import SwiftUI

struct DashboardView: View {
    @StateObject private var viewModel = FeedViewModel()

    var body: some View {
        AppScaffold(title: "Dashboard", subtitle: "Overview of campus issues") {
            if viewModel.isLoading {
                ProgressView("Loading...")
                    .frame(maxWidth: .infinity)
            } else if let error = viewModel.errorMessage {
                dashboardCard {
                    Text(error)
                        .font(.subheadline)
                        .foregroundStyle(.red)
                }
            } else if viewModel.reports.isEmpty {
                dashboardCard {
                    Text("No reports yet")
                        .foregroundStyle(.secondary)
                }
            } else {
                ForEach(viewModel.reports.prefix(8)) { report in
                    reportCard(report)
                }
            }
        }
        .task {
            await viewModel.loadReports()
        }
    }

    private func reportCard(_ report: Report) -> some View {
        dashboardCard {
            VStack(alignment: .leading, spacing: 10) {
                HStack(spacing: 10) {
                    Circle()
                        .fill(Color.orange.opacity(0.9))
                        .frame(width: 26, height: 26)
                        .overlay(Text("JD").font(.caption2).foregroundStyle(.white))
                    VStack(alignment: .leading, spacing: 0) {
                        Text("John Doe")
                            .font(.subheadline.weight(.semibold))
                        Text("2 hours ago")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }

                RoundedRectangle(cornerRadius: 10)
                    .fill(
                        LinearGradient(
                            colors: [Color.indigo.opacity(0.75), Color.purple.opacity(0.55)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(height: 120)

                Text(report.title?.isEmpty == false ? report.title! : "Campus issue")
                    .font(.headline)
                Text(report.description?.isEmpty == false ? report.description! : "Issue description")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .lineLimit(2)

                HStack {
                    pill(report.status ?? "Infrastructure", tint: .gray.opacity(0.18), textColor: .secondary)
                    Spacer()
                    pill(statusLabel(report.status), tint: .orange.opacity(0.25), textColor: .orange)
                }
            }
        }
    }

    private func statusLabel(_ status: String?) -> String {
        switch status?.lowercased() {
        case "approved", "resolved":
            return "Solved"
        case "pending":
            return "Pending"
        default:
            return "Being Solved"
        }
    }

    private func pill(_ text: String, tint: Color, textColor: Color) -> some View {
        Text(text)
            .font(.caption.weight(.semibold))
            .foregroundStyle(textColor)
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(tint)
            .clipShape(Capsule())
    }

    private func dashboardCard<Content: View>(@ViewBuilder _ content: () -> Content) -> some View {
        VStack(alignment: .leading) {
            content()
        }
        .padding(12)
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
    }
}
