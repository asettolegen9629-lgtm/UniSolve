# UniSolve Project

## 🚀 Быстрый запуск

### macOS/Linux:
```bash
./start.sh
```

### Windows:
```bash
start.bat
```

**Всё!** Сайт автоматически запустится на http://localhost:5173

## 📋 Требования

- **Node.js** - [Скачать](https://nodejs.org/)
- **PostgreSQL** - [Скачать](https://www.postgresql.org/download/)

### Установка PostgreSQL:

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Windows:**
Скачайте установщик с [postgresql.org](https://www.postgresql.org/download/windows/) и установите

**Linux:**
```bash
sudo apt install postgresql
sudo systemctl start postgresql
```

## 🌐 Использование общей базы данных (все видят одни посты)

Хотите, чтобы все пользователи видели одни и те же посты? Используйте бесплатную облачную БД!

**Бесплатные варианты:**
- **Supabase** (рекомендуется) - https://supabase.com
- **Neon** - https://neon.tech
- **Railway** - https://railway.app

📖 **Подробная инструкция:** См. файл [SETUP_CLOUD_DB.md](SETUP_CLOUD_DB.md)

**Быстрый старт с Supabase:**
1. Создайте аккаунт на https://supabase.com (бесплатно)
2. Создайте новый проект
3. Скопируйте строку подключения из Settings → Database
4. Обновите `unislove-backend/.env` с новой `DATABASE_URL`
5. Запустите `./start.sh`

## ✅ Что делает скрипт автоматически:

- ✅ Устанавливает все зависимости
- ✅ Создает нужные файлы настроек
- ✅ Настраивает базу данных
- ✅ Добавляет тестовые посты
- ✅ Запускает backend и frontend

**Просто запустите скрипт и всё заработает!**
