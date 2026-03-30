import React from 'react';
import UserCard from './UserCard';

export default function FriendList({ friends, currentUser, onRemove, onView, loading }) {
  if (loading) return <div className="loading-grid">{[...Array(3)].map((_, i) => <div key={i} className="skeleton-card" />)}</div>;
  if (!friends?.length) return (
    <div className="empty-state">
      <div className="empty-icon">👥</div>
      <p>No friends yet. Start connecting!</p>
    </div>
  );

  return (
    <div className="card-grid">
      {friends.map(friend => (
        <UserCard
          key={friend._id}
          user={friend}
          currentUser={currentUser}
          isFriend={true}
          onRemove={onRemove}
          onView={onView}
        />
      ))}
    </div>
  );
}
