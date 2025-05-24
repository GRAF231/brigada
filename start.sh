#!/bin/bash

# Запуск MongoDB
echo "Запуск MongoDB..."
./mongodb/bin/mongod --dbpath=./data/db &
MONGO_PID=$!

# Ждем, пока MongoDB запустится
sleep 3

# Запуск сервера
echo "Запуск сервера Node.js..."
cd server && npm run dev &
SERVER_PID=$!

# Ждем, пока сервер запустится
sleep 3

# Запуск клиента
echo "Запуск клиента React..."
cd client && npm start &
CLIENT_PID=$!

# Функция для корректного завершения всех процессов
cleanup() {
    echo "Завершение работы..."
    kill $CLIENT_PID
    kill $SERVER_PID
    kill $MONGO_PID
    exit 0
}

# Перехват сигналов для корректного завершения
trap cleanup SIGINT SIGTERM

# Ожидание завершения
echo "Все компоненты запущены. Нажмите Ctrl+C для завершения."
wait