import React, { useState } from 'react';
import { api } from '../services/api';

export default function PathFinder({ currentUser, allUsers, onClose }) {
  const [targetId, setTargetId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const find = async () => {
    if (!targetId) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await api.getShortest(currentUser._id, targetId);
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const others = allUsers?.filter(u => u._id !== currentUser._id) || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🔗 Find Connection Path</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <p className="modal-desc">Find the shortest friendship path from <strong>{currentUser.name}</strong> to another user.</p>

          <div className="path-select">
            <select value={targetId} onChange={e => setTargetId(e.target.value)} className="select-input">
              <option value="">Select a user...</option>
              {others.map(u => (
                <option key={u._id} value={u._id}>{u.name}</option>
              ))}
            </select>
            <button className="btn btn-primary" onClick={find} disabled={!targetId || loading}>
              {loading ? 'Searching...' : 'Find Path'}
            </button>
          </div>

          {error && <div className="error-box">{error}</div>}

          {result && (
            <div className="path-result">
              {result.path ? (
                <>
                  <div className="path-meta">
                    <span className="degree-badge">{result.length} degree{result.length !== 1 ? 's' : ''} of separation</span>
                  </div>
                  <div className="path-chain">
                    {result.path.map((node, i) => (
                      <React.Fragment key={node._id}>
                        <div className="path-node">
                          <div className="path-avatar" style={{ background: `hsl(${(i * 60) % 360},65%,55%)` }}>
                            {node.name?.charAt(0)}
                          </div>
                          <span>{node.name}</span>
                        </div>
                        {i < result.path.length - 1 && <div className="path-arrow">→</div>}
                      </React.Fragment>
                    ))}
                  </div>
                </>
              ) : (
                <div className="no-path">No connection found between these users.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
