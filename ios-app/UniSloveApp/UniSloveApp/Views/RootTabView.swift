import SwiftUI

struct RootTabView: View {
    private enum Tab: Hashable {
        case dashboard
        case notifications
        case newReport
        case feedback
        case profile
    }

    @State private var selectedTab: Tab = .dashboard

    var body: some View {
        TabView {
            DashboardView()
                .tabItem {
                    Label("Home", systemImage: "house")
                }
                .tag(Tab.dashboard)

            NotificationsView()
                .tabItem {
                    Label("Alerts", systemImage: "bell")
                }
                .tag(Tab.notifications)

            NewReportView()
                .tabItem {
                    Label("New", systemImage: "plus")
                }
                .tag(Tab.newReport)

            FeedbackView()
                .tabItem {
                    Label("Feedback", systemImage: "star")
                }
                .tag(Tab.feedback)

            ProfileView()
                .tabItem {
                    Label("Profile", systemImage: "person")
                }
                .tag(Tab.profile)
        }
        .tint(Color.orange)
    }
}
