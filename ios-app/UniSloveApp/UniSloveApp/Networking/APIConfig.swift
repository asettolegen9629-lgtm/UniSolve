import Foundation

struct APIConfig {
    static let defaultBaseURL = "http://localhost:3000/api"

    private enum Keys {
        static let baseURL = "ios.api.baseURL"
        static let clerkUserId = "ios.clerk.userId"
        static let clerkEmail = "ios.clerk.email"
        static let clerkUsername = "ios.clerk.username"
        static let clerkFullName = "ios.clerk.fullName"
    }

    static var baseURL: String {
        get { UserDefaults.standard.string(forKey: Keys.baseURL) ?? defaultBaseURL }
        set { UserDefaults.standard.set(newValue, forKey: Keys.baseURL) }
    }

    static var clerkUserId: String {
        get { UserDefaults.standard.string(forKey: Keys.clerkUserId) ?? "" }
        set { UserDefaults.standard.set(newValue, forKey: Keys.clerkUserId) }
    }

    static var clerkEmail: String {
        get { UserDefaults.standard.string(forKey: Keys.clerkEmail) ?? "" }
        set { UserDefaults.standard.set(newValue, forKey: Keys.clerkEmail) }
    }

    static var clerkUsername: String {
        get { UserDefaults.standard.string(forKey: Keys.clerkUsername) ?? "" }
        set { UserDefaults.standard.set(newValue, forKey: Keys.clerkUsername) }
    }

    static var clerkFullName: String {
        get { UserDefaults.standard.string(forKey: Keys.clerkFullName) ?? "" }
        set { UserDefaults.standard.set(newValue, forKey: Keys.clerkFullName) }
    }
}
