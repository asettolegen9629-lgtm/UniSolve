#!/bin/bash

echo "🚀 Запуск UniSolve..."

# Проверка Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен! Установите Node.js с https://nodejs.org/"
    exit 1
fi

# Проверка npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm не установлен! Установите Node.js с https://nodejs.org/"
    exit 1
fi

# Проверка PostgreSQL (не критично, можно использовать облачную БД)
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL не найден локально. Можно использовать облачную БД (Supabase)."
    echo "   Или установите PostgreSQL:"
    echo "   macOS: brew install postgresql@14 && brew services start postgresql@14"
    echo "   Linux: sudo apt install postgresql"
fi

# Установка зависимостей для frontend (ВСЕГДА)
echo "📦 Установка зависимостей для frontend..."
cd client
if [ ! -d "node_modules" ] || [ ! -f "package-lock.json" ]; then
    echo "   Установка npm пакетов..."
    npm install
else
    echo "   Проверка зависимостей..."
    npm install
fi

# Создание .env для frontend (ВСЕГДА проверяем)
if [ ! -f ".env" ]; then
    echo "📝 Создание .env для frontend..."
    cat > .env << EOF
VITE_CLERK_PUBLISHABLE_KEY=pk_test_ZWxlZ2FudC1uZXd0LTQ3LmNsZXJrLmFjY291bnRzLmRldiQ
VITE_API_URL=http://localhost:3000/api
EOF
    echo "✅ .env файл создан для frontend"
else
    # Проверяем что ключ есть
    if ! grep -q "VITE_CLERK_PUBLISHABLE_KEY" .env; then
        echo "📝 Добавление недостающих переменных в .env..."
        echo "VITE_CLERK_PUBLISHABLE_KEY=pk_test_ZWxlZ2FudC1uZXd0LTQ3LmNsZXJrLmFjY291bnRzLmRldiQ" >> .env
        echo "VITE_API_URL=http://localhost:3000/api" >> .env
    fi
fi
cd ..

# Установка зависимостей для backend (ВСЕГДА)
echo "📦 Установка зависимостей для backend..."
cd unislove-backend
if [ ! -d "node_modules" ] || [ ! -f "package-lock.json" ]; then
    echo "   Установка npm пакетов..."
    npm install
else
    echo "   Проверка зависимостей..."
    npm install
fi

# Создание .env для backend (ВСЕГДА проверяем)
if [ ! -f ".env" ]; then
    echo "📝 Создание .env для backend..."
    echo "   Используется облачная БД (Supabase) - все видят одни посты!"
    cat > .env << 'EOF'
DATABASE_URL="postgresql://postgres.unislove:YOUR_PASSWORD@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
PORT=3000
EOF
    echo ""
    echo "⚠️  ВАЖНО: Нужно настроить облачную БД один раз!"
    echo "   1. Откройте https://supabase.com и создайте бесплатный аккаунт"
    echo "   2. Создайте новый проект"
    echo "   3. Скопируйте строку подключения из Settings → Database"
    echo "   4. Вставьте её в unislove-backend/.env вместо DATABASE_URL"
    echo ""
    echo "   Или используйте локальную БД (каждый видит свои посты):"
    echo "   DATABASE_URL=\"postgresql://postgres:postgres@localhost:5432/unislove_db?schema=public\""
    echo ""
    read -p "   Продолжить с локальной БД? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cat > .env << EOF
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/unislove_db?schema=public"
PORT=3000
EOF
        echo "✅ Используется локальная БД"
    else
        echo "⚠️  Настройте облачную БД в unislove-backend/.env перед запуском!"
        exit 1
    fi
else
    # Проверяем что DATABASE_URL есть
    if ! grep -q "DATABASE_URL" .env; then
        echo "📝 Добавление DATABASE_URL в .env..."
        echo 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/unislove_db?schema=public"' >> .env
        echo "PORT=3000" >> .env
    fi
fi
cd ..

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

