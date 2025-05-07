import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ICellRendererParams, ModuleRegistry } from 'ag-grid-community';
import { ColDef } from "ag-grid-community";
import { Button } from "@mui/material";
import AddTraining from "./AddTraining";
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

export type TTrainings = {
    date: string;
    duration: number;
    activity: string;
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
    const location = useLocation();
    const formatDate = (isoDate: string) => {
        const date = new Date(isoDate);
        return new Intl.DateTimeFormat("fi-FI", {
            dateStyle: "short",
            timeStyle: "short",
            hour12: false,
        }).format(date);
    };

    const [columnDefs3] = useState<ColDef<TTrainingsCustomerCustom>[]>([
        { field: "date", headerName: "Date", valueFormatter: (params) => formatDate(params.value) },
        { field: "duration", headerName: "Duration (mins)" },
        { field: "activity", headerName: "Activity" },
        {
            headerName: "Customer",
            valueGetter: params => {
                const c = params.data?.customer;
                return c
                    ? `${c.firstname} ${c.lastname}`
                    : "Unknown customer";
            },
        }
    ]);


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
        console.log("Route changed:", location.pathname);
        fetchCombinedTrainings();
    }, [location.pathname]); // Lataa tiedot aina, kun sijainti muuttuu.

    return (
        <>
     
       <div style={{margin:"35px"}}>
 {/* 
                <input
                    type="text"
                    placeholder="Search from trainings"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    style={{ marginBottom: 10, padding: 5, width: "20%" }}
                />
*/}
   

            <FullCalendar
                plugins={[dayGridPlugin, weekGridPlugin, timeGridPlugin]}
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                  }}
                initialView="timeGridWeek"
                events={calendarEvents}
                firstDay={1}
            />

{/* 
            <div style={{ height: 800 }} >
                <AgGridReact<TTrainingsCustomerCustom>
                    rowData={trainingsWithLinks.length > 0 ? trainingsWithLinks : undefined}
                    columnDefs={columnDefs3}
                    quickFilterText={filter}
                />
            </div>
*/}
         </div>
        </>

    )
}

export default Calendar;