import * as React from 'react';
import { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { SelectChangeEvent } from "@mui/material";
import { TTrainingsData } from './TrainingList';

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

type TAddTrainingsDataProps = {
    addTraining: (treeni: TTrainingsData) => void;
}

export default function AddTraining({ addTraining }: TAddTrainingsDataProps) {
    const [open, setOpen] = useState(false);
    const [customers, setCustomers] = useState<TCustomer[]>([]);
    const [treeniData, setTreeniData] = useState<TTrainingsData>({
        id: 0,
        date: "",
        duration: "",
        activity: "",
        _links: {
            self: { href: "" },
            training: { href: "" },
            customer: { href: "" },
        },
    })

    const fetchCustomers = () => {
        fetch(`${BASE_URL}/customers`)
            .then((response) => {
                if (!response.ok) {
                    window.alert("Could not fetch customers");
                    throw new Error("asiakkaider haku epäonnistui");
                }
                return response.json();
            })
            .then(data => setCustomers(data._embedded.customers))
            .catch(error => console.error(error));
        if (customers != null) {
            console.log('haettiin customers', customers);
        }
    }
    const handleClickOpen = () => {
        fetchCustomers();
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setTreeniData((prevData) => ({ ...prevData, [name]: value }));
    }

    const handleCustomerSelect = (event: SelectChangeEvent<string>) => {
        const href = event.target.value as string;
        setTreeniData(prev => ({
          ...prev,
          _links: { ...prev._links, customer: { href } }
        }));
      };
    
    return (
        <>
            <Button variant="outlined" onClick={handleClickOpen} style={{ margin: "1em 0" }}>
                Add training
            </Button>

            <Dialog open={open} onClose={handleClose}>
                <form
                    onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
                        event.preventDefault();
                        addTraining(treeniData); // Pass the data to the parent function
                        handleClose();
                    }}
                >
                <DialogTitle>Add Training</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        id="date"
                        name="date"
                        placeholder="Enter date and time" 
                        type="datetime-local"
                        fullWidth
                        variant="standard"
                        onChange={handleChange}
                        value={treeniData.date}
                    />
                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        id="duration"
                        name="duration"
                        label="Duration (mins)"
                        type="text"
                        fullWidth
                        variant="standard"
                        onChange={handleChange}
                        value={treeniData.duration}
                    />
                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        id="activity"
                        name="activity"
                        label="Activity"
                        type="text"
                        fullWidth
                        variant="standard"
                        onChange={handleChange}
                        value={treeniData.activity}
                    />

                        <FormControl fullWidth margin="dense" variant="standard" required>
                            <InputLabel id="customer-select-label">Customer</InputLabel>
                            <Select
                                labelId="customer-select-label"
                                value={treeniData._links.customer.href || ""}
                                onChange={handleCustomerSelect}
                                label="Customer"
                            >
                                {customers.map((c, i) => (
                                    <MenuItem key={i} value={c._links.customer.href}>
                                        {c.firstname} {c.lastname}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button type="submit">Add</Button>
                </DialogActions>
                </form>
            </Dialog>
        </>
    )

}

