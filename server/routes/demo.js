const express = require('express');
const mysql = require('mysql2/promise');
const axios = require('axios');
const Joi = require('joi');
const router = express.Router();

// OpenAI API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

// Demo database configuration - uses environment variables
const DEMO_DB_CONFIG = {
  host: process.env.DEMO_DB_HOST || 'localhost',
  port: process.env.DEMO_DB_PORT || 3306,
  user: process.env.DEMO_DB_USER || 'demo_user',
  password: process.env.DEMO_DB_PASSWORD || 'demo_password',
  database: process.env.DEMO_DB_NAME || 'classicmodels',
  ssl: process.env.DEMO_DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false
};

// Validation schema for demo query
const demoQuerySchema = Joi.object({
  query: Joi.string().min(3).max(1000).required()
});

// Fallback queries for demo when OpenAI API is not available
const getFallbackQuery = (query) => {
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('customer') && lowerQuery.includes('france')) {
    return "SELECT customerName, city, country FROM customers WHERE country = 'France'";
  }

  if (lowerQuery.includes('product') && (lowerQuery.includes('price') || lowerQuery.includes('cost'))) {
    return 'SELECT productName, buyPrice, MSRP FROM products';
  }

  if (lowerQuery.includes('top') && lowerQuery.includes('customer') && lowerQuery.includes('credit')) {
    return 'SELECT customerName, creditLimit FROM customers ORDER BY creditLimit DESC LIMIT 5';
  }

  if (lowerQuery.includes('first') && lowerQuery.includes('10')) {
    return 'SELECT customerName, city, country FROM customers LIMIT 10';
  }

  if (lowerQuery.includes('order') && lowerQuery.includes('2023')) {
    return 'SELECT orderNumber, orderDate, status FROM orders WHERE YEAR(orderDate) = 2023';
  }

  if (lowerQuery.includes('employee') && lowerQuery.includes('job')) {
    return 'SELECT firstName, lastName, jobTitle FROM employees';
  }

  if (lowerQuery.includes('product') && lowerQuery.includes('stock')) {
    return 'SELECT productName, quantityInStock FROM products WHERE quantityInStock > 0';
  }

  if (lowerQuery.includes('customer') && lowerQuery.includes('order') && lowerQuery.includes('status')) {
    return 'SELECT c.customerName, o.orderNumber, o.status FROM customers c JOIN orders o ON c.customerNumber = o.customerNumber';
  }

  if (lowerQuery.includes('customer')) {
    return 'SELECT customerName, city, country FROM customers';
  }

  if (lowerQuery.includes('product')) {
    return 'SELECT productName, productLine, buyPrice FROM products';
  }

  if (lowerQuery.includes('order')) {
    return 'SELECT orderNumber, orderDate, status FROM orders';
  }

  if (lowerQuery.includes('employee')) {
    return 'SELECT firstName, lastName, jobTitle FROM employees';
  }

  // Default fallback
  return 'SELECT customerName, city, country FROM customers';
};



