# Kite Connect Trading App

A comprehensive trading application built with React.js frontend and Node.js backend that integrates with Zerodha's Kite Connect API for authentication and historical data fetching.

![Kite Connect App](https://img.shields.io/badge/Status-Ready%20for%20Development-green)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-Latest-green)
![Kite Connect](https://img.shields.io/badge/Kite%20Connect-v3-orange)

## 🚀 Features

### ✅ Completed Features
- **🔐 Secure Authentication Flow** - Complete Kite Connect OAuth integration
- **📊 Historical Data Fetching** - Get historical candlestick data for any instrument
- **🔍 Instrument Search** - Search and select from NSE, BSE, and other exchanges
- **📈 Multiple Timeframes** - Support for minute, hourly, and daily intervals
- **💻 Responsive Design** - Works on desktop, tablet, and mobile devices
- **🛡️ Security First** - API secrets never exposed to frontend

### 🎯 Core Functionality
1. **Login Flow**: One-click authentication with Zerodha Kite Connect
2. **Token Management**: Secure token exchange and session management  
3. **Market Data**: Access to historical data with customizable parameters
4. **Multi-Exchange Support**: NSE, BSE, NFO, MCX instrument support
5. **Data Visualization**: Tabular display of OHLCV data

## 🏗️ Architecture

### Frontend (React.js - Port 4000)
```
frontend/
├── src/
│   ├── components/
│   │   ├── AuthComponent.js        # Authentication UI & logic
│   │   └── HistoricalDataComponent.js  # Historical data fetching UI
│   ├── services/
│   │   └── api.js                  # API service layer
│   ├── App.js                      # Main application component
│   ├── App.css                     # Application styles
│   └── index.js                    # React entry point
└── package.json
```

### Backend (Node.js/Express - Port 3001)
```
backend/
├── server.js                       # Express server with all API routes
├── package.json                    # Dependencies and scripts
└── .env.example                    # Environment variables template
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Kite Connect API credentials from [Zerodha Developers](https://developers.kite.trade/)

### 1. Clone and Setup Project
```bash
cd c:\Projects\kite
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create environment file
copy .env.example .env

# Edit .env file with your credentials
notepad .env
```

**Configure your `.env` file:**
```env
KITE_API_KEY=your_api_key_here
KITE_API_SECRET=your_api_secret_here  
KITE_REDIRECT_URL=http://localhost:4000/callback
PORT=3001
```

### 3. Frontend Setup  
```bash
cd ../frontend

# Install dependencies
npm install
```

### 4. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend  
npm start
```

The application will open automatically at `http://localhost:4000`

## 🔑 Kite Connect Setup

### 1. Create Kite Connect App
1. Visit [Zerodha Developers Console](https://developers.kite.trade/)
2. Login with your Zerodha account
3. Create a new app with these settings:
   - **App Name**: Your choice (e.g., "My Trading App")
   - **Redirect URL**: `http://localhost:4000/callback`
   - **Post-back URL**: Leave blank for now

### 2. Get API Credentials
After creating the app, you'll receive:
- **API Key** (public)
- **API Secret** (private - never share this)

### 3. Configure Backend
Add these credentials to your `backend/.env` file as shown above.

## 📋 Usage Guide

### Authentication Flow
1. Click "Login with Kite Connect" button
2. You'll be redirected to Zerodha's secure login page
3. Enter your Zerodha credentials and complete 2FA
4. You'll be redirected back with authentication token
5. The app will display your authentication status

### Historical Data Access
1. After authentication, navigate to "Historical Data" tab
2. Select exchange (NSE, BSE, etc.)
3. Search for a stock/instrument (e.g., "INFY", "TCS") 
4. Choose date range and interval
5. Click "Fetch Historical Data"
6. View the results in a formatted table

### Available Data
- **OHLC Data**: Open, High, Low, Close prices
- **Volume Information**: Trading volume for each period
- **Multiple Timeframes**: 1min to daily candles
- **Date Range**: Historical data going back years
- **Open Interest**: For F&O instruments (optional)

## 🔧 API Endpoints

### Authentication Endpoints
- `GET /auth/login` - Get Kite Connect login URL
- `POST /auth/token` - Exchange request_token for access_token
- `GET /auth/status` - Check authentication status
- `DELETE /auth/logout` - Logout and invalidate session

### Data Endpoints  
- `GET /api/instruments` - Get instruments list (with exchange filter)
- `GET /api/historical/:token/:interval` - Get historical candle data
- `GET /api/quote/:exchange/:symbol` - Get current market quote
- `GET /api/profile` - Get user profile information

## 🛡️ Security Features

### Backend Security
- ✅ API Secret never exposed to frontend
- ✅ CORS properly configured
- ✅ Request validation and sanitization
- ✅ Error handling without information leakage
- ✅ Session management

### Frontend Security  
- ✅ No sensitive data stored in localStorage
- ✅ Secure token handling
- ✅ Input validation on all forms
- ✅ XSS protection through React

## 📊 Data Format

### Historical Data Response
```javascript
{
  "status": "success",
  "data": {
    "candles": [
      [
        "2023-12-01T09:15:00+0530",  // timestamp
        1234.50,                      // open
        1245.75,                      // high  
        1230.25,                      // low
        1240.00,                      // close
        125000,                       // volume
        1500000                       // oi (if requested)
      ]
    ]
  }
}
```

## 🚨 Troubleshooting

### Common Issues

**1. "API Key not configured" Error**
- Ensure your `.env` file exists in the backend directory
- Verify `KITE_API_KEY` and `KITE_API_SECRET` are set correctly
- Restart the backend server after making changes

**2. "Login failed" or Redirect Issues**  
- Verify the redirect URL matches exactly in your Kite Connect app settings
- Ensure both frontend (4000) and backend (3001) are running
- Check that the callback URL is `http://localhost:4000/callback`

**3. "No instruments found" Error**
- Ensure you're authenticated first
- Try a different exchange (NSE vs BSE)
- Check your internet connection

**4. "Historical data not available"**
- Verify the instrument token is correct
- Check date range (weekends/holidays have no data)
- Ensure the instrument was trading during the selected period

### Error Messages Guide
- **401 Unauthorized**: Not authenticated, login again
- **500 Server Error**: Check backend logs, usually API credential issues
- **Network Error**: Check if backend server is running on port 3001

## 🧪 Testing

### Manual Testing Checklist
- [ ] Backend server starts without errors
- [ ] Frontend loads at http://localhost:4000
- [ ] Login button generates proper Kite Connect URL
- [ ] Authentication flow completes successfully
- [ ] Instrument search returns results
- [ ] Historical data fetches and displays correctly
- [ ] Logout clears session properly

### API Testing
You can test the backend API directly:

```bash
# Check server health
curl http://localhost:3001/

# Get login URL (after server is running)
curl http://localhost:3001/auth/login
```

## 🔮 Future Enhancements

### Planned Features
- [ ] **Real-time Data**: WebSocket integration for live quotes
- [ ] **Advanced Charts**: Candlestick chart visualization
- [ ] **Portfolio Management**: Holdings and positions display
- [ ] **Order Placement**: Buy/sell order functionality  
- [ ] **Alerts & Notifications**: Price and technical alerts
- [ ] **Multi-user Support**: Database integration for multiple users
- [ ] **Advanced Analytics**: Technical indicators and analysis tools

### Technical Improvements
- [ ] **Database Integration**: PostgreSQL/MongoDB for data persistence
- [ ] **Caching Layer**: Redis for instrument and market data caching
- [ ] **Rate Limiting**: API rate limit handling and queuing
- [ ] **Error Recovery**: Automatic retry and fallback mechanisms
- [ ] **Logging**: Comprehensive logging and monitoring
- [ ] **Testing Suite**: Unit and integration tests

## 📄 License

This project is for educational and development purposes. Make sure to comply with Zerodha's API terms of service and trading regulations.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For issues with:
- **Kite Connect API**: Contact Zerodha support
- **This Application**: Create an issue in the repository
- **Trading Questions**: Consult your broker or financial advisor

---

## 🎯 Quick Start Summary

1. **Get Kite Connect API credentials** from Zerodha Developers Console
2. **Configure backend** with your API key and secret in `.env`
3. **Start both servers**: Backend on port 3001, Frontend on port 4000
4. **Login via Kite Connect** and start fetching historical data!

**Happy Trading! 📈🚀**