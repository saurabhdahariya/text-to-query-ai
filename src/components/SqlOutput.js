import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Code, Copy, Play, Check, Loader2, Sparkles, Eye } from "lucide-react";

const SqlOutput = ({ sqlQuery, onExecuteQuery, isExecuting, originalQuery }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sqlQuery);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleExecute = () => {
    onExecuteQuery(sqlQuery);
  };

  if (!sqlQuery) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto animate-slide-up">
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Code className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">Generated SQL Query</CardTitle>
                {originalQuery && (
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    "{originalQuery}"
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="gap-2"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3" />
                    Copied
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

        <CardContent className="space-y-4">
          {/* SQL Code Block */}
          <div className="relative group">
            <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
              </div>
              <span className="text-xs text-muted-foreground font-mono">query.sql</span>
            </div>

            <pre className="bg-card border border-border/50 rounded-lg p-6 pt-12 overflow-x-auto text-sm font-mono leading-relaxed custom-scrollbar">
              <code className="language-sql text-foreground">{sqlQuery}</code>
            </pre>

            {/* Hover overlay for copy */}
            <div className="absolute inset-0 bg-background/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none" />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleExecute}
              disabled={isExecuting}
              className="flex-1 h-11 text-base font-medium"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Executing Query...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Execute Query
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleCopy}
              className="h-11 px-6"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="outline"
              className="h-11 px-6"
              onClick={() => {/* Add preview functionality if needed */}}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SqlOutput;