// System prompt for classicmodels database
const getClassicModelsSystemPrompt = () => {
  return `You are an expert SQL query generator for the classicmodels MySQL database. Generate accurate, efficient SQL queries.

CRITICAL RULES:
1. Return ONLY the SQL query - no explanations, comments, or markdown formatting
2. Use proper MySQL syntax with lowercase keywords
3. ONLY generate SELECT statements for security
4. Always use exact column names as listed in the schema
5. Include appropriate JOINs when referencing multiple tables
6. Only add LIMIT clauses when specifically requested by the user (e.g., "top 10", "first 5")

DATABASE SCHEMA:
Table: customers
- customerNumber (int, PRIMARY KEY)
- customerName (varchar)
- contactLastName (varchar)
- contactFirstName (varchar)
- phone (varchar)
- addressLine1 (varchar)
- addressLine2 (varchar)
- city (varchar)
- state (varchar)
- postalCode (varchar)
- country (varchar)
- salesRepEmployeeNumber (int, FOREIGN KEY)
- creditLimit (decimal)

Table: orders
- orderNumber (int, PRIMARY KEY)
- orderDate (date)
- requiredDate (date)
- shippedDate (date)
- status (varchar)
- comments (text)
- customerNumber (int, FOREIGN KEY)

Table: orderdetails
- orderNumber (int, PRIMARY KEY)
- productCode (varchar, PRIMARY KEY)
- quantityOrdered (int)
- priceEach (decimal)
- orderLineNumber (smallint)

Table: products
- productCode (varchar, PRIMARY KEY)
- productName (varchar)
- productLine (varchar, FOREIGN KEY)
- productScale (varchar)
- productVendor (varchar)
- productDescription (text)
- quantityInStock (smallint)
- buyPrice (decimal)
- MSRP (decimal)

Table: employees
- employeeNumber (int, PRIMARY KEY)
- lastName (varchar)
- firstName (varchar)
- extension (varchar)
- email (varchar)
- officeCode (varchar, FOREIGN KEY)
- reportsTo (int, FOREIGN KEY)
- jobTitle (varchar)

Table: offices
- officeCode (varchar, PRIMARY KEY)
- city (varchar)
- phone (varchar)
- addressLine1 (varchar)
- addressLine2 (varchar)
- state (varchar)
- country (varchar)
- postalCode (varchar)
- territory (varchar)

Table: payments
- customerNumber (int, PRIMARY KEY)
- checkNumber (varchar, PRIMARY KEY)
- paymentDate (date)
- amount (decimal)

Table: productlines
- productLine (varchar, PRIMARY KEY)
- textDescription (varchar)
- htmlDescription (mediumtext)
- image (mediumblob)

KEY RELATIONSHIPS:
- customers.customerNumber = orders.customerNumber
- orders.orderNumber = orderdetails.orderNumber
- orderdetails.productCode = products.productCode
- customers.salesRepEmployeeNumber = employees.employeeNumber
- employees.officeCode = offices.officeCode
- products.productLine = productlines.productLine
- payments.customerNumber = customers.customerNumber

COMMON QUERY PATTERNS:
- Customer info: SELECT customerName, city, country FROM customers WHERE...
- Product info: SELECT productName, buyPrice, MSRP FROM products WHERE...
- Order info: SELECT o.orderNumber, o.orderDate, c.customerName FROM orders o JOIN customers c ON...
- Sales data: SELECT SUM(od.quantityOrdered * od.priceEach) FROM orderdetails od...

Generate a MySQL query for:`;
};

// Create database connection
const createDemoConnection = async () => {
  try {
    const connection = await mysql.createConnection(DEMO_DB_CONFIG);
    return connection;
  } catch (error) {
    console.error('Demo database connection error:', error);
    throw new Error('Failed to connect to demo database');
  }
};

