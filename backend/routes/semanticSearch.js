const express = require('express');
const axios = require('axios');
const router = express.Router();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';

router.post('/api/semantic-search', async (req, res) => {
  try {
    const { query, top_k } = req.body;
    const url = new URL('/search', API_BASE_URL).toString();
    const response = await axios.post(url, { query, top_k });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
