import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const StatusCheck = () => {
  const [backendStatus, setBackendStatus] = useState('checking');
  const [frontendStatus, setFrontendStatus] = useState('ok');

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch('http://localhost:5000/health');
        if (response.ok) {
          setBackendStatus('ok');
        } else {
          setBackendStatus('error');
        }
      } catch (error) {
        setBackendStatus('error');
      }
    };

    checkBackend();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'checking':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ok':
        return <Badge className="bg-green-100 text-green-800">Online</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Offline</Badge>;
      case 'checking':
        return <Badge className="bg-blue-100 text-blue-800">Checking...</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>System Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(frontendStatus)}
            <span>Frontend (React)</span>
          </div>
          {getStatusBadge(frontendStatus)}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(backendStatus)}
            <span>Backend (Express)</span>
          </div>
          {getStatusBadge(backendStatus)}
        </div>

        <div className="text-sm text-muted-foreground mt-4">
          <p><strong>Frontend:</strong> http://localhost:3000</p>
          <p><strong>Backend:</strong> http://localhost:5000</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusCheck;
