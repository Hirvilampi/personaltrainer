import * as React from 'react';
import { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TCustomer from "./Customers";

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

export default function AddCustomer({ addCustomer }: {addCustomer: (customer: TCustomer) => void}) {
    const [open, setOpen] = useState(false);
    const [customer, setCustomer] = useState<TCustomer>({
        firstname: "",
        lastname: "",
        streetaddress: "",
        postcode: "",
        city: "",
        email: "",
        phone: "",
        _links: {
            self: { href: "" },
            training: { href: "string" },
            customer: { href: "" },
        }
    });

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };


    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCustomer({ ...customer, [event.target.name]: event.target.value })
    }

    return (
        <>
            <Button variant="outlined" onClick={handleClickOpen} style={{ margin: "1em 0" }}>
                Add customer
            </Button>

            <Dialog  open={open} onClose={handleClose}>
                <form
                      onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
                            event.preventDefault();
                            addCustomer(customer);
                            handleClose();       
                }}
            >
                <DialogTitle>Add customer</DialogTitle>
                <DialogContent>

                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        id="firstname"
                        name="firstname"
                        label="Firstname"
                        type="text"
                        fullWidth
                        variant="standard"
                        onChange={handleChange}
                        value={customer.firstname}
                    />
                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        id="lastname"
                        name="lastname"
                        label="Lastname"
                        type="text"
                        fullWidth
                        variant="standard"
                        onChange={handleChange}
                        value={customer.lastname}
                    />
                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        id="streetaddress"
                        name="streetaddress"
                        label="Streetaddress"
                        type="text"
                        fullWidth
                        variant="standard"
                        onChange={handleChange}
                        value={customer.streetaddress}
                    />
                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        id="postcode"
                        name="postcode"
                        label="Postcode"
                        type="text"
                        fullWidth
                        variant="standard"
                        onChange={handleChange}
                        value={customer.postcode}
                    />
                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        id="city"
                        name="city"
                        label="City"
                        type="text"
                        fullWidth
                        variant="standard"
                        onChange={handleChange}
                        value={customer.city}
                    />
                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        id="email"
                        name="email"
                        label="Email"
                        type="text"
                        fullWidth
                        variant="standard"
                        onChange={handleChange}
                        value={customer.email}
                    />
                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        id="phone"
                        name="phone"
                        label="Phone"
                        type="text"
                        fullWidth
                        variant="standard"
                        onChange={handleChange}
                        value={customer.phone}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button type="submit">Add</Button>
                </DialogActions>
                </form>
            </Dialog>
        </>
    );
}

