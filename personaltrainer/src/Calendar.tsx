import { useEffect, useState, useRef } from "react";
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import FullCalendar from "@fullcalendar/react";
import { EventInput } from '@fullcalendar/core';

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
    const [events, setEvents] = useState<EventInput>([]);
    const calendarRef = useRef<any>(null); // viite kalenterikomponenttii
    const [isFirstLoad, setIsFirstLoad] = useState(true); // Tila ensimmäiselle lataukselle

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


    useEffect(() => {
        console.log("-- TrainingsWithLinks ladataan");
        const events = trainingsWithLinks.map((training) => {
            const startTime = new Date(training.date);
            const endTime = new Date(startTime.getTime() + parseInt(training.duration) * 60000);

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
        setEvents(events);
    }, [trainingsWithLinks]);

    useEffect(() => {
        console.log("eka lataus, puoli sekuntia");
        const interval = setInterval(() => {
            fetchCombinedTrainings();
        }, 500); // 5 minuutin välein
        setIsFirstLoad(false);
        return () => clearInterval(interval);
    }, [isFirstLoad]);

    useEffect(() => {
        console.log("24h kuluttua");
        const interval = setInterval(() => {
            fetchCombinedTrainings();
        }, 30 * 1000); // 24 tunnin välein
        return () => clearInterval(interval);
    }, [!isFirstLoad]);

    useEffect(() => {
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            calendarApi.removeAllEvents();
            events.forEach((event: EventInput) => calendarApi.addEvent(event));
            calendarApi.updateSize();
            console.log("Kalenteri päivitetty");
        }
    }, [events]);

    const handleReload = () => {
        fetchCombinedTrainings(); // Lataa sivu uudelleen
        console.log("HANDLERELOAD");
    };

    return (
        <>
            <div style={{ margin: "20px" }}>
                <button onClick={handleReload} style={{ padding: "10px", margin: "10px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                    Update calendar
                </button>
            </div>

            <div style={{ margin: "35px", width: "1100" }}>
                <FullCalendar
                    height="auto"

                    plugins={[dayGridPlugin, timeGridPlugin]}
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay',
                    }}
                    initialView="timeGridWeek"
                    events={events}
                    firstDay={1}
                    scrollTime="06:00:00"
                    slotMinTime="07:00:00"
                    locale="fi"
                //              ref={calendarRef}
                //               key={forceRenderKey}
                />


            </div>
        </>

    )
}

export default Calendar;