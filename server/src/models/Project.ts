import mongoose, { Document, Schema } from 'mongoose';

export enum ProjectStatus {
  PLANNING = 'planning', // Планирование
  IN_PROGRESS = 'in_progress', // В процессе
  ON_HOLD = 'on_hold', // Приостановлен
  COMPLETED = 'completed', // Завершен
  CANCELLED = 'cancelled' // Отменен
}

export interface IProject extends Document {
  name: string;
  address: string;
  startDate: Date;
  endDate: Date;
  clientId: mongoose.Types.ObjectId;
  managerId: mongoose.Types.ObjectId;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: [true, 'Пожалуйста, укажите название проекта']
    },
    address: {
      type: String,
      required: [true, 'Пожалуйста, укажите адрес']
    },
    startDate: {
      type: Date,
      required: [true, 'Пожалуйста, укажите дату начала']
    },
    endDate: {
      type: Date,
      required: [true, 'Пожалуйста, укажите дату окончания']
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Пожалуйста, укажите заказчика']
    },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Пожалуйста, укажите менеджера (НеБригадира)']
    },
    status: {
      type: String,
      enum: Object.values(ProjectStatus),
      default: ProjectStatus.PLANNING
    }
  },
  {
    timestamps: true
  }
);

const Project = mongoose.model<IProject>('Project', projectSchema);

export default Project;