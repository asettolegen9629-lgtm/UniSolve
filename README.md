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

## 🌐 Общая база данных (все видят одни посты)

**По умолчанию** каждый видит свои посты (локальная БД).

**Чтобы ВСЕ видели одни посты:**

1. Откройте файл `SETUP_SHARED_DB.txt` (простая инструкция)
2. Или следуйте шагам:
   - Создайте БД на https://supabase.com (бесплатно, 5 минут)
   - Скопируйте строку подключения
   - Вставьте в `unislove-backend/.env` вместо `DATABASE_URL`
   - Запустите `./start.sh`

📖 **Подробнее:** [QUICK_SETUP.md](QUICK_SETUP.md)

## ✅ Что делает скрипт автоматически:

- ✅ Устанавливает все зависимости
- ✅ Создает нужные файлы настроек
- ✅ Настраивает базу данных
- ✅ Добавляет тестовые посты
- ✅ Запускает backend и frontend

**Просто запустите скрипт и всё заработает!**
