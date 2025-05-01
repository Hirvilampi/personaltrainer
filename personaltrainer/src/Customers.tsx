import { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ICellRendererParams, ModuleRegistry } from 'ag-grid-community';
import { ColDef } from "ag-grid-community";
import { Button } from "@mui/material";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

const BASE_URL = 'https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api';


export type TCustomer =  {
    firstname: string;
    lastname: string;
    streetaddress: string;
    postcode: string;
    city: string;
    email: string;
    phone: string;
    _links: {
        self: {href: string;}
        training: { href: string; }
        customer: { href: string; }
    }
}

function Customers () {
    const [customers, setCustomers] = useState<TCustomer[]>([]);
    const [filter, setFilter] = useState("");

        const [columnDefs] = useState<ColDef<TCustomer>[]>([
            { field: "firstname" },
            { field: "lastname"},
            { field: "email" },
            { field: "phone" },
            { field: "_links.customer.href"}
        ]);


        const fetchCustomers = () => {
            fetch(`${BASE_URL}/customers`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("asiakkaider haku epäonnistui")
                    }
                    return response.json();
                })
                .then(data => setCustomers(data._embedded.customers))
                .catch(error => console.error(error));
            if (customers != null) {
                console.log('jotain haettiin', customers);
            }
        }

    useEffect(fetchCustomers, []);

    return (
        <>
                    <div>Hae asiakas
                <input
                    type="text"
                    placeholder="Hae treeneistä"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    style={{ marginBottom: 10, padding: 5, width: "20%" }}
                />
            </div>
        

                    <div style={{ height: 800 }}>
                        <AgGridReact<TCustomer>
                            rowData={customers.length > 0 ? customers : undefined}
                            columnDefs={columnDefs}
                            quickFilterText={filter}
                        />
                    </div>
        </>
    )
}

export default Customers;