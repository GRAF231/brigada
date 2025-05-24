import mongoose, { Document, Schema } from 'mongoose';

export enum ScheduleItemStatus {
  NOT_STARTED = 'not_started', // Не начато
  IN_PROGRESS = 'in_progress', // В процессе
  DELAYED = 'delayed', // Задержка
  COMPLETED = 'completed', // Завершено
  CANCELLED = 'cancelled' // Отменено
}

export interface IScheduleItem extends Document {
  scheduleId: mongoose.Types.ObjectId;
  name: string;
  startDate: Date;
  endDate: Date;
  status: ScheduleItemStatus;
  createdAt: Date;
  updatedAt: Date;
}

const scheduleItemSchema = new Schema<IScheduleItem>(
  {
    scheduleId: {
      type: Schema.Types.ObjectId,
      ref: 'Schedule',
      required: [true, 'Пожалуйста, укажите график работ']
    },
    name: {
      type: String,
      required: [true, 'Пожалуйста, укажите название работы']
    },
    startDate: {
      type: Date,
      required: [true, 'Пожалуйста, укажите дату начала']
    },
    endDate: {
      type: Date,
      required: [true, 'Пожалуйста, укажите дату окончания']
    },
    status: {
      type: String,
      enum: Object.values(ScheduleItemStatus),
      default: ScheduleItemStatus.NOT_STARTED
    }
  },
  {
    timestamps: true
  }
);

// Валидация дат: дата окончания должна быть позже даты начала
scheduleItemSchema.pre('save', function (next) {
  if (this.endDate < this.startDate) {
    const error = new Error('Дата окончания должна быть позже даты начала');
    return next(error);
  }
  next();
});

const ScheduleItem = mongoose.model<IScheduleItem>('ScheduleItem', scheduleItemSchema);

export default ScheduleItem;