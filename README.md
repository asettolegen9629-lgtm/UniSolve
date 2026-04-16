# UniSolve

A platform for university students to report campus issues, track their resolution, and collaborate on solutions.

---

## Problem Statement

University campuses have no easy way for students to surface maintenance issues, safety concerns, or facility problems. Reports get lost in email chains or go unreported entirely. UniSolve gives every student a direct channel to submit, upvote, and follow up on campus issues — and gives administrators a single dashboard to manage them.

---

## Features

- Submit campus issue reports with descriptions and photo attachments
- Comment and like reports to surface the most urgent issues
- Real-time notifications when your report status changes
- Admin console for reviewing, approving, and resolving reports
- Feedback system for closed reports
- Authentication via Clerk (OAuth / email)

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router |
| Auth | Clerk |
| Backend | Node.js, Express |
| Database | PostgreSQL via Prisma ORM |
| HTTP Client | Axios |

---

## Project Structure

```
UniSolve/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route-level page components
│   │   ├── services/        # API call wrappers
│   │   ├── routes/          # React Router config
│   │   └── utils/           # Shared utilities
│   └── public/
├── unislove-backend/        # Express API server
│   ├── controllers/         # Request handlers
│   ├── routes/              # Express route definitions
│   ├── middleware/          # Auth and error middleware
│   └── prisma/              # Database schema and migrations
├── docs/                    # Project documentation
├── tests/                   # Test suites
├── assets/                  # Static assets (screenshots, diagrams)
├── .gitignore
├── LICENSE
└── README.md
```

---

## Installation

### Prerequisites

- Node.js 18+
- PostgreSQL database
- A [Clerk](https://clerk.com) account for authentication

### 1. Clone the repository

```bash
git clone https://github.com/asettolegen9629-lgtm/UniSolve.git
cd UniSolve
```

### 2. Set up the backend

```bash
cd unislove-backend
cp .env.example .env
# Fill in DATABASE_URL and any other required values in .env
npm install
npx prisma migrate dev
npm run dev
```

### 3. Set up the frontend

```bash
cd ../client
cp .env.example .env
# Fill in VITE_CLERK_PUBLISHABLE_KEY and VITE_API_URL in .env
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and the backend on `http://localhost:3000`.

---

## Usage

1. Open the app in your browser and sign in via Clerk.
2. Browse existing campus reports on the home feed.
3. Click **New Report** to submit an issue with a title, description, and optional photo.
4. Like or comment on reports to help prioritise them.
5. Admins can log into the admin console to manage report statuses.

---

## Environment Variables

### Backend (`unislove-backend/.env`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |

### Frontend (`client/.env`)

| Variable | Description |
|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `VITE_API_URL` | Backend API base URL |

---

## License

[MIT](LICENSE)
