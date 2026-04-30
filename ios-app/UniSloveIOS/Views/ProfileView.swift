import SwiftUI

struct ProfileView: View {
    @State private var darkModeEnabled = false
    @State private var notificationsEnabled = true
    @State private var showApiSettings = false

    var body: some View {
        AppScaffold(title: "Profile", subtitle: "Manage your account") {
            profileCard
            settingsCard
            statsCard
            Button("Open API Settings") {
                showApiSettings = true
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 10)
            .background(Color.orange.opacity(0.9))
            .foregroundStyle(.white)
            .clipShape(RoundedRectangle(cornerRadius: 10))
        }
        .sheet(isPresented: $showApiSettings) {
            SettingsView()
        }
    }

    private var profileCard: some View {
        VStack(spacing: 10) {
            Circle()
                .fill(Color.orange.opacity(0.9))
                .frame(width: 64, height: 64)
                .overlay(Text("JD").font(.title2.weight(.bold)).foregroundStyle(.white))
            Text("John Doe")
                .font(.title3.weight(.semibold))
            Text("john.doe@university.edu")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(16)
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
    }

    private var settingsCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Settings")
                .font(.headline)
            Toggle("Dark Mode", isOn: $darkModeEnabled)
            Toggle("Notifications", isOn: $notificationsEnabled)
        }
        .padding(16)
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
    }

    private var statsCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Your Stats")
                .font(.headline)
            statRow(title: "Reports submitted", value: "12")
            statRow(title: "Resolved", value: "8")
            statRow(title: "Feedback sent", value: "5")
        }
        .padding(16)
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
    }

    private func statRow(title: String, value: String) -> some View {
        HStack {
            Text(title)
                .font(.subheadline)
            Spacer()
            Text(value)
                .font(.subheadline.weight(.semibold))
        }
        .foregroundStyle(.secondary)
    }
}
