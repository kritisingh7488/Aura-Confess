const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const authMiddleware = require('../middleware/auth');
const Confession = require('../models/Confession');
const User = require('../models/User');

// Get all confessions (public, non-draft, non-hidden)
router.get('/', async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    
    let query = { isDraft: false, isHidden: false };
    
    // Search filter
    if (search) {
      query.text = { $regex: search, $options: 'i' };
    }
    
    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Sort options
    let sortOption = { createdAt: -1 }; // Default: newest first
    if (sort === 'reactions') {
      sortOption = { totalReactions: -1 };
    } else if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    }
    
    const confessions = await Confession.find(query)
      .sort(sortOption)
      .populate('author', 'displayName avatar')
      .limit(100);
    
    res.json({ success: true, confessions });
  } catch (error) {
    console.error('Get confessions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch confessions' });
  }
});

// Get leaderboard (top confessions by reactions)
router.get('/leaderboard', async (req, res) => {
  try {
    const topConfessions = await Confession.find({ 
      isDraft: false, 
      isHidden: false 
    })
      .sort({ totalReactions: -1 })
      .limit(10)
      .populate('author', 'displayName avatar');
    
    res.json({ success: true, leaderboard: topConfessions });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch leaderboard' });
  }
});

// Get single confession by ID
router.get('/:id', async (req, res) => {
  try {
    const confession = await Confession.findById(req.params.id)
      .populate('author', 'displayName avatar');
    
    if (!confession) {
      return res.status(404).json({ success: false, message: 'Confession not found' });
    }
    
    res.json({ success: true, confession });
  } catch (error) {
    console.error('Get confession error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch confession' });
  }
});

// Create new confession
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { text, category, isDraft, burnAfter24Hours, poll } = req.body;
    
    console.log('Creating confession:', { text: text?.substring(0, 50), category, isDraft, burnAfter24Hours, hasPoll: !!poll, userId: req.userId });
    
    // Validation
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Confession text is required' });
    }
    
    if (!category) {
      return res.status(400).json({ success: false, message: 'Category is required' });
    }
    
    const confessionData = {
      text: text.trim(),
      category,
      author: req.userId,
      isDraft: isDraft || false,
      secretCode: crypto.randomBytes(4).toString('hex').toUpperCase()
    };
    
    // Set burn time if enabled
    if (burnAfter24Hours && !isDraft) {
      confessionData.burnAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
    
    // Add poll if provided
    if (poll && poll.question && poll.options && poll.options.length >= 2) {
      confessionData.poll = {
        question: poll.question,
        options: poll.options.map(opt => ({ text: typeof opt === 'string' ? opt : opt.text, votes: [] })),
        isActive: true
      };
    }
    
    const confession = await Confession.create(confessionData);
    const populatedConfession = await Confession.findById(confession._id)
      .populate('author', 'displayName avatar');
    
    res.status(201).json({ 
      success: true, 
      message: isDraft ? 'Confession saved as draft' : 'Confession posted successfully!',
      confession: populatedConfession,
      secretCode: confession.secretCode
    });
  } catch (error) {
    console.error('Create confession error:', error);
    console.error('Error details:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ success: false, message: error.message || 'Failed to create confession' });
  }
});

// Update confession (requires secret code)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { text, category, secretCode, isDraft } = req.body;
    
    const confession = await Confession.findById(req.params.id);
    
    if (!confession) {
      return res.status(404).json({ success: false, message: 'Confession not found' });
    }
    
    // Verify secret code and ownership
    if (confession.secretCode !== secretCode || confession.author.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Invalid secret code or unauthorized' });
    }
    
    // Update fields
    if (text) confession.text = text.trim();
    if (category) confession.category = category;
    if (typeof isDraft !== 'undefined') confession.isDraft = isDraft;
    
    await confession.save();
    
    const updatedConfession = await Confession.findById(confession._id)
      .populate('author', 'displayName avatar');
    
    res.json({ 
      success: true, 
      message: 'Confession updated successfully',
      confession: updatedConfession
    });
  } catch (error) {
    console.error('Update confession error:', error);
    res.status(500).json({ success: false, message: 'Failed to update confession' });
  }
});

// Delete confession (requires secret code)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { secretCode } = req.body;
    
    const confession = await Confession.findById(req.params.id);
    
    if (!confession) {
      return res.status(404).json({ success: false, message: 'Confession not found' });
    }
    
    // Verify secret code and ownership
    if (confession.secretCode !== secretCode || confession.author.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Invalid secret code or unauthorized' });
    }
    
    await Confession.findByIdAndDelete(req.params.id);
    
    res.json({ success: true, message: 'Confession deleted successfully' });
  } catch (error) {
    console.error('Delete confession error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete confession' });
  }
});

