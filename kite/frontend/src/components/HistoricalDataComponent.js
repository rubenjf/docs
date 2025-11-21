import React, { useState, useEffect } from 'react';
import { dataService } from '../services/api';
import nifty50Data from '../data/nifty50.json';
import './HistoricalDataComponent.css';

const HistoricalDataComponent = ({ isAuthenticated, onLogout }) => {
  const [instruments, setInstruments] = useState([]);
  const [filteredInstruments, setFilteredInstruments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [formData, setFormData] = useState({
    interval: 'day',
    fromDate: '',
    toDate: '',
    continuous: false,
    oi: false
  });
  const [historicalData, setHistoricalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingInstruments, setLoadingInstruments] = useState(false);
  const [quoteData, setQuoteData] = useState(null);
  const [loadingQuote, setLoadingQuote] = useState(false);

  const intervals = dataService.getIntervals();

  // Set default dates
  useEffect(() => {
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(toDate.getDate() - 30); // 30 days ago

    setFormData(prev => ({
      ...prev,
      fromDate: fromDate.toISOString().split('T')[0],
      toDate: toDate.toISOString().split('T')[0]
    }));
  }, []);

  // Load instruments from API instead of static JSON
  useEffect(() => {
    const fetchInstruments = async () => {
      try {
        setLoadingInstruments(true);
        const response = await dataService.getInstruments('NSE');
        if (response.success && response.data) {
          // Filter for equity instruments and map to our format
          const equityInstruments = response.data
            .filter(inst => inst.segment === 'NSE' && inst.instrument_type === 'EQ')
            .map(inst => ({
              name: inst.name,
              symbol: inst.tradingsymbol,
              instrument_token: inst.instrument_token,
              exchange: inst.exchange,
              tradingsymbol: inst.tradingsymbol
            }));
          setInstruments(equityInstruments);
        } else {
          // Fallback to NIFTY 50 data if API fails
          const nifty50Instruments = nifty50Data.map(row => ({
            name: row.name,
            symbol: row.symbol,
            instrument_token: null, // Will need to be looked up
            exchange: 'NSE',
            tradingsymbol: row.symbol
          }));
          setInstruments(nifty50Instruments);
        }
      } catch (error) {
        console.error('Failed to fetch instruments:', error);
        // Fallback to NIFTY 50 data
        const nifty50Instruments = nifty50Data.map(row => ({
          name: row.name,
          symbol: row.symbol,
          instrument_token: null,
          exchange: 'NSE',
          tradingsymbol: row.symbol
        }));
        setInstruments(nifty50Instruments);
      } finally {
        setLoadingInstruments(false);
      }
    };

    fetchInstruments();
  }, []);

  // Filter NIFTY 50 instruments based on search
  useEffect(() => {
    if (searchTerm) {
      const filtered = instruments.filter(inst => {
        const name = inst.name || '';
        const symbol = inst.symbol || '';
        return (
          name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          symbol.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
      setFilteredInstruments(filtered);
    } else {
      setFilteredInstruments([]);
    }
  }, [searchTerm, instruments]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleInstrumentSelect = (instrument) => {
    setSelectedInstrument(instrument);
    setSearchTerm(instrument.symbol);
    setFilteredInstruments([]);
  };

  const fetchHistoricalData = async (e) => {
    e.preventDefault();

    if (!selectedInstrument) {
      setError('Please select an instrument');
      return;
    }

    if (!formData.fromDate || !formData.toDate) {
      setError('Please select both from and to dates');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setHistoricalData(null);

      // Format dates for API
      const fromDateTime = `${formData.fromDate} 09:15:00`;
      const toDateTime = `${formData.toDate} 15:30:00`;

      const options = {};
      if (formData.continuous) options.continuous = '1';
      if (formData.oi) options.oi = '1';

      const response = await dataService.getHistoricalData(
        selectedInstrument.instrument_token,
        formData.interval,
        fromDateTime,
        toDateTime,
        options
      );

      setHistoricalData(response);
    } catch (error) {
      console.error('Historical data error:', error);
      
      // Extract detailed error information
      let errorMessage = 'Failed to fetch historical data';
      let errorDetails = null;
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = `API Error: ${error.response.status}`;
        errorDetails = error.response.data;
      } else if (error.details) {
        // API error details from our backend
        errorMessage = error.error || 'API Error';
        errorDetails = error.details;
      } else if (error.error) {
        // Custom error format from our API service
        errorMessage = `Error: ${error.error}`;
        if (error.data) {
          errorDetails = error.data;
        }
      } else if (error.message) {
        // JavaScript error object
        errorMessage = `Error: ${error.message}`;
      }
      
      // Set error state with both message and details
      setError({ message: errorMessage, details: errorDetails });
    } finally {
      setLoading(false);
    }
  };

  const fetchQuote = async (instrument) => {
    if (!instrument || !instrument.exchange || !instrument.tradingsymbol) return;
    try {
      setLoadingQuote(true);
      setQuoteData(null);
      const response = await dataService.getQuote(instrument.exchange, instrument.tradingsymbol);
      // Kite returns an object keyed by "EXCHANGE:SYMBOL", e.g. { "NSE:RELIANCE": { ... } }
      // Backend proxies that directly, so normalize by taking the first key if present.
      if (response && typeof response === 'object') {
        // If backend wrapped it under `data`, unwrap
        const maybeData = response.data && typeof response.data === 'object' ? response.data : response;
        const keys = Object.keys(maybeData);
        if (keys.length > 0) {
          setQuoteData(maybeData[keys[0]]);
        } else {
          setQuoteData(maybeData);
        }
      } else {
        setQuoteData(response);
      }
    } catch (err) {
      console.error('Quote fetch error:', err);
    } finally {
      setLoadingQuote(false);
    }
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined || Number.isNaN(Number(price))) return '-';
    return parseFloat(price).toFixed(2);
  };

  const formatDateTime = (dateTime) => {
    try {
      return new Date(dateTime).toLocaleString();
    } catch (e) {
      return dateTime || '-';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="historical-data-container">
        <div className="not-authenticated">
          <h3>Historical Data</h3>
          <p>Please login first to access historical data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="historical-data-container">
      <div className="historical-data-card">
        <div className="historical-header">
          <h2>📊 Historical Data</h2>
          <div className="historical-actions">
            <button 
              className="token-copy-button"
              onClick={() => {
                // Only use access token from localStorage
                const accessToken = localStorage.getItem('access_token');
                if (accessToken) {
                  navigator.clipboard.writeText(accessToken);
                  alert('Access token copied to clipboard!');
                } else {
                  alert('No access token found. Please login first.');
                }
              }}
              title="Copy access token to clipboard"
            >
              📋 Copy Access Token
            </button>
            <button
              className="logout-button-small"
              onClick={async () => {
                try {
                  // Clear local storage first
                  localStorage.removeItem('access_token');
                  localStorage.removeItem('user_id');
                  localStorage.removeItem('user_name');
                  
                  // Then try to logout from server
                  try {
                    const response = await fetch('http://localhost:3001/auth/logout', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json'
                      }
                    });
                    if (response.ok) {
                      const data = await response.json();
                      if (data.success) {
                        console.log('Remote logout successful');
                      }
                    }
                  } catch (serverError) {
                    console.warn('Server logout failed:', serverError);
                  }
                  alert('Logged out successfully');
                  // Call parent logout handler to switch to login flow
                  if (onLogout) onLogout();
                } catch (error) {
                  console.error('Logout error:', error);
                  alert('An error occurred during logout: ' + (error.message || 'Unknown error'));
                }
              }}
            >
              🚪 Logout
            </button>
          </div>
        </div>
        
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <div className="error-details">
              <strong>Error:</strong> {typeof error === 'string' ? error : error.message}
              
              {error.details && (
                <div className="error-api-details">
                  <strong>API Response:</strong>
                  <pre>{JSON.stringify(error.details, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={fetchHistoricalData} className="historical-form">
          {/* Only NIFTY 50, so no exchange selection */}

          {/* Instrument Search */}
          <div className="form-group">
            <label htmlFor="instrument">Stock/Instrument:</label>
            <div className="instrument-search">
              <input
                id="instrument"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for stock (e.g., INFY, TCS, RELIANCE)"
                className="form-input"
                disabled={loadingInstruments}
                autoComplete="off"
              />
              {loadingInstruments && (
                <div className="loading-instruments">
                  <span className="spinner-small"></span>
                  Loading instruments...
                </div>
              )}
              {filteredInstruments.length > 0 && (
                <div className="instruments-dropdown">
                  {filteredInstruments.map(instrument => (
                    <div
                      key={`${instrument.name}-${instrument.symbol}`}
                      className="instrument-item"
                      onClick={() => handleInstrumentSelect(instrument)}
                    >
                      <div className="instrument-symbol">
                        {instrument.symbol}
                      </div>
                      <div className="instrument-name">
                        {instrument.name} - {instrument.exchange}
                        <br />
                        <small>Token: {instrument.instrument_token}</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {selectedInstrument && (
              <div className="selected-instrument">
                <strong>Selected:</strong> {selectedInstrument.tradingsymbol} 
                ({selectedInstrument.name}) - {selectedInstrument.exchange}
                <br />
                <small><strong>Token:</strong> {selectedInstrument.instrument_token}</small>
                <div style={{marginTop: '8px'}}>
                  <button
                    className="fetch-quote-button"
                    onClick={() => fetchQuote(selectedInstrument)}
                    disabled={loadingQuote}
                  >
                    {loadingQuote ? 'Refreshing...' : 'Refresh Quote'}
                  </button>
                </div>

                {quoteData && (
                  <div className="quote-panel">
                    <h4>Quote</h4>
                    <p><strong>LTP:</strong> {quoteData.last_price}</p>
                    <p><strong>Volume:</strong> {quoteData.volume}</p>
                    <p><strong>OHLC:</strong> O:{quoteData.ohlc?.open} H:{quoteData.ohlc?.high} L:{quoteData.ohlc?.low} C:{quoteData.ohlc?.close}</p>

                    <div className="depth-panel">
                      <div className="depth-side">
                        <h5>Buy</h5>
                        {quoteData.depth?.buy?.map((level, idx) => (
                          <div key={idx} className="depth-row">
                            <span className="depth-price">{level.price}</span>
                            <span className="depth-qty">{level.quantity}</span>
                            <span className="depth-orders">{level.orders}</span>
                          </div>
                        ))}
                      </div>

                      <div className="depth-side">
                        <h5>Sell</h5>
                        {quoteData.depth?.sell?.map((level, idx) => (
                          <div key={idx} className="depth-row">
                            <span className="depth-price">{level.price}</span>
                            <span className="depth-qty">{level.quantity}</span>
                            <span className="depth-orders">{level.orders}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

          {/* Date Range */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fromDate">From Date:</label>
              <input
                id="fromDate"
                type="date"
                name="fromDate"
                value={formData.fromDate}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="toDate">To Date:</label>
              <input
                id="toDate"
                type="date"
                name="toDate"
                value={formData.toDate}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
          </div>

          {/* Interval Selection */}
          <div className="form-group">
            <label htmlFor="interval">Interval:</label>
            <select
              id="interval"
              name="interval"
              value={formData.interval}
              onChange={handleInputChange}
              className="form-select"
            >
              {intervals.map(interval => (
                <option key={interval.value} value={interval.value}>
                  {interval.label}
                </option>
              ))}
            </select>
          </div>

          {/* Options */}
          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="continuous"
                checked={formData.continuous}
                onChange={handleInputChange}
              />
              Continuous Data (for F&O)
            </label>
            
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="oi"
                checked={formData.oi}
                onChange={handleInputChange}
              />
              Include Open Interest
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`fetch-button ${loading ? 'loading' : ''}`}
            disabled={loading || !selectedInstrument}
          >
            {loading ? (
              <>
                <span className="spinner-small"></span>
                Fetching Data...
              </>
            ) : (
              <>
                <span className="chart-icon">📈</span>
                Fetch Historical Data
              </>
            )}
          </button>
        </form>

        {/* Results */}
        {historicalData && (
          <div className="historical-results">
            <h3>Historical Data Results</h3>
            
            {historicalData.data && historicalData.data.candles ? (
              <div className="candles-container">
                <div className="results-summary">
                  <p><strong>Records found:</strong> {historicalData.data.candles.length}</p>
                  <p><strong>Instrument:</strong> {selectedInstrument.tradingsymbol}</p>
                  <p><strong>Period:</strong> {formData.fromDate} to {formData.toDate}</p>
                  <p><strong>Interval:</strong> {intervals.find(i => i.value === formData.interval)?.label}</p>
                </div>
                
                <div className="candles-table-container">
                  <table className="candles-table">
                    <thead>
                      <tr>
                        <th>Date/Time</th>
                        <th>Open</th>
                        <th>High</th>
                        <th>Low</th>
                        <th>Close</th>
                        <th>Volume</th>
                        {formData.oi && <th>OI</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {historicalData.data.candles.slice(0, 20).map((candle, index) => (
                        <tr key={index}>
                          <td>{formatDateTime(candle[0])}</td>
                          <td>₹{formatPrice(candle[1])}</td>
                          <td>₹{formatPrice(candle[2])}</td>
                          <td>₹{formatPrice(candle[3])}</td>
                          <td>₹{formatPrice(candle[4])}</td>
                          <td>{candle[5].toLocaleString()}</td>
                          {formData.oi && <td>{candle[6]?.toLocaleString() || '-'}</td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {historicalData.data.candles.length > 20 && (
                    <p className="table-note">
                      Showing first 20 records out of {historicalData.data.candles.length} total records
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="no-data">
                <p>No historical data available for the selected criteria</p>
              </div>
            )}
          </div>
        )}

        {/* Quote Section */}
        {selectedInstrument && (
          <div className="quote-section">
            <h3>Live Quote</h3>
            
            {loadingQuote ? (
              <div className="loading-quote">
                <span className="spinner-small"></span>
                Loading quote...
              </div>
            ) : (
              quoteData && (
                <div className="quote-data">
                  <div className="quote-row">
                    <div className="quote-label">LTP:</div>
                    <div className="quote-value">₹{formatPrice(quoteData.last_price)}</div>
                  </div>
                  <div className="quote-row">
                    <div className="quote-label">Change:</div>
                    <div className="quote-value" style={{ color: quoteData.change >= 0 ? 'green' : 'red' }}>
                      {quoteData.change >= 0 ? '▲' : '▼'} {formatPrice(quoteData.change)} ({formatPrice(quoteData.p_change)}%)
                    </div>
                  </div>
                  <div className="quote-row">
                    <div className="quote-label">Open:</div>
                    <div className="quote-value">₹{formatPrice(quoteData.day_open)}</div>
                  </div>
                  <div className="quote-row">
                    <div className="quote-label">High:</div>
                    <div className="quote-value">₹{formatPrice(quoteData.day_high)}</div>
                  </div>
                  <div className="quote-row">
                    <div className="quote-label">Low:</div>
                    <div className="quote-value">₹{formatPrice(quoteData.day_low)}</div>
                  </div>
                  <div className="quote-row">
                    <div className="quote-label">Volume:</div>
                    <div className="quote-value">{quoteData.volume.toLocaleString()}</div>
                  </div>
                  {formData.oi && (
                    <div className="quote-row">
                      <div className="quote-label">OI:</div>
                      <div className="quote-value">{quoteData.oi?.toLocaleString() || '-'}</div>
                    </div>
                  )}
                </div>
              )
            )}

            <button
              className="refresh-quote-button"
              onClick={() => fetchQuote(selectedInstrument)}
              disabled={loadingQuote}
            >
              {loadingQuote ? (
                <span className="spinner-small"></span>
              ) : (
                '🔄 Refresh Quote'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoricalDataComponent;