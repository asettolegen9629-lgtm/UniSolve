# Connection Troubleshooting Guide

## Common Issues and Solutions

### 1. Backend Not Running
**Symptoms:** 
- Network errors in browser console
- "Failed to fetch" errors
- Timeout errors

**Solution:**
```bash
cd unislove-backend
npm start
```
Check that you see: `Server is running on port 3000`

### 2. CORS Errors
**Symptoms:**
- Browser console shows CORS policy errors
- Requests blocked by browser

**Solution:**
- Backend CORS is configured for `http://localhost:5173` (Vite default)
- If using different port, update `server.js` CORS origin
- Make sure backend is running before frontend

### 3. API URL Not Set
**Symptoms:**
- Requests going to wrong URL
- 404 errors

**Solution:**
Create `.env` file in `client/` directory:
```env
VITE_API_URL=http://localhost:3000/api
```

### 4. Authentication Headers Not Set
**Symptoms:**
- 401 Unauthorized errors
- User not found errors

**Solution:**
- Make sure you're logged in through Clerk
- Check browser console for Clerk user object
- Verify headers are being sent (check Network tab in DevTools)

### 5. Database Not Connected
**Symptoms:**
- Backend crashes on startup
- Prisma errors

**Solution:**
```bash
cd unislove-backend
# Check .env file has correct DATABASE_URL
npx prisma migrate dev
npx prisma generate
```

### 6. Port Conflicts
**Symptoms:**
- Backend won't start
- Port already in use error

**Solution:**
- Change PORT in backend `.env` file
- Update frontend API URL to match

## Testing Connection

### 1. Test Backend Health
Open browser: `http://localhost:3000/health`
Should return: `{"status":"OK","message":"Server is running"}`

### 2. Test API Endpoint
Open browser: `http://localhost:3000/api/reports`
Should return: `[]` (empty array if no reports) or array of reports

### 3. Check Browser Console
- Open DevTools (F12)
- Go to Network tab
- Try to load feed
- Check if requests are being made
- Check request/response details

### 4. Check Backend Logs
Backend should log:
```
GET /api/reports { headers: { ... } }
```

## Step-by-Step Connection Test

1. **Start Backend:**
   ```bash
   cd unislove-backend
   npm start
   ```

2. **Verify Backend:**
   - Visit `http://localhost:3000/health`
   - Should see JSON response

3. **Start Frontend:**
   ```bash
   cd client
   npm run dev
   ```

4. **Check Console:**
   - Open browser DevTools
   - Check Console for errors
   - Check Network tab for API calls

5. **Test Login:**
   - Login through Clerk
   - Check if user syncs to backend
   - Check Network tab for `/api/users/sync` request

## Debug Mode

Add to your code to see what's happening:

```javascript
// In browser console
localStorage.setItem('debug', 'true')

// In API service
console.log('API URL:', API_URL)
console.log('Request config:', config)
```

## Common Error Messages

### "Network Error"
- Backend not running
- Wrong API URL
- Firewall blocking connection

### "401 Unauthorized"
- Not logged in
- Clerk headers not set
- User not synced to backend

### "404 Not Found"
- Wrong API endpoint
- Route not defined in backend
- API URL incorrect

### "500 Internal Server Error"
- Database issue
- Backend code error
- Check backend console logs

## Still Having Issues?

1. Check backend console for errors
2. Check browser console for errors
3. Check Network tab in DevTools
4. Verify all environment variables are set
5. Make sure database is running and connected
6. Check that Prisma migrations have been run

