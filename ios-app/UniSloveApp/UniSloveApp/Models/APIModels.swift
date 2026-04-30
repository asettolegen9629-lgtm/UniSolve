import Foundation

struct UserProfile: Codable, Identifiable {
    let id: String?
    let clerkUserId: String?
    let email: String?
    let username: String?
    let fullName: String?
    let profilePicture: String?
    let isAdmin: Bool?
}

struct ReportInput: Codable {
    let title: String?
    let description: String
    let category: String
    let isAnonymous: Bool
}

struct CommentItem: Codable, Identifiable {
    let id: String
    let content: String?
    let reportId: String?
    let userId: String?
    let parentCommentId: String?
    let createdAt: String?
    let likes: [APILikeItem]?
    let replies: [CommentItem]?
}

struct APILikeItem: Codable, Identifiable {
    let id: String
    let userId: String?
    let reportId: String?
    let commentId: String?
}

struct APIToggleLikeResponse: Codable {
    let liked: Bool?
    let message: String?
}

struct APINotificationItem: Codable, Identifiable {
    let id: String
    let type: String?
    let message: String?
    let isRead: Bool?
    let createdAt: String?
}

struct APIFeedbackItem: Codable, Identifiable {
    let id: String
    let message: String?
    let type: String?
    let reportId: String?
    let isRead: Bool?
    let createdAt: String?
}

struct APICountResponse: Codable {
    let count: Int
}

struct APIMessageResponse: Codable {
    let message: String
}
