import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ currentUser, onSearch }) {
  const location = useLocation();
  const [q, setQ] = useState('');

  const handleSearch = (e) => {
    setQ(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="brand-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="5" r="3" /><circle cx="5" cy="19" r="3" /><circle cx="19" cy="19" r="3" />
            <line x1="12" y1="8" x2="5" y2="16" /><line x1="12" y1="8" x2="19" y2="16" />
          </svg>
        </div>
        <span className="brand-name">SocialGraph</span>
      </div>

      <div className="navbar-search">
        <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          className="search-input"
          placeholder="Search users..."
          value={q}
          onChange={handleSearch}
        />
      </div>

      <div className="navbar-links">
        <Link className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} to="/">Home</Link>
        <Link className={`nav-link ${location.pathname === '/graph' ? 'active' : ''}`} to="/graph">Graph</Link>
        <Link className={`nav-link ${location.pathname === '/components' ? 'active' : ''}`} to="/components">Network</Link>
      </div>

      {currentUser && (
        <div className="navbar-user">
          <div className="nav-avatar" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
            {currentUser.name?.charAt(0)}
          </div>
          <span className="nav-username">{currentUser.name?.split(' ')[0]}</span>
        </div>
      )}
    </nav>
  );
}
