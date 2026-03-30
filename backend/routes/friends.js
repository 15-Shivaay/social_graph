const express = require('express');
const router = express.Router();
const graphService = require('../services/graphService');

// POST /friends/add
router.post('/add', async (req, res) => {
  try {
    const { userId, friendId } = req.body;
    if (!userId || !friendId) return res.status(400).json({ error: 'userId and friendId required' });
    const result = await graphService.addFriend(userId, friendId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /friends/remove
router.post('/remove', async (req, res) => {
  try {
    const { userId, friendId } = req.body;
    if (!userId || !friendId) return res.status(400).json({ error: 'userId and friendId required' });
    const result = await graphService.removeFriend(userId, friendId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /friends/:id
router.get('/:id', async (req, res) => {
  try {
    const friends = await graphService.getFriends(req.params.id);
    res.json(friends);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
