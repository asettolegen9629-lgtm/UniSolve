# UniSlove Flutter App

Flutter-клиент с экранами по вашему дизайну:

- Dashboard
- Notifications
- New Report
- Feedback
- Profile

## Быстрый старт

1. Установи Flutter SDK: [flutter.dev](https://docs.flutter.dev/get-started/install)
2. В папке `flutter-app` выполни:

```bash
flutter pub get
flutter run -d chrome
```

или для Android:

```bash
flutter run -d android
```

## API

По умолчанию используется:

`http://localhost:3000/api`

Для Android-эмулятора обычно нужен:

`http://10.0.2.2:3000/api`

Базовый URL меняется в `lib/services/api_config.dart`.
