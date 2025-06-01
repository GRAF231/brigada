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
import { StatusDialogProps, EstimateItemFormData } from './types';
import { EstimateItemStatus, statusNames } from './estimateUtils';

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
      <DialogTitle>Изменить статус позиции</DialogTitle>
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