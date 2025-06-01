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
  MenuItem,
  Typography
} from '@mui/material';
import { unitOptions } from './estimateUtils';
import { AddDialogProps, EstimateItemFormData } from './types';

const AddEstimateItemDialog: React.FC<AddDialogProps> = ({
  open,
  onClose,
  onAdd,
  formData,
  onFormChange
}) => {
  const handleChange = (field: keyof EstimateItemFormData) => (
    e: React.ChangeEvent<HTMLInputElement | { value: unknown }> | any
  ) => {
    const value = e.target.value;
    onFormChange(field, value);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Добавить позицию сметы</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          name="name"
          label="Наименование"
          type="text"
          fullWidth
          value={formData.name}
          onChange={handleChange('name')}
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Единица измерения</InputLabel>
          <Select
            name="unit"
            value={formData.unit}
            onChange={handleChange('unit')}
            label="Единица измерения"
          >
            {unitOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          margin="dense"
          name="quantity"
          label="Количество"
          type="number"
          fullWidth
          value={formData.quantity}
          onChange={handleChange('quantity')}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          name="price"
          label="Цена"
          type="number"
          fullWidth
          value={formData.price}
          onChange={handleChange('price')}
          sx={{ mb: 2 }}
        />
        <Typography variant="subtitle1" sx={{ mt: 2 }}>
          Сумма: {((formData.quantity || 0) * (formData.price || 0)).toLocaleString()} ₽
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={onAdd} variant="contained">Добавить</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddEstimateItemDialog;