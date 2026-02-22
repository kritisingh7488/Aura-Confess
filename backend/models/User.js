const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: ''
  },
  auraPoints: {
    type: Number,
    default: 0
  },
  savedConfessions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Confession'
  }],
  unlockedConfessions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Confession'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
