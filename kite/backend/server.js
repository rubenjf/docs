const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Kite Connect configuration
const KITE_API_KEY = process.env.KITE_API_KEY;
const KITE_API_SECRET = process.env.KITE_API_SECRET;
const KITE_REDIRECT_URL = process.env.KITE_REDIRECT_URL || 'http://localhost:4000/callback';

// Base URLs
const KITE_BASE_URL = 'https://api.kite.trade';
const KITE_LOGIN_URL = 'https://kite.zerodha.com/connect/login';

// Store access tokens temporarily (in production, use proper session management)
let currentSession = {
  access_token: null,
  user_id: null
};

// Routes

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Kite Connect Backend Server Running',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Generate login URL
app.get('/auth/login', (req, res) => {
  try {
    if (!KITE_API_KEY) {
      return res.status(500).json({ 
        error: 'API Key not configured. Please set KITE_API_KEY in environment variables.' 
      });
    }

    const loginUrl = `${KITE_LOGIN_URL}?v=3&api_key=${KITE_API_KEY}`;
    res.json({ 
      loginUrl,
      message: 'Redirect user to this URL for authentication'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate login URL', details: error.message });
  }
});

// Handle token exchange
app.post('/auth/token', async (req, res) => {
  try {
    const { request_token } = req.body;
    
    if (!request_token) {
      return res.status(400).json({ error: 'request_token is required' });
    }

    if (!KITE_API_KEY || !KITE_API_SECRET) {
      return res.status(500).json({ 
        error: 'API credentials not configured. Please set KITE_API_KEY and KITE_API_SECRET in environment variables.' 
      });
    }

    // Generate checksum: SHA-256 of (api_key + request_token + api_secret)
    const checksum = crypto
      .createHash('sha256')
      .update(KITE_API_KEY + request_token + KITE_API_SECRET)
      .digest('hex');

    // Exchange request_token for access_token
    const tokenResponse = await axios.post(`${KITE_BASE_URL}/session/token`, {
      api_key: KITE_API_KEY,
      request_token: request_token,
      checksum: checksum
    }, {
      headers: {
        'X-Kite-Version': '3',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { data } = tokenResponse.data;
    
    // Store session data
    currentSession = {
      access_token: data.access_token,
      user_id: data.user_id,
      user_name: data.user_name,
      email: data.email,
      exchanges: data.exchanges
    };
    console.log('[LOGIN] New access token set:', data.access_token);

    res.json({
      success: true,
      data: {
        access_token: data.access_token,
        user_id: data.user_id,
        user_name: data.user_name,
        email: data.email,
        exchanges: data.exchanges
      }
    });

  } catch (error) {
    console.error('Token exchange error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to exchange token', 
      details: error.response?.data || error.message 
    });
  }
});

// Get user profile
app.get('/api/profile', async (req, res) => {
  try {
    if (!currentSession.access_token) {
      return res.status(401).json({ error: 'Not authenticated. Please login first.' });
    }

    const profileResponse = await axios.get(`${KITE_BASE_URL}/user/profile`, {
      headers: {
        'X-Kite-Version': '3',
        'Authorization': `token ${KITE_API_KEY}:${currentSession.access_token}`
      }
    });

    res.json(profileResponse.data);
  } catch (error) {
    console.error('Profile fetch error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to fetch profile', 
      details: error.response?.data || error.message 
    });
  }
});

// Get instruments list
app.get('/api/instruments', async (req, res) => {
  try {
    if (!currentSession.access_token) {
      return res.status(401).json({ error: 'Not authenticated. Please login first.' });
    }

    const { exchange } = req.query; // Optional: NSE, BSE, etc.
    
    let url = `${KITE_BASE_URL}/instruments`;
    if (exchange) {
      url += `/${exchange}`;
    }

    const instrumentsResponse = await axios.get(url, {
      headers: {
        'X-Kite-Version': '3',
        'Authorization': `token ${KITE_API_KEY}:${currentSession.access_token}`
      }
    });

    // Convert CSV to JSON for easier frontend consumption
    const csvData = instrumentsResponse.data;
    const lines = csvData.split('\n');
    const headers = lines[0].split(',');
    const instruments = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',');
        const instrument = {};
        headers.forEach((header, index) => {
          instrument[header.trim()] = values[index] ? values[index].trim() : '';
        });
        instruments.push(instrument);
      }
    }

    console.log(`[INSTRUMENTS] Fetched ${instruments.length} instruments from ${exchange || 'all exchanges'}`);

    res.json({ 
      success: true, 
      data: instruments, // Return all instruments, not just first 100
      total: instruments.length
    });
  } catch (error) {
    console.error('Instruments fetch error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to fetch instruments', 
      details: error.response?.data || error.message 
    });
  }
});

// Get historical data
app.get('/api/historical/:instrument_token/:interval', async (req, res) => {
  try {
    if (!currentSession.access_token) {
      return res.status(401).json({ error: 'Not authenticated. Please login first.' });
    }

    const { instrument_token, interval } = req.params;
    const { from, to, continuous, oi } = req.query;

    if (!from || !to) {
      return res.status(400).json({ 
        error: 'from and to dates are required in format: YYYY-MM-DD HH:MM:SS' 
      });
    }

    let url = `${KITE_BASE_URL}/instruments/historical/${instrument_token}/${interval}`;
    const params = new URLSearchParams({ from, to });
    
    if (continuous) params.append('continuous', continuous);
    if (oi) params.append('oi', oi);

    const historicalResponse = await axios.get(`${url}?${params}`, {
      headers: {
        'X-Kite-Version': '3',
        'Authorization': `token ${KITE_API_KEY}:${currentSession.access_token}`
      }
    });

    res.json(historicalResponse.data);
  } catch (error) {
    console.error('Historical data fetch error:', error.response?.data || error.message);
    
    // If we have a response from Kite Connect API, pass it through
    if (error.response?.data) {
      return res.status(error.response.status || 500).json({
        error: 'Failed to fetch historical data',
        details: error.response.data
      });
    }
    
    // Otherwise return a generic error
    res.status(500).json({ 
      error: 'Failed to fetch historical data', 
      details: { message: error.message } 
    });
  }
});

// Get market quote
app.get('/api/quote/:exchange/:tradingsymbol', async (req, res) => {
  try {
    if (!currentSession.access_token) {
      return res.status(401).json({ error: 'Not authenticated. Please login first.' });
    }

    const { exchange, tradingsymbol } = req.params;
    const instrument = `${exchange}:${tradingsymbol}`;

    const quoteResponse = await axios.get(`${KITE_BASE_URL}/quote?i=${instrument}`, {
      headers: {
        'X-Kite-Version': '3',
        'Authorization': `token ${KITE_API_KEY}:${currentSession.access_token}`
      }
    });

    res.json(quoteResponse.data);
  } catch (error) {
    console.error('Quote fetch error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to fetch quote', 
      details: error.response?.data || error.message 
    });
  }
});

// Logout
app.post('/auth/logout', async (req, res) => {
  try {
    if (!currentSession || !currentSession.access_token) {
      console.log("No active session found");  
      return res.status(400).json({ success: false, error: 'No active session found' });
      
    }

    try {
      // Invalidate the session as per Kite Connect documentation
      // POST to /session/token with api_key, access_token, action: 'logout'
      if (KITE_API_KEY && KITE_API_KEY.length >= 6) {
        const qs = require('querystring');
        const logoutBody = qs.stringify({
          api_key: KITE_API_KEY,
          access_token: currentSession.access_token,
          action: 'logout',
        });
        await axios.post(`${KITE_BASE_URL}/session/token`, logoutBody, {
          headers: {
            'X-Kite-Version': '3',
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
      }
    } catch (apiError) {
      // Log the error but continue with local logout
      console.warn('Failed to invalidate token on Kite API:', apiError.message);
    }

    // Clear the session regardless of Kite API response
    console.log('[LOGOUT] Clearing access token:', currentSession.access_token);
    currentSession = {
      access_token: null,
      user_id: null
    };

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    // Still clear the local session even if there was an error
    currentSession = {
      access_token: null,
      user_id: null
    };
    res.status(500).json({ 
      success: true,  // Consider it successful since we cleared the local session
      message: 'Logged out locally, but remote session may still be active',
      error: error.response?.data?.message || error.message || 'Error during logout process'
    });
  }
});

// Get current session status
app.get('/auth/status', (req, res) => {
  res.json({
    authenticated: !!currentSession.access_token,
    user_id: currentSession.user_id,
    user_name: currentSession.user_name,
    access_token: currentSession.access_token
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Kite Connect Backend Server running on port ${PORT}`);
  console.log(`📊 Make sure to set your KITE_API_KEY and KITE_API_SECRET in .env file`);
});

module.exports = app;