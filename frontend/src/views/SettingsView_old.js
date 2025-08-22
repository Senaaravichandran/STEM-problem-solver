import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Palette, Bell, Lock, Database } from 'lucide-react';
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Customize your STEM problem solver experience
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* API Settings */}
        <Card className="animate-slide-up">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-b border-blue-200/50 dark:border-blue-700/50">
            <CardTitle className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Database className="h-4 w-4 text-white" />
              </div>
              <span className="text-blue-800 dark:text-blue-200">API Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
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
                onChange={(e) => handleSettingChange('apiTimeout', parseInt(e.target.value))}
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
          </CardContent>
        </Card>

        {/* UI Settings */}
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="h-5 w-5 mr-2" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Theme</label>
              <select
                value={settings.theme}
                onChange={(e) => handleSettingChange('theme', e.target.value)}
                className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              >
                <option value="system">System Default</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Font Size</label>
              <select
                value={settings.fontSize}
                onChange={(e) => handleSettingChange('fontSize', e.target.value)}
                className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={settings.showAnimations}
                  onChange={(e) => handleSettingChange('showAnimations', e.target.checked)}
                  className="rounded border-input"
                />
                <span>Enable animations</span>
              </label>

              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={settings.compactMode}
                  onChange={(e) => handleSettingChange('compactMode', e.target.checked)}
                  className="rounded border-input"
                />
                <span>Compact mode</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={settings.enableNotifications}
                onChange={(e) => handleSettingChange('enableNotifications', e.target.checked)}
                className="rounded border-input"
              />
              <span>Enable notifications</span>
            </label>

            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                className="rounded border-input"
              />
              <span>Sound alerts</span>
            </label>
          </CardContent>
        </Card>

        {/* Study Preferences */}
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle>Study Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Default Subject</label>
              <select
                value={settings.defaultSubject}
                onChange={(e) => handleSettingChange('defaultSubject', e.target.value)}
                className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
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
              <label className="text-sm font-medium">Default Learning Style</label>
              <select
                value={settings.defaultLearningStyle}
                onChange={(e) => handleSettingChange('defaultLearningStyle', e.target.value)}
                className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              >
                <option value="Visual">Visual</option>
                <option value="Auditory">Auditory</option>
                <option value="Reading/Writing">Reading/Writing</option>
                <option value="Kinesthetic">Kinesthetic</option>
                <option value="Not Sure">Not Sure</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Max History Items</label>
              <input
                type="number"
                min="10"
                max="500"
                value={settings.maxHistoryItems}
                onChange={(e) => handleSettingChange('maxHistoryItems', parseInt(e.target.value))}
                className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              />
              <p className="text-xs text-muted-foreground">
                Maximum number of items to keep in history
              </p>
            </div>

            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={settings.saveHistory}
                onChange={(e) => handleSettingChange('saveHistory', e.target.checked)}
                className="rounded border-input"
              />
              <span>Save problem history</span>
            </label>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card className="animate-slide-up lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="h-5 w-5 mr-2" />
              Privacy & Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={settings.allowDataCollection}
                  onChange={(e) => handleSettingChange('allowDataCollection', e.target.checked)}
                  className="rounded border-input"
                />
                <span>Allow data collection for improving the service</span>
              </label>

              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={settings.shareUsageStats}
                  onChange={(e) => handleSettingChange('shareUsageStats', e.target.checked)}
                  className="rounded border-input"
                />
                <span>Share anonymous usage statistics</span>
              </label>
            </div>

            <div className="pt-4 border-t border-border">
              <h4 className="text-sm font-medium mb-3">Data Management</h4>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={clearHistory}
                  className="text-sm"
                >
                  Clear History
                </Button>
                <Button
                  variant="outline"
                  className="text-sm"
                  disabled
                >
                  Export Data (Coming Soon)
                </Button>
                <Button
                  variant="outline"
                  className="text-sm"
                  disabled
                >
                  Delete Account (Coming Soon)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <Card className="animate-slide-up">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              onClick={handleSave}
              className="px-6"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              className="px-6"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
          </div>

          {savedMessage && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-200 text-center text-sm">
              {savedMessage}
            </div>
          )}

          <div className="mt-6 text-center text-xs text-muted-foreground">
            Settings are saved locally in your browser. Clear your browser data to reset all settings.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsView;
