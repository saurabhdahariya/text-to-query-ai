import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  withCredentials: true, // Important for session cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);

    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - redirect to connection page or show error
      console.warn('Unauthorized access - database connection may have expired');
    } else if (error.response?.status === 429) {
      // Rate limited
      console.warn('Rate limit exceeded');
    }

    return Promise.reject(error);
  }
);

// Database API functions
export const databaseAPI = {
  // Test database connection
  connect: async (connectionData) => {
    try {
      const response = await api.post('/database/connect', connectionData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to connect to database');
    }
  },

  // Check connection status
  getStatus: async () => {
    try {
      const response = await api.get('/database/status');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get connection status');
    }
  },

  // Execute SQL query
  executeQuery: async (sql) => {
    try {
      const response = await api.post('/database/execute', { sql });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to execute query');
    }
  },

  // Get database schema/table information
  getSchema: async () => {
    try {
      const response = await api.get('/database/schema');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get database schema');
    }
  },

  // Disconnect from database
  disconnect: async () => {
    try {
      const response = await api.post('/database/disconnect');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to disconnect');
    }
  }
};

// SQL Generation API functions using OpenAI
export const sqlAPI = {
  // Generate SQL from natural language using OpenAI GPT-3.5 Turbo
  generateSQL: async (userQuery, dbType, schema = '') => {
    try {
      const response = await api.post('/generate-sql', {
        userQuery,
        dbType,
        schema
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to generate SQL with OpenAI');
    }
  },

  // Execute SQL query on connected database
  executeSQL: async (sql) => {
    try {
      const response = await api.post('/database/execute', { sql });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to execute SQL query');
    }
  }
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw new Error('Backend server is not responding');
  }
};

export default api;
