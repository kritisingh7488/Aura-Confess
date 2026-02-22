const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const Confession = require('../models/Confession');

// Get current user profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('-googleId')
      .populate('savedConfessions')
      .populate('unlockedConfessions');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
});

// Get user's confessions
router.get('/me/confessions', authMiddleware, async (req, res) => {
  try {
    const { type } = req.query; // all, draft, published
    
    let query = { author: req.userId };
    
    if (type === 'draft') {
      query.isDraft = true;
    } else if (type === 'published') {
      query.isDraft = false;
      query.isHidden = false;
    }
    
    const confessions = await Confession.find(query)
      .sort({ createdAt: -1 })
      .populate('author', 'displayName avatar');
    
    res.json({ success: true, confessions });
  } catch (error) {
    console.error('Get user confessions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch confessions' });
  }
});

// Get saved confessions
router.get('/me/saved', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate({
      path: 'savedConfessions',
      populate: [
        { path: 'author', select: 'displayName avatar' }
      ]
    });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Filter out hidden confessions
    const savedConfessions = user.savedConfessions.filter(c => !c.isHidden);
    
    res.json({ success: true, savedConfessions });
  } catch (error) {
    console.error('Get saved confessions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch saved confessions' });
  }
});

// Get unlocked confessions
router.get('/me/unlocked', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate({
      path: 'unlockedConfessions',
      populate: [
        { path: 'author', select: 'displayName avatar' }
      ]
    });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, unlockedConfessions: user.unlockedConfessions });
  } catch (error) {
    console.error('Get unlocked confessions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch unlocked confessions' });
  }
});

// Save/Unsave confession
router.post('/me/save/:confessionId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const confession = await Confession.findById(req.params.confessionId);
    
    if (!confession) {
      return res.status(404).json({ success: false, message: 'Confession not found' });
    }
    
    const isSaved = user.savedConfessions.includes(req.params.confessionId);
    
    if (isSaved) {
      // Unsave
      user.savedConfessions = user.savedConfessions.filter(
        id => id.toString() !== req.params.confessionId
      );
      await user.save();
      res.json({ success: true, message: 'Confession removed from saved', isSaved: false });
    } else {
      // Save
      user.savedConfessions.push(req.params.confessionId);
      await user.save();
      res.json({ success: true, message: 'Confession saved successfully', isSaved: true });
    }
  } catch (error) {
    console.error('Save confession error:', error);
    res.status(500).json({ success: false, message: 'Failed to save confession' });
  }
});

// Get user stats
router.get('/me/stats', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const confessions = await Confession.find({ 
      author: req.userId, 
      isDraft: false 
    });
    
    const totalConfessions = confessions.length;
    const totalReactions = confessions.reduce((sum, c) => sum + c.totalReactions, 0);
    const totalDrafts = await Confession.countDocuments({ 
      author: req.userId, 
      isDraft: true 
    });
    
    // Find top confession
    const topConfession = confessions.sort((a, b) => b.totalReactions - a.totalReactions)[0];
    
    res.json({ 
      success: true, 
      stats: {
        auraPoints: user.auraPoints,
        totalConfessions,
        totalReactions,
        totalDrafts,
        savedCount: user.savedConfessions.length,
        unlockedCount: user.unlockedConfessions.length,
        topConfession: topConfession ? {
          id: topConfession._id,
          text: topConfession.text.substring(0, 50) + '...',
          reactions: topConfession.totalReactions
        } : null
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

module.exports = router;
