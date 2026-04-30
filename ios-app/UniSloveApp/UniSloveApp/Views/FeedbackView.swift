import SwiftUI

private struct FeedbackItem: Identifiable {
    let id = UUID()
    let title: String
    let date: String
    let message: String
    let category: String
}

struct FeedbackView: View {
    private let items: [FeedbackItem] = [
        .init(title: "Your Report", date: "Resolved on Oct 20", message: "Cafeteria tables repair - All tables have been fixed and are now stable.", category: "Facilities"),
        .init(title: "Your Report", date: "Resolved on Oct 18", message: "Trash bins near entrance - Maintenance team has cleaned all bins and added more.", category: "Sanitation")
    ]

    var body: some View {
        AppScaffold(title: "Feedback", subtitle: "Rate resolved issues") {
            ForEach(items) { item in
                VStack(alignment: .leading, spacing: 10) {
                    HStack(spacing: 10) {
                        Circle()
                            .fill(Color.orange.opacity(0.9))
                            .frame(width: 26, height: 26)
                            .overlay(Text("JD").font(.caption2).foregroundStyle(.white))
                        VStack(alignment: .leading, spacing: 0) {
                            Text(item.title)
                                .font(.subheadline.weight(.semibold))
                            Text(item.date)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }

                    Text(item.message)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)

                    HStack {
                        Text(item.category)
                            .font(.caption.weight(.semibold))
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(Color(.systemGray6))
                            .clipShape(Capsule())
                        Spacer()
                        Text("Solved")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(.green)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(Color.green.opacity(0.14))
                            .clipShape(Capsule())
                    }

                    Button("Rate") {}
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 10)
                        .background(Color.orange)
                        .foregroundStyle(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                }
                .padding(12)
                .background(Color(.systemBackground))
                .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
            }
        }
    }
}