// Add reaction to confession
// Add reaction to confession
router.post('/:id/react', authMiddleware, async (req, res) => {
  try {
    const { reactionType } = req.body;
    const userId = req.userId;
    
    if (!['fire', 'heart', 'laugh', 'sad', 'shocked'].includes(reactionType)) {
      return res.status(400).json({ success: false, message: 'Invalid reaction type' });
    }
    
    const confession = await Confession.findById(req.params.id);
    if (!confession) {
      return res.status(404).json({ success: false, message: 'Confession not found' });
    }
    
    // Ensure reactions object exists with all types
    if (!confession.reactions) {
      confession.reactions = {
        fire: [],
        heart: [],
        laugh: [],
        sad: [],
        shocked: []
      };
    }
    
    ['fire', 'heart', 'laugh', 'sad', 'shocked'].forEach(type => {
      if (!Array.isArray(confession.reactions[type])) {
        confession.reactions[type] = [];
      }
    });
    
    // Check if user already reacted with this type
    const userIdString = userId.toString();
    const hasReacted = confession.reactions[reactionType].some(id => id.toString() === userIdString);
    
    // Check if user has ANY reaction on this confession
    const hadAnyReaction = ['fire', 'heart', 'laugh', 'sad', 'shocked'].some(type => 
      confession.reactions[type].some(id => id.toString() === userIdString)
    );
    
    if (hasReacted) {
      // Remove reaction (clicked same reaction again)
      confession.reactions[reactionType] = confession.reactions[reactionType].filter(
        id => id.toString() !== userIdString
      );
    } else {
      // Remove user from all other reaction types first
      ['fire', 'heart', 'laugh', 'sad', 'shocked'].forEach(type => {
        confession.reactions[type] = confession.reactions[type].filter(
          id => id.toString() !== userIdString
        );
      });
      // Add new reaction
      confession.reactions[reactionType].push(userId);
    }
    
    // Recalculate total reactions
    confession.totalReactions = Object.values(confession.reactions).reduce((sum, arr) => sum + (arr ? arr.length : 0), 0);
    
    await confession.save();
    
    // Award aura points to author ONLY if user's first reaction or removing reaction
    if (confession.author) {
      if (hasReacted) {
        // Removing reaction - decrease point
        await User.findByIdAndUpdate(confession.author, { $inc: { auraPoints: -1 } });
      } else if (!hadAnyReaction) {
        // First reaction from this user - increase point
        await User.findByIdAndUpdate(confession.author, { $inc: { auraPoints: 1 } });
      }
      // If hadAnyReaction and !hasReacted = just changing reaction type, no point change
    }
    
    const updatedConfession = await Confession.findById(confession._id).populate('author', 'displayName avatar');
    res.json({ 
      success: true, 
      message: hasReacted ? 'Reaction removed' : 'Reaction added',
      confession: updatedConfession
    });
  } catch (error) {
    console.error('React error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to add reaction' });
  }
});

// Add comment to confession
router.post('/:id/comment', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }
    
    const confession = await Confession.findById(req.params.id);
    
    if (!confession) {
      return res.status(404).json({ success: false, message: 'Confession not found' });
    }
    
    confession.comments.push({
      text: text.trim()
    });
    
    await confession.save();
    
    const updatedConfession = await Confession.findById(confession._id)
      .populate('author', 'displayName avatar');
    
    res.json({ 
      success: true, 
      message: 'Comment added successfully',
      confession: updatedConfession
    });
  } catch (error) {
    console.error('Comment error:', error);
    res.status(500).json({ success: false, message: 'Failed to add comment' });
  }
});

// Vote on poll
router.post('/:id/poll/vote', authMiddleware, async (req, res) => {
  try {
    const { optionIndex } = req.body;
    
    const confession = await Confession.findById(req.params.id);
    
    if (!confession || !confession.poll || !confession.poll.isActive) {
      return res.status(404).json({ success: false, message: 'Poll not found or inactive' });
    }
    
    if (optionIndex < 0 || optionIndex >= confession.poll.options.length) {
      return res.status(400).json({ success: false, message: 'Invalid poll option' });
    }
    
    const userId = req.userId;
    
    // Remove previous vote if any
    confession.poll.options.forEach(option => {
      option.votes = option.votes.filter(id => id.toString() !== userId);
    });
    
    // Add new vote
    confession.poll.options[optionIndex].votes.push(userId);
    
    await confession.save();
    
    const updatedConfession = await Confession.findById(confession._id)
      .populate('poll.options.votes', 'displayName');
    
    res.json({ 
      success: true, 
      message: 'Vote recorded successfully',
      confession: updatedConfession
    });
  } catch (error) {
    console.error('Poll vote error:', error);
    res.status(500).json({ success: false, message: 'Failed to record vote' });
  }
});

// Unlock confession (spend aura points)
router.post('/:id/unlock', authMiddleware, async (req, res) => {
  try {
    const confession = await Confession.findById(req.params.id);
    
    if (!confession) {
      return res.status(404).json({ success: false, message: 'Confession not found' });
    }
    
    if (!confession.isLocked) {
      return res.status(400).json({ success: false, message: 'Confession is not locked' });
    }
    
    const user = await User.findById(req.userId);
    
    // Check if already unlocked
    if (user.unlockedConfessions.includes(confession._id)) {
      return res.json({ success: true, message: 'Already unlocked', confession });
    }
    
    // Check if user is author
    if (confession.author.toString() === req.userId) {
      return res.json({ success: true, message: 'You own this confession', confession });
    }
    
    const unlockCost = 50; // Cost to unlock
    
    if (user.auraPoints < unlockCost) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient Aura Points. Need ${unlockCost}, you have ${user.auraPoints}` 
      });
    }
    
    // Deduct points and unlock
    user.auraPoints -= unlockCost;
    user.unlockedConfessions.push(confession._id);
    await user.save();
    
    res.json({ 
      success: true, 
      message: `Confession unlocked! Spent ${unlockCost} Aura Points`,
      confession,
      remainingPoints: user.auraPoints
    });
  } catch (error) {
    console.error('Unlock error:', error);
    res.status(500).json({ success: false, message: 'Failed to unlock confession' });
  }
});

module.exports = router;
