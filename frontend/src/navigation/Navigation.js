import React, { useState, useEffect } from 'react';
import { Menu, X, Brain, Calculator, BookOpen, Lightbulb, Settings, Wifi, WifiOff, Sparkles, TrendingUp, Award, Zap, Image, Mic } from 'lucide-react';

import { Button } from '../components/Button';
import { cn } from '../lib/utils';
import { ApiService } from '../services/api';

const Navigation = ({ currentView, onViewChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const menuItems = [
    { id: 'solver', label: 'Problem Solver', icon: Brain },
    { id: 'voice', label: 'Voice Input', icon: Mic },
    { id: 'explainer', label: 'Concept Explainer', icon: Lightbulb },
    { id: 'formulas', label: 'Formula Reference', icon: Calculator },
    { id: 'study', label: 'Study Tips', icon: BookOpen },
    { id: 'images', label: 'AI Images', icon: Image },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const checkConnection = async () => {
    try {
      await ApiService.healthCheck();
      setIsConnected(true);
    } catch (error) {
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleViewChange = (viewId) => {
    onViewChange(viewId);
    setIsOpen(false);
  };

  const ConnectionStatus = () => (
    <div className={cn(
      "flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all",
      isChecking 
        ? "bg-yellow-50 text-yellow-700 border border-yellow-200" 
        : isConnected 
          ? "bg-green-50 text-green-700 border border-green-200" 
          : "bg-red-50 text-red-700 border border-red-200"
    )}>
      {isChecking ? (
        <>
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
          <span>Checking...</span>
        </>
      ) : isConnected ? (
        <>
          <Wifi className="h-3 w-3" />
          <span>Connected</span>
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          <span>Disconnected</span>
        </>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="glass shadow-medium"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Connection Status - Mobile Top Bar */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <ConnectionStatus />
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 h-full w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50 z-40 transform transition-all duration-300 ease-in-out shadow-2xl",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0 lg:relative lg:z-0"
      )}>
        <div className="flex flex-col h-full relative overflow-hidden">
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5 pointer-events-none" />
          
          {/* Header */}
          <div className="relative p-6 border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-slate-800/50 dark:to-blue-900/50">
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Brain className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  STEM Solver
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">AI-Powered Learning Assistant</p>
              </div>
            </div>
            
            {/* Stats cards */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-lg p-3 border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Active</span>
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">24/7</div>
              </div>
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-lg p-3 border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Speed</span>
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">Fast</div>
              </div>
            </div>
            
            {/* Connection Status - Desktop */}
            <div className="hidden lg:block">
              <ConnectionStatus />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <div className="mb-3">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 mb-2">
                Tools
              </h3>
            </div>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleViewChange(item.id)}
                  className={cn(
                    "w-full flex items-center space-x-4 px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden",
                    isActive
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 transform scale-[0.98]"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70 hover:transform hover:scale-[0.98]"
                  )}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-500/20 animate-pulse" />
                  )}
                  <div className={cn(
                    "relative z-10 p-2 rounded-lg transition-all",
                    isActive 
                      ? "bg-white/20" 
                      : "bg-slate-100 dark:bg-slate-700 group-hover:bg-slate-200 dark:group-hover:bg-slate-600"
                  )}>
                    <Icon className={cn(
                      "h-5 w-5 transition-transform group-hover:scale-110",
                      isActive && "text-white"
                    )} />
                  </div>
                  <div className="relative z-10 flex-1 text-left">
                    <div className={cn(
                      "font-semibold text-sm",
                      isActive && "text-white"
                    )}>
                      {item.label}
                    </div>
                    <div className={cn(
                      "text-xs opacity-75",
                      isActive ? "text-blue-100" : "text-slate-500 dark:text-slate-400"
                    )}>
                      {item.id === 'solver' && "Solve complex problems"}
                      {item.id === 'explainer' && "Learn new concepts"}
                      {item.id === 'formulas' && "Quick reference guide"}
                      {item.id === 'study' && "Improve your study habits"}
                      {item.id === 'settings' && "Customize your experience"}
                    </div>
                  </div>
                  {isActive && (
                    <div className="relative z-10">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse shadow-sm" />
                    </div>
                  )}
                </button>
              );
            })}
            
            {/* Quick Actions */}
            <div className="mt-8">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 mb-3">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-all text-sm">
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Example</span>
                </button>
                <button className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-all text-sm">
                  <Award className="h-4 w-4" />
                  <span>View Progress</span>
                </button>
              </div>
            </div>
          </nav>

          {/* Footer */}
          <div className="relative p-6 border-t border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-slate-50/50 to-blue-50/50 dark:from-slate-800/50 dark:to-slate-700/50">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-blue-900 rounded-xl p-4 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                  <Brain className="h-4 w-4 text-white" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">Powered by Mistral AI</span>
                  <div className="flex items-center space-x-1 mt-0.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs text-slate-600 dark:text-slate-400">Online</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Advanced AI technology for enhanced STEM learning and problem-solving with real-time assistance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navigation;
