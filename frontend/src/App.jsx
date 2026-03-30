import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Profile from './pages/Profile';
import GraphPage from './pages/GraphPage';
import Components from './pages/Components';
import { wsConnect } from './services/api';
import './styles.css';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [wsStatus, setWsStatus] = useState('disconnected');

  // WebSocket for real-time updates
  useEffect(() => {
    const ws = wsConnect((msg) => {
      if (msg.type === 'connected') setWsStatus('connected');
    });
    if (ws) {
      ws.onopen = () => setWsStatus('connected');
      ws.onclose = () => setWsStatus('disconnected');
    }
    return () => ws?.close();
  }, []);

  const handleSearch = useCallback((q) => setSearchQuery(q), []);

  return (
    <BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { background: '#1e1e2e', color: '#cdd6f4', border: '1px solid #313244', borderRadius: 12 },
          success: { iconTheme: { primary: '#a6e3a1', secondary: '#1e1e2e' } },
          error: { iconTheme: { primary: '#f38ba8', secondary: '#1e1e2e' } }
        }}
      />
      <div className="app">
        <Navbar currentUser={currentUser} onSearch={handleSearch} />
        {wsStatus === 'connected' && (
          <div className="ws-badge">● Live</div>
        )}
        <main className="main">
          <Routes>
            <Route path="/" element={
              <Home
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
                searchQuery={searchQuery}
              />
            } />
            <Route path="/profile/:id" element={
              <Profile
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
              />
            } />
            <Route path="/graph" element={<GraphPage currentUser={currentUser} />} />
            <Route path="/components" element={<Components />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
