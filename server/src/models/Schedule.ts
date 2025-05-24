import mongoose, { Document, Schema } from 'mongoose';

export interface ISchedule extends Document {
  projectId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const scheduleSchema = new Schema<ISchedule>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Пожалуйста, укажите проект']
    }
  },
  {
    timestamps: true
  }
);

const Schedule = mongoose.model<ISchedule>('Schedule', scheduleSchema);

export default Schedule;