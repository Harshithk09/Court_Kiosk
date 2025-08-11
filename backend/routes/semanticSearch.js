const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/api/semantic-search', async (req, res) => {
  try {
    const { query, top_k } = req.body;
    const response = await axios.post('http://localhost:8000/search', { query, top_k });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 