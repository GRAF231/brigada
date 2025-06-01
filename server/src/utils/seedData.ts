import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, Project, ProjectStatus, UserRole } from '../models';

/**
 * Функция для заполнения базы данных начальными данными
 */
export const seedDatabase = async (): Promise<void> => {
  try {
    console.log('Проверка наличия данных в базе...');
    
    // Проверяем, есть ли уже пользователи в базе
    const userCount = await User.countDocuments();
    console.log(`Найдено ${userCount} пользователей в базе.`);
    // Если пользователи уже есть, не заполняем базу
    if (userCount > 1) {
      console.log('База данных уже содержит пользователей. Пропускаем заполнение.');
      return;
    }
    
    console.log('Заполнение базы данных начальными данными...');
    
    // Создаем хеш пароля
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    // Создаем пользователей
    const manager1 = await User.create({
      name: 'Смирнов Алексей',
      email: 'manager1@example.com',
      password: hashedPassword,
      role: UserRole.MANAGER
    });
    
    const manager2 = await User.create({
      name: 'Козлова Елена',
      email: 'manager2@example.com',
      password: hashedPassword,
      role: UserRole.MANAGER
    });
    
    const client1 = await User.create({
      name: 'Иванов Иван',
      email: 'client1@example.com',
      password: hashedPassword,
      role: UserRole.CLIENT
    });
    
    const client2 = await User.create({
      name: 'Петров Петр',
      email: 'client2@example.com',
      password: hashedPassword,
      role: UserRole.CLIENT
    });
    
    const client3 = await User.create({
      name: 'Сидорова Анна',
      email: 'client3@example.com',
      password: hashedPassword,
      role: UserRole.CLIENT
    });
    
    const expert1 = await User.create({
      name: 'Николаев Николай',
      email: 'expert1@example.com',
      password: hashedPassword,
      role: UserRole.EXPERT
    });
    
    const master1 = await User.create({
      name: 'Михайлов Михаил',
      email: 'master1@example.com',
      password: hashedPassword,
      role: UserRole.MASTER
    });
    
    const designer1 = await User.create({
      name: 'Александрова Александра',
      email: 'designer1@example.com',
      password: hashedPassword,
      role: UserRole.DESIGNER
    });
    
    // Создаем проекты
    const project1 = await Project.create({
      name: 'Ремонт квартиры на ул. Шейнкмана',
      address: 'ул. Шейнкмана 4, 93',
      startDate: new Date('2025-04-10'),
      endDate: new Date('2025-05-30'),
      clientId: client1._id,
      managerId: manager1._id,
      status: ProjectStatus.IN_PROGRESS
    });
    
    const project2 = await Project.create({
      name: 'Ремонт ванной комнаты',
      address: 'ул. Ленина 25, 12',
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-06-15'),
      clientId: client2._id,
      managerId: manager2._id,
      status: ProjectStatus.PLANNING
    });
    
    console.log('База данных успешно заполнена начальными данными!');
    console.log(`Создано пользователей: ${await User.countDocuments()}`);
    console.log(`Создано проектов: ${await Project.countDocuments()}`);
    
  } catch (error) {
    console.error('Ошибка при заполнении базы данных:', error);
  }
};