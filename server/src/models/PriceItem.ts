import mongoose, { Document, Schema } from 'mongoose';

export interface IPriceItem extends Document {
  priceListId: mongoose.Types.ObjectId;
  name: string;
  unit: string; // Единица измерения
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

const priceItemSchema = new Schema<IPriceItem>(
  {
    priceListId: {
      type: Schema.Types.ObjectId,
      ref: 'PriceList',
      required: [true, 'Пожалуйста, укажите прайс-лист']
    },
    name: {
      type: String,
      required: [true, 'Пожалуйста, укажите название позиции']
    },
    unit: {
      type: String,
      required: [true, 'Пожалуйста, укажите единицу измерения']
    },
    price: {
      type: Number,
      required: [true, 'Пожалуйста, укажите цену'],
      min: [0, 'Цена не может быть отрицательной']
    }
  },
  {
    timestamps: true
  }
);

const PriceItem = mongoose.model<IPriceItem>('PriceItem', priceItemSchema);

export default PriceItem;