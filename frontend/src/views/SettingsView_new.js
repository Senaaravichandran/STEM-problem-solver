import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Palette, Database, Settings as SettingsIcon, ChevronDown, ChevronUp, Shield, User } from 'lucide-react';
import { Button } from '../components/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';

const SettingsView = () => {
  const [settings, setSettings] = useState({
    // API Settings
    apiKey: '',
    apiTimeout: 30,
    maxRetries: 3,
    
    // UI Settings
    theme: 'system',
    fontSize: 'medium',
    showAnimations: true,
    compactMode: false,
    
    // Notifications
    enableNotifications: true,
    soundEnabled: false,
    
    // Study Settings
    defaultSubject: 'General STEM',
    defaultLearningStyle: 'Visual',
    saveHistory: true,
    maxHistoryItems: 100,
    
    // Privacy
    allowDataCollection: false,
    shareUsageStats: false,
  });

  const [savedMessage, setSavedMessage] = useState('');
  const [activeTab, setActiveTab] = useState('api');
  const [isConfigCollapsed, setIsConfigCollapsed] = useState(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('cpSolverSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  }, []);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    try {
      localStorage.setItem('cpSolverSettings', JSON.stringify(settings));
      setSavedMessage('Settings saved successfully!');
      setTimeout(() => setSavedMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSavedMessage('Failed to save settings. Please try again.');
      setTimeout(() => setSavedMessage(''), 3000);
    }
  };

  const handleReset = () => {
    const defaultSettings = {
      apiKey: '',
      apiTimeout: 30,
      maxRetries: 3,
      theme: 'system',
      fontSize: 'medium',
      showAnimations: true,
      compactMode: false,
      enableNotifications: true,
      soundEnabled: false,
      defaultSubject: 'General STEM',
      defaultLearningStyle: 'Visual',
      saveHistory: true,
      maxHistoryItems: 100,
      allowDataCollection: false,
      shareUsageStats: false,
    };
    setSettings(defaultSettings);
    localStorage.removeItem('cpSolverSettings');
    setSavedMessage('Settings reset to defaults!');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  const clearHistory = () => {
    localStorage.removeItem('problemHistory');
    localStorage.removeItem('conceptHistory');
    localStorage.removeItem('formulaHistory');
    setSavedMessage('History cleared successfully!');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  const tabConfigs = [
    { id: 'api', label: 'API & Performance', icon: Database, color: 'blue' },
    { id: 'appearance', label: 'Appearance', icon: Palette, color: 'purple' },
    { id: 'study', label: 'Study Preferences', icon: User, color: 'green' },
    { id: 'privacy', label: 'Privacy & Data', icon: Shield, color: 'red' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900/20 dark:to-blue-900/20">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-slate-600 to-blue-600 rounded-full flex items-center justify-center">
              <SettingsIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-600 to-blue-600 bg-clip-text text-transparent">
              Settings
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Customize your STEM problem solver experience and preferences
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-1 shadow-lg border border-slate-100 dark:border-slate-800">
            <div className="flex space-x-1">
              {tabConfigs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? `bg-gradient-to-r from-${tab.color}-600 to-${tab.color}-700 text-white shadow-md`
                        : `text-gray-600 dark:text-gray-400 hover:text-${tab.color}-600 dark:hover:text-${tab.color}-400 hover:bg-${tab.color}-50 dark:hover:bg-${tab.color}-900/20`
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="w-full">
          {/* API & Performance Tab */}
          {activeTab === 'api' && (
            <Card className="w-full max-w-4xl mx-auto animate-fade-in">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-800/30 border-b border-blue-200/50 dark:border-blue-700/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                      <Database className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-blue-800 dark:text-blue-200">API & Performance Configuration</span>
                  </CardTitle>
                  <button
                    onClick={() => setIsConfigCollapsed(!isConfigCollapsed)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    {isConfigCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                  </button>
                </div>
              </CardHeader>
              <CardContent className={`transition-all duration-300 ${isConfigCollapsed ? 'p-4' : 'p-8'}`}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 space-y-4">
                      <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">API Configuration</h3>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-blue-700 dark:text-blue-300">API Key</label>
                        <input
                          type="password"
                          value={settings.apiKey}
                          onChange={(e) => handleSettingChange('apiKey', e.target.value)}
                          placeholder="Enter your API key"
                          className="w-full p-3 border border-blue-200 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          API key for accessing AI services (kept locally)
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-blue-700 dark:text-blue-300">API Timeout (seconds)</label>
                        <input
                          type="number"
                          min="5"
                          max="120"
                          value={settings.apiTimeout}
                          onChange={(e) => handleSettingChange('apiTimeout', parseInt(e.target.value) || 30)}
                          className="w-full p-3 border border-blue-200 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          How long to wait for API responses (5-120 seconds)
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-blue-700 dark:text-blue-300">Max Retries</label>
                        <select
                          value={settings.maxRetries}
                          onChange={(e) => handleSettingChange('maxRetries', parseInt(e.target.value))}
                          className="w-full p-3 border border-blue-200 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        >
                          <option value={1}>1 retry</option>
                          <option value={2}>2 retries</option>
                          <option value={3}>3 retries</option>
                          <option value={5}>5 retries</option>
                        </select>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Number of times to retry failed API requests
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6 space-y-4">
                      <h3 className="text-lg font-semibold text-indigo-800 dark:text-indigo-200">Performance Tips</h3>
                      <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                          <span>Lower timeout values for faster responses but higher chance of timeouts</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                          <span>Higher retry counts improve reliability but increase wait times</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5"></div>
                          <span>API keys are stored locally and never sent to our servers</span>
                        </div>
                      </div>
                    </div>

                    {/* Current Status */}
                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-6 space-y-4">
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Current Configuration</h3>
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">API Key:</span>
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {settings.apiKey ? '•••••••••' : 'Not set'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Timeout:</span>
                          <span className="font-medium text-blue-600 dark:text-blue-400">{settings.apiTimeout}s</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Max Retries:</span>
                          <span className="font-medium text-indigo-600 dark:text-indigo-400">{settings.maxRetries}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <Card className="w-full max-w-4xl mx-auto animate-fade-in">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-800/30 border-b border-purple-200/50 dark:border-purple-700/50">
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                    <Palette className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-purple-800 dark:text-purple-200">Appearance & Interface</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 space-y-4">
                      <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200">Theme & Display</h3>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-purple-700 dark:text-purple-300">Theme</label>
                        <select
                          value={settings.theme}
                          onChange={(e) => handleSettingChange('theme', e.target.value)}
                          className="w-full p-3 border border-purple-200 dark:border-purple-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                        >
                          <option value="system">System Default</option>
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-purple-700 dark:text-purple-300">Font Size</label>
                        <select
                          value={settings.fontSize}
                          onChange={(e) => handleSettingChange('fontSize', e.target.value)}
                          className="w-full p-3 border border-purple-200 dark:border-purple-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                        >
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-pink-50 dark:bg-pink-900/20 rounded-xl p-6 space-y-4">
                      <h3 className="text-lg font-semibold text-pink-800 dark:text-pink-200">Interface Options</h3>
                      
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors">
                          <input
                            type="checkbox"
                            checked={settings.showAnimations}
                            onChange={(e) => handleSettingChange('showAnimations', e.target.checked)}
                            className="w-4 h-4 rounded border-pink-300 text-pink-600 focus:ring-pink-500"
                          />
                          <div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable animations</span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Smooth transitions and animations</p>
                          </div>
                        </label>

                        <label className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors">
                          <input
                            type="checkbox"
                            checked={settings.compactMode}
                            onChange={(e) => handleSettingChange('compactMode', e.target.checked)}
                            className="w-4 h-4 rounded border-pink-300 text-pink-600 focus:ring-pink-500"
                          />
                          <div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Compact mode</span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Reduced spacing and smaller elements</p>
                          </div>
                        </label>

                        <label className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors">
                          <input
                            type="checkbox"
                            checked={settings.enableNotifications}
                            onChange={(e) => handleSettingChange('enableNotifications', e.target.checked)}
                            className="w-4 h-4 rounded border-pink-300 text-pink-600 focus:ring-pink-500"
                          />
                          <div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable notifications</span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Browser notifications for updates</p>
                          </div>
                        </label>

                        <label className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors">
                          <input
                            type="checkbox"
                            checked={settings.soundEnabled}
                            onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                            className="w-4 h-4 rounded border-pink-300 text-pink-600 focus:ring-pink-500"
                          />
                          <div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sound alerts</span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Audio notifications and sounds</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-6 space-y-4">
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Preview</h3>
                      <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
                        <div className={`space-y-3 ${settings.fontSize === 'small' ? 'text-sm' : settings.fontSize === 'large' ? 'text-lg' : 'text-base'}`}>
                          <h4 className="font-semibold">Sample Content</h4>
                          <p className="text-gray-600 dark:text-gray-400">
                            This is how text will appear with your current settings.
                          </p>
                          <div className={`${settings.compactMode ? 'p-2' : 'p-4'} bg-blue-50 dark:bg-blue-900/20 rounded border transition-all ${settings.showAnimations ? 'duration-200' : ''}`}>
                            Compact mode: {settings.compactMode ? 'Enabled' : 'Disabled'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Study Preferences Tab */}
          {activeTab === 'study' && (
            <Card className="w-full max-w-4xl mx-auto animate-fade-in">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-800/30 border-b border-green-200/50 dark:border-green-700/50">
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-green-800 dark:text-green-200">Study Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 space-y-4">
                      <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">Default Preferences</h3>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-green-700 dark:text-green-300">Default Subject</label>
                        <select
                          value={settings.defaultSubject}
                          onChange={(e) => handleSettingChange('defaultSubject', e.target.value)}
                          className="w-full p-3 border border-green-200 dark:border-green-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                        >
                          <option value="General STEM">General STEM</option>
                          <option value="Physics">Physics</option>
                          <option value="Chemistry">Chemistry</option>
                          <option value="Mathematics">Mathematics</option>
                          <option value="Biology">Biology</option>
                          <option value="Computer Science">Computer Science</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-green-700 dark:text-green-300">Default Learning Style</label>
                        <select
                          value={settings.defaultLearningStyle}
                          onChange={(e) => handleSettingChange('defaultLearningStyle', e.target.value)}
                          className="w-full p-3 border border-green-200 dark:border-green-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                        >
                          <option value="Visual">Visual</option>
                          <option value="Auditory">Auditory</option>
                          <option value="Reading/Writing">Reading/Writing</option>
                          <option value="Kinesthetic">Kinesthetic</option>
                          <option value="Not Sure">Not Sure</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-6 space-y-4">
                      <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">History Settings</h3>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Max History Items</label>
                        <input
                          type="number"
                          min="10"
                          max="500"
                          value={settings.maxHistoryItems}
                          onChange={(e) => handleSettingChange('maxHistoryItems', parseInt(e.target.value) || 100)}
                          className="w-full p-3 border border-emerald-200 dark:border-emerald-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        />
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Maximum number of items to keep in history (10-500)
                        </p>
                      </div>

                      <label className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors">
                        <input
                          type="checkbox"
                          checked={settings.saveHistory}
                          onChange={(e) => handleSettingChange('saveHistory', e.target.checked)}
                          className="w-4 h-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Save problem history</span>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Keep track of solved problems and concepts</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-6 space-y-4">
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Learning Style Guide</h3>
                      <div className="space-y-3 text-sm">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="font-medium text-blue-800 dark:text-blue-200">Visual</div>
                          <div className="text-blue-600 dark:text-blue-400">Learn through diagrams, charts, and visual aids</div>
                        </div>
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <div className="font-medium text-purple-800 dark:text-purple-200">Auditory</div>
                          <div className="text-purple-600 dark:text-purple-400">Learn through listening and verbal explanations</div>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="font-medium text-green-800 dark:text-green-200">Reading/Writing</div>
                          <div className="text-green-600 dark:text-green-400">Learn through text-based materials and note-taking</div>
                        </div>
                        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                          <div className="font-medium text-orange-800 dark:text-orange-200">Kinesthetic</div>
                          <div className="text-orange-600 dark:text-orange-400">Learn through hands-on practice and examples</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-6 space-y-4">
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Data Management</h3>
                      <div className="space-y-3">
                        <Button
                          variant="outline"
                          onClick={clearHistory}
                          className="w-full justify-start text-sm border-red-200 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                          Clear All History
                        </Button>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          This will remove all saved problems, concepts, and formulas from your history.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Privacy & Data Tab */}
          {activeTab === 'privacy' && (
            <Card className="w-full max-w-4xl mx-auto animate-fade-in">
              <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/30 dark:to-pink-800/30 border-b border-red-200/50 dark:border-red-700/50">
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg flex items-center justify-center">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-red-800 dark:text-red-200">Privacy & Data Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 space-y-4">
                      <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Privacy Settings</h3>
                      
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors">
                          <input
                            type="checkbox"
                            checked={settings.allowDataCollection}
                            onChange={(e) => handleSettingChange('allowDataCollection', e.target.checked)}
                            className="w-4 h-4 rounded border-red-300 text-red-600 focus:ring-red-500"
                          />
                          <div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Allow data collection</span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Help improve the service through anonymous usage data</p>
                          </div>
                        </label>

                        <label className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors">
                          <input
                            type="checkbox"
                            checked={settings.shareUsageStats}
                            onChange={(e) => handleSettingChange('shareUsageStats', e.target.checked)}
                            className="w-4 h-4 rounded border-red-300 text-red-600 focus:ring-red-500"
                          />
                          <div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Share usage statistics</span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Anonymous analytics to improve user experience</p>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="bg-pink-50 dark:bg-pink-900/20 rounded-xl p-6 space-y-4">
                      <h3 className="text-lg font-semibold text-pink-800 dark:text-pink-200">Data Storage</h3>
                      <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                          <span>All settings and history are stored locally in your browser</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                          <span>API keys never leave your device</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5"></div>
                          <span>No personal data is transmitted to our servers</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5"></div>
                          <span>Clear browser data to remove all stored information</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-6 space-y-4">
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Data Management Actions</h3>
                      <div className="space-y-3">
                        <Button
                          variant="outline"
                          onClick={clearHistory}
                          className="w-full justify-start text-sm"
                        >
                          Clear History
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-sm"
                          disabled
                        >
                          Export Data (Coming Soon)
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-sm"
                          disabled
                        >
                          Delete Account (Coming Soon)
                        </Button>
                      </div>
                    </div>

                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-6 space-y-4">
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Privacy Policy</h3>
                      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                        <p>We are committed to protecting your privacy. This application:</p>
                        <ul className="space-y-1 ml-4">
                          <li>• Stores all data locally on your device</li>
                          <li>• Does not collect personal information</li>
                          <li>• Uses HTTPS for all communications</li>
                          <li>• Allows you to control all data sharing preferences</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Floating Action Bar */}
        <div className="sticky bottom-6 z-10">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl border border-slate-100 dark:border-slate-800 shadow-lg p-4 max-w-md mx-auto">
            <div className="flex items-center justify-center space-x-3">
              <Button
                onClick={handleSave}
                className="px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                className="px-6 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/20"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>

            {savedMessage && (
              <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-200 text-center text-sm">
                {savedMessage}
              </div>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          Settings are saved locally in your browser. Clear your browser data to reset all settings.
          Your privacy is protected - no personal data is transmitted to our servers.
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
