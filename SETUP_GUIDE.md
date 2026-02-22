# 🎮 AuraConfess - Setup Guide

## Prerequisites

- Node.js v14+ installed
- MongoDB (local or MongoDB Atlas account)
- Google OAuth 2.0 credentials

## Step 1: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set Application Type to "Web Application"
6. Add Authorized Redirect URI: `http://localhost:5000/auth/google/callback`
7. Copy your Client ID and Client Secret

## Step 2: Configure Environment

Your `.env` file is already configured! Just verify these values:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
JWT_SECRET=any_random_long_string_123
SESSION_SECRET=another_random_secret_session_key_456
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

## Step 3: Install Dependencies

### Backend:
```bash
npm install
```

### Frontend:
```bash
cd client
npm install
```

## Step 4: Run the Application

### Option A: Run Both Together (Recommended)
From the root directory:
```bash
npm run dev:full
```

### Option B: Run Separately

**Terminal 1 - Backend:**
```bash
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

## Step 5: Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

The backend API runs on:
```
http://localhost:5000
```

## 🎮 Features Overview

### Anonymous Confessions
- Post confessions without revealing your identity
- Use secret codes to edit/delete your own confessions
- Categories: Love, Friendship, Family, Work, School, Secrets, Regrets, Dreams

### Gamification
- **Earn Aura Points**: +1 point for each reaction on your confession
- **Level System**: Level up as you earn points
- **Leaderboard**: Top 10 confessions by reactions

### Reactions & Engagement
- 5 reaction types: 🔥 Fire, ❤️ Heart, 😂 Laugh, 😢 Sad, 😲 Shocked
- Comment on confessions
- Save favorite confessions

### Premium Features
- **Locked Confessions**: Posts with 50+ reactions are locked
- **Unlock with Points**: Spend 50 Aura Points to access locked content
- View your unlocked confessions in profile

### Time-Limited Content
- **Burn Feature**: Set confessions to auto-hide after 24 hours
- **Draft System**: Save confessions as drafts before publishing

### Live Polls
- Add polls to your confessions
- Get real-time audience feedback
- Vote on other users' polls

## 🛠️ Troubleshooting

### Port Already in Use
If port 5000 or 5173 is busy, change the PORT in `.env` and update `client/vite.config.js`

### MongoDB Connection Error
- Verify your MONGO_URI is correct
- Check if MongoDB service is running (for local)
- Ensure your IP is whitelisted (for Atlas)

### Google OAuth Not Working
- Verify redirect URI matches exactly in Google Console
- Clear browser cookies and try again
- Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct

### Module Not Found Errors
```bash
# Backend
npm install

# Frontend
cd client
npm install
```

## 📁 Project Structure

```
AuraConfess/
├── backend/
│   ├── config/
│   │   └── passport.js          # Passport OAuth config
│   ├── models/
│   │   ├── User.js              # User schema
│   │   └── Confession.js        # Confession schema
│   ├── routes/
│   │   ├── auth.js              # Auth routes
│   │   ├── confessions.js       # Confession CRUD
│   │   └── users.js             # User routes
│   ├── middleware/
│   │   └── auth.js              # JWT middleware
│   └── server.js                # Express server
├── client/
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   ├── pages/               # Page components
│   │   ├── context/             # React context
│   │   ├── services/            # API services
│   │   └── App.jsx              # Main app
│   └── index.html
├── .env                         # Environment variables
└── README.md
```

## 🎯 API Endpoints

### Authentication
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - OAuth callback
- `POST /auth/logout` - Logout user
- `GET /auth/status` - Check auth status

### Confessions
- `GET /api/confessions` - Get all confessions
- `GET /api/confessions/leaderboard` - Get top confessions
- `GET /api/confessions/:id` - Get single confession
- `POST /api/confessions` - Create confession
- `PUT /api/confessions/:id` - Update confession (requires secret code)
- `DELETE /api/confessions/:id` - Delete confession (requires secret code)
- `POST /api/confessions/:id/react` - Add/remove reaction
- `POST /api/confessions/:id/comment` - Add comment
- `POST /api/confessions/:id/poll/vote` - Vote on poll
- `POST /api/confessions/:id/unlock` - Unlock premium confession

### Users
- `GET /api/users/me` - Get user profile
- `GET /api/users/me/confessions` - Get user's confessions
- `GET /api/users/me/saved` - Get saved confessions
- `GET /api/users/me/unlocked` - Get unlocked confessions
- `POST /api/users/me/save/:id` - Save/unsave confession
- `GET /api/users/me/stats` - Get user statistics

## 🎨 Customization

### Change Colors
Edit `client/src/index.css` CSS variables:
```css
:root {
  --primary: #00ffff;     /* Cyan */
  --secondary: #ff00ff;   /* Magenta */
  --accent: #ffff00;      /* Yellow */
  /* ... */
}
```

### Adjust Point System
Edit `backend/models/Confession.js` and `backend/routes/confessions.js`:
- Change unlock cost (default: 50 points)
- Change reaction points (default: 1 point per reaction)
- Change lock threshold (default: 50 reactions)

## 📝 License

MIT License - Feel free to use and modify!

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

Built with ❤️ using MERN Stack
