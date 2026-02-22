import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  logout,
  getUserProfile,
  getUserConfessions,
  getSavedConfessions,
  getUnlockedConfessions,
  getUserStats,
  updateConfession,
  deleteConfession,
  createConfession
} from '../services/api';
import { FaHome, FaSignOutAlt, FaEdit, FaTrash, FaCrown, FaTrophy } from 'react-icons/fa';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout: logoutUser, updateUserPoints } = useAuth();
  
  const [activeTab, setActiveTab] = useState('my-confessions');
  const [myConfessions, setMyConfessions] = useState([]);
  const [savedConfessions, setSavedConfessions] = useState([]);
  const [unlockedConfessions, setUnlockedConfessions] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [activeConfession, setActiveConfession] = useState(null);
  const [editForm, setEditForm] = useState({ text: '', category: '', secretCode: '' });
  const [deleteCode, setDeleteCode] = useState('');
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

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats always
      const statsRes = await getUserStats();
      setStats(statsRes.data.stats);

      // Fetch data based on active tab
      if (activeTab === 'my-confessions') {
        const res = await getUserConfessions('published');
        setMyConfessions(res.data.confessions);
      } else if (activeTab === 'drafts') {
        const res = await getUserConfessions('draft');
        setDrafts(res.data.confessions);
      } else if (activeTab === 'saved') {
        const res = await getSavedConfessions();
        setSavedConfessions(res.data.savedConfessions);
      } else if (activeTab === 'unlocked') {
        const res = await getUnlockedConfessions();
        setUnlockedConfessions(res.data.unlockedConfessions);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleLogout = async () => {
    try {
      await logout();
      logoutUser();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      showToast('Failed to logout', 'error');
    }
  };

  const handleEdit = (confession) => {
    setActiveConfession(confession);
    setEditForm({
      text: confession.text,
      category: confession.category,
      secretCode: ''
    });
    setShowEditModal(true);
  };

  const handleDelete = (confession) => {
    setActiveConfession(confession);
    setShowDeleteModal(true);
  };

  const submitEdit = async () => {
    if (!editForm.secretCode) {
      showToast('🔐 Enter your secret code!', 'error');
      return;
    }

    try {
      const response = await updateConfession(activeConfession._id, editForm);
      showToast('✏️ Confession updated!');
      setShowEditModal(false);
      fetchData();
    } catch (error) {
      console.error('Edit error:', error);
      showToast('⚠️ Wrong code or could not update!', 'error');
    }
  };

  const submitDelete = async () => {
    if (!deleteCode) {
      showToast('🔐 Enter your secret code!', 'error');
      return;
    }

    try {
      const response = await deleteConfession(activeConfession._id, deleteCode);
      showToast('🗑️ Confession deleted!');
      setShowDeleteModal(false);
      setDeleteCode('');
      fetchData();
    } catch (error) {
      console.error('Delete error:', error);
      showToast('⚠️ Wrong code or could not delete!', 'error');
    }
  };

  const handlePublishDraft = async (draft) => {
    try {
      const response = await updateConfession(draft._id, {
        isDraft: false,
        secretCode: draft.secretCode
      });
      showToast('🚀 Draft published!');
      fetchData();
    } catch (error) {
      console.error('Publish error:', error);
      showToast('⚠️ Could not publish draft!', 'error');
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
      
      console.log('Posting confession:', data);
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
      
      if (!isDraft) {
        fetchData();
      }
    } catch (error) {
      console.error('Post error:', error);
      console.error('Error response:', error.response?.data);
      showToast('⚠️ Could not create confession!', 'error');
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

  const renderConfessions = (confessions) => {
    if (loading) {
      return <div className="loader"></div>;
    }

    if (confessions.length === 0) {
      return (
        <div className="empty-state">
          <h3>No confessions found</h3>
          <p>Start sharing your thoughts!</p>
        </div>
      );
    }

    return (
      <div className="confessions-list">
        {confessions.map(confession => (
          <div key={confession._id} className="profile-confession-card">
            <div className="confession-header">
              <span className="category-badge">{confession.category}</span>
              <div className="confession-actions">
                {activeTab === 'drafts' && (
                  <button 
                    onClick={() => handlePublishDraft(confession)}
                    className="icon-btn publish-btn"
                    title="Publish Draft"
                    style={{ color: '#00ffff', marginRight: '8px', fontSize: '18px' }}
                  >
                    📤
                  </button>
                )}
                {activeTab !== 'saved' && activeTab !== 'unlocked' && (
                  <>
                    <button 
                      onClick={() => handleEdit(confession)}
                      className="icon-btn edit-btn"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      onClick={() => handleDelete(confession)}
                      className="icon-btn delete-btn"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <p className="confession-text">{confession.text}</p>
            
            <div className="confession-stats">
              <span className="stat">🔥 {confession.totalReactions} reactions</span>
              <span className="stat">💬 {confession.comments?.length || 0} comments</span>
              {confession.isDraft && <span className="draft-badge">📝 DRAFT</span>}
              {confession.burnAt && !confession.isHidden && (
                <span className="burn-badge">
                  🔥 Burns in {Math.floor((new Date(confession.burnAt) - new Date()) / 3600000)}h
                </span>
              )}
            </div>

            {activeTab === 'my-confessions' || activeTab === 'drafts' ? (
              <div className="secret-code-display">
                <small>Secret Code: <code>{confession.secretCode}</code></small>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="profile-page">
      {/* Header */}
      <header className="profile-header">
        <div className="header-content">
          <h1 className="logo glow">PROFILE</h1>
          <div className="header-actions">
            <button onClick={() => setShowPostModal(true)} className="btn btn-success">
              ✍️ Post Confession
            </button>
            <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
              <FaHome /> Dashboard
            </button>
            <button onClick={handleLogout} className="btn btn-danger">
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Profile Info */}
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-avatar-section">
            <img 
              src={user?.avatar || '/default-avatar.png'} 
              alt={user?.displayName}
              className="profile-avatar"
            />
            <div className="profile-info">
              <h2 className="profile-name">{user?.displayName}</h2>
              <p className="profile-email">{user?.email}</p>
            </div>
          </div>

          <div className="aura-section">
            <div className="aura-large">
              <span className="aura-icon-large">⚡</span>
              <div>
                <div className="aura-points-large">{stats?.auraPoints || 0}</div>
                <div className="aura-label">Aura Points</div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          {stats && (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📝</div>
                <div className="stat-value">{stats.totalConfessions}</div>
                <div className="stat-label">Confessions</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🔥</div>
                <div className="stat-value">{stats.totalReactions}</div>
                <div className="stat-label">Total Reactions</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📑</div>
                <div className="stat-value">{stats.totalDrafts}</div>
                <div className="stat-label">Drafts</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💾</div>
                <div className="stat-value">{stats.savedCount}</div>
                <div className="stat-label">Saved</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🔓</div>
                <div className="stat-value">{stats.unlockedCount}</div>
                <div className="stat-label">Unlocked</div>
              </div>
              {stats.topConfession && (
                <div className="stat-card highlight-card">
                  <div className="stat-icon"><FaTrophy /></div>
                  <div className="stat-value">{stats.topConfession.reactions}</div>
                  <div className="stat-label">Top Confession</div>
                </div>
              )}
            </div>
          )}

          {/* Level Badge */}
          <div className="level-badge">
            <FaCrown className="crown-icon" />
            <span className="level-text">
              Level {Math.floor((stats?.auraPoints || 0) / 100) + 1}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-section">
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'my-confessions' ? 'active' : ''}`}
              onClick={() => setActiveTab('my-confessions')}
            >
              📝 My Confessions
            </button>
            <button 
              className={`tab ${activeTab === 'drafts' ? 'active' : ''}`}
              onClick={() => setActiveTab('drafts')}
            >
              📑 Drafts
            </button>
            <button 
              className={`tab ${activeTab === 'saved' ? 'active' : ''}`}
              onClick={() => setActiveTab('saved')}
            >
              💾 Saved
            </button>
            <button 
              className={`tab ${activeTab === 'unlocked' ? 'active' : ''}`}
              onClick={() => setActiveTab('unlocked')}
            >
              🔓 Unlocked
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'my-confessions' && renderConfessions(myConfessions)}
            {activeTab === 'drafts' && renderConfessions(drafts)}
            {activeTab === 'saved' && renderConfessions(savedConfessions)}
            {activeTab === 'unlocked' && renderConfessions(unlockedConfessions)}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditForm({ text: '', category: '', secretCode: '' });
        }}
        title="✏️ Edit Confession"
      >
        <textarea
          className="textarea"
          value={editForm.text}
          onChange={(e) => setEditForm({ ...editForm, text: e.target.value })}
          maxLength={2000}
          rows={6}
        />
        <div className="char-count">{editForm.text.length}/2000</div>

        <select
          className="select"
          value={editForm.category}
          onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
        >
          <option value="love">❤️ Love</option>
          <option value="friendship">🤝 Friendship</option>
          <option value="family">👨‍👩‍👧 Family</option>
          <option value="work">💼 Work</option>
          <option value="school">🎓 School</option>
          <option value="secrets">🤫 Secrets</option>
          <option value="regrets">😔 Regrets</option>
          <option value="dreams">✨ Dreams</option>
          <option value="other">🎭 Other</option>
        </select>

        <input
          type="text"
          className="input"
          placeholder="Enter your secret code"
          value={editForm.secretCode}
          onChange={(e) => setEditForm({ ...editForm, secretCode: e.target.value.toUpperCase() })}
        />

        <button onClick={submitEdit} className="btn btn-success mt-2">
          Update Confession
        </button>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteCode('');
        }}
        title="⚠️ Delete Confession"
      >
        <p className="warning-text">
          This action cannot be undone. Enter your secret code to confirm deletion.
        </p>

        <input
          type="text"
          className="input"
          placeholder="Enter your secret code"
          value={deleteCode}
          onChange={(e) => setDeleteCode(e.target.value.toUpperCase())}
        />

        <button onClick={submitDelete} className="btn btn-danger mt-2">
          Delete Permanently
        </button>
      </Modal>

      {/* Post Modal */}
      <Modal 
        isOpen={showPostModal} 
        onClose={() => {
          setShowPostModal(false);
          setPostForm({
            text: '',
            category: 'other',
            burnAfter24Hours: false,
            isDraft: false,
            poll: { question: '', options: ['', ''] }
          });
          setIncludePoll(false);
        }}
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
          <option value="love">❤️ Love</option>
          <option value="friendship">🤝 Friendship</option>
          <option value="family">👨‍👩‍👧 Family</option>
          <option value="work">💼 Work</option>
          <option value="school">🎓 School</option>
          <option value="secrets">🤫 Secrets</option>
          <option value="regrets">😔 Regrets</option>
          <option value="dreams">✨ Dreams</option>
          <option value="other">🎭 Other</option>
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

export default Profile;
