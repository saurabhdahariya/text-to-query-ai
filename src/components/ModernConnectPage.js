import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Select, SelectItem } from './ui/select';
import { ThemeToggle } from './theme-toggle';
import { getAPIURL } from '../utils/apiConfig';
import {
  ArrowLeft,
  Database,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Server,
  Globe
} from 'lucide-react';

const ModernConnectPage = ({ onBack, onConnect }) => {
  const [formData, setFormData] = useState({
    type: '',
    host: '',
    port: '',
    database: '',
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [testPassed, setTestPassed] = useState(false);

  const databaseTypes = [
    { value: 'mysql', label: 'MySQL', port: '3306' },
    { value: 'postgresql', label: 'PostgreSQL', port: '5432' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (connectionStatus) setConnectionStatus(null);
  };

  const handleDatabaseTypeChange = (type) => {
    const dbType = databaseTypes.find(db => db.value === type);
    setFormData(prev => ({
      ...prev,
      type,
      port: dbType?.port || ''
    }));
  };

  const handleTestConnection = async (e) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = [
      { field: 'type', name: 'Database Type' },
      { field: 'host', name: 'Host' },
      { field: 'port', name: 'Port' },
      { field: 'database', name: 'Database Name' },
      { field: 'username', name: 'Username' },
      { field: 'password', name: 'Password' }
    ];

    const missingFields = requiredFields.filter(({ field }) => !formData[field]);

    if (missingFields.length > 0) {
      const missingFieldNames = missingFields.map(({ name }) => name).join(', ');
      toast.error(`Please fill in all required fields: ${missingFieldNames}`);
      return;
    }

    // Validate port number
    const port = parseInt(formData.port);
    if (isNaN(port) || port < 1 || port > 65535) {
      toast.error('Please enter a valid port number (1-65535)');
      return;
    }

    setIsTesting(true);
    setConnectionStatus(null);
    setTestPassed(false);

    try {
      console.log('Testing connection with:', {
        host: formData.host,
        port: parseInt(formData.port),
        username: formData.username,
        database: formData.database,
        dbType: formData.type
      });

      const response = await fetch(getAPIURL('database/connect'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          host: formData.host,
          port: parseInt(formData.port),
          username: formData.username,
          password: formData.password,
          database: formData.database,
          dbType: formData.type
        }),
      });

      const result = await response.json();
      console.log('Connection test result:', result);

      if (response.ok && result.success) {
        setConnectionStatus({
          type: 'success',
          message: 'Connection test successful! You can now connect to use this database.'
        });
        setTestPassed(true);
        toast.success('Database connection test passed!');
      } else {
        // Handle different types of errors
        let errorMessage = result.error || 'Connection test failed';

        if (response.status === 400) {
          if (result.error?.includes('Access denied')) {
            errorMessage = 'Access denied. Please check your username and password.';
          } else if (result.error?.includes('Host not found')) {
            errorMessage = 'Host not found. Please check your hostname or IP address.';
          } else if (result.error?.includes('Connection timeout')) {
            errorMessage = 'Connection timeout. Please check your host, port, and network connection.';
          } else if (result.error?.includes('Database not found')) {
            errorMessage = 'Database not found. Please check your database name.';
          } else if (result.error?.includes('Connection refused')) {
            errorMessage = 'Connection refused. Please check your host and port number.';
          }
        }

        setConnectionStatus({
          type: 'error',
          message: errorMessage
        });
        setTestPassed(false);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Connection test error:', error);
      let errorMessage = 'Failed to test connection. Please check your network and try again.';

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Cannot connect to server. Please ensure the backend is running.';
      }

      setConnectionStatus({
        type: 'error',
        message: errorMessage
      });
      setTestPassed(false);
      toast.error(errorMessage);
    } finally {
      setIsTesting(false);
    }
  };

  const handleConnect = async () => {
    if (!testPassed) {
      toast.error('Please test the connection first');
      return;
    }

    setIsConnecting(true);

    try {
      // The connection is already established from the test, so we can proceed
      toast.success('Successfully connected to database!');

      // Call the onConnect callback to navigate to the query interface
      if (onConnect) {
        onConnect({
          host: formData.host,
          port: parseInt(formData.port),
          username: formData.username,
          database: formData.database,
          dbType: formData.type
        });
      }
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Failed to establish connection');
    } finally {
      setIsConnecting(false);
    }
  };

  const steps = [
    {
      number: 1,
      title: "Choose Database Type",
      description: "Select your database management system"
    },
    {
      number: 2,
      title: "Enter Connection Details",
      description: "Provide your database credentials"
    },
    {
      number: 3,
      title: "Test Connection",
      description: "Verify the connection is working"
    }
  ];

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
                <span className="text-xl font-semibold">Connect Database</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Badge variant="secondary" className="gap-2">
                <Shield className="h-3 w-3" />
                Secure Connection
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-8">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      step.number <= 2 ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground text-muted-foreground'
                    }`}>
                      {step.number <= 1 ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <span className="text-sm font-medium">{step.number}</span>
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <p className="text-sm font-medium">{step.title}</p>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-px bg-border mx-4" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Connection Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-2"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    Database Connection
                  </CardTitle>
                  <CardDescription>
                    Enter your database credentials to establish a secure connection
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleTestConnection} className="space-y-6">
                    {/* Database Type */}
                    <div className="space-y-2">
                      <Label htmlFor="type">Database Type</Label>
                      <Select
                        value={formData.type}
                        onValueChange={handleDatabaseTypeChange}
                        placeholder="Select database type"
                      >
                        {databaseTypes.map((db) => (
                          <SelectItem key={db.value} value={db.value}>
                            {db.label}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>

                    {/* Host and Port */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="host">Host</Label>
                        <Input
                          id="host"
                          placeholder="localhost or IP address"
                          value={formData.host}
                          onChange={(e) => handleInputChange('host', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="port">Port</Label>
                        <Input
                          id="port"
                          placeholder="Port"
                          value={formData.port}
                          onChange={(e) => handleInputChange('port', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Database Name */}
                    <div className="space-y-2">
                      <Label htmlFor="database">Database Name</Label>
                      <Input
                        id="database"
                        placeholder="Database name"
                        value={formData.database}
                        onChange={(e) => handleInputChange('database', e.target.value)}
                      />
                    </div>

                    {/* Username */}
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        placeholder="Database username"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                      />
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Database password"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Connection Status */}
                    {connectionStatus && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-lg border ${
                          connectionStatus.type === 'success'
                            ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200'
                            : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {connectionStatus.type === 'success' ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <AlertCircle className="h-4 w-4" />
                          )}
                          <span className="text-sm font-medium">{connectionStatus.message}</span>
                        </div>
                        {connectionStatus.type === 'error' && (
                          <div className="mt-2 text-xs opacity-80">
                            💡 Tip: Make sure your database server is running and accessible from this network.
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Help Text */}
                    {!connectionStatus && (
                      <div className="p-4 rounded-lg bg-muted/50 border border-border">
                        <div className="flex items-start gap-2">
                          <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                            <span className="text-xs text-primary font-bold">?</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <p className="font-medium mb-1">Connection Examples:</p>
                            <ul className="space-y-1 text-xs">
                              <li>• <strong>MySQL:</strong> Host: localhost, Port: 3306</li>
                              <li>• <strong>PostgreSQL:</strong> Host: localhost, Port: 5432</li>
                              <li>• <strong>Remote:</strong> Use your server's IP or domain name</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Submit Buttons */}
                    <div className="space-y-3">
                      <Button
                        type="submit"
                        variant="outline"
                        className="w-full gap-2"
                        disabled={isTesting || !formData.type || !formData.host || !formData.port || !formData.database || !formData.username || !formData.password}
                      >
                        {isTesting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Testing Connection...
                          </>
                        ) : (
                          <>
                            <Database className="h-4 w-4" />
                            Test Connection
                          </>
                        )}
                      </Button>

                      {testPassed && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Button
                            type="button"
                            onClick={handleConnect}
                            className="w-full gap-2"
                            disabled={isConnecting || !testPassed}
                          >
                            {isConnecting ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Connecting...
                              </>
                            ) : (
                              <>
                                <Database className="h-4 w-4" />
                                Connect to Database
                              </>
                            )}
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Info Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Encrypted Connection</p>
                      <p className="text-xs text-muted-foreground">All data is encrypted in transit</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">No Data Storage</p>
                      <p className="text-xs text-muted-foreground">Credentials are not stored on our servers</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Read-Only Access</p>
                      <p className="text-xs text-muted-foreground">Only SELECT queries are executed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Supported Databases
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {databaseTypes.map((db) => (
                    <div key={db.value} className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{db.label}</span>
                      {db.port && (
                        <Badge variant="outline" className="text-xs">
                          Port {db.port}
                        </Badge>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
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

export default ModernConnectPage;
