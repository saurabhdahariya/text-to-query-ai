import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { ScrollArea } from "./ui/scroll-area";
import { Sparkles, Play, Code, Database, ArrowLeft, Loader2, AlertCircle, CheckCircle, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { demoAPI, DemoAPIError } from "../services/demoAPI";

const TryDemoPage = ({ onBack }) => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [generatedSQL, setGeneratedSQL] = useState("");
  const [showSQL, setShowSQL] = useState(false);
  const [error, setError] = useState("");
  const [schema, setSchema] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [maxColumnsToShow] = useState(8);

  const exampleQueries = [
    "Show me all customers from the USA",
    "List the top 5 most expensive products",
    "Find all orders placed in 2023",
    "Show employees and their office locations",
    "Get total sales by product line",
    "Find customers with the highest credit limits",
    "Show all products that are motorcycles",
    "List orders with their shipping status"
  ];

  // Load schema on component mount
  useEffect(() => {
    const loadSchema = async () => {
      try {
        const schemaData = await demoAPI.getSchema();
        setSchema(schemaData);
      } catch (error) {
        console.error('Failed to load schema:', error);
      }
    };

    loadSchema();
  }, []);

  // Pagination calculations
  const totalPages = results ? Math.ceil(results.length / itemsPerPage) : 0;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentResults = results ? results.slice(startIndex, endIndex) : [];

  // Column management for large datasets
  const getVisibleColumns = (data) => {
    if (!data || data.length === 0) return [];
    const allColumns = Object.keys(data[0]);
    return allColumns.length > maxColumnsToShow
      ? allColumns.slice(0, maxColumnsToShow)
      : allColumns;
  };

  const handleSubmit = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError("");
    setResults(null);
    setGeneratedSQL("");
    setCurrentPage(1); // Reset pagination

    try {
      const result = await demoAPI.executeQuery(query);

      setGeneratedSQL(result.sql);
      setResults(result.data);
      setShowSQL(true); // Auto-show SQL for demo

    } catch (error) {
      console.error('Demo query failed:', error);

      if (error instanceof DemoAPIError) {
        setError(error.message);
        if (error.details) {
          console.error('Error details:', error.details);
        }
      } else {
        setError('Failed to execute query. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (example) => {
    setQuery(example);
    setResults(null);
    setGeneratedSQL("");
    setShowSQL(false);
    setError("");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="h-6 w-px bg-border"></div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Database className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-semibold">NaturalSQL Demo</span>
              </div>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3 w-3" />
              Demo Mode
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Demo Banner */}
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg">Live Demo with Real Database!</h3>
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Connected to Aiven MySQL
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-3">
                  This demo uses the real <strong>classicmodels</strong> database hosted on Aiven MySQL.
                  Your natural language queries are converted to SQL using AIML API and executed on the live database.
                </p>
                {schema && (
                  <div className="text-sm text-muted-foreground">
                    <strong>Available tables:</strong> {schema.tables?.map(t => t.TABLE_NAME).join(', ') || 'customers, orders, products, employees, offices, payments, productlines'}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Query Input */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Ask Your Question
                </CardTitle>
                <CardDescription>
                  Ask questions about customers, orders, products, employees, or offices
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Textarea
                    placeholder="e.g., Show me all customers from the USA with their credit limits..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="min-h-[120px] resize-none"
                  />

                  {error && (
                    <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-destructive">
                        <p className="font-medium">Query Failed</p>
                        <p>{error}</p>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleSubmit}
                    disabled={!query.trim() || isLoading}
                    className="w-full h-11"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing with AIML API...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate & Execute SQL
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Example Queries */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Try These Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {exampleQueries.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => handleExampleClick(example)}
                      className="w-full text-left p-3 rounded-lg border border-border/50 hover:border-border hover:bg-muted/50 transition-all duration-200 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Code className="h-3 w-3 text-muted-foreground" />
                        {example}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {generatedSQL && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Code className="h-4 w-4" />
                      Generated SQL
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSQL(!showSQL)}
                    >
                      {showSQL ? "Hide" : "Show"} SQL
                    </Button>
                  </div>
                </CardHeader>
                {showSQL && (
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-lg text-sm font-mono overflow-x-auto">
                      <code>{generatedSQL}</code>
                    </pre>
                  </CardContent>
                )}
              </Card>
            )}

            {results && results.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Database className="h-4 w-4" />
                      Query Results ({results.length} rows)
                    </CardTitle>
                    {results.length > itemsPerPage && (
                      <div className="text-sm text-muted-foreground">
                        Showing {startIndex + 1}-{Math.min(endIndex, results.length)} of {results.length}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Responsive Table Container */}
                  <div className="border rounded-lg">
                    <ScrollArea className="w-full">
                      <div className="min-w-full">
                        <Table>
                          <TableHeader className="sticky top-0 bg-background z-10">
                            <TableRow>
                              {getVisibleColumns(results).map((key) => (
                                <TableHead key={key} className="font-medium whitespace-nowrap px-4 py-3">
                                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </TableHead>
                              ))}
                              {results.length > 0 && Object.keys(results[0]).length > maxColumnsToShow && (
                                <TableHead className="font-medium px-4 py-3">
                                  <MoreHorizontal className="h-4 w-4" />
                                </TableHead>
                              )}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {currentResults.map((row, index) => (
                              <TableRow key={startIndex + index} className="hover:bg-muted/50">
                                {getVisibleColumns(results).map((key) => (
                                  <TableCell key={key} className="font-mono text-sm px-4 py-3 max-w-xs">
                                    <div className="truncate" title={String(row[key])}>
                                      {row[key] === null ? (
                                        <span className="text-muted-foreground italic">NULL</span>
                                      ) : typeof row[key] === 'object' ? (
                                        <span className="text-blue-600">JSON</span>
                                      ) : String(row[key]).length > 50 ? (
                                        <span title={String(row[key])}>
                                          {String(row[key]).substring(0, 50)}...
                                        </span>
                                      ) : (
                                        String(row[key])
                                      )}
                                    </div>
                                  </TableCell>
                                ))}
                                {results.length > 0 && Object.keys(results[0]).length > maxColumnsToShow && (
                                  <TableCell className="px-4 py-3">
                                    <span className="text-xs text-muted-foreground">
                                      +{Object.keys(results[0]).length - maxColumnsToShow} more
                                    </span>
                                  </TableCell>
                                )}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t">
                      <div className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {results && results.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">No results found</p>
                    <p className="text-sm">The query executed successfully but returned no data.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {!results && !isLoading && (
              <Card className="border-dashed">
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Submit a query to see results here</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TryDemoPage;
