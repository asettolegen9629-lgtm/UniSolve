#!/bin/bash

# Initial setup helper for a fresh local machine.
echo "🚀 Настройка проекта UniSolve..."

# Установка зависимостей для frontend
echo "📦 Установка зависимостей для frontend..."
cd client
npm install

# Создание .env для frontend если его нет
if [ ! -f .env ]; then
    echo "📝 Создание .env для frontend..."
    cat > .env << EOF
VITE_CLERK_PUBLISHABLE_KEY=pk_test_ZWxlZ2FudC1uZXd0LTQ3LmNsZXJrLmFjY291bnRzLmRldiQ
VITE_API_URL=http://localhost:3000/api
EOF
    echo "✅ .env файл создан для frontend"
else
    echo "✅ .env файл уже существует для frontend"
fi

cd ..

# Установка зависимостей для backend
echo "📦 Установка зависимостей для backend..."
cd unislove-backend
npm install

# Создание .env для backend если его нет
if [ ! -f .env ]; then
    echo "📝 Создание .env для backend..."
    cat > .env << EOF
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/unislove_db?schema=public"
PORT=3000
EOF
    echo "✅ .env файл создан для backend"
else
    echo "✅ .env файл уже существует для backend"
fi

# Генерация Prisma клиента
echo "🔧 Генерация Prisma клиента..."
npx prisma generate

# Применение миграций базы данных
echo "🗄️  Применение миграций базы данных..."
echo "⚠️  Убедитесь, что PostgreSQL запущен и база данных unislove_db создана!"
npx prisma db push || echo "⚠️  Не удалось применить миграции. Проверьте подключение к БД."

cd ..

echo ""
echo "✅ Установка завершена!"
echo ""
echo "📋 Для запуска проекта:"
echo "   1. Терминал 1: cd unislove-backend && npm start"
echo "   2. Терминал 2: cd client && npm run dev"
echo ""

