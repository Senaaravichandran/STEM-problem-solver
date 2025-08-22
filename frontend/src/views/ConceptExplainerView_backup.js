import React, { useState } from 'react';
import { Lightbulb, Loader2, Copy, Download, Share, Settings, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../components/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import SolutionRenderer from '../components/SolutionRenderer';
import { ApiService } from '../services/api';

const ConceptExplainerView = () => {
  const [concept, setConcept] = useState('');
  const [subject, setSubject] = useState('Physics');
  const [level, setLevel] = useState('intermediate');
  const [includeExamples, setIncludeExamples] = useState(true);
  const [includeHistory, setIncludeHistory] = useState(false);
  const [temperature, setTemperature] = useState(0.3);
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('input');
  const [isConfigCollapsed, setIsConfigCollapsed] = useState(false);

  const subjects = [
    'Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science'
  ];

  const levels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const handleExplain = async () => {
    if (!concept.trim()) {
      setError('Please enter a concept to explain');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await ApiService.explainConcept({
        concept,
        subject,
        level,
        includeExamples,
        includeHistory,
        temperature,
      });

      setExplanation(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (explanation?.explanation) {
      navigator.clipboard.writeText(explanation.explanation);
    }
  };

  const handleDownload = () => {
    if (explanation?.explanation) {
      const blob = new Blob([`Concept: ${concept}\n\nExplanation:\n${explanation.explanation}`], {
        type: 'text/plain',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `concept-explanation-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Concept Explainer
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Get detailed explanations of complex STEM concepts with examples and interactive learning
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-1 shadow-lg border border-blue-100 dark:border-blue-800">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('input')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'input'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Lightbulb className="w-4 h-4" />
                  <span>Concept Input</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('explanation')}
                disabled={!explanation}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'explanation' && explanation
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : explanation
                    ? 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                    : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Explanation</span>
                  {explanation && (
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="w-full">
          {activeTab === 'input' && (
            <Card className="w-full max-w-4xl mx-auto animate-fade-in">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-800/30 border-b border-blue-200/50 dark:border-blue-700/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                      <Lightbulb className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-blue-800 dark:text-blue-200">Concept Configuration</span>
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
                  {/* Left Column - Main Input */}
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                        What concept would you like explained?
                      </label>
                      <textarea
                        value={concept}
                        onChange={(e) => setConcept(e.target.value)}
                        placeholder="e.g., Quantum Entanglement, DNA Replication, Machine Learning, Photosynthesis..."
                        rows={4}
                        className="w-full p-4 border-2 border-blue-200 dark:border-blue-600 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg resize-none"
                      />
                    </div>
                    
                    <Button
                      onClick={handleExplain}
                      disabled={loading || !concept.trim()}
                      className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                          Explaining Concept...
                        </>
                      ) : (
                        <>
                          <Lightbulb className="h-6 w-6 mr-3" />
                          Explain Concept
                        </>
                      )}
                    </Button>

                    {error && (
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="font-semibold text-red-700 dark:text-red-400">Error</span>
                        </div>
                        <p className="mt-2 text-red-600 dark:text-red-400">{error}</p>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Configuration */}
                  {!isConfigCollapsed && (
                    <div className="space-y-6">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 space-y-6">
                        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 flex items-center space-x-2">
                          <Settings className="w-5 h-5" />
                          <span>Explanation Settings</span>
                        </h3>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-blue-700 dark:text-blue-300 block mb-2">Subject Area</label>
                            <select
                              value={subject}
                              onChange={(e) => setSubject(e.target.value)}
                              className="w-full p-3 border border-blue-200 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            >
                              {subjects.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-blue-700 dark:text-blue-300 block mb-2">Explanation Level</label>
                            <select
                              value={level}
                              onChange={(e) => setLevel(e.target.value)}
                              className="w-full p-3 border border-blue-200 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            >
                              {levels.map((l) => (
                                <option key={l.value} value={l.value}>{l.label}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-3">
                            <label className="text-sm font-medium text-blue-700 dark:text-blue-300 block">Options</label>
                            <div className="space-y-2">
                              <label className="flex items-center space-x-3">
                                <input
                                  type="checkbox"
                                  checked={includeExamples}
                                  onChange={(e) => setIncludeExamples(e.target.checked)}
                                  className="w-4 h-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Include practical examples</span>
                              </label>
                              <label className="flex items-center space-x-3">
                                <input
                                  type="checkbox"
                                  checked={includeHistory}
                                  onChange={(e) => setIncludeHistory(e.target.checked)}
                                  className="w-4 h-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Include historical context</span>
                              </label>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-blue-700 dark:text-blue-300">
                              Creativity Level: {temperature}
                            </label>
                            <input
                              type="range"
                              min="0.1"
                              max="1.0"
                              step="0.1"
                              value={temperature}
                              onChange={(e) => setTemperature(parseFloat(e.target.value))}
                              className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                              <span>Focused</span>
                              <span>Creative</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'explanation' && explanation && (
            <div className="w-full animate-fade-in">
              {/* Floating Action Bar */}
              <div className="sticky top-4 z-10 mb-6">
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl border border-blue-100 dark:border-blue-800 shadow-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Explanation Ready
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(explanation.metadata.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        className="border-blue-200 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownload}
                        className="border-blue-200 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-200 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        <Share className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Explanation Content */}
              <Card className="w-full">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-800/30 border-b border-blue-200/50 dark:border-blue-700/50">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <CardTitle className="flex items-center space-x-2 text-xl">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                          <Lightbulb className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-blue-800 dark:text-blue-200">Concept Explanation</span>
                      </CardTitle>
                      <div className="flex space-x-3">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {explanation.metadata.concept}
                        </span>
                        <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                          {explanation.metadata.level}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <SolutionRenderer solution={explanation.explanation} />
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'explanation' && !explanation && (
            <Card className="w-full max-w-2xl mx-auto">
              <CardContent className="p-12">
                <div className="text-center space-y-4">
                  <Lightbulb className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600" />
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                    No Explanation Yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Go back to the Concept Input tab to explain a concept first.
                  </p>
                  <Button
                    onClick={() => setActiveTab('input')}
                    className="mt-4"
                  >
                    Go to Input
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
        {/* Input Section */}
        <Card className="animate-slide-up">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-b border-blue-200/50 dark:border-blue-700/50">
            <CardTitle className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Lightbulb className="h-4 w-4 text-white" />
              </div>
              <span className="text-blue-800 dark:text-blue-200">Concept Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            {/* Concept Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-700 dark:text-blue-300">Concept</label>
              <input
                type="text"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="e.g., Quantum Entanglement, DNA Replication, Machine Learning"
                className="w-full p-3 border border-blue-200 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Subject Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-700 dark:text-blue-300">Subject Area</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-3 border border-blue-200 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                {subjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Level Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-700 dark:text-blue-300">Explanation Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full p-3 border border-blue-200 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                {levels.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300">Explanation Options</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={includeExamples}
                    onChange={(e) => setIncludeExamples(e.target.checked)}
                    className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">Include practical examples</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={includeHistory}
                    onChange={(e) => setIncludeHistory(e.target.checked)}
                    className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">Include historical context</span>
                </label>
              </div>
            </div>

            {/* Temperature Slider */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Creativity Level: {temperature}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full h-2 bg-blue-200 dark:bg-blue-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>More factual</span>
                <span>More creative</span>
              </div>
            </div>

            {/* Explain Button */}
            <Button
              onClick={handleExplain}
              disabled={loading || !concept.trim()}
              className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-blue-500/25"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Explaining...
                </>
              ) : (
                <>
                  <Lightbulb className="h-5 w-5 mr-2" />
                  Explain Concept
                </>
              )}
            </Button>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="font-medium">Error</span>
                </div>
                <p className="mt-1">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
};

export default ConceptExplainerView;
