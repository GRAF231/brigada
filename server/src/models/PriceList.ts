import mongoose, { Document, Schema } from 'mongoose';

export enum PriceListType {
  CLIENT = 'client', // Для заказчиков
  MASTER = 'master' // Для мастеров
}

export interface IPriceList extends Document {
  name: string;
  type: PriceListType;
  createdAt: Date;
  updatedAt: Date;
}

const priceListSchema = new Schema<IPriceList>(
  {
    name: {
      type: String,
      required: [true, 'Пожалуйста, укажите название прайс-листа']
    },
    type: {
      type: String,
      enum: Object.values(PriceListType),
      required: [true, 'Пожалуйста, укажите тип прайс-листа']
    }
  },
  {
    timestamps: true
  }
);

const PriceList = mongoose.model<IPriceList>('PriceList', priceListSchema);

export default PriceList;