@echo off
echo 🚀 Запуск UniSolve...

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js не установлен! Установите Node.js с https://nodejs.org/
    pause
    exit /b 1
)

where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  PostgreSQL не найден. Установите PostgreSQL:
    echo    https://www.postgresql.org/download/windows/
    pause
    exit /b 1
)

echo 📦 Установка зависимостей для frontend...
cd client
if not exist "node_modules" (
    echo    Установка npm пакетов...
    call npm install
) else (
    echo    Проверка зависимостей...
    call npm install
)

if not exist ".env" (
    echo 📝 Создание .env для frontend...
    (
        echo VITE_CLERK_PUBLISHABLE_KEY=pk_test_ZWxlZ2FudC1uZXd0LTQ3LmNsZXJrLmFjY291bnRzLmRldiQ
        echo VITE_API_URL=http://localhost:3000/api
    ) > .env
    echo ✅ .env файл создан для frontend
) else (
    findstr /C:"VITE_CLERK_PUBLISHABLE_KEY" .env >nul
    if errorlevel 1 (
        echo 📝 Добавление недостающих переменных в .env...
        echo VITE_CLERK_PUBLISHABLE_KEY=pk_test_ZWxlZ2FudC1uZXd0LTQ3LmNsZXJrLmFjY291bnRzLmRldiQ >> .env
        echo VITE_API_URL=http://localhost:3000/api >> .env
    )
)
cd ..

echo 📦 Установка зависимостей для backend...
cd unislove-backend
if not exist "node_modules" (
    echo    Установка npm пакетов...
    call npm install
) else (
    echo    Проверка зависимостей...
    call npm install
)

if not exist ".env" (
    echo 📝 Создание .env для backend...
    (
        echo DATABASE_URL="postgresql://postgres:postgres@localhost:5432/unislove_db?schema=public"
        echo PORT=3000
    ) > .env
    echo ✅ .env файл создан для backend
)
cd ..

echo 🗄️  Проверка базы данных...
cd unislove-backend

psql -U postgres -lqt 2>nul | findstr /C:"unislove_db" >nul
if %ERRORLEVEL% NEQ 0 (
    echo 📝 Создание базы данных...
    psql -U postgres -c "CREATE DATABASE unislove_db;" 2>nul
)

echo 🔧 Настройка базы данных...
call npx prisma generate 2>nul
call npx prisma db push --accept-data-loss 2>nul

echo 🌱 Добавление тестовых постов...
call node seed.js 2>nul

cd ..

echo 🔧 Запуск backend сервера...
start "Backend" cmd /k "cd unislove-backend && npm start"

timeout /t 3 /nobreak >nul

echo 🎨 Запуск frontend...
start "Frontend" cmd /k "cd client && npm run dev"

echo.
echo ✅ Проект запущен!
echo 📱 Frontend: http://localhost:5173
echo 🔧 Backend: http://localhost:3000
echo.
echo Закройте окна терминалов для остановки
pause

