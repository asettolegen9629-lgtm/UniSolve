#!/bin/bash

echo "🚀 Запуск UniSolve..."

# Проверка Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен! Установите Node.js с https://nodejs.org/"
    exit 1
fi

# Проверка PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL не найден. Установите PostgreSQL:"
    echo "   macOS: brew install postgresql@14 && brew services start postgresql@14"
    echo "   Linux: sudo apt install postgresql"
    echo "   Windows: https://www.postgresql.org/download/windows/"
    exit 1
fi

# Установка зависимостей для frontend
if [ ! -d "client/node_modules" ]; then
    echo "📦 Установка зависимостей для frontend..."
    cd client
    npm install
    cd ..
fi

# Создание .env для frontend
if [ ! -f "client/.env" ]; then
    echo "📝 Создание .env для frontend..."
    cat > client/.env << EOF
VITE_CLERK_PUBLISHABLE_KEY=pk_test_ZWxlZ2FudC1uZXd0LTQ3LmNsZXJrLmFjY291bnRzLmRldiQ
VITE_API_URL=http://localhost:3000/api
EOF
fi

# Установка зависимостей для backend
if [ ! -d "unislove-backend/node_modules" ]; then
    echo "📦 Установка зависимостей для backend..."
    cd unislove-backend
    npm install
    cd ..
fi

# Создание .env для backend
if [ ! -f "unislove-backend/.env" ]; then
    echo "📝 Создание .env для backend..."
    cat > unislove-backend/.env << EOF
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/unislove_db?schema=public"
PORT=3000
EOF
fi

# Проверка и создание базы данных
echo "🗄️  Проверка базы данных..."
cd unislove-backend

# Проверяем подключение к PostgreSQL
if psql -U postgres -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw unislove_db; then
    echo "✅ База данных уже существует"
else
    echo "📝 Создание базы данных..."
    psql -U postgres -c "CREATE DATABASE unislove_db;" 2>/dev/null || {
        echo "⚠️  Не удалось создать БД автоматически. Создайте вручную:"
        echo "   psql -U postgres"
        echo "   CREATE DATABASE unislove_db;"
        echo "   \\q"
    }
fi

# Генерация Prisma клиента
echo "🔧 Настройка базы данных..."
npx prisma generate 2>/dev/null || npm install prisma @prisma/client

# Применение миграций
npx prisma db push --accept-data-loss 2>/dev/null || echo "⚠️  Проверьте подключение к БД"

# Добавление тестовых данных
echo "🌱 Добавление тестовых постов..."
node seed.js 2>/dev/null || echo "⚠️  Не удалось добавить тестовые данные"

cd ..

# Запуск backend в фоне
echo "🔧 Запуск backend сервера..."
cd unislove-backend
npm start > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Ждем запуска backend
sleep 3

# Проверка что backend запустился
if ! curl -s http://localhost:3000/health > /dev/null; then
    echo "⚠️  Backend не запустился. Проверьте backend.log"
else
    echo "✅ Backend запущен на http://localhost:3000"
fi

# Запуск frontend
echo "🎨 Запуск frontend..."
cd client
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Проект запущен!"
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend: http://localhost:3000"
echo ""
echo "Для остановки нажмите Ctrl+C"

# Ожидание завершения
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait

