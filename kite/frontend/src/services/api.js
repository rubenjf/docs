import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth Service
export const authService = {
  // Get login URL from backend
  async getLoginUrl() {
    try {
      const response = await api.get('/auth/login');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Exchange request token for access token
  async exchangeToken(requestToken) {
    try {
      const response = await api.post('/auth/token', {
        request_token: requestToken
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Get authentication status
  async getStatus() {
    try {
      const response = await api.get('/auth/status');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Logout
  async logout() {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Get user profile
  async getProfile() {
    try {
      const response = await api.get('/api/profile');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  handleError(error) {
    console.error('API Error:', error);
    
    if (error.response) {
      // Server responded with error status
      return {
        error: error.response.data.error || 'Server error',
        details: error.response.data.details || error.response.statusText,
        status: error.response.status
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        error: 'Network error',
        details: 'Unable to connect to server',
        status: 0
      };
    } else {
      // Something else happened
      return {
        error: 'Unknown error',
        details: error.message,
        status: 0
      };
    }
  }
};

// Data Service
export const dataService = {
  // Get instruments list
  async getInstruments(exchange = null) {
    try {
      const url = exchange ? `/api/instruments?exchange=${exchange}` : '/api/instruments';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw authService.handleError(error);
    }
  },

  // Get historical data
  async getHistoricalData(instrumentToken, interval, fromDate, toDate, options = {}) {
    try {
      const params = new URLSearchParams({
        from: fromDate,
        to: toDate,
        ...options // continuous, oi, etc.
      });

      const response = await api.get(
        `/api/historical/${instrumentToken}/${interval}?${params}`
      );
      return response.data;
    } catch (error) {
      throw authService.handleError(error);
    }
  },

  // Get market quote
  async getQuote(exchange, tradingSymbol) {
    try {
      const response = await api.get(`/api/quote/${exchange}/${tradingSymbol}`);
      return response.data;
    } catch (error) {
      throw authService.handleError(error);
    }
  },

  // Search instruments by name/symbol
  searchInstruments(instruments, searchTerm) {
    if (!searchTerm || !instruments) return [];
    
    const term = searchTerm.toLowerCase();
    return instruments.filter(instrument => 
      instrument.tradingsymbol?.toLowerCase().includes(term) ||
      instrument.name?.toLowerCase().includes(term)
    );
  },

  // Format date for API (YYYY-MM-DD HH:MM:SS)
  formatDate(date) {
    return date.toISOString().slice(0, 19).replace('T', ' ');
  },

  // Get common intervals
  getIntervals() {
    return [
      { value: 'minute', label: '1 Minute' },
      { value: '3minute', label: '3 Minutes' },
      { value: '5minute', label: '5 Minutes' },
      { value: '15minute', label: '15 Minutes' },
      { value: '30minute', label: '30 Minutes' },
      { value: '60minute', label: '1 Hour' },
      { value: 'day', label: '1 Day' }
    ];
  },

  // Get exchanges
  getExchanges() {
    return [
      { value: 'NSE', label: 'National Stock Exchange (NSE)' },
      { value: 'BSE', label: 'Bombay Stock Exchange (BSE)' },
      { value: 'NFO', label: 'NSE Futures & Options' },
      { value: 'MCX', label: 'Multi Commodity Exchange' }
    ];
  }
};

export default { authService, dataService };