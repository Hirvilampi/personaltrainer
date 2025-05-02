import { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ICellRendererParams, ModuleRegistry } from 'ag-grid-community';
import { ColDef } from "ag-grid-community";
import AddCustomer from "./AddCustomer";
import { Button } from "@mui/material";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

const BASE_URL = 'https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api';


export type TCustomer = {
    firstname: string;
    lastname: string;
    streetaddress: string;
    postcode: string;
    city: string;
    email: string;
    phone: string;
    _links: {
        self: { href: string; }
        training: { href: string; }
        customer: { href: string; }
    }
}

function Customers() {
    const [customers, setCustomers] = useState<TCustomer[]>([]);
    const [filter, setFilter] = useState("");

    const [columnDefs] = useState<ColDef<TCustomer>[]>([
        { field: "firstname" },
        { field: "lastname" },
        { field: "email" },
        { field: "phone" },
        { field: "_links.customer.href" },
        {
                    cellRenderer: (params: ICellRendererParams<TCustomer>) => {
                        if (!params.data) {
                            return null;
                        } else {
                            const useHref = params.data._links.self.href;
                            return (
                                <Button
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    onClick={() => handleDelete(useHref)}
                                >
                                    Delete
                                </Button>
                            );
                        }
        
                    }
                }
    ]);

    const handleDelete = (href: string) => {
        if (window.confirm("Do you want to remove customer")) {
            fetch(href, { method: "DELETE" })
                .then(response => {
                    if (!response.ok){
                        window.alert("Delete failed");
                        throw new Error("Poisto epäonnistui");
                    }
                    fetchCustomers(); // päivitä lista poiston jälkeen
                })
                .catch(error => console.error(error));
        }
    };

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

    const addCustomer = (asiakas: TCustomer) => {
        console.log("UUDEN ASIAKKAAN TIEDOT",asiakas);
        const options = {
            method: "POST",
            headers: {
                'Content-Type' : 'application/json', 
            },
            body: JSON.stringify({
                firstname: asiakas.firstname,
                lastname: asiakas.lastname,
                email: asiakas.email,
                phone: asiakas.phone,
                streetaddress: asiakas.streetaddress,
                postcode: asiakas.postcode,
                city: asiakas.city,
            })
        };
        console.log("TÄMÄ YRITETÄÄN POSTATA",
            JSON.stringify({
                firstname: asiakas.firstname,
                lastname: asiakas.lastname,
                email: asiakas.email,
                phone: asiakas.phone,
                streetaddress: asiakas.streetaddress,
                postcode: asiakas.postcode,
                city: asiakas.city,
            }));
            fetch(`${BASE_URL}/customers`, options)
            .then(( response) => {
                if (!response.ok) {
                    window.alert("Customer could not be added");
                    throw new Error("Asiakasta ei voitu lisätä");
                } return response.json();
            })
            .then(() => fetchCustomers())
            .catch(error => console.error("Virhe asiakkaan lisäyksessä:",error));

    }

    useEffect(fetchCustomers, []);

    return (
        <>
            <div>
                <AddCustomer addCustomer={addCustomer} />
                <input
                    type="text"
                    placeholder="Search from customers"
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