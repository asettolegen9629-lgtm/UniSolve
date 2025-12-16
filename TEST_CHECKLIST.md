# ✅ Testing Checklist - Everything is Ready!

## Pre-Testing Setup (Do this first!)

### 1. Install Dependencies

**Backend:**
```bash
cd unislove-backend
npm install
```

**Frontend:**
```bash
cd client
npm install axios  # Important: Install axios if not already installed
npm install
```

### 2. Database Setup

```bash
cd unislove-backend

# Create .env file if it doesn't exist
# Add this line:
DATABASE_URL="postgresql://username:password@localhost:5432/unislove_db?schema=public"
PORT=3000

# Run migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

### 3. Environment Variables

**Backend** (`unislove-backend/.env`):
```env
DATABASE_URL="postgresql://username:password@localhost:5432/unislove_db?schema=public"
PORT=3000
```

**Frontend** (`client/.env`):
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
VITE_API_URL=http://localhost:3000/api
```

## 🚀 Testing Steps

### Step 1: Start Backend
```bash
cd unislove-backend
npm start
```

**Expected Output:**
```
Server is running on port 3000
```

**✅ Test:** Open `http://localhost:3000/health` in browser
- Should see: `{"status":"OK","message":"Server is running"}`

### Step 2: Start Frontend
```bash
cd client
npm run dev
```

**Expected Output:**
```
VITE v... ready in ... ms
➜  Local:   http://localhost:5173/
```

### Step 3: Test Connection

1. Open browser to `http://localhost:5173`
2. Open Developer Tools (F12)
3. Check **Console** tab:
   - Should see: `✅ Backend is running: {status: "OK", ...}`
4. Check **Network** tab:
   - Should see requests to backend

### Step 4: Test Login

1. Click "Sign In" / Login
2. Login through Clerk
3. Check **Network** tab:
   - Look for `POST /api/users/sync` request
   - Status should be 200 (success)
4. Check **Console**:
   - Should see: `Clerk user set: {...}`
   - Should see: `Syncing user: {...}`

### Step 5: Test Feed Page

1. After login, you should see the Feed page
2. Check **Network** tab:
   - Look for `GET /api/reports` request
   - Status should be 200
3. Feed should load (may be empty if no reports yet)

### Step 6: Test Creating Report

1. Navigate to "New Report" or `/new-report`
2. Fill in:
   - Description: "Test report - broken lights"
   - Category: "Infrastructure"
3. Optionally add an image
4. Click "Publish Report"
5. Check **Network** tab:
   - Look for `POST /api/reports` request
   - Status should be 201 (created)
6. Should see success toast: "Report created successfully!"
7. Go back to Feed - your report should appear!

### Step 7: Test Profile

1. Navigate to Profile page
2. Should see your user information
3. Should see "Your Reports" section with your created reports

### Step 8: Test Notifications

1. Navigate to Notifications page
2. Should load (may be empty if no notifications yet)
3. When someone likes/comments on your report, notifications will appear here

## ✅ Success Indicators

- ✅ Backend starts without errors
- ✅ Frontend connects to backend (check console)
- ✅ Login works and user syncs
- ✅ Feed loads reports
- ✅ Can create new reports
- ✅ Profile shows user data
- ✅ No CORS errors in console
- ✅ No 404/500 errors in Network tab

## ❌ Common Issues & Quick Fixes

### Issue: "Cannot find module 'axios'"
**Fix:** `cd client && npm install axios`

### Issue: "Cannot connect to backend"
**Fix:** 
- Make sure backend is running on port 3000
- Check `http://localhost:3000/health` works
- Verify `VITE_API_URL` in `client/.env`

### Issue: "Database connection error"
**Fix:**
- Make sure PostgreSQL is running
- Check `DATABASE_URL` in `unislove-backend/.env`
- Run `npx prisma migrate dev`

### Issue: "CORS error"
**Fix:**
- Backend CORS is configured for `http://localhost:5173`
- If using different port, update `server.js` CORS origin

### Issue: "401 Unauthorized"
**Fix:**
- Make sure you're logged in through Clerk
- Check that Clerk headers are being sent (Network tab)
- Verify Clerk keys in `.env` files

## 🎉 You're Ready to Test!

Everything is set up correctly. Follow the steps above and you should be able to test all features!

If you encounter any issues, check:
1. Browser console for errors
2. Backend console for errors
3. Network tab for failed requests
4. `CONNECTION_TROUBLESHOOTING.md` for detailed solutions

