import React from 'react';
import UserCard from './UserCard';

export default function SuggestionList({ suggestions, currentUser, onAdd, onView, loading }) {
  if (loading) return <div className="loading-grid">{[...Array(4)].map((_, i) => <div key={i} className="skeleton-card" />)}</div>;
  if (!suggestions?.length) return (
    <div className="empty-state">
      <div className="empty-icon">🔍</div>
      <p>No suggestions available. You know everyone!</p>
    </div>
  );

  return (
    <div className="card-grid">
      {suggestions.map(user => (
        <div key={user._id} className="suggestion-wrapper">
          <div className="mutual-badge">
            <span className="mutual-count">{user.mutualCount}</span>
            mutual {user.mutualCount === 1 ? 'friend' : 'friends'}
          </div>
          <UserCard
            user={user}
            currentUser={currentUser}
            isFriend={false}
            onAdd={onAdd}
            onView={onView}
          />
        </div>
      ))}
    </div>
  );
}
