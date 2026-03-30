import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import UserCard from '../components/UserCard';
import toast from 'react-hot-toast';

export default function Home({ currentUser, setCurrentUser, searchQuery }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', bio: '' });
  const navigate = useNavigate();

  const load = async (q = '') => {
    setLoading(true);
    try {
      const data = await api.getUsers(q);
      setUsers(data);
    } catch (e) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(searchQuery); }, [searchQuery]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const user = await api.createUser(form);
      toast.success(`Welcome, ${user.name}!`);
      setForm({ name: '', email: '', bio: '' });
      setShowCreate(false);
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleAdd = async (friendId) => {
    if (!currentUser) return toast.error('Select a profile first');
    try {
      await api.addFriend(currentUser._id, friendId);
      toast.success('Friend added!');
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleRemove = async (friendId) => {
    if (!currentUser) return;
    try {
      await api.removeFriend(currentUser._id, friendId);
      toast.success('Friend removed');
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const friendSet = new Set(currentUser?.friends?.map(f => f._id?.toString?.() || f?.toString?.()) || []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Discover People</h1>
          <p className="page-subtitle">{users.length} members in the network</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? '✕ Cancel' : '+ New User'}
        </button>
      </div>

      {showCreate && (
        <form className="create-form card" onSubmit={handleCreate}>
          <h3>Create Account</h3>
          <div className="form-row">
            <input className="input" placeholder="Full name *" required
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <input className="input" type="email" placeholder="Email *" required
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <input className="input" placeholder="Bio (optional)"
            value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
          <button type="submit" className="btn btn-primary">Create User</button>
        </form>
      )}

      {!currentUser && (
        <div className="info-banner">
          💡 Click <strong>View</strong> on any user to set them as your active profile, then add friends and explore suggestions.
        </div>
      )}

      {loading
        ? <div className="loading-grid">{[...Array(6)].map((_, i) => <div key={i} className="skeleton-card" />)}</div>
        : <div className="card-grid">
          {users.map(user => (
            <UserCard
              key={user._id}
              user={user}
              currentUser={currentUser}
              isFriend={friendSet.has(user._id?.toString())}
              onAdd={handleAdd}
              onRemove={handleRemove}
              onView={(id) => {
                navigate(`/profile/${id}`);
                if (!currentUser) {
                  api.getUser(id).then(setCurrentUser);
                }
              }}
            />
          ))}
        </div>
      }
    </div>
  );
}
