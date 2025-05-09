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
    const [trainingsWithLinks, setTrainingsWithLinks] = useState<TTrainingsCustomerCustom[]>([]);
    const [filter, setFilter] = useState("");

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
        { field: "duration", headerName: "Duration (mins)", width: 160 },
        { field: "activity", headerName: "Activity", width: 180 },
        {
            headerName: "Customer",
            width: 180,
            valueGetter: params => {
                const c = params.data?.customer;
                return c
                    ? `${c.firstname} ${c.lastname}`
                    : "Unknown customer";
            },
        },
        {   headerName: "Actions",width: 150,
            cellRenderer: (params: ICellRendererParams<TTrainingsCustomerCustom>) => {
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

    const addTraining = (treeni: TTrainingsData) => {
        const uusiDate = new Date(treeni.date);
        let iso = uusiDate.toISOString();
        //     iso = iso.replace("Z", "+000");
        console.log("ISOISOSISO: " + iso);
        let uusiHref = treeni._links.customer.href;
        uusiHref = uusiHref.replace("https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/",
            "https://myserver.personaltrainer.api/"
        );
        const options = {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                date: iso,
                activity: treeni.activity,
                duration: treeni.duration,
                customer: uusiHref
            }),
        };
        console.log("TÄMÄ YRITETÄÄN POSTATA",
            JSON.stringify({
                date: iso,
                activity: treeni.activity,
                duration: treeni.duration,
                customer: uusiHref,
            }));
        fetch(`${BASE_URL}/trainings`, options)
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
        fetchCombinedTrainings();
    }, []);

    return (
        <>
            <div style={{ padding: "10px", display: "flex", alignItems: "center" }}>
                <AddTraining addTraining={addTraining} />

                <input
                    type="text"
                    placeholder="Search from table"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    style={{ marginLeft: '10px', padding: '5px', width: "20%" }}
                />
            </div>

            <div style={{ height: 800 }} >
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