import { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ICellRendererParams, ModuleRegistry } from 'ag-grid-community';
import { ColDef } from "ag-grid-community";
import { Button } from "@mui/material";
import AddTraining from "./AddTraining";
import dayGridPlugin from "@fullcalendar/daygrid";
import weekGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import FullCalendar from "@fullcalendar/react";
import { PureComponent } from "react";
import { BarChart, Bar, YAxis, XAxis, ResponsiveContainer } from 'recharts';

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
    duration: string;
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

function Chart() {
    const [treenit, setTreenit] = useState<TTrainings[]>([]);
    const [trainingsWithLinks, setTrainingsWithLinks] = useState<TTrainingsCustomerCustom[]>([]);
    const [filter, setFilter] = useState("");


    const data = [
        {
            name: "Page A",
            uv: 4000,
            pv: 2400,
            amt: 2400,
        },
        {
            name: "Page B",
            uv: 3000,
            pv: 1398,
            amt: 2210,
        },
        {
            name: "Page C",
            uv: 2000,
            pv: 9800,
            amt: 2290,
        },
        {
            name: "Page D",
            uv: 2780,
            pv: 3908,
            amt: 2000,
        },
        {
            name: "Page E",
            uv: 1890,
            pv: 4800,
            amt: 2181,
        },
        {
            name: "Page F",
            uv: 2390,
            pv: 3800,
            amt: 2500,
        },
        {
            name: "Page G",
            uv: 3490,
            pv: 4300,
            amt: 2100,
        },
    ];




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


    const fetchTrainings = () => {
        fetch(`${BASE_URL}/trainings`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Treenien haku epäonnistui")
                }
                return response.json();
            })
            .then(data => setTreenit(data._embedded.trainings))
            .catch(error => console.error(error));
        if (treenit != null) {
            console.log('jotain haettiin', treenit);
        }
    }



    const calculateTrainingActivities = (treenit: TTrainings[]) => {
        const activityAndDurations = new Map<string, number>();

        treenit.forEach((training) => {
            const duration = parseInt(training.duration); // Convert duration to a number
            if (!isNaN(duration)) {
                if (activityAndDurations.has(training.activity)) {
                    // Add the duration to the existing activity
                    activityAndDurations.set(
                        training.activity,
                        activityAndDurations.get(training.activity)! + duration
                    );
                } else {
                    // Create a new entry for the activity
                    activityAndDurations.set(training.activity, duration);
                }
            }
        });

        console.log("LASKETTU TEENIT ", Array.from(activityAndDurations.entries()).map(([activity, duration]) => ({
            activity: activity,
            totalDuration: duration,
        })));
        console.log("DATA", data);

        // Convert the Map to an array of objects

        const tulos = Array.from(activityAndDurations.entries()).map(([activity, duration]) => ({
            name: activity,
            duration: duration,
        }));

        console.log("RETURN tulos", tulos)

        return tulos;
    };

    const trainingActivities = calculateTrainingActivities(treenit);
    console.log(trainingActivities);

    useEffect(() => {
        fetchTrainings();
    }, []);

    return (
        <>

            <div style={{ margin: "35px"}}>

                <BarChart data={trainingActivities} width={1000} height={600} barSize={110} margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}>
                    <YAxis dataKey="duration" unit=" min" />
                    <XAxis dataKey="name" />
                    <Bar dataKey="duration" fill="#8884d8" />
                </BarChart>

            </div>
        </>

    )
}

export default Chart;