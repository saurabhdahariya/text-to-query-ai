import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { MessageSquare, Sparkles, Loader2, Database, Table } from "lucide-react";

const NaturalLanguageInput = ({ onGenerateSQL, isGenerating, connectedDatabase, dbSchema }) => {
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    if (error) {
      setError("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setError("Please enter a question about your data");
      return;
    }
    onGenerateSQL(query.trim());
  };

  const exampleQueries = [
    "Show me all users who signed up last month",
    "What are the top 5 products by sales?",
    "Find customers with more than 3 orders",
    "Show revenue by month for this year"
  ];

  const handleExampleClick = (example) => {
    setQuery(example);
    setError("");
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      <Card className="border-border/50">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <MessageSquare className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Ask Your Database</CardTitle>
          <CardDescription className="text-base mt-2">
            {connectedDatabase ? (
              <span className="inline-flex items-center gap-2">
                Connected to <span className="font-medium text-foreground">{connectedDatabase.database}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{connectedDatabase.host}</span>
              </span>
            ) : (
              "Describe what you want to know in plain English and we'll generate the perfect SQL query"
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <div className="relative">
                <Textarea
                  id="query"
                  placeholder="Ask anything about your data... e.g., 'Show me all customers who made purchases in the last 30 days'"
                  value={query}
                  onChange={handleInputChange}
                  className={`min-h-[140px] resize-none text-base leading-relaxed ${error ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  disabled={isGenerating}
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {query.length}/1000
                  </span>
                </div>
              </div>
              {error && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {error}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-medium"
              disabled={isGenerating || !query.trim()}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating SQL...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate SQL Query
                </>
              )}
            </Button>
          </form>

          {/* Database Schema */}
          {dbSchema && dbSchema.tables && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-medium">
                  Available Tables ({dbSchema.tables.length}):
                </h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {dbSchema.tables.map((table, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    <Table className="h-3 w-3" />
                    {table.table_name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Example Queries */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-medium">
                Try these examples:
              </h4>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {exampleQueries.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example)}
                  className="group text-left p-4 rounded-lg border border-border/50 hover:border-border hover:bg-muted/50 transition-all duration-200 text-sm"
                  disabled={isGenerating}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1 rounded bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <MessageSquare className="h-3 w-3" />
                    </div>
                    <span className="leading-relaxed">{example}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NaturalLanguageInput;
