import { useEffect, useState } from "react";
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import dayGridPlugin from "@fullcalendar/daygrid";
import weekGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import FullCalendar from "@fullcalendar/react";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

const BASE_URL = 'https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api';

export type TTrainingsData = {
    id: number,
    date: string;
    duration: string;
    activity: string;
    _links: {
        self: {
            href: string;
        }
        training: {
            href: string;
        }
        customer: {
            href: string;
        }
    }
}

export type TTrainingsCustomer = {
    id: number,
    date: string;
    duration: string;
    activity: string;
    customer: {
        id: number,
        firstname: string,
        lastname: string,
        streetaddress: string,
        postcode: string,
        city: string,
        email: string,
        phone: string
    }

}

type TTrainingsCustomerCustom = TTrainingsCustomer & {
    _links: TTrainingsData["_links"]
}

function Calendar() {
    const [trainingsWithLinks, setTrainingsWithLinks] = useState<TTrainingsCustomerCustom[]>([]);
    const [events, setEvents] = useState<any>([]);
    const [forceRenderKey, setForceRenderKey] = useState(0); // Tila uudelleenrenderöinnin pakottamiseen

    // haetaan treenajä ja asiakkkaita koskeva data ja yhdistetään ne
    const fetchCombinedTrainings = async () => {
        try {
            const [trainingsCustomersRes, trainingsLinksRes] = await Promise.all([
                fetch(`${BASE_URL}/gettrainings`),
                fetch(`${BASE_URL}/trainings`)
            ]);

            if (!trainingsCustomersRes.ok || !trainingsLinksRes.ok) {
                throw new Error("Haku epäonnistui");
            }

            const treeniData: TTrainingsCustomer[] = await trainingsCustomersRes.json();
            const linkkiCustomeriinData: { _embedded: { trainings: TTrainingsData[] } } = await trainingsLinksRes.json();
            const linksMap = new Map<number, TTrainingsData["_links"]>();

            for (const training of linkkiCustomeriinData._embedded.trainings) {
                const idMatch = training._links.self.href.match(/\/trainings\/(\d+)$/);
                if (idMatch) {
                    const id = Number(idMatch[1]);
                    linksMap.set(id, training._links);
                }
            }

            const combined: TTrainingsCustomerCustom[] = treeniData
                .map(training => ({
                    ...training,
                    _links: linksMap.get(training.id)!
                }))
                .filter(t => t._links); // suodata pois jos linkit puuttuvat

            setTrainingsWithLinks(combined);

        } catch (error) {
            console.error("Virhe treenien haussa: ", error);
        }
    };

    // Luo tapahtumat FullCalendar-komponentille
    const calendarEvents = trainingsWithLinks.map((training) => {
        const startTime = new Date(training.date);
        const endTime = new Date(startTime.getTime() + parseInt(training.duration) * 60000); // Kesto minuutteina

        return {
            title: `${training.activity} - ${training.customer.firstname} ${training.customer.lastname}`,
            start: startTime.toISOString(),
            end: endTime.toISOString(),
            extendedProps: {
                customer: training.customer,
                duration: training.duration,
            },
        };
    });


    useEffect(() => {
        fetchCombinedTrainings();
    }, []); // Lataa tiedot aina, kun sijainti muuttuu.

    const handleReload = () => {
        fetchCombinedTrainings(); // Lataa sivu uudelleen
        setEvents(calendarEvents);
        setForceRenderKey((prevKey) => prevKey + 1);
    };

    return (
        <>
     <div style={{margin: "20px"}}>
     <button onClick={handleReload} style={{ padding: "10px", margin: "10px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
            Update calendar
        </button>
     </div>

       <div style={{margin:"35px"}}>

            <FullCalendar
                key={forceRenderKey}
                plugins={[dayGridPlugin, weekGridPlugin, timeGridPlugin]}
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay',
                  }}
                initialView="timeGridWeek"
                events={events}
                firstDay={1}
                slotMinTime="07:00:00"
                locale="fi"
            />


         </div>
        </>

    )
}

export default Calendar;