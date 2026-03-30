import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import toast from 'react-hot-toast';

const COMPONENT_COLORS = [
  ['#6366f1', '#818cf8'],
  ['#10b981', '#34d399'],
  ['#f59e0b', '#fbbf24'],
  ['#ef4444', '#f87171'],
  ['#8b5cf6', '#a78bfa'],
  ['#06b6d4', '#22d3ee'],
];

export default function Components() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.getComponents()
      .then(setData)
      .catch(() => toast.error('Failed to load components'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page">
      <div className="loading-grid">{[...Array(3)].map((_, i) => <div key={i} className="skeleton-card tall" />)}</div>
    </div>
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Network Components</h1>
          <p className="page-subtitle">
            DFS-detected isolated groups — {data?.count || 0} connected component{data?.count !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="components-grid">
        {data?.components?.map((comp, i) => {
          const [c1, c2] = COMPONENT_COLORS[i % COMPONENT_COLORS.length];
          return (
            <div key={i} className="component-card card" style={{ borderTop: `3px solid ${c1}` }}>
              <div className="component-header" style={{ background: `linear-gradient(135deg, ${c1}22, ${c2}11)` }}>
                <div className="component-badge" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                  {comp.length}
                </div>
                <div>
                  <h3>Group {i + 1}</h3>
                  <p>{comp.length} member{comp.length !== 1 ? 's' : ''}</p>
                </div>
                {comp.length === 1 && <span className="isolated-tag">Isolated</span>}
              </div>

              <div className="component-members">
                {comp.map(user => (
                  <div
                    key={user._id}
                    className="member-chip"
                    onClick={() => navigate(`/profile/${user._id}`)}
                    style={{ borderColor: `${c1}44` }}
                  >
                    <div className="member-avatar" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                      {user.name?.charAt(0)}
                    </div>
                    <span>{user.name}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="card algo-explainer">
        <h3>🔍 How DFS Detects Components</h3>
        <div className="algo-steps">
          <div className="algo-step">
            <span className="step-num">1</span>
            <p>Start from any unvisited node and run Depth-First Search</p>
          </div>
          <div className="algo-step">
            <span className="step-num">2</span>
            <p>Mark all reachable nodes as visited — they form one component</p>
          </div>
          <div className="algo-step">
            <span className="step-num">3</span>
            <p>Repeat for any remaining unvisited nodes to find isolated groups</p>
          </div>
          <div className="algo-step">
            <span className="step-num">4</span>
            <p>Time complexity: O(V + E) where V = users, E = friendships</p>
          </div>
        </div>
      </div>
    </div>
  );
}
