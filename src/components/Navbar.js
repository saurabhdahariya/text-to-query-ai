import React from "react";
import { Button } from "./ui/button";
import { Database, LogOut, Home, Sparkles } from "lucide-react";

const Navbar = ({ connectionData, onDisconnect, onGoHome }) => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <Database className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">NaturalSQL</h1>
              <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-muted rounded-full">
                <Sparkles className="h-3 w-3 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">AI</span>
              </div>
            </div>
          </div>

          {/* Connection Status & Actions */}
          <div className="flex items-center gap-4">
            {connectionData ? (
              <>
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg border border-border/50">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Connected to </span>
                    <span className="font-medium text-foreground">{connectionData.database}</span>
                    <span className="text-muted-foreground"> on {connectionData.host}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDisconnect}
                  className="gap-2 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Disconnect</span>
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={onGoHome}
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
