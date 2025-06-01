import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';
import { DeleteDialogProps } from './types';

const DeleteScheduleItemDialog: React.FC<DeleteDialogProps> = ({
  open,
  onClose,
  item,
  onDelete
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Удалить работу</DialogTitle>
      <DialogContent>
        <Typography>
          Вы уверены, что хотите удалить работу "{item?.name}"?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={onDelete} variant="contained" color="error">Удалить</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteScheduleItemDialog;