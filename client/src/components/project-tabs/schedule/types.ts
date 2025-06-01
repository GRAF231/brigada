import { ScheduleItem } from '../../../types/project';

export interface ScheduleItemFormData {
  name: string;
  startDate: string;
  endDate: string;
  status: string;
}

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  formData: ScheduleItemFormData;
  onFormChange: (field: keyof ScheduleItemFormData, value: any) => void;
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
  item: ScheduleItem | null;
  onDelete: () => void;
}

export interface StatusDialogProps {
  open: boolean;
  onClose: () => void;
  formData: ScheduleItemFormData;
  onFormChange: (field: keyof ScheduleItemFormData, value: any) => void;
  onSave: () => void;
}

export interface GanttChartProps {
  items: ScheduleItem[];
  onTaskClick?: (task: ScheduleItem) => void;
}