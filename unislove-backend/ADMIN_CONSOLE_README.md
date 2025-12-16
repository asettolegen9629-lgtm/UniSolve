# UniSolve Admin Console

Terminal-based admin interface for managing the UniSolve platform.

## How to Run

```bash
cd unislove-backend
npm run admin
```

Or directly:
```bash
node admin-console.js
```

## Features

### 1. View All Reports
- Lists all reports with details
- Shows status, verification, rating, user info
- Displays likes, comments, and images count

### 2. View Report by ID
- Get detailed information about a specific report
- Shows all comments, likes, and images
- Displays user information

### 3. Verify Report
- Mark reports as verified or unverified
- Helps filter real problems from fake ones

### 4. Update Report Status
- Change report status: `in-progress` or `done`
- Automatically creates notification for the user

### 5. Rate Report
- Rate reports from 1-5 stars
- Helps prioritize important issues
- Automatically creates notification for the user

### 6. View All Users
- List all registered users
- Shows user statistics (reports, comments)
- Displays admin status

### 7. Make User Admin
- Grant admin privileges to users
- Enter user email to make them admin

### 8. View Statistics
- System-wide statistics
- Total users, reports, comments, likes
- Report status breakdown
- Verified and rated reports count

### 9. Delete Report
- Permanently delete reports
- Requires confirmation
- Deletes all related data (comments, likes, images)

## Usage Example

```
╔═══════════════════════════════════════════════════════╗
║           UNISOLVE ADMIN CONSOLE                  ║
╚═══════════════════════════════════════════════════════╝

Main Menu:
1. View all reports
2. View report by ID
3. Verify report (mark as verified)
4. Update report status
5. Rate report (1-5 stars)
6. View all users
7. Make user admin
8. View statistics
9. Delete report
0. Exit

Select an option: 1
```

## Notes

- All changes are saved immediately to the database
- Notifications are automatically created for users when you:
  - Update report status
  - Rate a report
- Use `Ctrl+C` to exit at any time
- Make sure the database is connected before running

## Requirements

- Node.js installed
- Database connection configured
- Prisma Client generated (`npx prisma generate`)

