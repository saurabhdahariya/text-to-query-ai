import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { Database, Lock, Server, User, Loader2, Shield, AlertCircle, Zap, CheckCircle, Eye, EyeOff } from "lucide-react";

const DatabaseConnectForm = ({ onConnect, isConnecting, connectionError }) => {
  const [formData, setFormData] = useState({
    host: "",
    port: "",
    username: "",
    password: "",
    database: "",
    dbType: "mysql"
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null); // 'success', 'error', null
  const [connectionMessage, setConnectionMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }

    // Clear connection status when form changes
    if (connectionStatus) {
      setConnectionStatus(null);
      setConnectionMessage("");
    }
  };

  const handleSelectChange = (value) => {
    setFormData(prev => ({
      ...prev,
      dbType: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Host validation
    if (!formData.host.trim()) {
      newErrors.host = "Host is required";
    } else if (formData.host.length > 255) {
      newErrors.host = "Host name is too long";
    }

    // Port validation
    if (!formData.port.trim()) {
      newErrors.port = "Port is required";
    } else if (!/^\d+$/.test(formData.port)) {
      newErrors.port = "Port must be a number";
    } else {
      const portNum = parseInt(formData.port);
      if (portNum < 1 || portNum > 65535) {
        newErrors.port = "Port must be between 1 and 65535";
      }
    }

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length > 63) {
      newErrors.username = "Username is too long";
    }

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    }

    // Database validation
    if (!formData.database.trim()) {
      newErrors.database = "Database name is required";
    } else if (formData.database.length > 63) {
      newErrors.database = "Database name is too long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTestConnection = async () => {
    if (!validateForm()) return;

    setIsTestingConnection(true);
    setConnectionStatus(null);
    setConnectionMessage("");

    try {
      // Import the API function
      const { databaseAPI } = await import('../services/api');
      const result = await databaseAPI.connect(formData);

      setConnectionStatus('success');
      setConnectionMessage(`Successfully connected to ${result.dbType} database "${result.database}" on ${result.host}`);

      // Disconnect immediately after test
      await databaseAPI.disconnect();

    } catch (error) {
      setConnectionStatus('error');
      setConnectionMessage(error.message || 'Failed to connect to database');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onConnect(formData);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Database className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">Connect Your Database</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Instructions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Setup Instructions
                </CardTitle>
                <CardDescription>
                  Follow these steps to securely connect your database
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Ensure Database Accessibility</h4>
                      <p className="text-sm text-muted-foreground">
                        Make sure your database is accessible from the internet or your network.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Configure Firewall</h4>
                      <p className="text-sm text-muted-foreground">
                        Allow external connections through your firewall for the database port.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Use Read-Only User</h4>
                      <p className="text-sm text-muted-foreground">
                        Create a read-only database user for safety. We only execute SELECT queries.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                      4
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Enter Credentials Securely</h4>
                      <p className="text-sm text-muted-foreground">
                        Use HTTPS and ensure your credentials are transmitted securely.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground mb-1">Your data stays secure</p>
                    <p className="text-muted-foreground">
                      We only execute read-only SELECT queries. Your credentials are stored temporarily in your session and never saved permanently.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Connection Form */}
          <div className="w-full animate-fade-in">
            <Card className="border-border/50">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                  <Database className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl font-bold">Database Connection</CardTitle>
                <CardDescription className="text-sm mt-2">
                  Enter your database credentials below
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="dbType" className="text-sm font-medium">
                Database Type
              </Label>
              <Select value={formData.dbType} onValueChange={handleSelectChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select database type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="postgresql">PostgreSQL</SelectItem>
                  <SelectItem value="mysql">MySQL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="host" className="text-sm font-medium">
                  Host
                </Label>
                <div className="relative">
                  <Server className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="host"
                    name="host"
                    type="text"
                    placeholder="localhost"
                    value={formData.host}
                    onChange={handleInputChange}
                    className={`pl-10 ${errors.host ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                </div>
                {errors.host && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    {errors.host}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="port" className="text-sm font-medium">
                  Port
                </Label>
                <Input
                  id="port"
                  name="port"
                  type="text"
                  placeholder={formData.dbType === 'postgresql' ? '5432' : '3306'}
                  value={formData.port}
                  onChange={handleInputChange}
                  className={errors.port ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                {errors.port && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    {errors.port}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`pl-10 ${errors.username ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
              </div>
              {errors.username && (
                <div className="flex items-center gap-1 text-sm text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {errors.username}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`pl-10 pr-10 ${errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center gap-1 text-sm text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="database" className="text-sm font-medium">
                Database Name
              </Label>
              <div className="relative">
                <Database className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="database"
                  name="database"
                  type="text"
                  placeholder="Enter database name"
                  value={formData.database}
                  onChange={handleInputChange}
                  className={`pl-10 ${errors.database ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
              </div>
              {errors.database && (
                <div className="flex items-center gap-1 text-sm text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {errors.database}
                </div>
              )}
            </div>

                  {/* Connection Status Alert */}
                  {connectionStatus && (
                    <Alert className={connectionStatus === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                      <div className="flex items-center gap-2">
                        {connectionStatus === 'success' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                        <AlertDescription className={connectionStatus === 'success' ? 'text-green-800' : 'text-red-800'}>
                          {connectionMessage}
                        </AlertDescription>
                      </div>
                    </Alert>
                  )}

                  {/* Connection Error from App */}
                  {connectionError && (
                    <Alert className="border-red-200 bg-red-50">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          {connectionError}
                        </AlertDescription>
                      </div>
                    </Alert>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 h-12 text-base font-medium"
                      disabled={isConnecting || isTestingConnection}
                      onClick={handleTestConnection}
                    >
                      {isTestingConnection ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2 h-4 w-4" />
                          Test Connection
                        </>
                      )}
                    </Button>

                    <Button
                      type="submit"
                      className="flex-1 h-12 text-base font-medium"
                      disabled={isConnecting || isTestingConnection}
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Database className="mr-2 h-4 w-4" />
                          Save & Connect
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseConnectForm;
