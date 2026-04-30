# UniSlove iOS App (SwiftUI)

Базовый каркас iOS-клиента для текущего backend (`unislove-backend`).

## Что уже есть

- SwiftUI app structure (`RootTabView`, `FeedView`, `SettingsView`)
- Сетевой слой (`APIClient`) для endpoint `GET /api/reports`
- Настройки подключения:
  - `API URL`
  - `x-clerk-user-id`
  - `x-clerk-email`
  - `x-clerk-username`
  - `x-clerk-full-name`
- Хранение настроек через `UserDefaults`

## Быстрый запуск в Xcode

1. Открой Xcode -> New Project -> iOS App.
2. Название проекта: `UniSloveIOS`, интерфейс: `SwiftUI`, язык: `Swift`.
3. Скопируй файлы из папки `ios-app/UniSloveIOS` в созданный проект (Create groups).
4. В `UniSloveIOSApp.swift` замени стартовый `ContentView` на `RootTabView()`.
5. Запусти backend (`unislove-backend`) и убедись, что iPhone Simulator видит URL API:
   - для симулятора обычно подходит `http://localhost:3000/api`
6. Вкладка `Settings` -> заполни Clerk headers (минимум `x-clerk-user-id`), нажми Save.
7. Вернись в `Feed` и нажми Reload.

## Следующий этап

- Добавить авторизацию Clerk для iOS (через официальный SDK)
- Экран деталей репорта + комментарии
- Лайки и уведомления
- Создание репорта с фото (multipart upload)
