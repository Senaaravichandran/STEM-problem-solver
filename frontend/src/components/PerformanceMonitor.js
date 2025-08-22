import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const PerformanceMonitor = () => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('http://localhost:5000/health');
        const data = await response.json();
        setHealthData(data);
      } catch (error) {
        console.error('Health check failed:', error);
        setHealthData({ status: 'error', error: error.message });
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Activity className="h-4 w-4 text-blue-500 animate-spin" />
          <span className="text-sm text-gray-600 dark:text-gray-300">Checking status...</span>
        </div>
      </div>
    );
  }

  if (!healthData || healthData.status === 'error') {
    return (
      <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 border border-red-200 dark:border-red-700">
        <div className="flex items-center space-x-2">
          <XCircle className="h-4 w-4 text-red-500" />
          <span className="text-sm text-red-600 dark:text-red-400">Backend Offline</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700 max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-white">System Status</h3>
        <div className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(healthData.status)}`}>
          {healthData.status.toUpperCase()}
        </div>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-300">Response Time</span>
          <span className="font-mono text-gray-900 dark:text-white">
            {healthData.response_time_ms}ms
          </span>
        </div>
        
        {healthData.services && (
          <div className="space-y-1">
            {Object.entries(healthData.services).map(([service, data]) => (
              <div key={service} className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300 capitalize">
                  {service.replace('_', ' ')}
                </span>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(data.status)}
                  <span className="text-xs">{data.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="pt-2 border-t border-gray-200 dark:border-gray-600 text-xs text-gray-500 dark:text-gray-400">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;
