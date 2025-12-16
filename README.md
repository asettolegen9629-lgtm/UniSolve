# UniSolve Project

## Быстрый старт

### Автоматическая установка (рекомендуется)

**Для macOS/Linux:**
```bash
./setup.sh
```

**Для Windows:**
```bash
setup.bat
```

Скрипт автоматически:
- ✅ Установит все зависимости
- ✅ Создаст .env файлы с нужными настройками
- ✅ Настроит базу данных

### Ручная установка

1. **Установите зависимости:**
   ```bash
   cd client && npm install
   cd ../unislove-backend && npm install
   ```

2. **Создайте .env файлы** (скрипт делает это автоматически):
   - `client/.env` - уже настроен в скрипте
   - `unislove-backend/.env` - уже настроен в скрипте

3. **Настройте базу данных:**
   ```bash
   cd unislove-backend
   npx prisma generate
   npx prisma db push
   ```

### Запуск проекта

**Терминал 1 - Backend:**
```bash
cd unislove-backend
npm start
```

**Терминал 2 - Frontend:**
```bash
cd client
npm run dev
```

Откройте в браузере адрес, который покажет Vite (обычно http://localhost:5173)

## Требования

- Node.js (v16 или выше)
- PostgreSQL (запущен и база данных `unislove_db` создана)
- npm или yarn

