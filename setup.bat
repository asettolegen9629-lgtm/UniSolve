@echo off
echo 🚀 Настройка проекта UniSolve...

echo 📦 Установка зависимостей для frontend...
cd client
call npm install

if not exist .env (
    echo 📝 Создание .env для frontend...
    (
        echo VITE_CLERK_PUBLISHABLE_KEY=pk_test_ZWxlZ2FudC1uZXd0LTQ3LmNsZXJrLmFjY291bnRzLmRldiQ
        echo VITE_API_URL=http://localhost:3000/api
    ) > .env
    echo ✅ .env файл создан для frontend
) else (
    echo ✅ .env файл уже существует для frontend
)

cd ..

echo 📦 Установка зависимостей для backend...
cd unislove-backend
call npm install

if not exist .env (
    echo 📝 Создание .env для backend...
    (
        echo DATABASE_URL="postgresql://postgres:postgres@localhost:5432/unislove_db?schema=public"
        echo PORT=3000
    ) > .env
    echo ✅ .env файл создан для backend
) else (
    echo ✅ .env файл уже существует для backend
)

echo 🔧 Генерация Prisma клиента...
call npx prisma generate

echo 🗄️  Применение миграций базы данных...
echo ⚠️  Убедитесь, что PostgreSQL запущен и база данных unislove_db создана!
call npx prisma db push

cd ..

echo.
echo ✅ Установка завершена!
echo.
echo 📋 Для запуска проекта:
echo    1. Терминал 1: cd unislove-backend ^&^& npm start
echo    2. Терминал 2: cd client ^&^& npm run dev
echo.

pause

