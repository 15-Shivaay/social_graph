const express = require('express');
const router = express.Router();
const graphService = require('../services/graphService');

// GET /graph/suggestions/:id
router.get('/suggestions/:id', async (req, res) => {
  try {
    const suggestions = await graphService.friendSuggestions(req.params.id);
    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /graph/mutual/:u/:v
router.get('/mutual/:u/:v', async (req, res) => {
  try {
    const mutual = await graphService.mutualFriends(req.params.u, req.params.v);
    res.json(mutual);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /graph/shortest/:u/:v
router.get('/shortest/:u/:v', async (req, res) => {
  try {
    const path = await graphService.shortestPath(req.params.u, req.params.v);
    if (!path) return res.json({ path: null, message: 'No connection found' });
    res.json({ path, length: path.length - 1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /graph/components
router.get('/components', async (req, res) => {
  try {
    const components = await graphService.connectedComponents();
    res.json({ components, count: components.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /graph/data — full graph for visualization
router.get('/data', async (req, res) => {
  try {
    const data = await graphService.getGraphData();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
