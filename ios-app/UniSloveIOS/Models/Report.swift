import Foundation

struct Report: Decodable, Identifiable {
    let id: Int
    let title: String?
    let description: String?
    let status: String?
    let createdAt: String?
}
