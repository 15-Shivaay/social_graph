const express = require('express');
const router = express.Router();
const graphService = require('../services/graphService');

// POST /users — create user
router.post('/', async (req, res) => {
  try {
    const { name, email, bio, avatar } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'name and email required' });
    const user = await graphService.createUser(name, email, bio, avatar);
    res.status(201).json(user);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Email already exists' });
    res.status(500).json({ error: err.message });
  }
});

// GET /users — all users
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    const users = search
      ? await graphService.searchUsers(search)
      : await graphService.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /users/:id
router.get('/:id', async (req, res) => {
  try {
    const user = await graphService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
