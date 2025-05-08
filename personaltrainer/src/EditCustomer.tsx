import * as React from 'react';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TCustomer from "./Customers";


// const BASE_URL = 'https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api';

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


export default function EditCustomer({editCustomer, customer, open, handleClose, 
    }: {
    editCustomer: (customer: TCustomer) => void;
    customer: TCustomer;
    open: boolean; // Tämä kertoo, onko dialogi auki
    handleClose: () => void; // Tämä sulkee dialogin
  }) {
    const [currentCustomer, setCurrentCustomer] = useState<TCustomer>(customer);

      // Päivitä currentCustomer aina, kun customer muuttuu
  useEffect(() => {
    setCurrentCustomer(customer);
  }, [customer]);
 
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentCustomer({
        ...currentCustomer,
        [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    editCustomer(currentCustomer);
    handleClose(); // Sulkee dialogin tallennuksen jälkeen
  };

        return (
            <>
                <Dialog  open={open} onClose={handleClose}>
                    <form  onSubmit={handleSubmit}>
                    <DialogTitle>Edit customer</DialogTitle>
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
                            value={currentCustomer.firstname}
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
                            value={currentCustomer.lastname}
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
                            value={currentCustomer.streetaddress}
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
                            value={currentCustomer.postcode}
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
                            value={currentCustomer.city}
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
                            value={currentCustomer.email}
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
                            value={currentCustomer.phone}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button type="submit">Save</Button>
                    </DialogActions>
                    </form>
                </Dialog>
            </>
        );
    }
    
    


