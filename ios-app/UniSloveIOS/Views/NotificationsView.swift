import SwiftUI

private struct NotificationItem: Identifiable {
    let id = UUID()
    let initials: String
    let title: String
    let body: String
    let time: String
}

struct NotificationsView: View {
    private let items: [NotificationItem] = [
        .init(initials: "AD", title: "Admin commented", body: "\"We've assigned a maintenance team for the broken lights.\"", time: "2 hours ago"),
        .init(initials: "SL", title: "Sarah Lee commented", body: "\"I've noticed the same issue in Building B. Hope this gets fixed soon!\"", time: "5 hours ago"),
        .init(initials: "AD", title: "Admin updated status", body: "\"Marked your report as Solved.\"", time: "1 day ago")
    ]

    var body: some View {
        AppScaffold(title: "Notifications", subtitle: "Updates and comments") {
            ForEach(items) { item in
                VStack(alignment: .leading, spacing: 8) {
                    HStack(alignment: .top, spacing: 10) {
                        Circle()
                            .fill(Color.orange.opacity(0.9))
                            .frame(width: 30, height: 30)
                            .overlay(Text(item.initials).font(.caption2).foregroundStyle(.white))
                        VStack(alignment: .leading, spacing: 3) {
                            Text(item.title)
                                .font(.subheadline.weight(.semibold))
                            Text(item.body)
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }
                    }
                    Text(item.time)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                .padding(12)
                .background(Color(.systemBackground))
                .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
            }
        }
    }
}
