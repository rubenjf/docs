import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AuthComponent from './components/AuthComponent';
import HistoricalDataComponent from './components/HistoricalDataComponent';
import './App.css';

function AppRoutes() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleAuthSuccess = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    navigate('/historical');
  };

  const handleLogout = async () => {
    setIsAuthenticated(false);
    setUser(null);
    // Optionally, call backend /auth/logout here if not already done
    navigate('/login');
  };

  useEffect(() => {
    // On mount, redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  return (
    <>
      <header className="app-header">
        <div className="header-content">
          <h1>
            <span className="kite-icon">🪁</span>
            Kite Connect Trading App
          </h1>
          {isAuthenticated && user && (
            <div className="user-info-header">
              <span className="user-greeting">
                Welcome, {user.user_name || user.user_id}
              </span>
              {user.access_token && (
                <button 
                  className="token-copy-header"
                  onClick={() => {
                    navigator.clipboard.writeText(user.access_token);
                    alert('Access token copied to clipboard!');
                  }}
                  title="Copy access token to clipboard"
                >
                  📋 Copy Access Token
                </button>
              )}
            </div>
          )}
        </div>
        <nav className="main-nav">
          <button
            className={`nav-button`}
            onClick={() => navigate('/login')}
          >
            <span className="nav-icon">🔐</span>
            Authentication
          </button>
          <button
            className={`nav-button ${!isAuthenticated ? 'disabled' : ''}`}
            onClick={() => isAuthenticated && navigate('/historical')}
            disabled={!isAuthenticated}
          >
            <span className="nav-icon">📊</span>
            Historical Data
          </button>
        </nav>
      </header>
      <main className="main-content">
        <Routes>
          <Route path="/login" element={
            <AuthComponent 
              onAuthSuccess={handleAuthSuccess} 
              onLogout={handleLogout}
            />
          } />
          <Route path="/historical" element={
            isAuthenticated ? (
              <HistoricalDataComponent 
                isAuthenticated={isAuthenticated}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          } />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
      <footer className="app-footer">
        <div className="footer-content">
          <p>
            <strong>Kite Connect Trading App</strong> - Built with React & Node.js
          </p>
          <p>
            <small>
              🔒 Secure authentication with Zerodha Kite Connect API |
              📈 Real-time historical data access |
              ⚡ Fast and responsive interface
            </small>
          </p>
        </div>
      </footer>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;