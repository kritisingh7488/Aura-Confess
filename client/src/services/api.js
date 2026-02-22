import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true
});

// Auth APIs
export const checkAuthStatus = () => API.get('/auth/status');
export const logout = () => API.post('/auth/logout');

// Confession APIs
export const getConfessions = (params) => API.get('/api/confessions', { params });
export const getConfessionById = (id) => API.get(`/api/confessions/${id}`);
export const createConfession = (data) => API.post('/api/confessions', data);
export const updateConfession = (id, data) => API.put(`/api/confessions/${id}`, data);
export const deleteConfession = (id, secretCode) => API.delete(`/api/confessions/${id}`, { data: { secretCode } });
export const reactToConfession = (id, reactionType) => API.post(`/api/confessions/${id}/react`, { reactionType });
export const commentOnConfession = (id, text) => API.post(`/api/confessions/${id}/comment`, { text });
export const voteOnPoll = (id, optionIndex) => API.post(`/api/confessions/${id}/poll/vote`, { optionIndex });
export const unlockConfession = (id) => API.post(`/api/confessions/${id}/unlock`);
export const getLeaderboard = () => API.get('/api/confessions/leaderboard');

// User APIs
export const getUserProfile = () => API.get('/api/users/me');
export const getUserConfessions = (type) => API.get('/api/users/me/confessions', { params: { type } });
export const getSavedConfessions = () => API.get('/api/users/me/saved');
export const getUnlockedConfessions = () => API.get('/api/users/me/unlocked');
export const saveConfession = (id) => API.post(`/api/users/me/save/${id}`);
export const getUserStats = () => API.get('/api/users/me/stats');

export default API;
