#!/bin/bash

# Initial setup helper for a fresh local machine.
echo "Setting up UniSolve..."

echo "Installing frontend dependencies..."
cd client
npm install

if [ ! -f .env ]; then
    echo "Creating client/.env from .env.example..."
    cp .env.example .env 2>/dev/null || cat > .env << EOF
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
VITE_API_URL=http://localhost:3000/api
EOF
    echo "Created client/.env — add your Clerk key from the Clerk dashboard."
else
    echo "client/.env already exists"
fi

cd ..

echo "Installing backend dependencies..."
cd unislove-backend
npm install

if [ ! -f .env ]; then
    echo "Creating unislove-backend/.env..."
    cat > .env << EOF
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/unislove_db?schema=public"
PORT=3000
EOF
    echo "Created unislove-backend/.env"
else
    echo "unislove-backend/.env already exists"
fi

echo "Generating Prisma client..."
npx prisma generate

echo "Applying database schema..."
echo "Ensure PostgreSQL is running and database unislove_db exists."
npx prisma db push || echo "Could not apply schema — check DATABASE_URL and PostgreSQL."

cd ..

echo ""
echo "Setup finished."
echo ""
echo "To run locally:"
echo "  Terminal 1: cd unislove-backend && npm start"
echo "  Terminal 2: cd client && npm run dev"
echo ""
