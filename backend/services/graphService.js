const User = require('../models/User');

/**
 * GraphService — all DSA-heavy logic lives here.
 * Uses in-memory adjacency lists (Map of Sets) to avoid redundant DB hits.
 */
class GraphService {
  constructor() {
    // adjacencyList: Map<userId:string, Set<friendId:string>>
    this.adjacencyList = new Map();
    this.userCache = new Map(); // userId -> user doc
    this.dirty = true;
  }

  // ─── Cache Management ────────────────────────────────────────────────────

  async buildGraph() {
    if (!this.dirty) return;
    const users = await User.find({}, '_id friends name email avatar bio');
    this.adjacencyList.clear();
    this.userCache.clear();
    for (const user of users) {
      const uid = user._id.toString();
      this.adjacencyList.set(uid, new Set(user.friends.map(f => f.toString())));
      this.userCache.set(uid, user);
    }
    this.dirty = false;
  }

  invalidate() {
    this.dirty = true;
  }

  async getGraph() {
    await this.buildGraph();
    return this.adjacencyList;
  }

  // ─── User Ops ────────────────────────────────────────────────────────────

  async createUser(name, email, bio = '', avatar = '') {
    const user = new User({ name, email, bio, avatar });
    await user.save();
    this.invalidate();
    return user;
  }

  async getUserById(id) {
    const user = await User.findById(id).populate('friends', '_id name email avatar bio');
    return user;
  }

  async getAllUsers() {
    return User.find({}, '_id name email avatar bio friends');
  }

  async searchUsers(prefix) {
    const regex = new RegExp(`^${prefix}`, 'i');
    return User.find({ name: regex }, '_id name email avatar bio').limit(10);
  }

  // ─── Friendship ──────────────────────────────────────────────────────────

  async addFriend(userId, friendId) {
    if (userId === friendId) throw new Error('Cannot friend yourself');

    const [u, f] = await Promise.all([
      User.findById(userId),
      User.findById(friendId)
    ]);
    if (!u) throw new Error(`User ${userId} not found`);
    if (!f) throw new Error(`User ${friendId} not found`);

    const uFriends = new Set(u.friends.map(id => id.toString()));
    if (uFriends.has(friendId)) throw new Error('Already friends');

    // Bidirectional edge
    await Promise.all([
      User.findByIdAndUpdate(userId, { $addToSet: { friends: friendId } }),
      User.findByIdAndUpdate(friendId, { $addToSet: { friends: userId } })
    ]);

    this.invalidate();
    return { message: 'Friendship added' };
  }

  async removeFriend(userId, friendId) {
    await Promise.all([
      User.findByIdAndUpdate(userId, { $pull: { friends: friendId } }),
      User.findByIdAndUpdate(friendId, { $pull: { friends: userId } })
    ]);
    this.invalidate();
    return { message: 'Friendship removed' };
  }

  async getFriends(userId) {
    const user = await User.findById(userId).populate('friends', '_id name email avatar bio friends');
    if (!user) throw new Error('User not found');
    return user.friends;
  }

  // ─── Mutual Friends — O(min(|A|, |B|)) via Set intersection ────────────

  async mutualFriends(userIdA, userIdB) {
    await this.buildGraph();
    const setA = this.adjacencyList.get(userIdA) || new Set();
    const setB = this.adjacencyList.get(userIdB) || new Set();
    const mutual = [...setA].filter(id => setB.has(id));
    return mutual.map(id => this.userCache.get(id)).filter(Boolean).map(u => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      avatar: u.avatar
    }));
  }

  // ─── Friend Suggestions — BFS level-2, ranked by mutual count ───────────

  async friendSuggestions(userId) {
    await this.buildGraph();
    const directFriends = this.adjacencyList.get(userId) || new Set();
    const visited = new Set([userId, ...directFriends]);
    const mutualCount = new Map(); // candidateId -> mutual friend count

    // BFS: explore friends-of-friends
    for (const friendId of directFriends) {
      const fof = this.adjacencyList.get(friendId) || new Set();
      for (const candidate of fof) {
        if (!visited.has(candidate)) {
          mutualCount.set(candidate, (mutualCount.get(candidate) || 0) + 1);
        }
      }
    }

    // Sort by mutual count descending (priority queue simulation)
    const sorted = [...mutualCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);

    return sorted.map(([id, count]) => {
      const u = this.userCache.get(id);
      if (!u) return null;
      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        avatar: u.avatar,
        mutualCount: count
      };
    }).filter(Boolean);
  }

  // ─── Shortest Path — BFS ─────────────────────────────────────────────────

  async shortestPath(startId, endId) {
    if (startId === endId) return [startId];
    await this.buildGraph();

    const queue = [[startId]];
    const visited = new Set([startId]);

    while (queue.length > 0) {
      const path = queue.shift();
      const current = path[path.length - 1];
      const neighbors = this.adjacencyList.get(current) || new Set();

      for (const neighbor of neighbors) {
        if (neighbor === endId) {
          const fullPath = [...path, neighbor];
          return fullPath.map(id => {
            const u = this.userCache.get(id);
            return u ? { _id: u._id, name: u.name, avatar: u.avatar } : { _id: id };
          });
        }
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push([...path, neighbor]);
        }
      }
    }
    return null; // No path
  }

  // ─── Connected Components — DFS ─────────────────────────────────────────

  async connectedComponents() {
    await this.buildGraph();
    const visited = new Set();
    const components = [];

    const dfs = (nodeId, component) => {
      visited.add(nodeId);
      component.push(nodeId);
      const neighbors = this.adjacencyList.get(nodeId) || new Set();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          dfs(neighbor, component);
        }
      }
    };

    for (const nodeId of this.adjacencyList.keys()) {
      if (!visited.has(nodeId)) {
        const component = [];
        dfs(nodeId, component);
        components.push(component.map(id => {
          const u = this.userCache.get(id);
          return u ? { _id: u._id, name: u.name, avatar: u.avatar } : { _id: id };
        }));
      }
    }

    return components.sort((a, b) => b.length - a.length);
  }

  // ─── Graph Visualization Data ────────────────────────────────────────────

  async getGraphData() {
    await this.buildGraph();
    const nodes = [];
    const edges = [];
    const seen = new Set();

    for (const [uid, friends] of this.adjacencyList.entries()) {
      const u = this.userCache.get(uid);
      if (u) nodes.push({ id: uid, name: u.name, avatar: u.avatar, friendCount: friends.size });

      for (const fid of friends) {
        const edgeKey = [uid, fid].sort().join('-');
        if (!seen.has(edgeKey)) {
          seen.add(edgeKey);
          edges.push({ source: uid, target: fid });
        }
      }
    }

    return { nodes, edges };
  }
}

module.exports = new GraphService(); // Singleton
