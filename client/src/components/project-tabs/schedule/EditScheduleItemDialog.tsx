import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { EditDialogProps, ScheduleItemFormData } from './types';
import { ScheduleItemStatus, statusNames } from './scheduleUtils';

const EditScheduleItemDialog: React.FC<EditDialogProps> = ({
  open,
  onClose,
  onSave,
  formData,
  onFormChange
}) => {
  const handleChange = (field: keyof ScheduleItemFormData) => (
    e: React.ChangeEvent<HTMLInputElement | { value: unknown }> | any
  ) => {
    const value = e.target.value;
    onFormChange(field, value);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Редактировать работу</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          name="name"
          label="Название работы"
          type="text"
          fullWidth
          value={formData.name}
          onChange={handleChange('name')}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          name="startDate"
          label="Дата начала"
          type="date"
          fullWidth
          value={formData.startDate}
          onChange={handleChange('startDate')}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          name="endDate"
          label="Дата окончания"
          type="date"
          fullWidth
          value={formData.endDate}
          onChange={handleChange('endDate')}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Статус</InputLabel>
          <Select
            name="status"
            value={formData.status}
            onChange={handleChange('status')}
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

export default EditScheduleItemDialog;