// POST /api/demo/query - Generate and execute SQL for demo
router.post('/query', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = demoQuerySchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details[0].message
      });
    }

    const { query } = value;

    let generatedSQL = null;
    let usingFallback = false;

    // Try OpenAI API first if available
    if (OPENAI_API_KEY && OPENAI_API_KEY !== 'your_openai_api_key_here') {
      try {
        // Generate SQL using OpenAI API
        const openaiResponse = await axios.post(`${OPENAI_BASE_URL}/chat/completions`, {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: getClassicModelsSystemPrompt()
        },
        {
          role: "user",
          content: query
        }
      ],
      max_tokens: 300,
      temperature: 0.1,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
        });

        generatedSQL = openaiResponse.data.choices[0]?.message?.content?.trim();

        if (!generatedSQL) {
          throw new Error('No SQL generated from OpenAI API');
        }

      } catch (openaiError) {
        console.log('OpenAI API failed, using fallback:', openaiError.message);
        generatedSQL = getFallbackQuery(query);
        usingFallback = true;
      }
    } else {
      // No API key, use fallback
      console.log('No OpenAI API key, using fallback queries');
      generatedSQL = getFallbackQuery(query);
      usingFallback = true;
    }

    // Basic validation to ensure it's a SELECT query
    const sqlLower = generatedSQL.toLowerCase().trim();
    if (!sqlLower.startsWith('select')) {
      return res.status(400).json({
        error: 'Generated query must be a SELECT statement for security reasons'
      });
    }

    // Check for potentially dangerous keywords
    const dangerousKeywords = ['drop', 'delete', 'update', 'insert', 'alter', 'create', 'truncate'];
    const containsDangerous = dangerousKeywords.some(keyword =>
      sqlLower.includes(keyword.toLowerCase())
    );

    if (containsDangerous) {
      return res.status(400).json({
        error: 'Generated query contains potentially dangerous operations'
      });
    }

    // Try to execute the query on the demo database, fallback to mock data if connection fails
    let connection = null;
    try {
      connection = await createDemoConnection();

      const [rows, fields] = await connection.execute(generatedSQL);
      const columns = fields.map(f => f.name);

      res.json({
        success: true,
        sql: generatedSQL,
        data: rows,
        columns: columns,
        rowCount: rows.length,
        originalQuery: query,
        executedAt: new Date().toISOString(),
        usingFallback: usingFallback,
        message: usingFallback ? 'Using demo fallback queries (OpenAI API not available)' : 'Generated using OpenAI GPT-3.5 Turbo'
      });

    } catch (dbError) {
      console.error('Demo query execution error:', dbError);

      let errorMessage = 'Failed to execute query on demo database';

      if (dbError.code === 'ER_PARSE_ERROR') {
        errorMessage = 'SQL syntax error in generated query';
      } else if (dbError.code === 'ER_NO_SUCH_TABLE') {
        errorMessage = 'Table not found in classicmodels database';
      } else if (dbError.code === 'ER_BAD_FIELD_ERROR') {
        errorMessage = 'Column not found in the specified table';
      } else if (dbError.code === 'ECONNREFUSED' || dbError.code === 'ENOTFOUND') {
        errorMessage = 'Unable to connect to demo database';
      }

      res.status(400).json({
        error: errorMessage,
        sql: generatedSQL,
        details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
      });
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch (closeError) {
          console.error('Error closing demo connection:', closeError);
        }
      }
    }

  } catch (error) {
    console.error('Demo API error:', error);

    // Handle OpenAI API specific errors
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      if (status === 429) {
        return res.status(429).json({
          error: 'OpenAI API rate limit exceeded. Please try again later.'
        });
      }

      if (status === 401) {
        return res.status(401).json({
          error: 'OpenAI API authentication failed. Please check your API key.'
        });
      }

      if (status === 402) {
        return res.status(402).json({
          error: 'OpenAI API quota exceeded. Please check your billing.'
        });
      }

      return res.status(status).json({
        error: 'OpenAI API error',
        details: process.env.NODE_ENV === 'development' ? errorData : undefined
      });
    }

    // Handle network errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({
        error: 'Unable to connect to OpenAI API service'
      });
    }

    res.status(500).json({
      error: 'Failed to process demo query',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/demo/schema - Get database schema info
router.get('/schema', async (req, res) => {
  try {
    let connection = null;
    try {
      connection = await createDemoConnection();

      // Get table information from the real database
      const [tables] = await connection.execute(`
        SELECT TABLE_NAME, TABLE_COMMENT
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = 'classicmodels'
        AND TABLE_TYPE = 'BASE TABLE'
        ORDER BY TABLE_NAME
      `);

      // Get column information for each table
      const tablesWithColumns = await Promise.all(
        tables.map(async (table) => {
          const [columns] = await connection.execute(`
            SELECT
              COLUMN_NAME,
              DATA_TYPE,
              IS_NULLABLE,
              COLUMN_KEY,
              COLUMN_DEFAULT,
              COLUMN_COMMENT
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = 'classicmodels'
            AND TABLE_NAME = ?
            ORDER BY ORDINAL_POSITION
          `, [table.TABLE_NAME]);

          return {
            ...table,
            columns: columns,
            COLUMN_COUNT: columns.length
          };
        })
      );

      res.json({
        success: true,
        database: 'classicmodels',
        tables: tablesWithColumns,
        description: 'Classic car sales database with customers, orders, products, and employees'
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
          await connection.end();
        } catch (closeError) {
          console.error('Error closing schema connection:', closeError);
        }
      }
    }
  } catch (error) {
    console.error('Schema API error:', error);
    res.status(500).json({
      error: 'Failed to connect to demo database',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
