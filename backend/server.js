const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const cron = require('node-cron');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const confessionRoutes = require('./routes/confessions');
const userRoutes = require('./routes/users');

// Import passport config
require('./config/passport');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);
app.use('/api/confessions', confessionRoutes);
app.use('/api/users', userRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'AuraConfess API is running! 🎮' });
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
  
  // Auto-cleanup expired confessions every hour
  const Confession = require('./models/Confession');
  cron.schedule('0 * * * *', async () => {
    try {
      const now = new Date();
      const result = await Confession.updateMany(
        { 
          burnAt: { $lte: now },
          isHidden: false
        },
        { 
          $set: { isHidden: true } 
        }
      );
      if (result.modifiedCount > 0) {
        console.log(`🔥 Auto-burned ${result.modifiedCount} confessions`);
      }
    } catch (error) {
      console.error('Error in auto-burn cron:', error);
    }
  });
})
.catch(err => console.error('❌ MongoDB connection error:', err));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🎮 Environment: ${process.env.NODE_ENV}`);
});
