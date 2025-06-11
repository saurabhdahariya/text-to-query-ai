import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import {
  Send,
  Copy,
  CheckCircle,
  Database,
  LogOut,
  Eye,
  EyeOff,
  Loader2,
  Settings
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';

import { ThemeToggle } from './theme-toggle';
import DatabaseSidebar from './DatabaseSidebar';
import QueryResultsTable from './QueryResultsTable';
import { sqlAPI } from '../services/api';
import { getAPIURL } from '../utils/apiConfig';

const QueryInterface = ({ 
  connectionData, 
  onDisconnect, 
  dbSchema,
  onRefreshSchema 
}) => {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedSQL, setGeneratedSQL] = useState('');
  const [queryResults, setQueryResults] = useState(null);
  const [error, setError] = useState(null);
  const [showSQL, setShowSQL] = useState(true);
  const [copied, setCopied] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const textareaRef = useRef(null);

  const exampleQueries = [
    "Show me all customers from France",
    "List all products with their prices",
    "Find the top 5 customers by credit limit",
    "Show me all orders placed in 2023",
    "List employees and their job titles",
    "What products are currently in stock?",
    "Show me customer orders with their status"
  ];

  useEffect(() => {
    // Auto-focus textarea when component mounts
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error('Please enter a query');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setQueryResults(null);
    setGeneratedSQL('');

    try {
      toast.loading('Generating SQL...', { id: 'query-processing' });

      // Check if we're in demo mode or connected to real database
      const isDemoMode = connectionData?.database === 'classicmodels' || !connectionData?.host;

      if (isDemoMode) {
        // Use demo API for demo mode
        const demoResponse = await fetch(getAPIURL('demo/query'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query })
        });

        if (!demoResponse.ok) {
          throw new Error('Demo API request failed');
        }

        const demoResult = await demoResponse.json();

        setGeneratedSQL(demoResult.sql);
        setQueryResults({
          data: demoResult.data,
          columns: demoResult.columns,
          rowCount: demoResult.rowCount || demoResult.data?.length || 0
        });

        const successMessage = demoResult.usingFallback
          ? `Query executed using demo fallback! Found ${demoResult.data?.length || 0} results. (OpenAI API not available)`
          : `Query executed successfully! Found ${demoResult.data?.length || 0} results.`;

        toast.success(successMessage, { id: 'query-processing' });

      } else {
        // Use OpenAI API for real database connections
        const schema = dbSchema?.tables ?
          dbSchema.tables.map(table => {
            const columns = table.columns?.map(col =>
              `${col.COLUMN_NAME} (${col.DATA_TYPE}${col.COLUMN_KEY === 'PRI' ? ', PRIMARY KEY' : ''}${col.IS_NULLABLE === 'NO' ? ', NOT NULL' : ''})`
            ).join(', ') || 'No columns';
            return `Table: ${table.TABLE_NAME}\nColumns: ${columns}`;
          }).join('\n\n') :
          'No schema available';

        const sqlResponse = await sqlAPI.generateSQL(
          query,
          connectionData?.dbType || 'mysql',
          schema
        );

        setGeneratedSQL(sqlResponse.sql);
        toast.loading('Executing query...', { id: 'query-processing' });

        // Execute SQL on connected database
        const results = await sqlAPI.executeSQL(sqlResponse.sql);

        setQueryResults({
          data: results.data,
          columns: results.columns,
          rowCount: results.rowCount || results.data?.length || 0
        });

        toast.success(`Query executed successfully! Found ${results.data?.length || 0} results.`, { id: 'query-processing' });
      }

    } catch (err) {
      console.error('Query execution error:', err);
      let errorMessage = err.message || 'Failed to process query';

      // Provide more helpful error messages
      if (errorMessage.includes('OpenAI API authentication failed') || errorMessage.includes('OpenAI API key not configured')) {
        errorMessage = 'OpenAI API key not configured. Please set up your OpenAI API key in the backend configuration.';
        // Try demo fallback for OpenAI issues
        try {
          const demoResponse = await fetch(getAPIURL('demo/query'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query })
          });

          if (demoResponse.ok) {
            const demoResult = await demoResponse.json();
            setGeneratedSQL(demoResult.sql);
            setQueryResults({
              data: demoResult.data,
              columns: demoResult.columns,
              rowCount: demoResult.rowCount || demoResult.data?.length || 0
            });

            toast.success(`Query executed using fallback system! Found ${demoResult.data?.length || 0} results.`, { id: 'query-processing' });
            setIsProcessing(false);
            return;
          }
        } catch (demoErr) {
          console.error('Demo fallback failed:', demoErr);
        }
      } else if (errorMessage.includes('Unknown column')) {
        errorMessage = 'Column not found. The AI might have used incorrect column names. Please try rephrasing your question or check the database schema in the sidebar.';
      } else if (errorMessage.includes('Table') && errorMessage.includes("doesn't exist")) {
        errorMessage = 'Table not found. Please check the available tables in the sidebar and try again.';
      } else if (errorMessage.includes('syntax error')) {
        errorMessage = 'SQL syntax error. Please try rephrasing your question in simpler terms.';
      }

      setError(errorMessage);
      toast.error(errorMessage, { id: 'query-processing' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExampleClick = (example) => {
    setQuery(example);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const copySQL = async () => {
    try {
      await navigator.clipboard.writeText(generatedSQL);
      setCopied(true);
      toast.success('SQL copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy SQL');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <DatabaseSidebar
            connectionData={connectionData}
            dbSchema={dbSchema}
            onRefreshSchema={onRefreshSchema}
            onClose={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-0' : 'ml-0'}`}>
        {/* Header */}
        <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              {!sidebarOpen && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                  className="gap-2"
                >
                  <Database className="h-4 w-4" />
                  Show Schema
                </Button>
              )}
              
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Database className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-semibold">Query Interface</h1>
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-600 font-medium">Connected</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {connectionData?.username}@{connectionData?.host}/{connectionData?.database} ({connectionData?.dbType?.toUpperCase()})
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={onDisconnect}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Disconnect
              </Button>
            </div>
          </div>
        </header>

        {/* Main Query Area */}
        <div className="flex-1 flex flex-col">
          {/* Results Area */}
          <div className="flex-1 p-6 space-y-6 overflow-auto">
            {/* Generated SQL */}
            <AnimatePresence>
              {generatedSQL && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          <CardTitle className="text-sm">Generated SQL</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowSQL(!showSQL)}
                            className="gap-2"
                          >
                            {showSQL ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            {showSQL ? 'Hide' : 'Show'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={copySQL}
                            className="gap-2"
                          >
                            {copied ? (
                              <>
                                <CheckCircle className="h-3 w-3" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                Copy
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    {showSQL && (
                      <CardContent>
                        <pre className="bg-muted/50 p-4 rounded-lg text-sm overflow-x-auto font-mono">
                          <code>{generatedSQL}</code>
                        </pre>
                      </CardContent>
                    )}
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Query Results */}
            <AnimatePresence>
              {queryResults && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <QueryResultsTable
                    data={queryResults.data}
                    columns={queryResults.columns}
                    rowCount={queryResults.rowCount}
                    isLoading={isProcessing}
                    error={error}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Display */}
            <AnimatePresence>
              {error && !queryResults && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border-destructive">
                    <CardHeader>
                      <CardTitle className="text-destructive text-sm">Query Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-destructive">{error}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Welcome State */}
            {!isProcessing && !queryResults && !error && !generatedSQL && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 flex items-center justify-center"
              >
                <Card className="max-w-2xl w-full">
                  <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2">
                      <Database className="h-5 w-5" />
                      Ready to Query Your Database
                    </CardTitle>
                    <CardDescription>
                      {dbSchema?.tables?.length > 0 ? (
                        `Connected to ${connectionData?.database} with ${dbSchema.tables.length} tables. Ask questions about your data in natural language.`
                      ) : (
                        'Loading database schema... Please wait.'
                      )}
                    </CardDescription>
                  </CardHeader>
                  {dbSchema?.tables?.length > 0 && (
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground text-center mb-4">
                        Try one of these examples:
                      </p>
                      {exampleQueries.map((example, index) => (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => handleExampleClick(example)}
                          className="w-full text-left p-3 text-sm bg-muted/50 hover:bg-muted rounded-lg transition-colors border border-transparent hover:border-border"
                        >
                          "{example}"
                        </motion.button>
                      ))}
                    </CardContent>
                  )}
                </Card>
              </motion.div>
            )}
          </div>

          {/* Query Input Area - Fixed at bottom */}
          <div className="border-t border-border bg-background p-6">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Textarea
                    ref={textareaRef}
                    placeholder="Ask anything about your database... (Ctrl+Enter to submit)"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="min-h-[60px] resize-none"
                    disabled={isProcessing}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isProcessing || !query.trim()}
                  className="gap-2 h-[60px] px-6"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(var(--border))',
          },
        }}
      />
    </div>
  );
};

export default QueryInterface;
