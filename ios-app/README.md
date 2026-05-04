# iOS (SwiftUI) — UniSolve

Basic iOS client skeleton for the `unislove-backend` API.

## Included

- Network layer (`APIClient`) for `GET /api/reports`
- Connection settings (base URL, Clerk header fields)
- `UserDefaults` for persisting settings

## Run in Xcode

1. Create a new iOS App: **SwiftUI**, **Swift**, name e.g. `UniSloveIOS`.
2. Copy files from `ios-app/UniSloveIOS` into the project (Create groups).
3. In `UniSloveIOSApp.swift`, set the root view to `RootTabView()`.
4. Start the backend (`unislove-backend`). The simulator can use `http://localhost:3000/api` for the API base URL.
5. Open **Settings**, set Clerk headers (at least `x-clerk-user-id`), tap **Save**.
6. Open **Feed** and tap **Reload**.

## Next steps

- Integrate the official Clerk iOS SDK
- Report detail, comments, likes, notifications
- New report with photos (multipart upload)
