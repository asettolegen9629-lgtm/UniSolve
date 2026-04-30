import Foundation

struct Report: Decodable, Identifiable {
    let id: String
    let title: String?
    let description: String?
    let category: String?
    let status: String?
    let userRating: Int?
    let isApproved: Bool?
    let createdAt: String?
    let user: UserProfile?
    let likes: [APILikeItem]?
    let comments: [CommentItem]?
}
