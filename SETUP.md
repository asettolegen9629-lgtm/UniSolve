# Quick Setup Guide

## Step 1: Database Setup

1. Create a PostgreSQL database:
```bash
createdb unislove_db
```

2. Or using psql:
```sql
CREATE DATABASE unislove_db;
```

## Step 2: Backend Setup

```bash
cd unislove-backend
npm install
```

3. Create `.env` file:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/unislove_db?schema=public"
PORT=3000
```

4. Run migrations:
```bash
npx prisma migrate dev --name init
```

5. Generate Prisma Client:
```bash
npx prisma generate
```

6. Start server:
```bash
npm start
```

## Step 3: Frontend Setup

```bash
cd client
npm install
```

2. Create `.env` file:
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=http://localhost:3000/api
```

3. Start dev server:
```bash
npm run dev
```

## Step 4: Create Admin User

After creating your first user through Clerk, make them admin:

```sql
UPDATE users SET "isAdmin" = true WHERE email = 'your-email@example.com';
```

## Troubleshooting

### Database Connection Issues
- Make sure PostgreSQL is running
- Check your DATABASE_URL in `.env`
- Verify database exists

### CORS Issues
- Backend CORS is configured for `http://localhost:5173`
- If using different port, update `server.js`

### File Upload Issues
- Make sure `uploads/` directory exists in `unislove-backend/`
- Check file size limits (10MB max)

### Authentication Issues
- Verify Clerk keys are correct
- Check that headers are being sent in API requests

