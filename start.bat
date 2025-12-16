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

if not exist "client\node_modules" (
    echo 📦 Установка зависимостей для frontend...
    cd client
    call npm install
    cd ..
)

if not exist "client\.env" (
    echo 📝 Создание .env для frontend...
    (
        echo VITE_CLERK_PUBLISHABLE_KEY=pk_test_ZWxlZ2FudC1uZXd0LTQ3LmNsZXJrLmFjY291bnRzLmRldiQ
        echo VITE_API_URL=http://localhost:3000/api
    ) > client\.env
)

if not exist "unislove-backend\node_modules" (
    echo 📦 Установка зависимостей для backend...
    cd unislove-backend
    call npm install
    cd ..
)

if not exist "unislove-backend\.env" (
    echo 📝 Создание .env для backend...
    (
        echo DATABASE_URL="postgresql://postgres:postgres@localhost:5432/unislove_db?schema=public"
        echo PORT=3000
    ) > unislove-backend\.env
)

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

