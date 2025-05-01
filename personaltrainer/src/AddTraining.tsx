import * as React from 'react';
import { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import { TTrainingsData } from './TrainingList';


type TAddTrainingsDataProps = {
    addTraining: (treeni: TTrainingsData) => void;
    initialId: number;
}



export default function AddTraining({ addTraining, initialId }: TAddTrainingsDataProps) {
    const [open, setOpen] = useState(false);
    const [treeniData, setTreeniData] = useState({
        id: initialId,
        date: "",
        duration: "",
        activity: "",
        _links: {
            self: { href: "" },
            training: { href: "" },
            customer: { href: `https://myserver.personaltrainer.api/api/customers/${initialId}` },
        },
    })


    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = event.target;
        setTreeniData((prevData) => ({ ...prevData, [name]: name === "duration" ? Number(value): value, }));
    }

    return (
        <>
            <Button variant="outlined" onClick={handleClickOpen} style={{ margin: "1em 0" }}>
                Add training
            </Button>

            <Dialog
                open={open}
                onClose={handleClose}
                slotProps={{
                    paper: {
                        component: 'form',
                        onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                            event.preventDefault();
                            addTraining({
                                ...treeniData
                            });
                            handleClose();
                        },
                    },
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
                        label="Date and Time"
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
                        label="Duration"
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


                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button type="submit">Add</Button>
                </DialogActions>
            </Dialog>
        </>
    )

}

