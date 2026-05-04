import SwiftUI

struct FeedView: View {
    @StateObject private var viewModel = FeedViewModel()

    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading {
                    ProgressView("Loading reports...")
                } else if let error = viewModel.errorMessage {
                    ContentUnavailableView("Failed to load", systemImage: "exclamationmark.triangle", description: Text(error))
                } else if viewModel.reports.isEmpty {
                    ContentUnavailableView("Nothing here yet", systemImage: "tray", description: Text("There are no reports in the feed"))
                } else {
                    List(viewModel.reports) { report in
                        VStack(alignment: .leading, spacing: 6) {
                            Text(report.title?.isEmpty == false ? report.title! : "Untitled")
                                .font(.headline)
                            if let description = report.description, !description.isEmpty {
                                Text(description)
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                                    .lineLimit(3)
                            }
                            Text("Status: \(report.status ?? "unknown")")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                        .padding(.vertical, 4)
                    }
                    .listStyle(.plain)
                }
            }
            .navigationTitle("Feed")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Reload") {
                        Task { await viewModel.loadReports() }
                    }
                }
            }
            .task {
                await viewModel.loadReports()
            }
        }
    }
}
