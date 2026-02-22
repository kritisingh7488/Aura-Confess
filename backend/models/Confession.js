const mongoose = require('mongoose');
const crypto = require('crypto');

const pollOptionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  votes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

const confessionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    maxlength: 2000
  },
  category: {
    type: String,
    required: true,
    enum: ['love', 'friendship', 'family', 'work', 'school', 'secrets', 'regrets', 'dreams', 'other']
  },
  secretCode: {
    type: String,
    required: false,
    unique: true,
    default: function() {
      return crypto.randomBytes(4).toString('hex').toUpperCase();
    }
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reactions: {
    fire: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    heart: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    laugh: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    sad: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    shocked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  totalReactions: {
    type: Number,
    default: 0
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  comments: [{
    text: {
      type: String,
      required: true,
      maxlength: 150
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  poll: {
    question: String,
    options: [pollOptionSchema],
    isActive: {
      type: Boolean,
      default: false
    }
  },
  burnAt: {
    type: Date,
    default: null
  },
  isHidden: {
    type: Boolean,
    default: false
  },
  isDraft: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate total reactions and auto-lock before saving
confessionSchema.pre('save', function(next) {
  // Ensure secretCode exists (backup in case default didn't run)
  if (this.isNew && !this.secretCode) {
    this.secretCode = crypto.randomBytes(4).toString('hex').toUpperCase();
  }
  
  // Calculate total reactions
  let total = 0;
  for (let reaction in this.reactions) {
    total += this.reactions[reaction].length;
  }
  this.totalReactions = total;
  
  // Auto-lock if more than 50 reactions
  if (total >= 50) {
    this.isLocked = true;
  }
  
  next();
});

// Method to check if locked
confessionSchema.methods.isAccessible = function(userId, unlockedConfessions) {
  if (!this.isLocked) return true;
  if (this.author.toString() === userId.toString()) return true;
  return unlockedConfessions.includes(this._id.toString());
};

module.exports = mongoose.model('Confession', confessionSchema);
