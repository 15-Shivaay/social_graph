import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import GraphVisualizer from '../components/GraphVisualizer';
import toast from 'react-hot-toast';

export default function GraphPage({ currentUser }) {
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.getUsers(), api.getComponents(), api.getGraphData()])
      .then(([users, comp, graph]) => {
        setStats({
          userCount: users.length,
          components: comp.count,
          edgeCount: graph.edges.length,
          largestComponent: comp.components[0]?.length || 0
        });
      })
      .catch(() => toast.error('Failed to load graph stats'));
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Network Graph</h1>
          <p className="page-subtitle">Live visualization of your social network</p>
        </div>
      </div>

      {stats && (
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-card-value">{stats.userCount}</div>
            <div className="stat-card-label">Users (Nodes)</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-value">{stats.edgeCount}</div>
            <div className="stat-card-label">Friendships (Edges)</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-value">{stats.components}</div>
            <div className="stat-card-label">Connected Groups</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-value">{stats.largestComponent}</div>
            <div className="stat-card-label">Largest Cluster</div>
          </div>
        </div>
      )}

      <div className="card graph-card">
        <div className="graph-header">
          <h2>Force-Directed Graph</h2>
          <p className="graph-note">Nodes = users · Edges = friendships · Size = friend count</p>
        </div>
        <GraphVisualizer highlightUserId={currentUser?._id} />
      </div>

      <div className="algo-info card">
        <h3>⚙️ Algorithms at Work</h3>
        <div className="algo-grid">
          <div className="algo-item">
            <div className="algo-icon">🔵</div>
            <div>
              <strong>BFS</strong>
              <p>Friend suggestions (level-2) and shortest path discovery</p>
            </div>
          </div>
          <div className="algo-item">
            <div className="algo-icon">🔴</div>
            <div>
              <strong>DFS</strong>
              <p>Connected component detection across the network</p>
            </div>
          </div>
          <div className="algo-item">
            <div className="algo-icon">🟢</div>
            <div>
              <strong>Set Intersection</strong>
              <p>O(min(|A|,|B|)) mutual friend computation</p>
            </div>
          </div>
          <div className="algo-item">
            <div className="algo-icon">🟡</div>
            <div>
              <strong>Priority Ranking</strong>
              <p>Suggestions ranked by mutual friend count (max-heap concept)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
