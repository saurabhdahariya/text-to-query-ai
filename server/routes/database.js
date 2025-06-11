const express = require('express');
const mysql = require('mysql2/promise');
const { Client } = require('pg');
const Joi = require('joi');
const router = express.Router();

// Validation schema for database connection
const connectSchema = Joi.object({
  host: Joi.string().min(1).max(255).required(),
  port: Joi.number().integer().min(1).max(65535).required(),
  username: Joi.string().min(1).max(255).required(),
  password: Joi.string().allow('').max(255).required(),
  database: Joi.string().min(1).max(255).required(),
  dbType: Joi.string().valid('postgresql', 'mysql').required()
});

// Validation schema for query execution
const executeQuerySchema = Joi.object({
  sql: Joi.string().min(1).max(10000).required()
});

// Store database connections in session
const getConnection = async (connectionConfig, retries = 2) => {
  const { host, port, username, password, database, dbType } = connectionConfig;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (dbType === 'postgresql') {
        const client = new Client({
          host,
          port,
          user: username,
          password,
          database,
          connectionTimeoutMillis: 15000,
          query_timeout: 30000,
          ssl: false
        });

        await client.connect();
        return client;
      } else if (dbType === 'mysql') {
        const connection = await mysql.createConnection({
          host,
          port,
          user: username,
          password,
          database,
          connectTimeout: 15000,
          ssl: false,
          charset: 'utf8mb4',
          multipleStatements: false,
          dateStrings: true,
          supportBigNumbers: true,
          bigNumberStrings: true
        });

        // Test the connection
        await connection.ping();
        return connection;
      } else {
        throw new Error('Unsupported database type');
      }
    } catch (error) {
      console.log(`Connection attempt ${attempt} failed:`, error.message);

      if (attempt === retries) {
        throw error;
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};

// POST /api/database/connect - Test database connection
router.post('/connect', async (req, res) => {
  try {
    console.log('Received connection request:', JSON.stringify(req.body, null, 2));

    // Validate request body
    const { error, value } = connectSchema.validate(req.body);
    if (error) {
      console.log('Validation error:', error.details[0].message);
      console.log('Received data:', req.body);
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details[0].message,
        received: req.body
      });
    }

    const connectionConfig = value;
    let connection = null;

    try {
      // Test the connection
      connection = await getConnection(connectionConfig);

      // Test with a simple query
      let testResult;
      if (connectionConfig.dbType === 'postgresql') {
        testResult = await connection.query('SELECT 1 as test');
      } else {
        testResult = await connection.execute('SELECT 1 as test');
      }

      // Store connection config in session (without password for security)
      req.session.dbConnection = {
        ...connectionConfig,
        password: undefined // Don't store password in session
      };

      // Store the actual password separately (encrypted in production)
      req.session.dbPassword = connectionConfig.password;

      console.log('Connection successful - Session stored:', {
        sessionID: req.sessionID,
        dbConnection: req.session.dbConnection,
        hasPassword: !!req.session.dbPassword
      });

      // Explicitly save the session to ensure it persists
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
        } else {
          console.log('Session saved successfully');
        }
      });

      res.json({
        success: true,
        message: 'Database connection successful',
        dbType: connectionConfig.dbType,
        database: connectionConfig.database,
        host: connectionConfig.host,
        sessionID: req.sessionID
      });

    } catch (dbError) {
      console.error('Database connection error:', dbError);

      let errorMessage = 'Failed to connect to database';
      let statusCode = 400;

      if (dbError.code === 'ECONNREFUSED') {
        errorMessage = 'Connection refused. Please check host and port.';
      } else if (dbError.code === 'ENOTFOUND') {
        errorMessage = 'Host not found. Please check the hostname.';
      } else if (dbError.code === 'ETIMEDOUT') {
        errorMessage = 'Connection timeout. Please check your network connection and database server.';
      } else if (dbError.code === 'ER_ACCESS_DENIED_ERROR' || dbError.code === '28P01') {
        errorMessage = 'Access denied. Please check username and password.';
      } else if (dbError.code === 'ER_BAD_DB_ERROR' || dbError.code === '3D000') {
        errorMessage = 'Database not found. Please check database name.';
      } else if (dbError.code === 'ECONNRESET') {
        errorMessage = 'Connection reset. Please try again.';
      } else if (dbError.code === 'PROTOCOL_CONNECTION_LOST') {
        errorMessage = 'Database connection lost. Please try again.';
      } else if (dbError.message && dbError.message.includes('timeout')) {
        errorMessage = 'Connection timeout. Please check your database server and network.';
      }

      res.status(statusCode).json({
        error: errorMessage,
        code: dbError.code,
        details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
      });
    } finally {
      // Close the test connection
      if (connection) {
        try {
          if (connectionConfig.dbType === 'postgresql') {
            await connection.end();
          } else {
            await connection.end();
          }
        } catch (closeError) {
          console.error('Error closing connection:', closeError);
        }
      }
    }

  } catch (error) {
    console.error('Connection validation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/database/execute - Execute SQL query
router.post('/execute', async (req, res) => {
  try {
    // Check if user has an active database session
    if (!req.session.dbConnection || !req.session.dbPassword) {
      return res.status(401).json({
        error: 'No active database connection. Please connect to a database first.'
      });
    }

    // Validate request body
    const { error, value } = executeQuerySchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details[0].message
      });
    }

    const { sql } = value;

    // Security check: only allow SELECT statements
    const sqlLower = sql.toLowerCase().trim();
    if (!sqlLower.startsWith('select')) {
      return res.status(400).json({
        error: 'Only SELECT queries are allowed for security reasons'
      });
    }

    // Check for potentially dangerous keywords
    const dangerousKeywords = ['drop', 'delete', 'update', 'insert', 'alter', 'create', 'truncate'];
    const containsDangerous = dangerousKeywords.some(keyword =>
      sqlLower.includes(keyword.toLowerCase())
    );

    if (containsDangerous) {
      return res.status(400).json({
        error: 'Query contains potentially dangerous operations'
      });
    }

    const connectionConfig = {
      ...req.session.dbConnection,
      password: req.session.dbPassword
    };

    let connection = null;

    try {
      // Create new connection for query execution
      connection = await getConnection(connectionConfig);

      let result;
      let rows;
      let fields;

      if (connectionConfig.dbType === 'postgresql') {
        result = await connection.query(sql);
        rows = result.rows;
        fields = result.fields ? result.fields.map(f => f.name) : Object.keys(rows[0] || {});
      } else {
        [rows, fieldsInfo] = await connection.execute(sql);
        fields = fieldsInfo.map(f => f.name);
      }

      res.json({
        success: true,
        data: rows,
        columns: fields,
        rowCount: rows.length,
        executedAt: new Date().toISOString()
      });

    } catch (dbError) {
      console.error('Query execution error:', dbError);

      let errorMessage = 'Failed to execute query';

      if (dbError.code === 'ER_PARSE_ERROR' || dbError.code === '42601') {
        errorMessage = 'SQL syntax error. Please check your query.';
      } else if (dbError.code === 'ER_NO_SUCH_TABLE' || dbError.code === '42P01') {
        errorMessage = 'Table not found. Please check table names.';
      } else if (dbError.code === 'ER_BAD_FIELD_ERROR' || dbError.code === '42703') {
        errorMessage = 'Column not found. Please check column names.';
      }

      res.status(400).json({
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
      });
    } finally {
      // Close the connection
      if (connection) {
        try {
          if (connectionConfig.dbType === 'postgresql') {
            await connection.end();
          } else {
            await connection.end();
          }
        } catch (closeError) {
          console.error('Error closing connection:', closeError);
        }
      }
    }

  } catch (error) {
    console.error('Query execution error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/database/schema - Get database schema information
router.get('/schema', async (req, res) => {
  try {
    console.log('Schema request - Session check:', {
      sessionID: req.sessionID,
      hasDbConnection: !!req.session.dbConnection,
      hasDbPassword: !!req.session.dbPassword,
      sessionData: req.session
    });

    // Check if user has an active database session
    if (!req.session.dbConnection || !req.session.dbPassword) {
      console.log('Schema request failed - No active session');
      return res.status(401).json({
        error: 'No active database connection. Please connect to a database first.'
      });
    }

    const connectionConfig = {
      ...req.session.dbConnection,
      password: req.session.dbPassword
    };

    let connection = null;

    try {
      // Create connection to get schema
      connection = await getConnection(connectionConfig);

      let tables = [];
      let columns = [];

      if (connectionConfig.dbType === 'postgresql') {
        // Get PostgreSQL schema
        const tablesResult = await connection.query(`
          SELECT table_name, table_type
          FROM information_schema.tables
          WHERE table_schema = 'public'
          ORDER BY table_name
        `);
        tables = tablesResult.rows;

        const columnsResult = await connection.query(`
          SELECT table_name, column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_schema = 'public'
          ORDER BY table_name, ordinal_position
        `);
        columns = columnsResult.rows;
      } else {
        // Get MySQL schema with detailed column information
        const [tablesResult] = await connection.execute(`
          SELECT TABLE_NAME, TABLE_TYPE, TABLE_COMMENT
          FROM INFORMATION_SCHEMA.TABLES
          WHERE TABLE_SCHEMA = ?
          AND TABLE_TYPE = 'BASE TABLE'
          ORDER BY TABLE_NAME
        `, [connectionConfig.database]);

        // Get column information for each table
        const tablesWithColumns = await Promise.all(
          tablesResult.map(async (table) => {
            const [columns] = await connection.execute(`
              SELECT
                COLUMN_NAME,
                DATA_TYPE,
                IS_NULLABLE,
                COLUMN_KEY,
                COLUMN_DEFAULT,
                COLUMN_COMMENT
              FROM INFORMATION_SCHEMA.COLUMNS
              WHERE TABLE_SCHEMA = ?
              AND TABLE_NAME = ?
              ORDER BY ORDINAL_POSITION
            `, [connectionConfig.database, table.TABLE_NAME]);

            return {
              ...table,
              columns: columns,
              COLUMN_COUNT: columns.length
            };
          })
        );

        tables = tablesWithColumns;
      }

      res.json({
        success: true,
        database: connectionConfig.database,
        dbType: connectionConfig.dbType,
        tables: tables,
        description: `Connected to ${connectionConfig.database} database`
      });

    } catch (dbError) {
      console.error('Schema query error:', dbError);
      res.status(500).json({
        error: 'Failed to retrieve database schema',
        details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
      });
    } finally {
      if (connection) {
        try {
          if (connectionConfig.dbType === 'postgresql') {
            await connection.end();
          } else {
            await connection.end();
          }
        } catch (closeError) {
          console.error('Error closing schema connection:', closeError);
        }
      }
    }

  } catch (error) {
    console.error('Schema API error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper function to generate table info string for AI
const generateTableInfo = (tables, columns) => {
  let tableInfo = '';

  tables.forEach(table => {
    const tableName = table.table_name;
    const tableColumns = columns.filter(col => col.table_name === tableName);

    tableInfo += `Table: ${tableName}\n`;
    tableColumns.forEach(col => {
      tableInfo += `  - ${col.column_name} (${col.data_type}${col.is_nullable === 'NO' ? ', NOT NULL' : ''})\n`;
    });
    tableInfo += '\n';
  });

  return tableInfo;
};

// GET /api/database/status - Check connection status
router.get('/status', (req, res) => {
  console.log('Status check - Session info:', {
    sessionID: req.sessionID,
    hasDbConnection: !!req.session.dbConnection,
    hasDbPassword: !!req.session.dbPassword,
    sessionKeys: Object.keys(req.session)
  });

  if (req.session.dbConnection) {
    res.json({
      connected: true,
      dbType: req.session.dbConnection.dbType,
      database: req.session.dbConnection.database,
      host: req.session.dbConnection.host,
      sessionID: req.sessionID
    });
  } else {
    res.json({
      connected: false,
      sessionID: req.sessionID,
      sessionKeys: Object.keys(req.session)
    });
  }
});

// POST /api/database/disconnect - Disconnect from database
router.post('/disconnect', (req, res) => {
  req.session.dbConnection = null;
  req.session.dbPassword = null;

  res.json({
    success: true,
    message: 'Disconnected from database'
  });
});

// GET /api/database/session-test - Test session persistence
router.get('/session-test', (req, res) => {
  // Set a test value in session
  if (!req.session.testValue) {
    req.session.testValue = Date.now();
  }

  res.json({
    sessionID: req.sessionID,
    testValue: req.session.testValue,
    sessionKeys: Object.keys(req.session),
    hasDbConnection: !!req.session.dbConnection,
    hasDbPassword: !!req.session.dbPassword,
    cookies: req.headers.cookie
  });
});

module.exports = router;
