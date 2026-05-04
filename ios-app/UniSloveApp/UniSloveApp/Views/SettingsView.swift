import SwiftUI

struct SettingsView: View {
    @State private var baseURL = APIConfig.baseURL
    @State private var userId = APIConfig.clerkUserId
    @State private var email = APIConfig.clerkEmail
    @State private var username = APIConfig.clerkUsername
    @State private var fullName = APIConfig.clerkFullName
    @State private var saved = false

    var body: some View {
        NavigationStack {
            Form {
                Section("Backend") {
                    TextField("API URL", text: $baseURL)
                        .keyboardType(.URL)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                }

                Section("Clerk headers") {
                    TextField("x-clerk-user-id", text: $userId)
                    TextField("x-clerk-email", text: $email)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                    TextField("x-clerk-username", text: $username)
                    TextField("x-clerk-full-name", text: $fullName)
                }

                Section {
                    Button("Save") {
                        APIConfig.baseURL = baseURL.trimmingCharacters(in: .whitespacesAndNewlines)
                        APIConfig.clerkUserId = userId.trimmingCharacters(in: .whitespacesAndNewlines)
                        APIConfig.clerkEmail = email.trimmingCharacters(in: .whitespacesAndNewlines)
                        APIConfig.clerkUsername = username.trimmingCharacters(in: .whitespacesAndNewlines)
                        APIConfig.clerkFullName = fullName.trimmingCharacters(in: .whitespacesAndNewlines)
                        saved = true
                    }
                }
            }
            .navigationTitle("Settings")
            .alert("Saved", isPresented: $saved) {
                Button("OK", role: .cancel) {}
            } message: {
                Text("API settings were updated.")
            }
        }
    }
}
