#!/bin/bash

# All-in-one: install deps, optional DB setup, start backend and frontend.
echo "Starting UniSolve..."

if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Install from https://nodejs.org/"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "npm is not found. Install Node.js from https://nodejs.org/"
    exit 1
fi

if ! command -v psql &> /dev/null; then
    echo "psql not found. You can use a cloud database (e.g. Supabase) or install PostgreSQL locally."
    echo "  macOS: brew install postgresql@14 && brew services start postgresql@14"
    echo "  Linux: sudo apt install postgresql"
fi

echo "Installing frontend dependencies..."
cd client
echo "  (npm install may take a few minutes)"
npm install --silent || npm install

if [ ! -f ".env" ]; then
    echo "Creating client/.env..."
    cp .env.example .env 2>/dev/null || cat > .env << EOF
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
VITE_API_URL=http://localhost:3000/api
EOF
    echo "Created client/.env — set VITE_CLERK_PUBLISHABLE_KEY from Clerk."
else
    if ! grep -q "VITE_CLERK_PUBLISHABLE_KEY" .env; then
        echo "Adding VITE_CLERK_PUBLISHABLE_KEY to .env..."
        echo "VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here" >> .env
        echo "VITE_API_URL=http://localhost:3000/api" >> .env
    fi
fi
cd ..

echo "Installing backend dependencies..."
cd unislove-backend
echo "  (npm install may take a few minutes)"
npm install --silent || npm install

if [ ! -f ".env" ]; then
    echo "Creating unislove-backend/.env..."
    cat > .env << EOF
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/unislove_db?schema=public"
PORT=3000
EOF
    echo "Created unislove-backend/.env (local Postgres defaults)"
else
    if ! grep -q "DATABASE_URL" .env; then
        echo "Adding DATABASE_URL to .env..."
        echo 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/unislove_db?schema=public"' >> .env
        echo "PORT=3000" >> .env
    fi
fi
cd ..

echo "Checking database..."
cd unislove-backend

if psql -U postgres -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw unislove_db; then
    echo "Database unislove_db exists"
else
    echo "Creating database unislove_db..."
    psql -U postgres -c "CREATE DATABASE unislove_db;" 2>/dev/null || {
        echo "Could not create DB automatically. Create manually:"
        echo "  psql -U postgres"
        echo "  CREATE DATABASE unislove_db;"
    }
fi

echo "Prisma generate / db push..."
npx prisma generate 2>/dev/null || npm install prisma @prisma/client
npx prisma db push --accept-data-loss 2>/dev/null || echo "Check DATABASE_URL and PostgreSQL connection"

echo "Seeding sample data..."
node seed.js 2>/dev/null || echo "Seed skipped or failed (non-fatal)"

cd ..

echo "Starting backend..."
cd unislove-backend
npm start > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

sleep 3

if ! curl -s http://localhost:3000/health > /dev/null; then
    echo "Backend may not be up — see backend.log"
else
    echo "Backend: http://localhost:3000"
fi

echo "Starting frontend..."
cd client
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "Project started."
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
