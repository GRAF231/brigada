import { EstimateItem } from '../../../types/project';

export interface EstimateItemFormData {
  name: string;
  unit: string;
  quantity: number;
  price: number;
  status: string;
}

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  formData: EstimateItemFormData;
  onFormChange: (field: keyof EstimateItemFormData, value: any) => void;
}

export interface AddDialogProps extends DialogProps {
  onAdd: () => void;
}

export interface EditDialogProps extends DialogProps {
  onSave: () => void;
}

export interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  item: EstimateItem | null;
  onDelete: () => void;
}

export interface StatusDialogProps {
  open: boolean;
  onClose: () => void;
  formData: EstimateItemFormData;
  onFormChange: (field: keyof EstimateItemFormData, value: any) => void;
  onSave: () => void;
}