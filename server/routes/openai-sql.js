const express = require('express');
const axios = require('axios');
const Joi = require('joi');
const router = express.Router();

// Environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

// Validation schema for SQL generation request
const generateSQLSchema = Joi.object({
  userQuery: Joi.string().min(3).max(1000).required(),
  dbType: Joi.string().valid('postgresql', 'mysql').required(),
  schema: Joi.string().allow('').optional()
});

// Helper function to create system prompt
const createSystemPrompt = (dbType, schema) => {
  let prompt = `You are an expert SQL query generator for ${dbType.toUpperCase()} databases. Convert natural language questions into accurate, efficient SQL queries.

CRITICAL RULES:
1. Return ONLY the SQL query - no explanations, comments, or markdown formatting
2. Use proper ${dbType.toUpperCase()} syntax and conventions
3. ONLY generate SELECT statements for security
4. Always include appropriate JOINs when referencing multiple tables
5. Only add LIMIT clauses when specifically requested by the user (e.g., "top 10", "first 5")
6. Use proper column names exactly as they appear in the schema
7. Handle edge cases like NULL values and data type conversions

${dbType.toUpperCase()} SYNTAX REQUIREMENTS:
- Use lowercase keywords: select, from, where, join, order by, group by, etc.
- ${dbType === 'mysql' ? 'Use backticks for table/column names if they contain spaces or special characters' : 'Use double quotes for identifiers if needed'}
- Use single quotes for string literals
- Date functions: ${dbType === 'mysql' ? 'DATE(), YEAR(), MONTH(), DAY(), NOW()' : 'DATE(), EXTRACT(), CURRENT_DATE'}
- String functions: ${dbType === 'mysql' ? 'CONCAT(), LIKE, SUBSTRING()' : 'CONCAT(), LIKE, SUBSTRING()'}
- Aggregation: COUNT(), SUM(), AVG(), MAX(), MIN()

COMMON PATTERNS:
- "Show me..." → SELECT ... FROM ...
- "Show me all..." → SELECT ... FROM ... (no limit)
- "Top N..." → SELECT ... ORDER BY ... DESC LIMIT N
- "First N..." → SELECT ... LIMIT N
- "Count of..." → SELECT COUNT(*) FROM ...
- "Average/Total..." → SELECT AVG()/SUM() FROM ...
- "Between dates..." → WHERE date_column BETWEEN 'date1' AND 'date2'

IMPORTANT: Only add LIMIT when the user specifically asks for a limited number of results (e.g., "top 5", "first 10", "limit to 20"). For general queries like "show me all customers" or "list products", return ALL results without LIMIT.`;

  if (schema && schema.trim()) {
    prompt += `\n\nDATABASE SCHEMA:\n${schema}\n\nUse ONLY the tables and columns listed above. Pay attention to:
- Exact column names and data types
- Primary/Foreign key relationships for JOINs
- Table relationships and constraints`;
  }

  prompt += `\n\nGenerate a valid ${dbType.toUpperCase()} SQL query for the following question:`;

  return prompt;
};

// POST /api/generate-sql - Generate SQL using OpenAI GPT-3.5 Turbo
router.post('/generate-sql', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = generateSQLSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details[0].message
      });
    }

    const { userQuery, dbType, schema } = value;

    // Check if OpenAI API key is configured
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_api_key_here') {
      return res.status(500).json({
        error: 'OpenAI API key not configured. Please set OPENAI_API_KEY in environment variables.'
      });
    }

    console.log('🤖 Generating SQL with OpenAI GPT-3.5 Turbo:', {
      userQuery,
      dbType,
      schemaLength: schema?.length || 0
    });

    // Create system prompt with schema context
    const systemPrompt = createSystemPrompt(dbType, schema);

    // Make request to OpenAI API
    const openaiResponse = await axios.post(`${OPENAI_BASE_URL}/chat/completions`, {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userQuery
        }
      ],
      max_tokens: 500,
      temperature: 0.1,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    const generatedSQL = openaiResponse.data.choices[0]?.message?.content?.trim();

    if (!generatedSQL) {
      return res.status(500).json({
        error: 'No SQL generated from OpenAI API'
      });
    }

    // Basic validation to ensure it's a SELECT query
    const sqlLower = generatedSQL.toLowerCase().trim();
    if (!sqlLower.startsWith('select')) {
      return res.status(400).json({
        error: 'Generated query must be a SELECT statement for security reasons',
        sql: generatedSQL
      });
    }

    // Check for potentially dangerous keywords
    const dangerousKeywords = ['drop', 'delete', 'update', 'insert', 'alter', 'create', 'truncate'];
    const containsDangerous = dangerousKeywords.some(keyword =>
      sqlLower.includes(keyword.toLowerCase())
    );

    if (containsDangerous) {
      return res.status(400).json({
        error: 'Generated query contains potentially dangerous operations',
        sql: generatedSQL
      });
    }

    console.log('✅ SQL generated successfully:', generatedSQL);

    res.json({
      success: true,
      sql: generatedSQL,
      originalQuery: userQuery,
      dbType: dbType,
      generatedAt: new Date().toISOString(),
      model: 'gpt-3.5-turbo'
    });

  } catch (error) {
    console.error('❌ OpenAI SQL generation error:', error);

    // Handle specific OpenAI API errors
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      console.error('OpenAI API response error:', {
        status,
        data: errorData
      });

      if (status === 401) {
        return res.status(401).json({
          error: 'OpenAI API authentication failed. Please check your API key.'
        });
      }

      if (status === 403) {
        return res.status(403).json({
          error: 'OpenAI API access forbidden. Please check your API key permissions.'
        });
      }

      if (status === 429) {
        return res.status(429).json({
          error: 'OpenAI API rate limit exceeded. Please try again later.'
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

    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({
        error: 'OpenAI API request timeout. Please try again.'
      });
    }

    res.status(500).json({
      error: 'Failed to generate SQL query',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
