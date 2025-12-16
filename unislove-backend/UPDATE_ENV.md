# Update Your .env File

I've created a `.env` file with default values. **You need to update it with your actual database credentials!**

## Current .env file contains:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/unislove_db?schema=public"
PORT=3000
```

## ⚠️ IMPORTANT: Update These Values

1. **Username**: Replace `postgres` with your PostgreSQL username
2. **Password**: Replace `postgres` with your PostgreSQL password  
3. **Database**: Replace `unislove_db` with your database name (or create it first)

## How to Edit:

```bash
cd unislove-backend
nano .env
```

Or use any text editor to edit the file.

## Example with real credentials:

If your PostgreSQL:
- Username: `myuser`
- Password: `mypassword123`
- Database: `unislove_db`

Then your `.env` should be:
```env
DATABASE_URL="postgresql://myuser:mypassword123@localhost:5432/unislove_db?schema=public"
PORT=3000
```

## After updating .env:

1. Make sure your database exists:
   ```bash
   createdb unislove_db
   ```

2. Run migrations:
   ```bash
   npx prisma migrate dev
   ```

3. Test admin console:
   ```bash
   npm run admin
   ```

