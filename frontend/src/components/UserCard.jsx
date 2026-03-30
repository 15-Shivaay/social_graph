import React from 'react';

export default function UserCard({ user, currentUser, isFriend, onAdd, onRemove, onView, compact = false }) {
  if (!user) return null;

  const initials = user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const isSelf = currentUser && user._id === currentUser._id;

  return (
    <div className={`user-card ${compact ? 'compact' : ''}`}>
      <div className="user-card-avatar" style={{ background: stringToGradient(user.name) }}>
        {user.avatar
          ? <img src={user.avatar} alt={user.name} onError={e => { e.target.style.display = 'none'; }} />
          : <span>{initials}</span>}
      </div>
      <div className="user-card-info">
        <h3 className="user-card-name">{user.name}</h3>
        {!compact && <p className="user-card-email">{user.email}</p>}
        {!compact && user.bio && <p className="user-card-bio">{user.bio}</p>}
        <div className="user-card-meta">
          <span className="friend-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
            </svg>
            {(user.friends?.length ?? user.friendCount) ?? 0} friends
          </span>
        </div>
      </div>
      <div className="user-card-actions">
        {onView && (
          <button className="btn btn-ghost" onClick={() => onView(user._id)}>
            View
          </button>
        )}
        {!isSelf && currentUser && (
          isFriend
            ? <button className="btn btn-danger" onClick={() => onRemove(user._id)}>Unfriend</button>
            : <button className="btn btn-primary" onClick={() => onAdd(user._id)}>Add Friend</button>
        )}
      </div>
    </div>
  );
}

function stringToGradient(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const h1 = Math.abs(hash) % 360;
  const h2 = (h1 + 40) % 360;
  return `linear-gradient(135deg, hsl(${h1},65%,55%), hsl(${h2},70%,45%))`;
}
