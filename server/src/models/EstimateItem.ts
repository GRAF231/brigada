import mongoose, { Document, Schema } from 'mongoose';

export enum EstimateItemStatus {
  NOT_STARTED = 'not_started', // Не начато
  FINANCED = 'financed', // Профинансировано
  IN_PROGRESS = 'in_progress', // В процессе
  COMPLETED = 'completed', // Выполнено
  REWORK = 'rework', // Переделываем
  ACCEPTED = 'accepted' // Принято
}

export interface IEstimateItem extends Document {
  estimateId: mongoose.Types.ObjectId;
  parentId?: mongoose.Types.ObjectId; // Для иерархической структуры
  name: string;
  unit: string; // Единица измерения
  quantity: number;
  price: number;
  amount: number; // Сумма = quantity * price
  status: EstimateItemStatus;
  createdAt: Date;
  updatedAt: Date;
}

const estimateItemSchema = new Schema<IEstimateItem>(
  {
    estimateId: {
      type: Schema.Types.ObjectId,
      ref: 'Estimate',
      required: [true, 'Пожалуйста, укажите смету']
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'EstimateItem',
      default: null
    },
    name: {
      type: String,
      required: [true, 'Пожалуйста, укажите название позиции']
    },
    unit: {
      type: String,
      required: [true, 'Пожалуйста, укажите единицу измерения']
    },
    quantity: {
      type: Number,
      required: [true, 'Пожалуйста, укажите количество'],
      min: [0, 'Количество не может быть отрицательным']
    },
    price: {
      type: Number,
      required: [true, 'Пожалуйста, укажите цену'],
      min: [0, 'Цена не может быть отрицательной']
    },
    amount: {
      type: Number,
      required: [true, 'Пожалуйста, укажите сумму'],
      min: [0, 'Сумма не может быть отрицательной']
    },
    status: {
      type: String,
      enum: Object.values(EstimateItemStatus),
      default: EstimateItemStatus.NOT_STARTED
    }
  },
  {
    timestamps: true
  }
);

// Middleware для автоматического расчета суммы перед сохранением
estimateItemSchema.pre('save', function (next) {
  if (this.isModified('quantity') || this.isModified('price')) {
    this.amount = this.quantity * this.price;
  }
  next();
});

const EstimateItem = mongoose.model<IEstimateItem>('EstimateItem', estimateItemSchema);

export default EstimateItem;