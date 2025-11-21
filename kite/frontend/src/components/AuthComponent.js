import React, { useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthComponent = ({ onAuthSuccess, onLogout }) => {
  const [authStatus, setAuthStatus] = useState({
    authenticated: false,
    user_id: null,
    user_name: null,
    access_token: null,
    loading: true
  });
  const [error, setError] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Handle URL parameters (for callback from Kite)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const requestToken = urlParams.get('request_token');
    const status = urlParams.get('status');

    if (requestToken && status === 'success') {
      handleTokenExchange(requestToken);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (status === 'error') {
      setError('Login was cancelled or failed');
      setIsLoggingIn(false);
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const status = await authService.getStatus();
      setAuthStatus({ ...status, loading: false });
      
      if (status.authenticated && onAuthSuccess) {
        onAuthSuccess(status);
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
      setAuthStatus(prev => ({ ...prev, loading: false }));
    }
  };

  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      setError(null);
      
      const response = await authService.getLoginUrl();
      
      if (response.loginUrl) {
        // Redirect to Kite login
        window.location.href = response.loginUrl;
      } else {
        setError('Failed to get login URL');
        setIsLoggingIn(false);
      }
    } catch (error) {
      setError(error.error || 'Login failed');
      setIsLoggingIn(false);
    }
  };

  const handleTokenExchange = async (requestToken) => {
    try {
      setIsLoggingIn(true);
      setError(null);
      
      const response = await authService.exchangeToken(requestToken);
      
      if (response.success) {
        setAuthStatus({
          authenticated: true,
          user_id: response.data.user_id,
          user_name: response.data.user_name,
          access_token: response.data.access_token,
          loading: false
        });
        
        if (onAuthSuccess) {
          onAuthSuccess(response.data);
        }
      } else {
        setError('Token exchange failed');
      }
    } catch (error) {
      setError(error.error || 'Token exchange failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await authService.logout();
      if (response.success) {
        setAuthStatus({
          authenticated: false,
          user_id: null,
          user_name: null,
          access_token: null,
          loading: false
        });
        if (onLogout) {
          onLogout();
        }
        alert('Logged out successfully');
      } else {
        alert('Failed to log out: ' + response.error);
      }
    } catch (error) {
      alert('An error occurred while logging out');
    }
  };

  if (authStatus.loading) {
    return (
      <div className="auth-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Checking authentication status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Kite Connect Authentication</h2>
        
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}
        
        {!authStatus.authenticated ? (
          <div className="login-section">
            <p>Click the button below to login with your Zerodha account:</p>
            <button
              className={`login-button ${isLoggingIn ? 'loading' : ''}`}
              onClick={handleLogin}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <span className="spinner-small"></span>
                  Redirecting to Kite...
                </>
              ) : (
                <>
                  <span className="kite-icon">🪁</span>
                  Login with Kite Connect
                </>
              )}
            </button>
            <div className="login-info">
              <p><small>You will be redirected to Zerodha Kite for secure authentication</small></p>
            </div>
          </div>
        ) : (
          <div className="authenticated-section">
            <div className="user-info">
              <div className="welcome-message">
                <span className="success-icon">✅</span>
                <div>
                  <h3>Welcome, {authStatus.user_name || authStatus.user_id}!</h3>
                  <p>Successfully authenticated with Kite Connect</p>
                </div>
              </div>
              <div className="auth-details">
                <div className="detail-item">
                  <strong>User ID:</strong> {authStatus.user_id}
                </div>
                {authStatus.user_name && (
                  <div className="detail-item">
                    <strong>Name:</strong> {authStatus.user_name}
                  </div>
                )}
                {authStatus.access_token && (
                  <div className="detail-item token-display">
                    <div className="token-header">
                      <strong>Access Token:</strong>
                      <button 
                        className="copy-button"
                        onClick={() => {
                          navigator.clipboard.writeText(authStatus.access_token);
                          // Create temporary element to show "Copied!" message
                          const copiedMsg = document.createElement('span');
                          copiedMsg.textContent = 'Copied!';
                          copiedMsg.className = 'copied-message';
                          document.querySelector('.token-header').appendChild(copiedMsg);
                          setTimeout(() => copiedMsg.remove(), 2000);
                        }}
                      >
                        📋 Copy
                      </button>
                    </div>
                    <div className="token-container">
                      <input
                        type="text"
                        value={authStatus.access_token}
                        readOnly
                        className="token-input"
                        onFocus={e => e.target.select()}
                      />
                    </div>
                    <small className="token-help">
                      This token is required for making API calls to Kite Connect
                    </small>
                  </div>
                )}
              </div>
            </div>
            <button
              className="logout-button"
              onClick={handleLogout}
            >
              <span className="logout-icon">🚪</span>
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthComponent;