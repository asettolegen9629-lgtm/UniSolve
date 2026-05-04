# Flutter — UniSolve

Flutter client with screens aligned to the product design.

## Quick start

1. Install the Flutter SDK: [flutter.dev](https://docs.flutter.dev/get-started/install)
2. From `flutter-app/`:

```bash
flutter pub get
flutter run -d chrome
```

Or for Android:

```bash
flutter run -d android
```

## Defaults

The API base URL is configured in `lib/services/api_config.dart`.

For the Android emulator you typically need `http://10.0.2.2:3000/api` instead of `localhost`.

Change the base URL in `lib/services/api_config.dart` for your environment.
