import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import FriendList from '../components/FriendList';
import SuggestionList from '../components/SuggestionList';
import PathFinder from '../components/PathFinder';
import toast from 'react-hot-toast';

export default function Profile({ currentUser, setCurrentUser }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [mutual, setMutual] = useState([]);
  const [tab, setTab] = useState('friends');
  const [loading, setLoading] = useState(true);
  const [showPath, setShowPath] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  const isMe = currentUser?._id === id;

  const loadUser = async () => {
    setLoading(true);
    try {
      const [u, f] = await Promise.all([api.getUser(id), api.getFriends(id)]);
      setUser(u);
      setFriends(f);
    } catch (e) {
      toast.error('User not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const loadSuggestions = async () => {
    try {
      const s = await api.getSuggestions(id);
      setSuggestions(s);
    } catch {}
  };

  const loadMutual = async () => {
    if (!currentUser || currentUser._id === id) return;
    try {
      const m = await api.getMutual(currentUser._id, id);
      setMutual(m);
    } catch {}
  };

  useEffect(() => {
    loadUser();
    loadSuggestions();
    loadMutual();
    api.getUsers().then(setAllUsers);
  }, [id]);

  const handleAdd = async (friendId) => {
    if (!currentUser) return toast.error('Set your profile first');
    try {
      await api.addFriend(currentUser._id, friendId);
      toast.success('Friend added!');
      loadUser();
      loadSuggestions();
      if (isMe) {
        const updated = await api.getUser(currentUser._id);
        setCurrentUser(updated);
      }
    } catch (e) { toast.error(e.message); }
  };

  const handleRemove = async (friendId) => {
    if (!currentUser) return;
    try {
      await api.removeFriend(currentUser._id, friendId);
      toast.success('Friend removed');
      loadUser();
      loadSuggestions();
      if (isMe) {
        const updated = await api.getUser(currentUser._id);
        setCurrentUser(updated);
      }
    } catch (e) { toast.error(e.message); }
  };

  const friendSet = new Set(
    (isMe ? friends : currentUser?.friends || []).map(f => f._id?.toString?.() || f?.toString?.())
  );

  if (loading) return (
    <div className="page">
      <div className="profile-skeleton">
        <div className="skeleton-avatar" />
        <div className="skeleton-text wide" />
        <div className="skeleton-text" />
      </div>
    </div>
  );

  if (!user) return null;

  const initials = user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="page">
      {/* Profile Header */}
      <div className="profile-header card">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
            {user.avatar
              ? <img src={user.avatar} alt={user.name} onError={e => e.target.style.display = 'none'} />
              : <span>{initials}</span>}
          </div>
          {isMe && <div className="you-badge">You</div>}
        </div>

        <div className="profile-info">
          <h1 className="profile-name">{user.name}</h1>
          <p className="profile-email">{user.email}</p>
          {user.bio && <p className="profile-bio">{user.bio}</p>}
          <div className="profile-stats">
            <div className="stat">
              <span className="stat-value">{friends.length}</span>
              <span className="stat-label">Friends</span>
            </div>
            {!isMe && mutual.length > 0 && (
              <div className="stat">
                <span className="stat-value">{mutual.length}</span>
                <span className="stat-label">Mutual</span>
              </div>
            )}
            <div className="stat">
              <span className="stat-value">{suggestions.length}</span>
              <span className="stat-label">Suggestions</span>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          {!isMe && currentUser && (
            friendSet.has(user._id?.toString())
              ? <button className="btn btn-danger" onClick={() => handleRemove(user._id)}>Unfriend</button>
              : <button className="btn btn-primary" onClick={() => handleAdd(user._id)}>Add Friend</button>
          )}
          <button className="btn btn-ghost" onClick={() => {
            setCurrentUser(user);
            toast.success(`Switched to ${user.name}`);
          }}>
            {isMe ? '✓ Active Profile' : 'Switch to this Profile'}
          </button>
          {currentUser && !isMe && (
            <button className="btn btn-secondary" onClick={() => setShowPath(true)}>
              🔗 Find Path
            </button>
          )}
        </div>
      </div>

      {/* Mutual Friends (when viewing someone else) */}
      {!isMe && mutual.length > 0 && (
        <div className="mutual-section card">
          <h3>👥 {mutual.length} Mutual Friend{mutual.length !== 1 ? 's' : ''}</h3>
          <div className="mutual-avatars">
            {mutual.slice(0, 6).map(m => (
              <div key={m._id} className="mutual-chip" onClick={() => navigate(`/profile/${m._id}`)}>
                <div className="mutual-avatar-sm" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                  {m.name?.charAt(0)}
                </div>
                <span>{m.name?.split(' ')[0]}</span>
              </div>
            ))}
            {mutual.length > 6 && <span className="more-mutual">+{mutual.length - 6} more</span>}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${tab === 'friends' ? 'active' : ''}`} onClick={() => setTab('friends')}>
          Friends ({friends.length})
        </button>
        <button className={`tab ${tab === 'suggestions' ? 'active' : ''}`} onClick={() => setTab('suggestions')}>
          Suggestions ({suggestions.length})
        </button>
      </div>

      {tab === 'friends' && (
        <FriendList
          friends={friends}
          currentUser={currentUser}
          onRemove={isMe ? handleRemove : undefined}
          onView={(fid) => navigate(`/profile/${fid}`)}
        />
      )}

      {tab === 'suggestions' && (
        <SuggestionList
          suggestions={suggestions}
          currentUser={currentUser}
          onAdd={handleAdd}
          onView={(sid) => navigate(`/profile/${sid}`)}
        />
      )}

      {showPath && currentUser && (
        <PathFinder
          currentUser={currentUser}
          allUsers={allUsers}
          onClose={() => setShowPath(false)}
        />
      )}
    </div>
  );
}
