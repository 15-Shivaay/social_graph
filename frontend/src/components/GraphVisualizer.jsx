import React, { useEffect, useRef, useState, useCallback } from 'react';
import { api } from '../services/api';

// Lightweight D3-inspired force-directed graph (no external dep required)
export default function GraphVisualizer({ highlightUserId }) {
  const canvasRef = useRef(null);
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const simRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    api.getGraphData().then(data => {
      setGraphData(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !simRef.current) return;
    const ctx = canvas.getContext('2d');
    const { nodes, edges } = simRef.current;
    const W = canvas.width, H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    // Draw edges
    ctx.strokeStyle = 'rgba(99,102,241,0.25)';
    ctx.lineWidth = 1.5;
    for (const edge of edges) {
      const s = nodes.find(n => n.id === edge.source);
      const t = nodes.find(n => n.id === edge.target);
      if (!s || !t) continue;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(t.x, t.y);
      ctx.stroke();
    }

    // Draw nodes
    for (const node of nodes) {
      const isHighlighted = node.id === highlightUserId;
      const r = 10 + Math.min(node.friendCount || 0, 8) * 1.5;

      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
      const gradient = ctx.createRadialGradient(node.x - r / 3, node.y - r / 3, 0, node.x, node.y, r);
      if (isHighlighted) {
        gradient.addColorStop(0, '#f59e0b');
        gradient.addColorStop(1, '#d97706');
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 20;
      } else {
        gradient.addColorStop(0, '#818cf8');
        gradient.addColorStop(1, '#6366f1');
        ctx.shadowBlur = 0;
      }
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Label
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = `${isHighlighted ? 'bold ' : ''}11px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(node.name?.split(' ')[0] || '', node.x, node.y + r + 14);
    }
  }, [highlightUserId]);

  useEffect(() => {
    if (!graphData.nodes.length || loading) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.width, H = canvas.height;

    // Initialize node positions
    const nodes = graphData.nodes.map((n, i) => ({
      ...n,
      x: W / 2 + Math.cos((i / graphData.nodes.length) * Math.PI * 2) * 200,
      y: H / 2 + Math.sin((i / graphData.nodes.length) * Math.PI * 2) * 200,
      vx: 0, vy: 0
    }));

    simRef.current = { nodes, edges: graphData.edges };

    // Force simulation
    const tick = () => {
      const { nodes, edges } = simRef.current;
      const k = 0.05, repulsion = 2000, damping = 0.85;

      // Repulsion
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
          const force = repulsion / (dist * dist);
          nodes[i].vx -= dx / dist * force;
          nodes[i].vy -= dy / dist * force;
          nodes[j].vx += dx / dist * force;
          nodes[j].vy += dy / dist * force;
        }
      }

      // Attraction along edges
      for (const edge of edges) {
        const s = nodes.find(n => n.id === edge.source);
        const t = nodes.find(n => n.id === edge.target);
        if (!s || !t) continue;
        const dx = t.x - s.x, dy = t.y - s.y;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
        const target = 120;
        const force = (dist - target) * k;
        s.vx += dx / dist * force;
        s.vy += dy / dist * force;
        t.vx -= dx / dist * force;
        t.vy -= dy / dist * force;
      }

      // Center gravity
      for (const n of nodes) {
        n.vx += (W / 2 - n.x) * 0.001;
        n.vy += (H / 2 - n.y) * 0.001;
        n.vx *= damping;
        n.vy *= damping;
        n.x += n.vx;
        n.y += n.vy;
        n.x = Math.max(30, Math.min(W - 30, n.x));
        n.y = Math.max(30, Math.min(H - 30, n.y));
      }

      draw();
      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [graphData, loading, draw]);

  if (loading) return <div className="graph-loading">Loading network graph...</div>;

  return (
    <div className="graph-container">
      <canvas ref={canvasRef} width={800} height={500} className="graph-canvas" />
      <div className="graph-legend">
        <span className="legend-dot" style={{ background: '#6366f1' }} /> User node
        <span className="legend-dot" style={{ background: '#f59e0b', marginLeft: 12 }} /> You
      </div>
    </div>
  );
}
