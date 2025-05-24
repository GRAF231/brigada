import mongoose, { Document, Schema } from 'mongoose';

export interface IProjectUser extends Document {
  projectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const projectUserSchema = new Schema<IProjectUser>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Создаем составной индекс для уникальности пары проект-пользователь
projectUserSchema.index({ projectId: 1, userId: 1 }, { unique: true });

const ProjectUser = mongoose.model<IProjectUser>('ProjectUser', projectUserSchema);

export default ProjectUser;