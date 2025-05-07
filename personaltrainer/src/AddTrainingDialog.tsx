import { useState} from 'react';
import Button from '@mui/material/Button';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';

import { TTrainingsData } from './TrainingList';
import { createTrainingData } from "./utils/trainingFactory";

export default function AddTrainingDialog({
  open, onClose, onSave, initialCustomerLink, initialId
}: {
  open: boolean;
  onClose: () => void;
  onSave: (t: TTrainingsData) => void;
  initialId: number;
  initialCustomerLink: string;
}) {
  // lomakkeen state...
  const [date] = useState("");
  const [duration] = useState("");
  const [activity] = useState("");

  const handleSubmit = () => {
    const t = createTrainingData(
      initialId, date, duration, activity, initialCustomerLink
    );
    onSave(t);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      {/* lomake kenttineen */}
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Add</Button>
      </DialogActions>
    </Dialog>
  );
}
