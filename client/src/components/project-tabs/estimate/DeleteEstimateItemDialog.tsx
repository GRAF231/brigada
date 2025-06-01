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

const DeleteEstimateItemDialog: React.FC<DeleteDialogProps> = ({
  open,
  onClose,
  item,
  onDelete
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Удалить позицию сметы</DialogTitle>
      <DialogContent>
        <Typography>
          Вы уверены, что хотите удалить позицию "{item?.name}"?
        </Typography>
        {item?.children && item.children.length > 0 && (
          <Typography color="error" sx={{ mt: 1 }}>
            Внимание! Будут удалены также все подпункты этой позиции.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={onDelete} variant="contained" color="error">Удалить</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteEstimateItemDialog;