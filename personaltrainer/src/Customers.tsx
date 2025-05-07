import { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ICellRendererParams, ModuleRegistry } from 'ag-grid-community';
import { ColDef } from "ag-grid-community";
import AddCustomer from "./AddCustomer";
import { Button } from "@mui/material";
import EditCustomer from "./EditCustomer"
import { CSVLink } from "react-csv";

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

export type TCustomerCSV = {
    firstname: string;
    lastname: string;
    streetaddress: string;
    postcode: string;
    city: string;
    email: string;
    phone: string;
}




function Customers() {
    const [customers, setCustomers] = useState<TCustomer[]>([]);
    const [filter, setFilter] = useState("");
    const [editCustomerData, setEditCustomerData] = useState<TCustomer | null>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [customerCSV, setCustomerCSV] = useState<any[]>([]);

    const [columnDefs] = useState<ColDef<TCustomer>[]>([
        { 
            headerName: "Customer", 
            valueGetter: (params) => `${params.data?.firstname} ${params.data?.lastname}`,
            width : 180, 
        },
        { field: "email" },
        { field: "phone", width : 130, },
        {
            headerName: "Address",
            width: 280,
            valueGetter: (params) => `${params.data?.streetaddress}, ${params.data?.postcode}, ${params.data?.city}` 
        },
        {
            headerName: "Actions",
            width: 180,
            cellRenderer: (params: ICellRendererParams<TCustomer>) => {
                if (!params.data) return null;

                const useHref = params.data._links.self.href;
                const { firstname, lastname, email, city, phone, postcode, streetaddress } = params.data;

                return (
                    <div style={{ display: 'flex', gap: '6px' }}>
                        <Button
                            variant="outlined"
                            color="success"
                            size="small"
                            onClick={() => handleEdit(useHref, firstname, lastname, email, city, phone, postcode, streetaddress)}
                        >
                            Edit
                        </Button>
                        <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleDelete(useHref)}
                        >
                            Delete
                        </Button>
                    </div>
                );
            }
        }
    ]);

    const handleDelete = (href: string) => {
        if (window.confirm("Do you want to remove customer")) {
            fetch(href, { method: "DELETE" })
                .then(response => {
                    if (!response.ok) {
                        window.alert("Delete failed");
                        throw new Error("Poisto epäonnistui");
                    }
                    fetchCustomers(); // päivitä lista poiston jälkeen
                })
                .catch(error => console.error(error));
        }
    };

    const handleEdit = (href: string, fname: string, sname: string, email: string,
        city: string, phone: string, postcod: string, street: string) => {
        const customerData: TCustomer = {
            firstname: fname,
            lastname: sname,
            email: email,
            city: city,
            phone: phone,
            postcode: postcod,
            streetaddress: street,
            _links: {
                self: { href: href },
                training: { href: "" },
                customer: { href: "" },
            },
        };
        setEditCustomerData(customerData);
        setEditModalOpen(true);
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
            console.log('Haeittiin seuraavat asiakkaat:', customers);
        }
    }

    useEffect(() => {
        // asiakkaiden haun jälkeen
        const csvData = customers.map(({ _links, ...rest }) => rest);
        console.log("csvDATA", csvData);
        setCustomerCSV(csvData);
    }, [customers]);


    const addCustomer = (asiakas: TCustomer) => {
        console.log("UUDEN ASIAKKAAN TIEDOT", asiakas);
        const options = {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
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
            .then((response) => {
                if (!response.ok) {
                    window.alert("Customer could not be added");
                    throw new Error("Asiakasta ei voitu lisätä");
                } return response.json();
            })
            .then(() => fetchCustomers())
            .catch(error => console.error("Virhe asiakkaan lisäyksessä:", error));

    }

    const editCustomer = (updatedCustomer: TCustomer) => {
        fetch(updatedCustomer._links.self.href, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedCustomer),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Asiakkaan tietojen päivitys epäonnistui");
                }
                return response.json();
            })
            .then(() => fetchCustomers())
            .catch((error) => console.error("Virhe asiakkaan tietoja päivitettäessä: ", error));

    }

    useEffect(fetchCustomers, []);

    return (
        <>
            <div style={{ padding: "10px", display: "flex", alignItems: "center" }}>
                <AddCustomer addCustomer={addCustomer} />
                
                <CSVLink data={customerCSV} filename="customers.csv" style={{ textDecoration: 'none', marginLeft: '5px' }}>
                    <Button variant="outlined" color="primary">
                        Export customers
                    </Button>
                </CSVLink>
                
                <input
                    type="text"
                    placeholder="Search from table"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    style={{ marginLeft: '5px', padding: 5, width: "20%" }}
                />
            </div>

            <div style={{ height: 800 }}>
                <AgGridReact<TCustomer>
                    rowData={customers.length > 0 ? customers : undefined}
                    columnDefs={columnDefs}
                    quickFilterText={filter}
                />
            </div>
            {editCustomerData && (
                <EditCustomer
                    editCustomer={editCustomer}
                    customer={editCustomerData}
                    open={editModalOpen}
                    handleClose={() => setEditModalOpen(false)}
                />
            )}
        </>
    )
}

export default Customers;