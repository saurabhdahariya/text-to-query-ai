import { useState } from "react";
import ModernLandingPage from "./components/ModernLandingPage";
import ModernTryDemoPage from "./components/ModernTryDemoPage";
import ModernConnectPage from "./components/ModernConnectPage";
import QueryInterface from "./components/QueryInterface";
import { ThemeProvider } from "./components/theme-provider";
import { databaseAPI } from "./services/api";

function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'connect', 'demo', 'query'
  const [connectionData, setConnectionData] = useState(null);
  const [dbSchema, setDbSchema] = useState(null);

  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  const handleDisconnect = async () => {
    try {
      await databaseAPI.disconnect();
      setConnectionData(null);
      setDbSchema(null);
      setCurrentView('landing');
    } catch (error) {
      console.error('Disconnect failed:', error);
      // Even if API call fails, clear local state
      setConnectionData(null);
      setDbSchema(null);
      setCurrentView('landing');
    }
  };

  const handleGoHome = () => {
    setCurrentView('landing');
  };





  if (currentView === 'landing') {
    return (
      <ThemeProvider defaultTheme="dark" storageKey="naturalsql-theme">
        <ModernLandingPage onNavigate={handleNavigate} />
      </ThemeProvider>
    );
  }

  if (currentView === 'demo') {
    return (
      <ThemeProvider defaultTheme="dark" storageKey="naturalsql-theme">
        <ModernTryDemoPage onBack={handleGoHome} />
      </ThemeProvider>
    );
  }

  if (currentView === 'connect') {
    return (
      <ThemeProvider defaultTheme="dark" storageKey="naturalsql-theme">
        <ModernConnectPage
          onBack={handleGoHome}
          onConnect={async (dbConfig) => {
            setConnectionData(dbConfig);
            // Load schema after successful connection
            try {
              const schema = await databaseAPI.getSchema();
              setDbSchema(schema);
            } catch (error) {
              console.error('Failed to load schema:', error);
            }
            setCurrentView('query');
          }}
        />
      </ThemeProvider>
    );
  }

  if (currentView === 'query') {
    return (
      <ThemeProvider defaultTheme="dark" storageKey="naturalsql-theme">
        <QueryInterface
          connectionData={connectionData}
          onDisconnect={handleDisconnect}
          dbSchema={dbSchema}
          onRefreshSchema={async () => {
            try {
              const schema = await databaseAPI.getSchema();
              setDbSchema(schema);
            } catch (error) {
              console.error('Failed to refresh schema:', error);
            }
          }}
        />
      </ThemeProvider>
    );
  }

  return null;
}

export default App;
