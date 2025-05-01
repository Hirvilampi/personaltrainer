import { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ICellRendererParams, ModuleRegistry } from 'ag-grid-community';
import { ColDef } from "ag-grid-community";
import { Button } from "@mui/material";
import AddTraining from "./AddTraining";

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

function TrainingList() {
    const [treenit, setTreenit] = useState<TTrainingsData[]>([]);
    const [trainingsWithCustomers, setTrainingsWithCustomers] = useState<TTrainingsCustomer[]>([]);
    const [trainingsWithLinks, setTrainingsWithLinks] = useState<TTrainingsCustomerCustom[]>([]);
    const [filter, setFilter] = useState("");

    const formatDate = (isoDate: string) => {
        const date = new Date(isoDate);
        return new Intl.DateTimeFormat("fi-FI", {
            dateStyle: "short",
            timeStyle: "short",
        }).format(date);
    };

    const [columnDefs] = useState<ColDef<TTrainingsData>[]>([
        { field: "id" },
        { field: "date", valueFormatter: (params) => formatDate(params.value), },
        { field: "duration" },
        { field: "activity" },
        {
            headerName: "Customer link",
            cellRenderer: (params: ICellRendererParams<TTrainingsData>) =>
                params.data._links.customer?.href ?? "No link"
        }
    ]);

    const [columnDefs2] = useState<ColDef<TTrainingsCustomer>[]>([
        { field: "id" },
        { field: "date", headerName: "Date", valueFormatter: (params) => formatDate(params.value), },
        { field: "duration", headerName: "Duration (mins)" },
        { field: "activity", headerName: "Activity" },
        {
            headerName: "Customer Name",
            valueGetter: (params) =>
                `${params.data.customer?.firstname ?? ""} ${params.data.customer?.lastname ?? ""}`,
        },

    ]);

    const [columnDefs3] = useState<ColDef<TTrainingsCustomerCustom>[]>([
        { field: "date", headerName: "Date", valueFormatter: (params) => formatDate(params.value) },
        { field: "duration", headerName: "Duration (mins)" },
        { field: "activity", headerName: "Activity" },
        {
            headerName: "Customer",
            valueGetter: (params) =>
                `${params.data.customer.firstname ?? ""} ${params.data.customer.lastname ?? ""}`,

        },
        {
            cellRenderer: (params: ICellRendererParams<TTrainingsCustomerCustom>) =>
                <AddTraining
                    addTraining={addTraining}
                    initialId={params.data.id}
                />
        },
        {

            cellRenderer: (params: ICellRendererParams<TTrainingsCustomerCustom>) => (
                <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDelete(params.data._links.self.href)}
                >
                    Delete
                </Button>
            )
        }
    ]);

    const addTraining = (treeni: TTrainingsData) => {
        const uusiDate = new Date(treeni.date);
        let iso = uusiDate.toISOString();
        iso = iso.replace("Z","+000");
        console.log("ISOISOSISO: "+iso);
        const options = {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                date: iso,
                activity: treeni.activity,
                duration: treeni.duration,
                customer: treeni._links.customer.href,
            }),
        };
        console.log("TÄMÄ YRITETTIIN POSTATA",
            JSON.stringify({
            date: iso,
            activity: treeni.activity,
            duration: treeni.duration,
            customer: treeni._links.customer.href,
        }));
        fetch('${BASE_URL}/trainings', options)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Treeniä ei voitu lisätä")
                }
                return response.json();
            })
            .then(() => fetchCombinedTrainings())
            .catch(error => console.error("Virhe treenin lisäyksessä:", error));
    }

    const handleDelete = (href: string) => {
        if (window.confirm("Haluatko poistaa treenin?")) {
            fetch(href, { method: "DELETE" })
                .then(response => {
                    if (!response.ok) throw new Error("Poisto epäonnistui");
                    fetchCombinedTrainings(); // päivitä lista poiston jälkeen
                })
                .catch(error => console.error(error));
        }
    };


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

    const fetchTrainingsWitCustomers = () => {
        fetch(`https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/gettrainings`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Treenien haku epäonnistui")
                }
                return response.json();
            })
            .then(data => setTrainingsWithCustomers(data))
            .catch(error => console.error(error));
        if (trainingsWithCustomers != null) {
            console.log('treenit ja käyttäjät haettiin', trainingsWithCustomers);
        }
    }

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

    useEffect(fetchTrainings, []);
    useEffect(fetchTrainingsWitCustomers, []);
    useEffect(() => {
        fetchCombinedTrainings();
    }, []);




    return (
        <>
            <div>Lisää treeni tähän
                <input
                    type="text"
                    placeholder="Hae treeneistä"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    style={{ marginBottom: 10, padding: 5, width: "20%" }}
                />
            </div>

            <div style={{ height: 800 }}>
                <AgGridReact<TTrainingsCustomerCustom>
                    rowData={trainingsWithLinks.length > 0 ? trainingsWithLinks : undefined}
                    columnDefs={columnDefs3}
                    quickFilterText={filter}
                />
            </div>
        </>

    )
}

export default TrainingList;