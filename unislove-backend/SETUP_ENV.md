# Environment Setup

The admin console needs a `.env` file to connect to the database.

## Create .env file

Create a file named `.env` in the `unislove-backend` directory with:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/unislove_db?schema=public"
PORT=3000
```

## Replace with your actual values:

- `username` - Your PostgreSQL username
- `password` - Your PostgreSQL password
- `localhost:5432` - Your database host and port (if different)
- `unislove_db` - Your database name

## Example:

```env
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/unislove_db?schema=public"
PORT=3000
```

## After creating .env:

1. Make sure your database exists
2. Run migrations: `npx prisma migrate dev`
3. Run admin console: `npm run admin`

