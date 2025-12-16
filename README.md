# UniSolve Project

## Установка и запуск

### 1. Установка зависимостей

```bash
# Frontend
cd client
npm install

# Backend
cd ../unislove-backend
npm install
```

### 2. Настройка переменных окружения

#### Client (client/.env)
Скопируйте `client/.env.example` в `client/.env` и заполните:
```
VITE_CLERK_PUBLISHABLE_KEY=ваш_clerk_key
VITE_API_URL=http://localhost:3000/api
```

#### Backend (unislove-backend/.env)
Скопируйте `unislove-backend/.env.example` в `unislove-backend/.env` и заполните:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/unislove_db?schema=public"
PORT=3000
```

### 3. Настройка базы данных

```bash
cd unislove-backend
npx prisma generate
npx prisma db push
```

### 4. Запуск проекта

#### Терминал 1 - Backend
```bash
cd unislove-backend
npm start
```

#### Терминал 2 - Frontend
```bash
cd client
npm run dev
```

### 5. Открыть в браузере

Откройте адрес, который покажет Vite (обычно http://localhost:5173)

## Важно!

- Убедитесь, что PostgreSQL запущен
- Убедитесь, что база данных `unislove_db` создана
- После клонирования проекта обязательно создайте `.env` файлы из `.env.example`

