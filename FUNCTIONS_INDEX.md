# Functions Index

Автоматически сгенерированный список функций по текущему состоянию проекта.

Всего файлов с функциями: **38**
Всего функций/методов (по сигнатурам): **157**

## `client/src/App.jsx`

- `App()`

## `client/src/components/Loading.jsx`

- `Loading()`

## `client/src/components/MenuItems.jsx`

- `MenuItems()`
- `onUpdated()`
- `fetchUnreadCount()`
- `checkAdminStatus()`

## `client/src/components/PostCard.jsx`

- `PostCard()`
- `fetchComments()`
- `handleLike()`
- `handleCommentSubmit()`
- `handleReplySubmit()`
- `toggleComments()`

## `client/src/components/SideBar.jsx`

- `SideBar()`
- `fetchUserProfile()`

## `client/src/main.jsx`

- `AppWithAuth()`

## `client/src/pages/Admin/AdminFeedback.jsx`

- `AdminFeedback()`
- `fetchData()`
- `handleSendMessage()`
- `getTypeLabel()`
- `getTypeColor()`

## `client/src/pages/Admin/AdminLayout.jsx`

- `AdminLayout()`
- `fetchUser()`
- `fetchAdminUnreadCount()`
- `onUpdated()`

## `client/src/pages/Admin/AdminNotifications.jsx`

- `AdminNotifications()`
- `fetchNotifications()`
- `handleMarkAsRead()`
- `getNotificationIcon()`
- `getNotificationColor()`
- `getInitials()`

## `client/src/pages/Admin/AdminProfile.jsx`

- `AdminProfile()`
- `fetchUserData()`
- `handleProfilePictureChange()`
- `handleUpdateProfile()`

## `client/src/pages/Admin/Dashboard.jsx`

- `Dashboard()`
- `fetchData()`
- `getStatusColor()`
- `getStatusLabel()`

## `client/src/pages/Admin/ManageReports.jsx`

- `ManageReports()`
- `fetchReports()`
- `filterReports()`
- `getUniqueCategories()`
- `clearFilters()`
- `hasActiveFilters()`
- `handleApprove()`
- `handleStatusChange()`
- `handleRate()`
- `handleVerify()`
- `handleDelete()`
- `getStatusColor()`
- `getStatusLabel()`
- `ActionModal()`

## `client/src/pages/Admin/ManageUsers.jsx`

- `ManageUsers()`
- `fetchUsers()`
- `filterUsers()`
- `handleMakeAdmin()`

## `client/src/pages/Feed.jsx`

- `Feed()`
- `fetchFeeds()`
- `handleCommentAdded()`

## `client/src/pages/Feedback.jsx`

- `StarRating()`
- `handleStarClick()`
- `FeedbackCard()`
- `handleRatingChange()`
- `handleSendFeedback()`
- `Feedback()`
- `handleRatingUpdate()`
- `loadFeedback()`

## `client/src/pages/Layout.jsx`

- `Layout()`

## `client/src/pages/Login.jsx`

- `Login()`

## `client/src/pages/Notification.jsx`

- `getInitials()`
- `getAvatarColor()`
- `truncateText()`
- `ImageModal()`
- `handleEscape()`
- `NotificationItem()`
- `handleToggleDetails()`
- `Notification()`
- `fetchNotifications()`
- `handleMarkAsRead()`

## `client/src/pages/Profile.jsx`

- `Profile()`
- `fetchUserData()`
- `fetchUserReports()`
- `handleProfilePictureChange()`
- `handleUpdateProfile()`
- `handleLike()`

## `client/src/pages/Report.jsx`

- `Report()`
- `fetchUser()`
- `handleSubmit()`

## `client/src/routes/api.js`

- `getIssues()`
- `createIssue()`

## `client/src/services/api.js`

- `setClerkHeaders()`

## `client/src/utils/testConnection.js`

- `testBackendConnection()`
- `testAPIEndpoint()`

## `controllers/issuesController.js`

- `getIssues()`
- `createIssue()`

## `dependecies.py`

- `read_root()`
- `read_item()`
- `update_item()`

## `unislove-backend/admin-console.js`

- `colorize()`
- `printHeader()`
- `printMenu()`
- `question()`
- `viewAllReports()`
- `viewReportById()`
- `viewPendingReports()`
- `approveOrRejectReport()`
- `verifyReport()`
- `updateReportStatus()`
- `rateReport()`
- `viewAllUsers()`
- `makeUserAdmin()`
- `viewStatistics()`
- `deleteReport()`
- `main()`

## `unislove-backend/check-reports.js`

- `checkReports()`

## `unislove-backend/cleanup-admin-user.js`

- `cleanupAdminUser()`

## `unislove-backend/controllers/adminNotificationsController.js`

- `getAdminNotifications()`
- `markAdminNotificationAsRead()`
- `getAdminUnreadCount()`

## `unislove-backend/controllers/commentsController.js`

- `createComment()`
- `getCommentsByReport()`
- `deleteComment()`

## `unislove-backend/controllers/feedbackController.js`

- `createFeedback()`
- `getAllFeedbacksForAdmin()`
- `getFeedbackStatistics()`
- `getFeedbacksByReport()`
- `markFeedbackAsRead()`

## `unislove-backend/controllers/likesController.js`

- `toggleReportLike()`
- `toggleCommentLike()`
- `getReportLikes()`
- `getCommentLikes()`

## `unislove-backend/controllers/notificationsController.js`

- `getNotifications()`
- `markAsRead()`
- `markAllAsRead()`
- `getUnreadCount()`

## `unislove-backend/controllers/reportsController.js`

- `createReport()`
- `getAllReports()`
- `getReportById()`
- `getReportsByUser()`
- `updateReportStatus()`
- `rateReport()`
- `rateReportByUser()`
- `approveReport()`
- `getPendingReports()`
- `getAllReportsForAdmin()`
- `getAdminStatistics()`
- `deleteReport()`

## `unislove-backend/controllers/usersController.js`

- `getOrCreateUser()`
- `getUserById()`
- `updateUser()`
- `getCurrentUser()`
- `getAllUsers()`
- `makeUserAdmin()`

## `unislove-backend/middleware/auth.js`

- `authenticateUser()`
- `isAdmin()`

## `unislove-backend/seed.js`

- `seed()`

## `unislove-backend/setup-admin.js`

- `setupAdmin()`
