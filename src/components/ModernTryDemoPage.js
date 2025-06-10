import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Loader2, Database, ArrowLeft, Play, Copy, CheckCircle, Sparkles, Terminal, Code, Info } from 'lucide-react';
import { Typewriter } from 'react-simple-typewriter';
import ResultTable from './ResultTable';
import { ThemeToggle } from './theme-toggle';
import { demoAPI } from '../services/demoAPI';

const ModernTryDemoPage = ({ onBack }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [generatedSQL, setGeneratedSQL] = useState('');
  const [copied, setCopied] = useState(false);
  const [dbSchema, setDbSchema] = useState(null);
  const [isLoadingSchema, setIsLoadingSchema] = useState(true);

  const exampleQueries = [
    "Show me the top 10 customers by revenue",
    "List all orders shipped in 2024",
    "How many products are in stock?",
    "Find customers who haven't placed orders",
    "What's the average order value by month?",
    "Show me all products with low stock levels",
    "Which employees have the highest sales?",
    "List customers from the USA"
  ];

  // Load database schema on component mount
  useEffect(() => {
    const loadSchema = async () => {
      try {
        setIsLoadingSchema(true);
        const schemaData = await demoAPI.getSchema();
        setDbSchema(schemaData);
        toast.success('Connected to demo database!');
      } catch (error) {
        console.error('Failed to load schema:', error);
        toast.error('Failed to connect to demo database');
      } finally {
        setIsLoadingSchema(false);
      }
    };

    loadSchema();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error('Please enter a query');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setGeneratedSQL('');

    try {
      toast.loading('Processing your query...', { id: 'query-processing' });
      const response = await demoAPI.generateAndExecuteSQL(query);

      setGeneratedSQL(response.sql);
      setResult(response.results);

      toast.success(`Query executed successfully! Found ${response.results?.length || 0} results.`, {
        id: 'query-processing'
      });
    } catch (err) {
      console.error('Query execution error:', err);
      const errorMessage = err.message || 'An error occurred while processing your query';
      setError(errorMessage);
      toast.error(errorMessage, { id: 'query-processing' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (example) => {
    setQuery(example);
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Database className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-xl font-semibold">Try Demo</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Badge variant="secondary" className="gap-2">
                <Sparkles className="h-3 w-3" />
                Sample Database
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  Natural Language Query
                </CardTitle>
                <CardDescription>
                  Describe what you want to know about the database in plain English
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Database Info */}
                {dbSchema && (
                  <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Database: {dbSchema.database}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {dbSchema.description || 'Classic business database with customers, orders, products, and employees'}
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Textarea
                    placeholder={isLoadingSchema
                      ? "Loading database..."
                      : "Ask anything about the database in plain English..."
                    }
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="min-h-[140px] resize-none"
                    disabled={isLoadingSchema}
                  />
                  <Button
                    type="submit"
                    disabled={isLoading || !query.trim() || isLoadingSchema}
                    className="w-full gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : isLoadingSchema ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading Database...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        Generate SQL & Execute
                      </>
                    )}
                  </Button>
                </form>

                {/* Example Queries */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">Try these examples:</h4>
                  <div className="space-y-2">
                    {exampleQueries.map((example, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleExampleClick(example)}
                        className="w-full text-left p-3 text-sm bg-muted/50 hover:bg-muted rounded-lg transition-colors border border-transparent hover:border-border"
                      >
                        "{example}"
                      </motion.button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Generated SQL */}
            {generatedSQL && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      Generated SQL
                    </CardTitle>
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
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted/50 p-4 rounded-lg text-sm overflow-x-auto">
                    <code>{generatedSQL}</code>
                  </pre>
                </CardContent>
              </Card>
            )}

            {/* Results */}
            {result && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Query Results
                  </CardTitle>
                  <CardDescription>
                    {result.length} row{result.length !== 1 ? 's' : ''} returned
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResultTable data={result} />
                </CardContent>
              </Card>
            )}

            {/* Error */}
            {error && (
              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="text-destructive">Error</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-destructive">{error}</p>
                </CardContent>
              </Card>
            )}

            {/* Loading State */}
            {isLoading && (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Processing your query...</p>
                      <p className="text-xs text-muted-foreground">
                        <Typewriter
                          words={[
                            "Analyzing natural language...",
                            "Generating SQL query...",
                            "Executing on database...",
                            "Formatting results..."
                          ]}
                          loop={1}
                          cursor={false}
                          typeSpeed={50}
                          deleteSpeed={30}
                          delaySpeed={1000}
                        />
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Welcome State */}
            {!isLoading && !result && !error && !generatedSQL && (
              <Card className="border-dashed">
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center space-y-4">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                      <Play className="h-6 w-6" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Ready to generate SQL</p>
                      <p className="text-xs text-muted-foreground">
                        Enter a natural language query to get started
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
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

export default ModernTryDemoPage;
