# UniSolve - University Problem Reporting System

UniSolve is a platform where students can register, login, and report problems about their university. The system allows students to create reports with descriptions, categories, and photos. Other students can like and comment on reports. Admins can verify reports, rate them, and update their status.

## Features

- **User Authentication**: Registration and login using Clerk
- **Report Creation**: Students can create reports with description, category, and photos
- **Social Features**: Like and comment on reports
- **Admin Features**: Verify reports, rate them (1-5 stars), and update status
- **Notifications**: Get notified when reports are liked, commented, or status changes
- **Profile Management**: Update profile information and view your reports

## Tech Stack

### Frontend
- React
- Vite
- Clerk (Authentication)
- React Router
- Tailwind CSS
- Axios

### Backend
- Node.js
- Express
- PostgreSQL
- Prisma ORM
- Multer (File uploads)

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- Clerk account (for authentication)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd unislove-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `unislove-backend` directory:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/unislove_db?schema=public"
PORT=3000
CLERK_SECRET_KEY=your_clerk_secret_key_here
```

4. Set up the database:
```bash
npx prisma migrate dev
```

5. Generate Prisma Client:
```bash
npx prisma generate
```

6. Start the server:
```bash
npm start
```

Or for development with auto-reload:
```bash
npx nodemon server.js
```

The backend will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `client` directory:
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=http://localhost:3000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (or another port if 5173 is taken)

## API Endpoints

### Users
- `POST /api/users/sync` - Sync/create user from Clerk
- `GET /api/users/me` - Get current user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/me` - Update current user profile

### Reports
- `GET /api/reports` - Get all reports
- `GET /api/reports/:id` - Get report by ID
- `POST /api/reports` - Create new report (requires auth)
- `GET /api/reports/user/me` - Get current user's reports
- `PUT /api/reports/:id/status` - Update report status (admin only)
- `PUT /api/reports/:id/rate` - Rate report (admin only)

### Comments
- `GET /api/comments/report/:reportId` - Get comments for a report
- `POST /api/comments/report/:reportId` - Create comment (requires auth)
- `DELETE /api/comments/:id` - Delete comment (requires auth)

### Likes
- `GET /api/likes/report/:reportId` - Get likes for a report
- `GET /api/likes/comment/:commentId` - Get likes for a comment
- `POST /api/likes/report/:reportId` - Toggle like on report (requires auth)
- `POST /api/likes/comment/:commentId` - Toggle like on comment (requires auth)

### Notifications
- `GET /api/notifications` - Get all notifications (requires auth)
- `GET /api/notifications/unread-count` - Get unread count (requires auth)
- `PUT /api/notifications/:id/read` - Mark notification as read (requires auth)
- `PUT /api/notifications/read-all` - Mark all as read (requires auth)

## Database Schema

The database includes the following models:
- **User**: User accounts with Clerk integration
- **Report**: Problem reports with description, category, status, and admin rating
- **ReportImage**: Images associated with reports
- **Comment**: Comments on reports
- **ReportLike**: Likes on reports
- **CommentLike**: Likes on comments
- **Notification**: User notifications

## Authentication

The application uses Clerk for authentication. When a user logs in:
1. The frontend sends Clerk user information to the backend
2. The backend creates or updates the user in the database
3. All subsequent API calls include Clerk user headers for authentication

## File Uploads

Report images are uploaded using Multer and stored in the `uploads/` directory. Images are served statically at `/uploads/:filename`.

## Admin Features

To make a user an admin, update the `isAdmin` field in the database:
```sql
UPDATE users SET "isAdmin" = true WHERE "clerkId" = 'user_clerk_id';
```

## Development Notes

- The backend uses Prisma for database operations
- File uploads are handled by Multer
- CORS is enabled for development
- The frontend uses Axios for API calls with interceptors for authentication

## License

This project is for educational purposes.

