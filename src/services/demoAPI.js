const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class DemoAPIError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'DemoAPIError';
    this.status = status;
    this.details = details;
  }
}

const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new DemoAPIError(
      data.error || 'Demo API request failed',
      response.status,
      data.details
    );
  }

  return data;
};

export const demoAPI = {
  // Execute natural language query on demo database
  generateAndExecuteSQL: async (naturalLanguageQuery) => {
    try {
      const response = await fetch(`${API_BASE_URL}/demo/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: naturalLanguageQuery
        }),
      });

      const result = await handleResponse(response);

      return {
        success: true,
        sql: result.sql,
        results: result.data || [],
        columns: result.columns || [],
        rowCount: result.rowCount || 0,
        originalQuery: result.originalQuery,
        executedAt: result.executedAt
      };
    } catch (error) {
      console.error('Demo query execution failed:', error);

      if (error instanceof DemoAPIError) {
        throw error;
      }

      throw new DemoAPIError(
        'Failed to execute demo query',
        500,
        error.message
      );
    }
  },

  // Legacy method for backward compatibility
  executeQuery: async (naturalLanguageQuery) => {
    return demoAPI.generateAndExecuteSQL(naturalLanguageQuery);
  },

  // Get database schema information
  getSchema: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/demo/schema`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await handleResponse(response);

      return {
        success: true,
        database: result.database,
        tables: result.tables || [],
        description: result.description
      };
    } catch (error) {
      console.error('Demo schema fetch failed:', error);

      if (error instanceof DemoAPIError) {
        throw error;
      }

      throw new DemoAPIError(
        'Failed to fetch demo database schema',
        500,
        error.message
      );
    }
  }
};

export { DemoAPIError };
