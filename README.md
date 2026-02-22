# AuraConfess - Anonymous Confession Platform 🎮

A gamified MERN stack application where users can post anonymous confessions, earn Aura Points, and compete on the leaderboard!

## Features ✨

- 🔐 Google OAuth 2.0 Authentication
- 🎭 Anonymous Confessions with Secret Codes
- ⚡ Aura Points Currency System
- 🏆 Leaderboard for Top Confessions
- 💬 Comments & Reactions
- 🔒 Locked Premium Confessions (50+ reactions)
- 📊 Live Polls on Confessions
- 🔥 Auto-burn/hide confessions after 24 hours
- 💾 Save & Draft Confessions

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Google OAuth 2.0 credentials

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
SESSION_SECRET=your_session_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

### Installation

1. Install backend dependencies:
```bash
npm install
```

2. Install frontend dependencies:
```bash
cd client
npm install
```

### Running the Application

1. Start both backend and frontend:
```bash
npm run dev:full
```

Or run separately:

Backend:
```bash
npm run dev
```

Frontend:
```bash
npm run client
```

## Tech Stack 🛠️

- **Frontend**: React, React Router, Axios
- **Backend**: Node.js, Express
- **Database**: MongoDB with Mongoose
- **Authentication**: Passport.js with Google OAuth 2.0
- **Styling**: Custom CSS with gamified theme

## How to Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:5000/auth/google/callback`
6. Copy Client ID and Client Secret to `.env` file

## Game Mechanics 🎮

- **Earn Aura Points**: Get 1 point for each reaction on your confession
- **Unlock Confessions**: Spend points to unlock popular confessions (50+ reactions)
- **Leaderboard**: Compete for top positions with most reactions
- **Secret Codes**: Edit or delete your confessions using your unique code

## Project Structure

```
AuraConfess/
├── backend/
│   ├── config/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   └── server.js
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       └── App.js
└── .env
```

## License

MIT License
