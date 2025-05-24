import mongoose, { Document, Schema } from 'mongoose';

export interface IAttachment {
  filename: string;
  originalname: string;
  path: string;
  mimetype: string;
}

export interface IStatusMessage extends Document {
  projectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  message: string;
  attachments: IAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

const attachmentSchema = new Schema({
  filename: {
    type: String,
    required: true
  },
  originalname: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  }
});

const statusMessageSchema = new Schema<IStatusMessage>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Пожалуйста, укажите проект']
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Пожалуйста, укажите пользователя']
    },
    message: {
      type: String,
      required: [true, 'Пожалуйста, введите сообщение']
    },
    attachments: [attachmentSchema]
  },
  {
    timestamps: true
  }
);

const StatusMessage = mongoose.model<IStatusMessage>('StatusMessage', statusMessageSchema);

export default StatusMessage;