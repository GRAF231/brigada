import mongoose, { Document, Schema } from 'mongoose';

export interface IEstimate extends Document {
  projectId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const estimateSchema = new Schema<IEstimate>(
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

const Estimate = mongoose.model<IEstimate>('Estimate', estimateSchema);

export default Estimate;