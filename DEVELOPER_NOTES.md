# AuraConfess - Development Notes

## 🎮 Game Mechanics

### Aura Points System
- **Earning Points**: Users earn 1 Aura Point for each reaction their confession receives
- **Spending Points**: Users can spend 50 Aura Points to unlock premium confessions (50+ reactions)
- **Level System**: User level = floor(total_points / 100) + 1

### Secret Code System
- **Generation**: 8-character hexadecimal string (e.g., "A5F3B2E1")
- **Purpose**: Allows users to edit/delete their anonymous confessions
- **Security**: Generated using crypto.randomBytes() for uniqueness

### Locked Confessions
- **Trigger**: Automatically locked when receiving 50+ reactions
- **Visual**: Blurred content with unlock overlay
- **Access**: 
  - Free for confession author
  - Free for users who already unlocked it
  - Costs 50 Aura Points for others

### Burn Feature
- **Purpose**: Auto-hide confessions after 24 hours
- **Implementation**: Cron job runs every hour to check and hide expired confessions
- **User Control**: Optional setting when creating confession

## 🔧 Technical Implementation

### Authentication Flow
1. User clicks "Login with Google"
2. Redirected to Google OAuth consent screen
3. Google redirects back with auth code
4. Backend creates/updates user and generates JWT
5. JWT stored in HTTP-only cookie
6. Frontend checks auth status on load

### State Management
- **Auth Context**: Global user state, auth status
- **Local State**: Component-specific data (confessions, forms, modals)
- **No Redux**: Kept simple for beginner-friendly code

### API Design
- RESTful endpoints
- JWT authentication via middleware
- Consistent response format: `{ success, message, data }`
- Error handling with try-catch blocks

### Database Schema

**User:**
- googleId (unique identifier)
- email, displayName, avatar
- auraPoints (integer)
- savedConfessions (array of IDs)
- unlockedConfessions (array of IDs)

**Confession:**
- text (max 2000 chars)
- category (enum)
- secretCode (unique 8-char hex)
- author (ref to User)
- reactions (object with arrays per type)
- totalReactions (calculated)
- isLocked (boolean)
- comments (embedded subdocuments)
- poll (embedded subdocument)
- burnAt (Date, optional)
- isHidden (boolean)
- isDraft (boolean)

## 🎨 Design Philosophy

### Color Scheme
- **Primary (Cyan)**: #00ffff - Main actions, highlights
- **Secondary (Magenta)**: #ff00ff - Accents, special features
- **Accent (Yellow)**: #ffff00 - Currency, rewards
- **Dark Background**: #0a0a0f - Base color
- **Card Background**: rgba(20, 20, 30, 0.9) - Semi-transparent cards

### Typography
- **Headings**: Orbitron (sci-fi, futuristic)
- **Pixel Text**: Press Start 2P (retro gaming)
- **Body**: Orbitron (consistency)

### Animations
- Glow effects on hover
- Pulse animations for important elements
- Smooth transitions (0.3s ease)
- Floating elements on login page
- Card hover effects

## 🔐 Security Measures

### Backend
- JWT with expiration (7 days)
- HTTP-only cookies
- CORS with credentials
- Session secret for Passport
- Environment variables for sensitive data

### Frontend
- No token storage in localStorage
- Protected routes with auth check
- Auto-redirect on auth failure
- Credentials included in requests

## 🚀 Performance Optimizations

### Backend
- MongoDB indexing on frequently queried fields
- Populate only necessary fields
- Limit query results
- Cron job for scheduled tasks (not real-time checks)

### Frontend
- Lazy loading (could be improved with code splitting)
- Conditional rendering
- Debounced search (could be added)
- Optimistic UI updates

## 📱 Responsive Design

### Breakpoints
- Desktop: > 768px
- Mobile: ≤ 768px

### Mobile Adaptations
- Stacked layouts
- Smaller font sizes
- Full-width buttons
- Simplified navigation
- Scrollable tabs

## 🧪 Testing Considerations

### Manual Testing Checklist
- [ ] Google OAuth login
- [ ] Post confession (public, draft)
- [ ] Add reactions (all types)
- [ ] Add comments
- [ ] Create poll and vote
- [ ] Save confessions
- [ ] Unlock premium confession
- [ ] Edit confession with secret code
- [ ] Delete confession with secret code
- [ ] Search and filter
- [ ] View leaderboard
- [ ] Check burn timer
- [ ] Profile stats display
- [ ] Logout

### Edge Cases to Handle
- Empty search results
- No confessions posted
- Insufficient points to unlock
- Invalid secret code
- Expired sessions
- Network errors
- Duplicate reactions
- Empty comments/confessions

## 🎯 Future Enhancement Ideas

1. **Notifications**: Real-time notifications for reactions/comments
2. **Achievements**: Badges for milestones (100 points, 10 confessions, etc.)
3. **Themes**: Multiple color schemes
4. **Moderation**: Report system for inappropriate content
5. **Share**: Share confessions (while maintaining anonymity)
6. **Analytics**: Personal stats dashboard with charts
7. **Daily Quests**: Bonus points for daily activities
8. **Reply System**: Threaded comments
9. **Bookmarks**: Organize saved confessions into folders
10. **Export**: Download your confession history

## 🐛 Known Limitations

1. No real-time updates (requires refresh for new content)
2. No image/media support in confessions
3. No password recovery (OAuth only)
4. No admin panel
5. No rate limiting on API calls
6. No input sanitization (XSS vulnerability)
7. No pagination (limited to 100 confessions)
8. No email notifications

## 📚 Learning Resources

### Next Steps
1. Add input validation and sanitization
2. Implement real-time features with Socket.io
3. Add unit and integration tests
4. Deploy to production (Heroku, Vercel, etc.)
5. Add CI/CD pipeline
6. Implement proper error logging
7. Add API rate limiting
8. Create admin dashboard
