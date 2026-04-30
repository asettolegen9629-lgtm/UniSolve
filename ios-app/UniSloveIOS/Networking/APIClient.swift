import Foundation

enum APIError: LocalizedError {
    case invalidURL
    case invalidResponse
    case requestFailed(Int, String)
    case decodingFailed

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid API URL"
        case .invalidResponse:
            return "Invalid server response"
        case .requestFailed(let code, let message):
            return "Request failed (\(code)): \(message)"
        case .decodingFailed:
            return "Failed to decode response data"
        }
    }
}

final class APIClient {
    static let shared = APIClient()
    private init() {}

    func fetchReports() async throws -> [Report] {
        guard let url = URL(string: "\(APIConfig.baseURL)/reports") else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        if !APIConfig.clerkUserId.isEmpty {
            request.setValue(APIConfig.clerkUserId, forHTTPHeaderField: "x-clerk-user-id")
        }
        if !APIConfig.clerkEmail.isEmpty {
            request.setValue(APIConfig.clerkEmail, forHTTPHeaderField: "x-clerk-email")
        }
        if !APIConfig.clerkUsername.isEmpty {
            request.setValue(APIConfig.clerkUsername, forHTTPHeaderField: "x-clerk-username")
        }
        if !APIConfig.clerkFullName.isEmpty {
            request.setValue(APIConfig.clerkFullName, forHTTPHeaderField: "x-clerk-full-name")
        }

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let http = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }

        guard (200 ... 299).contains(http.statusCode) else {
            let message = String(data: data, encoding: .utf8) ?? "Unknown error"
            throw APIError.requestFailed(http.statusCode, message)
        }

        do {
            return try JSONDecoder().decode([Report].self, from: data)
        } catch {
            throw APIError.decodingFailed
        }
    }
}
