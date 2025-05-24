import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export enum UserRole {
  CLIENT = 'client', // Заказчик
  MANAGER = 'manager', // НеБригадир
  EXPERT = 'expert', // Эксперт-приёмщик
  COORDINATOR = 'coordinator', // Координатор
  MASTER = 'master', // Мастер
  DESIGNER = 'designer' // Дизайнер
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Пожалуйста, укажите имя']
    },
    email: {
      type: String,
      required: [true, 'Пожалуйста, укажите email'],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Пожалуйста, укажите корректный email']
    },
    password: {
      type: String,
      required: [true, 'Пожалуйста, укажите пароль'],
      minlength: [6, 'Пароль должен содержать минимум 6 символов']
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.CLIENT
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Хеширование пароля перед сохранением
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Метод для сравнения паролей
userSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;