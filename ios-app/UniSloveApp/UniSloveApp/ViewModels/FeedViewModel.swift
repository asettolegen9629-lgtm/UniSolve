import Foundation

@MainActor
final class FeedViewModel: ObservableObject {
    @Published var reports: [Report] = []
    @Published var isLoading = false
    @Published var errorMessage: String?

    func loadReports() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            reports = try await APIClient.shared.fetchReports()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
