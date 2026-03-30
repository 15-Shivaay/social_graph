const BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const request = async (path, opts = {}) => {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

export const api = {
  // Users
  getUsers: (search = '') =>
    request(`/users${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getUser: (id) => request(`/users/${id}`),
  createUser: (body) => request('/users', { method: 'POST', body: JSON.stringify(body) }),

  // Friends
  getFriends: (id) => request(`/friends/${id}`),
  addFriend: (userId, friendId) =>
    request('/friends/add', { method: 'POST', body: JSON.stringify({ userId, friendId }) }),
  removeFriend: (userId, friendId) =>
    request('/friends/remove', { method: 'POST', body: JSON.stringify({ userId, friendId }) }),

  // Graph
  getSuggestions: (id) => request(`/graph/suggestions/${id}`),
  getMutual: (u, v) => request(`/graph/mutual/${u}/${v}`),
  getShortest: (u, v) => request(`/graph/shortest/${u}/${v}`),
  getComponents: () => request('/graph/components'),
  getGraphData: () => request('/graph/data'),
};

export const wsConnect = (onMessage) => {
  const WS_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000')
    .replace('http', 'ws');
  try {
    const ws = new WebSocket(WS_URL);
    ws.onmessage = (e) => onMessage(JSON.parse(e.data));
    ws.onerror = () => {};
    return ws;
  } catch {
    return null;
  }
};
