const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const path = require('path');
require('dotenv').config({ path: __dirname + '/.env' });
console.log('Environment loaded - OpenAI API Key:', process.env.OPENAI_API_KEY ? 'Present' : 'Missing');
console.log('OpenAI Base URL:', process.env.OPENAI_BASE_URL);

const openaiSqlRoutes = require('./routes/openai-sql');
const dbRoutes = require('./routes/database');
const demoRoutes = require('./routes/demo');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // In production, since frontend and backend are served from same domain,
    // we can be more permissive with CORS
    if (process.env.NODE_ENV === 'production') {
      // Allow requests with no origin (same-origin requests)
      if (!origin) return callback(null, true);

      // Allow the deployed frontend URL and Render's external URL
      const allowedOrigins = [
        process.env.FRONTEND_URL,
        process.env.RENDER_EXTERNAL_URL // Render automatically sets this
      ].filter(Boolean);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        // In production, also allow same-origin requests
        return callback(null, true);
      }
    } else {
      // In development, allow localhost
      if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'fallback-secret-key',
  resave: false,
  saveUninitialized: false,
  name: 'sessionId', // Custom session name
  cookie: {
    secure: false, // Set to false - Render handles HTTPS termination
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax' // Use lax for better compatibility
  }
};

// In production, add additional session configuration
if (process.env.NODE_ENV === 'production') {
  sessionConfig.proxy = true; // Trust first proxy (Render's load balancer)
  sessionConfig.cookie.secure = false; // Keep false even in production due to proxy
}

app.use(session(sessionConfig));

// Session debugging middleware (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log('Session Debug:', {
      sessionID: req.sessionID,
      session: req.session,
      cookies: req.headers.cookie
    });
    next();
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    sessionID: req.sessionID || 'No session'
  });
});



// Serve static files from React build (MUST come before API routes for production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
}

// API routes
app.use('/api', openaiSqlRoutes);
app.use('/api/database', dbRoutes);
app.use('/api/demo', demoRoutes);

// Serve React app for all non-API routes (MUST come after API routes but before 404)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'Invalid JSON in request body'
    });
  }

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});

// 404 handler for API routes only (MUST come last)
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API route not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

module.exports = app;
