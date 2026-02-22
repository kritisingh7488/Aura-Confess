import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  getConfessions, 
  getLeaderboard, 
  reactToConfession, 
  commentOnConfession,
  saveConfession,
  unlockConfession,
  createConfession,
  voteOnPoll
} from '../services/api';
import { FaFire, FaHeart, FaLaugh, FaSadTear, FaShoppingBag, FaUser, FaLock, FaComment, FaBookmark, FaRegBookmark, FaSurprise } from 'react-icons/fa';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import './Dashboard.css';

const categories = [
  { value: 'all', label: 'All Categories', icon: '🌐' },
  { value: 'love', label: 'Love', icon: '❤️' },
  { value: 'friendship', label: 'Friendship', icon: '🤝' },
  { value: 'family', label: 'Family', icon: '👨‍👩‍👧' },
  { value: 'work', label: 'Work', icon: '💼' },
  { value: 'school', label: 'School', icon: '🎓' },
  { value: 'secrets', label: 'Secrets', icon: '🤫' },
  { value: 'regrets', label: 'Regrets', icon: '😔' },
  { value: 'dreams', label: 'Dreams', icon: '✨' },
  { value: 'other', label: 'Other', icon: '🎭' }
];

const reactionIcons = {
  fire: { icon: FaFire, color: '#ff4500', label: 'Fire' },
  heart: { icon: FaHeart, color: '#ff1744', label: 'Heart' },
  laugh: { icon: FaLaugh, color: '#ffd700', label: 'Laugh' },
  sad: { icon: FaSadTear, color: '#4169e1', label: 'Sad' },
  shocked: { icon: FaSurprise, color: '#9c27b0', label: 'Shocked' }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, updateUserPoints, refreshAuth } = useAuth();
  
  const [confessions, setConfessions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [savedConfessions, setSavedConfessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [accessFilter, setAccessFilter] = useState('all'); // all, public, locked
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [activeConfession, setActiveConfession] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [unlockConfessionsToConfirm, setUnlockConfessionsToConfirm] = useState(null);
  const [locallyUnlockedConfessions, setLocallyUnlockedConfessions] = useState(new Set());
  const [toast, setToast] = useState(null);
  
  // Post form state
  const [postForm, setPostForm] = useState({
    text: '',
    category: 'other',
    burnAfter24Hours: false,
    isDraft: false,
    poll: { question: '', options: ['', ''] }
  });
  const [includePoll, setIncludePoll] = useState(false);

  // Load data on mount and when filters change
  useEffect(() => {
    fetchData();
  }, [searchQuery, selectedCategory, sortBy, accessFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [confessionsRes, leaderboardRes] = await Promise.all([
        getConfessions({ search: searchQuery, category: selectedCategory, sort: sortBy }),
        getLeaderboard()
      ]);
      
      // Set saved confessions from user
      if (user?.savedConfessions) {
        setSavedConfessions(user.savedConfessions);
      }
      
      // Sync locally unlocked confessions with server data
      if (user?.unlockedConfessions) {
        const unlockedSet = new Set(user.unlockedConfessions.map(id => id.toString()));
        setLocallyUnlockedConfessions(unlockedSet);
      }
      
      setConfessions(confessionsRes.data.confessions);
      setLeaderboard(leaderboardRes.data.leaderboard);
    } catch (error) {
      console.error('Fetch error:', error);
      showToast('Failed to load confessions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleReact = async (confessionId, reactionType) => {
    try {
      const response = await reactToConfession(confessionId, reactionType);
      
      // Update confession in state
      setConfessions(prev => prev.map(c => 
        c._id === confessionId ? response.data.confession : c
      ));
      
      // Refresh user data to update aura points
      await refreshAuth();
      
      showToast('✨ Reaction updated!', 'success');
    } catch (error) {
      console.error('React error:', error);
      showToast('⚠️ Could not update reaction. Try again!', 'error');
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) {
      showToast('📝 Write something first!', 'error');
      return;
    }
    
    // Check character count (limit to 150 characters)
    if (commentText.length > 150) {
      showToast(`⚠️ Comment too long! Maximum 150 characters (currently ${commentText.length})`, 'error');
      return;
    }
    
    try {
      const response = await commentOnConfession(activeConfession._id, commentText);
      
      setConfessions(prev => prev.map(c => 
        c._id === activeConfession._id ? response.data.confession : c
      ));
      
      showToast('💬 Comment posted!');
      setCommentText('');
      setShowCommentModal(false);
      setActiveConfession(null);
    } catch (error) {
      console.error('Comment error:', error);
      showToast('⚠️ Could not post comment. Try again!', 'error');
    }
  };

  const handleSave = async (confessionId) => {
    try {
      const response = await saveConfession(confessionId);
      
      // Update saved confessions state
      if (response.data.isSaved) {
        setSavedConfessions(prev => [...prev, confessionId]);
        showToast('📌 Saved to your collection!', 'success');
      } else {
        setSavedConfessions(prev => prev.filter(id => id !== confessionId));
        showToast('🗑️ Removed from collection!', 'success');
      }
      
      // Refresh user data to update saved confessions
      await refreshAuth();
    } catch (error) {
      console.error('Save error:', error);
      showToast('⚠️ Could not save. Try again!', 'error');
    }
  };

  const handleUnlock = async (confessionId) => {
    // Show confirmation dialog
    setUnlockConfessionsToConfirm({ id: confessionId, confirmed: false });
  };

  const confirmUnlock = async (confessionId) => {
    try {
      const response = await unlockConfession(confessionId);
      console.log('Unlock successful:', response.data);
      
      // Update user points
      if (response.data.remainingPoints !== undefined) {
        updateUserPoints(response.data.remainingPoints);
      }
      
      // Immediately track this confession as unlocked locally
      setLocallyUnlockedConfessions(prev => new Set([...prev, confessionId]));
      
      // Immediately mark confession as unlocked in state (remove blur)
      setConfessions(prev => prev.map(c => {
        if (c._id === confessionId) {
          return { ...c, isLocked: false };
        }
        return c;
      }));
      
      // Refresh user from backend (will update unlockedConfessions in context)
      const updatedUser = await refreshAuth();
      console.log('Updated user unlocked confessions:', updatedUser?.unlockedConfessions);
      
      // Refresh all confessions to sync with backend
      await fetchData();
      
      showToast('🔓 Unlocked! 50 Aura points spent', 'success');
      setUnlockConfessionsToConfirm(null);
    } catch (error) {
      console.error('Unlock error:', error);
      showToast('⚠️ Not enough Aura points or error unlocking!', 'error');
      setUnlockConfessionsToConfirm(null);
    }
  };

  const handlePostConfession = async (isDraft = false) => {
    if (!postForm.text.trim()) {
      showToast('✍️ Share your confession first!', 'error');
      return;
    }
    
    try {
      const data = {
        text: postForm.text,
        category: postForm.category,
        burnAfter24Hours: postForm.burnAfter24Hours,
        isDraft,
        poll: includePoll && postForm.poll.question && postForm.poll.options.filter(o => o.trim()).length >= 2 
          ? { question: postForm.poll.question, options: postForm.poll.options.filter(o => o.trim()) } 
          : undefined
      };
      
      const response = await createConfession(data);
      
      showToast(isDraft ? '📓 Saved as draft!' : '🚀 Confession posted!');
      setShowPostModal(false);
      setPostForm({
        text: '',
        category: 'other',
        burnAfter24Hours: false,
        isDraft: false,
        poll: { question: '', options: ['', ''] }
      });
      setIncludePoll(false);
      
      // Add new confession to the list if not a draft
      if (!isDraft && response.data.confession) {
        setConfessions(prev => [response.data.confession, ...prev]);
      }
    } catch (error) {
      console.error('Post error:', error);
      showToast('⚠️ Could not create confession!', 'error');
    }
  };

  const handleVote = async (confessionId, optionIndex) => {
    try {
      const response = await voteOnPoll(confessionId, optionIndex);
      setConfessions(prev => prev.map(c => 
        c._id === confessionId ? response.data.confession : c
      ));
      showToast('✅ Vote recorded!');
    } catch (error) {
      console.error('Vote error:', error);
      showToast(error.response?.data?.message || '⚠️ Failed to vote', 'error');
    }
  };

  const addPollOption = () => {
    if (postForm.poll.options.length < 4) {
      setPostForm(prev => ({
        ...prev,
        poll: { ...prev.poll, options: [...prev.poll.options, ''] }
      }));
    }
  };

  const updatePollOption = (index, value) => {
    const newOptions = [...postForm.poll.options];
    newOptions[index] = value;
    setPostForm(prev => ({
      ...prev,
      poll: { ...prev.poll, options: newOptions }
    }));
  };

  const removePollOption = (index) => {
    if (postForm.poll.options.length > 2) {
      const newOptions = postForm.poll.options.filter((_, i) => i !== index);
      setPostForm(prev => ({
        ...prev,
        poll: { ...prev.poll, options: newOptions }
      }));
    }
  };

  const isConfessionAccessible = (confession) => {
    if (!confession.isLocked) return true;
    if (confession.author._id === user?._id) return true;
    
    // Check both server-side unlocked confessions and locally tracked unlocks
    const unlockedIds = user?.unlockedConfessions?.map(id => id.toString()) || [];
    const confessionIdStr = confession._id.toString();
    
    return unlockedIds.includes(confessionIdStr) || locallyUnlockedConfessions.has(confessionIdStr);
  };

  const getFilteredConfessions = () => {
    const unlockedIds = user?.unlockedConfessions?.map(id => id.toString()) || [];
    return confessions.filter(confession => {
      const confIdStr = confession._id.toString();
      const isUnlocked = unlockedIds.includes(confIdStr) || locallyUnlockedConfessions.has(confIdStr);
      
      if (accessFilter === 'all') return true;
      if (accessFilter === 'public') {
        return !confession.isLocked;
      }
      if (accessFilter === 'unlocked') {
        return confession.isLocked && isUnlocked;
      }
      if (accessFilter === 'locked') {
        return confession.isLocked && !isUnlocked;
      }
      return true;
    });
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="logo glow">AURA<span style={{color: 'var(--secondary)'}}>CONFESS</span></h1>
          <div className="header-actions">
            <div className="aura-display">
              <span className="aura-icon">⚡</span>
              <span className="aura-points">{user?.auraPoints || 0}</span>
            </div>
            <button onClick={() => navigate('/profile')} className="btn btn-primary">
              <FaUser /> Profile
            </button>
          </div>
        </div>
      </header>

      {/* Controls */}
      <div className="controls-section">
        <div className="controls-row">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search confessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          <select 
            className="select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
          
          <select 
            className="select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="reactions">Most Reactions</option>
          </select>
          
          <select 
            className="select"
            value={accessFilter}
            onChange={(e) => setAccessFilter(e.target.value)}
          >
            <option value="all">All Confessions</option>
            <option value="public">🔓 Public</option>
            <option value="unlocked">🔑 Unlocked</option>
            <option value="locked">🔒 Locked</option>
          </select>
        </div>
        
        <div className="action-buttons">
          <button onClick={() => setShowPostModal(true)} className="btn btn-success">
            ✍️ Post Confession
          </button>
          <button onClick={() => setShowLeaderboard(!showLeaderboard)} className="btn btn-secondary">
            🏆 {showLeaderboard ? 'Hide' : 'Show'} Leaderboard
          </button>
        </div>
      </div>

      {/* Leaderboard */}
      {showLeaderboard && (
        <div className="leaderboard-section">
          <h2 className="section-title">🏆 Top Confessions</h2>
          <div className="leaderboard-grid">
            {leaderboard.map((confession, index) => (
              <div key={confession._id} className="leaderboard-item">
                <div className="rank-badge">#{index + 1}</div>
                <div className="leaderboard-content">
                  <p className="confession-preview">
                    {confession.text.substring(0, 100)}...
                  </p>
                  <div className="leaderboard-stats">
                    <span className="stat">🔥 {confession.totalReactions} reactions</span>
                    <span className="stat">💬 {confession.comments?.length || 0} comments</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confessions */}
      <div className="confessions-section">
        {loading ? (
          <div className="loader"></div>
        ) : getFilteredConfessions().length === 0 ? (
          <div className="empty-state">
            <h3>{confessions.length === 0 ? 'No confessions found' : 'No confessions match your filter'}</h3>
            <p>{confessions.length === 0 ? 'Be the first to share your story!' : 'Try changing your filters'}</p>
          </div>
        ) : (
          <div className="confessions-grid">
            {getFilteredConfessions().map((confession) => (
              <ConfessionCard
                key={confession._id}
                confession={confession}
                onReact={handleReact}
                onComment={(c) => {
                  setActiveConfession(c);
                  setShowCommentModal(true);
                }}
                onSave={handleSave}
                onUnlock={handleUnlock}
                onVote={handleVote}
                currentUserId={user._id}
                isAccessible={isConfessionAccessible(confession)}
                isSaved={savedConfessions.includes(confession._id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Post Modal */}
      <Modal 
        isOpen={showPostModal} 
        onClose={() => setShowPostModal(false)}
        title="✍️ Create Confession"
      >
        <textarea
          className="textarea"
          placeholder="Share your confession anonymously..."
          value={postForm.text}
          onChange={(e) => setPostForm({ ...postForm, text: e.target.value })}
          maxLength={2000}
          rows={6}
        />
        <div className="char-count">{postForm.text.length}/2000</div>
        
        <select
          className="select"
          value={postForm.category}
          onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
        >
          {categories.filter(c => c.value !== 'all').map(cat => (
            <option key={cat.value} value={cat.value}>
              {cat.icon} {cat.label}
            </option>
          ))}
        </select>
        
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={postForm.burnAfter24Hours}
            onChange={(e) => setPostForm({ ...postForm, burnAfter24Hours: e.target.checked })}
          />
          🔥 Burn after 24 hours
        </label>
        
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={includePoll}
            onChange={(e) => setIncludePoll(e.target.checked)}
          />
          📊 Include Poll
        </label>
        
        {includePoll && (
          <div className="poll-section">
            <input
              className="input"
              placeholder="Poll question..."
              value={postForm.poll.question}
              onChange={(e) => setPostForm({
                ...postForm,
                poll: { ...postForm.poll, question: e.target.value }
              })}
            />
            {postForm.poll.options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <input
                  className="input"
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => updatePollOption(index, e.target.value)}
                />
                {postForm.poll.options.length > 2 && (
                  <button 
                    onClick={() => removePollOption(index)}
                    className="btn btn-danger"
                    style={{ padding: '8px 12px' }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            {postForm.poll.options.length < 4 && (
              <button onClick={addPollOption} className="btn btn-primary">
                + Add Option
              </button>
            )}
          </div>
        )}
        
        <div className="modal-actions">
          <button onClick={() => handlePostConfession(false)} className="btn btn-success">
            Post Now
          </button>
          <button onClick={() => handlePostConfession(true)} className="btn btn-secondary">
            Save as Draft
          </button>
        </div>
      </Modal>

      {/* Unlock Confirmation Modal */}
      <Modal
        isOpen={!!unlockConfessionsToConfirm}
        onClose={() => setUnlockConfessionsToConfirm(null)}
        title="🔐 Unlock Confession?"
      >
        <div className="confirm-modal-content">
          <p>This will cost <strong>50 Aura Points</strong></p>
          <p>You have <strong>{user?.auraPoints || 0} points</strong></p>
          <div className="modal-actions" style={{ marginTop: '20px', gap: '10px' }}>
            <button 
              onClick={() => setUnlockConfessionsToConfirm(null)} 
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button 
              onClick={() => unlockConfessionsToConfirm && confirmUnlock(unlockConfessionsToConfirm.id)} 
              className="btn btn-primary"
            >
              Yes, Unlock
            </button>
          </div>
        </div>
      </Modal>

      {/* Comment Modal */}
      <Modal
        isOpen={showCommentModal}
        onClose={() => {
          setShowCommentModal(false);
          setCommentText('');
          setActiveConfession(null);
        }}
        title="💬 Add Comment"
      >
        <textarea
          className="textarea"
          placeholder="Write your comment... (max 150 characters)"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          maxLength={150}
          rows={4}
        />
        <div className="char-count">
          {commentText.length}/150 characters
        </div>
        
        <button onClick={handleComment} className="btn btn-primary mt-2">
          Post Comment
        </button>
      </Modal>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

// Confession Card Component
const ConfessionCard = ({ confession, onReact, onComment, onSave, onUnlock, onVote, currentUserId, isAccessible, isSaved }) => {
  const [showComments, setShowComments] = useState(false);
  const [showPoll, setShowPoll] = useState(true);
  const [userReaction, setUserReaction] = useState(null);
  const [savedState, setSavedState] = useState(isSaved || false);

  useEffect(() => {
    // Find user's reaction
    for (let type in confession.reactions) {
      if (confession.reactions[type]?.some(id => id === currentUserId)) {
        setUserReaction(type);
        break;
      }
    }
  }, [confession, currentUserId]);

  const getCategoryIcon = (category) => {
    return categories.find(c => c.value === category)?.icon || '🎭';
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const calculatePollPercentage = (votes, totalVotes) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  const totalPollVotes = confession.poll?.options.reduce((sum, opt) => sum + opt.votes.length, 0) || 0;

  return (
    <div className={`confession-card ${!isAccessible ? 'locked-card' : ''}`}>
      <div className="confession-header">
        <span className="category-badge">
          {getCategoryIcon(confession.category)} {confession.category}
        </span>
        <span className="time-stamp">{formatDate(confession.createdAt)}</span>
      </div>

      <div className="confession-body">
        <p className={`confession-text ${!isAccessible ? 'blurred' : ''}`}>{confession.text}</p>
        
        {!isAccessible && (
          <div className="unlock-overlay">
            <div className="unlock-content">
              <FaLock size={40} />
              <p>Unlock for 50 Aura Points</p>
              <button onClick={() => onUnlock(confession._id)} className="btn btn-primary">
                Unlock Now
              </button>
            </div>
          </div>
        )}
      </div>

      {isAccessible && (
        <>
          {/* Poll */}
          {confession.poll?.isActive && showPoll && (
            <div className="poll-container">
              <h4 className="poll-question">📊 {confession.poll.question}</h4>
              <div className="poll-options">
                {confession.poll.options.map((option, index) => {
                  const percentage = calculatePollPercentage(option.votes.length, totalPollVotes);
                  const hasVoted = option.votes.some(v => v._id === currentUserId);
                  
                  return (
                    <div
                      key={index}
                      className={`poll-option ${hasVoted ? 'voted' : ''}`}
                      onClick={() => onVote(confession._id, index)}
                    >
                      <div className="poll-option-text">{option.text}</div>
                      <div className="poll-option-bar" style={{ width: `${percentage}%` }}></div>
                      <div className="poll-option-percentage">{percentage}%</div>
                    </div>
                  );
                })}
              </div>
              <div className="poll-footer">{totalPollVotes} votes</div>
            </div>
          )}

          {/* Reactions */}
          <div className="reactions-bar">
            {Object.entries(reactionIcons).map(([type, { icon: Icon, color }]) => {
              const count = confession.reactions[type]?.length || 0;
              const isActive = userReaction === type;
              
              return (
                <button
                  key={type}
                  className={`reaction-btn ${isActive ? 'active' : ''}`}
                  onClick={() => onReact(confession._id, type)}
                  style={{ color: isActive ? color : 'inherit' }}
                >
                  <Icon />
                  {count > 0 && <span className="reaction-count">{count}</span>}
                </button>
              );
            })}
          </div>

          {/* Actions */}
          <div className="confession-actions">
            <button onClick={() => setShowComments(!showComments)} className="action-btn">
              <FaComment /> {confession.comments?.length || 0} Comments
            </button>
            <button onClick={() => {
              onSave(confession._id);
              setSavedState(!savedState);
            }} className={`action-btn ${savedState ? 'saved' : ''}`}>
              {savedState ? <FaBookmark /> : <FaRegBookmark />} {savedState ? 'Unsave' : 'Save'}
            </button>
            <div className="total-reactions">
              🔥 {confession.totalReactions} reactions
            </div>
          </div>

          {/* Comments */}
          {showComments && (
            <div className="comments-section">
              {confession.comments?.length > 0 ? (
                confession.comments.map((comment, index) => (
                  <div key={index} className="comment">
                    <div className="comment-header">
                      <span className="comment-author">Anonymous</span>
                      <span className="comment-time">{formatDate(comment.timestamp)}</span>
                    </div>
                    <p className="comment-text">{comment.text}</p>
                  </div>
                ))
              ) : (
                <p className="no-comments">No comments yet. Be the first!</p>
              )}
              <button onClick={() => onComment(confession)} className="btn btn-primary mt-2">
                Add Comment
              </button>
            </div>
          )}

          {/* Burn Timer */}
          {confession.burnAt && !confession.isHidden && (
            <div className="burn-timer">
              🔥 Burns in {Math.floor((new Date(confession.burnAt) - new Date()) / 3600000)}h
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
