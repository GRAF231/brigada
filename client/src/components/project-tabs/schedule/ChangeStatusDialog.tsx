import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { StatusDialogProps, ScheduleItemFormData } from './types';
import { ScheduleItemStatus, statusNames } from './scheduleUtils';

const ChangeStatusDialog: React.FC<StatusDialogProps> = ({
  open,
  onClose,
  formData,
  onFormChange,
  onSave
}) => {
  const handleChange = (e: React.ChangeEvent<{ value: unknown }> | any) => {
    onFormChange('status', e.target.value);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Изменить статус работы</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Статус</InputLabel>
          <Select
            name="status"
            value={formData.status}
            onChange={handleChange}
            label="Статус"
          >
            {Object.entries(statusNames).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={onSave} variant="contained">Сохранить</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangeStatusDialog;