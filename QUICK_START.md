# Quick Start Guide - Connect Frontend to Backend

## Step 1: Start Backend Server

Open a terminal and run:

```bash
cd unislove-backend
npm install  # If you haven't already
npm start
```

You should see:
```
Server is running on port 3000
```

**Test it:** Open `http://localhost:3000/health` in your browser. You should see:
```json
{"status":"OK","message":"Server is running"}
```

## Step 2: Start Frontend

Open a **NEW** terminal and run:

```bash
cd client
npm install  # If you haven't already
npm run dev
```

You should see:
```
VITE v... ready in ... ms
➜  Local:   http://localhost:5173/
```

## Step 3: Check Connection

1. Open your browser to `http://localhost:5173`
2. Open **Developer Tools** (F12 or Right-click → Inspect)
3. Go to the **Console** tab
4. You should see: `✅ Backend is running: {status: "OK", ...}`

## Step 4: Test Login

1. Login through Clerk
2. Check the **Network** tab in DevTools
3. Look for requests to `/api/users/sync`
4. Should return status 200 (success)

## Step 5: Test Creating a Report

1. Go to "New Report" page
2. Fill in description and category
3. Optionally add images
4. Click "Publish Report"
5. Check Network tab for `/api/reports` POST request
6. Should return status 201 (created)

## Troubleshooting

### If backend won't start:
- Check if port 3000 is already in use
- Check if database is running
- Check `.env` file exists in `unislove-backend/`

### If frontend can't connect:
- Make sure backend is running first
- Check browser console for errors
- Verify `VITE_API_URL` in `client/.env` is `http://localhost:3000/api`

### If you see CORS errors:
- Backend CORS is configured for `http://localhost:5173`
- If using different port, update `server.js`

### If authentication fails:
- Make sure you're logged in through Clerk
- Check Network tab to see if headers are being sent
- Verify Clerk keys are correct in `.env`

## Quick Test Commands

### Test Backend Health:
```bash
curl http://localhost:3000/health
```

### Test API Endpoint:
```bash
curl http://localhost:3000/api/reports
```

### Check if ports are in use:
```bash
# Mac/Linux
lsof -i :3000
lsof -i :5173

# Windows
netstat -ano | findstr :3000
```

## Environment Variables Checklist

### Backend (`unislove-backend/.env`):
```env
DATABASE_URL="postgresql://username:password@localhost:5432/unislove_db?schema=public"
PORT=3000
```

### Frontend (`client/.env`):
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key_here
VITE_API_URL=http://localhost:3000/api
```

## Still Having Issues?

1. Check `CONNECTION_TROUBLESHOOTING.md` for detailed solutions
2. Check backend console for error messages
3. Check browser console for error messages
4. Check Network tab in DevTools to see actual requests/responses

