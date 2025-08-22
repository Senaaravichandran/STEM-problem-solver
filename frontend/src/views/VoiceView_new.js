import React, { useState } from 'react';
import VoiceInput from '../components/VoiceInput';
import SolutionRenderer from '../components/SolutionRenderer';
import { Button } from '../components/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Mic, Volume2, Brain, Waves, BarChart3, ChevronDown, ChevronUp, Copy, Download, Search } from 'lucide-react';

const VoiceView = () => {
  const [transcription, setTranscription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [solution, setSolution] = useState(null);
  const [trainingStats, setTrainingStats] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [activeTab, setActiveTab] = useState('input');
  const [isConfigCollapsed, setIsConfigCollapsed] = useState(false);

  const handleTranscription = (result) => {
    setTranscription(result.transcript);
    console.log('Transcription result:', result);
  };

  const solveVoiceProblem = async () => {
    if (!transcription.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/solve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          problem: transcription,
          subject: 'Mathematics',
          difficulty: 'Intermediate',
          showSteps: true,
          includeTheory: true,
          includeDiagrams: true
        }),
      });

      const result = await response.json();
      setSolution(result);
      setActiveTab('solution');
    } catch (error) {
      console.error('Error solving problem:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTrainingStats = async () => {
    try {
      const response = await fetch('/api/voice-training-stats');
      const result = await response.json();
      if (result.success) {
        setTrainingStats(result.stats);
      }
    } catch (error) {
      console.error('Error fetching training stats:', error);
    }
  };

  const searchSimilarSamples = async () => {
    if (!transcription.trim()) return;

    try {
      const response = await fetch('/api/voice-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: transcription,
          limit: 5
        }),
      });

      const result = await response.json();
      if (result.success) {
        setSearchResults(result.results);
        setActiveTab('analysis');
      }
    } catch (error) {
      console.error('Error searching samples:', error);
    }
  };

  const handleCopy = () => {
    if (solution?.solution) {
      navigator.clipboard.writeText(solution.solution);
    }
  };

  const handleDownload = () => {
    if (solution?.solution) {
      const blob = new Blob([`Voice Problem Solution\n\nProblem: ${transcription}\n\nSolution:\n${solution.solution}`], {
        type: 'text/plain',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `voice-solution-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  React.useEffect(() => {
    fetchTrainingStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-teal-900/20 dark:to-blue-900/20">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-teal-600 to-blue-600 rounded-full flex items-center justify-center">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
              Voice Problem Solver
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Speak your STEM problems and get AI-powered solutions with voice input enhanced by 13,101 speech training samples
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-1 shadow-lg border border-teal-100 dark:border-teal-800">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('input')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'input'
                    ? 'bg-gradient-to-r from-teal-600 to-blue-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Volume2 className="w-4 h-4" />
                  <span>Voice Input</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('solution')}
                disabled={!solution}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'solution' && solution
                    ? 'bg-gradient-to-r from-teal-600 to-blue-600 text-white shadow-md'
                    : solution
                    ? 'text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20'
                    : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Brain className="w-4 h-4" />
                  <span>Solution</span>
                  {solution && (
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  )}
                </div>
              </button>
              <button
                onClick={() => {
                  setActiveTab('analysis');
                  if (!trainingStats) fetchTrainingStats();
                }}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'analysis'
                    ? 'bg-gradient-to-r from-teal-600 to-blue-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>Analysis</span>
                  {(trainingStats || searchResults.length > 0) && (
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="w-full">
          {/* Voice Input Tab */}
          {activeTab === 'input' && (
            <Card className="w-full max-w-5xl mx-auto animate-fade-in">
              <CardHeader className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/30 dark:to-blue-800/30 border-b border-teal-200/50 dark:border-teal-700/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-teal-600 to-blue-600 rounded-lg flex items-center justify-center">
                      <Volume2 className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-teal-800 dark:text-teal-200">Voice Problem Input</span>
                  </CardTitle>
                  <button
                    onClick={() => setIsConfigCollapsed(!isConfigCollapsed)}
                    className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                  >
                    {isConfigCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                  </button>
                </div>
              </CardHeader>
              <CardContent className={`transition-all duration-300 ${isConfigCollapsed ? 'p-4' : 'p-8'}`}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column - Voice Input */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-teal-50 dark:bg-teal-900/20 rounded-xl p-6 space-y-4">
                      <h3 className="text-lg font-semibold text-teal-800 dark:text-teal-200">Speak Your Problem</h3>
                      
                      <VoiceInput 
                        onTranscription={handleTranscription}
                        isLoading={isLoading}
                      />

                      {/* Enhanced Instructions */}
                      <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Voice Input Tips</h4>
                        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                          <li>• Speak clearly and at a normal pace</li>
                          <li>• Include all mathematical symbols and numbers</li>
                          <li>• State the subject area if not obvious</li>
                          <li>• Use phrases like "solve for x" or "find the derivative"</li>
                        </ul>
                      </div>
                    </div>

                    {/* Transcription Display */}
                    {transcription && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">Transcription</h3>
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-600">
                          <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                            {transcription}
                          </p>
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                          <Button
                            onClick={solveVoiceProblem}
                            disabled={isLoading}
                            className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
                          >
                            <Brain className="w-4 h-4 mr-2" />
                            {isLoading ? 'Solving...' : 'Solve Problem'}
                          </Button>
                          
                          <Button
                            variant="outline"
                            onClick={searchSimilarSamples}
                            className="border-teal-200 dark:border-teal-600 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                          >
                            <Search className="w-4 h-4 mr-2" />
                            Find Similar Samples
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Quick Actions */}
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 rounded-xl p-6 space-y-6 text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-teal-600 to-blue-600 rounded-full flex items-center justify-center mx-auto">
                        <Mic className="w-8 h-8 text-white" />
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                          Voice Enhanced AI
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Advanced speech recognition trained on 13,000+ samples
                        </p>
                      </div>

                      {/* Quick Stats */}
                      {trainingStats && (
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                            <div className="font-semibold text-teal-600 dark:text-teal-400">
                              {trainingStats.total_samples?.toLocaleString()}
                            </div>
                            <div className="text-gray-600 dark:text-gray-400">Samples</div>
                          </div>
                          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                            <div className="font-semibold text-blue-600 dark:text-blue-400">
                              {trainingStats.vocabulary_size?.toLocaleString()}
                            </div>
                            <div className="text-gray-600 dark:text-gray-400">Vocabulary</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Example Phrases */}
                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-6 space-y-4">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Example Phrases</h4>
                      <div className="space-y-2 text-xs">
                        <div className="p-2 bg-teal-50 dark:bg-teal-900/20 rounded text-teal-700 dark:text-teal-300">
                          "Solve the equation x squared plus 3x minus 10 equals zero"
                        </div>
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-blue-700 dark:text-blue-300">
                          "Find the derivative of sine of x times cosine of x"
                        </div>
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded text-indigo-700 dark:text-indigo-300">
                          "What is the kinetic energy of a 2 kilogram object moving at 5 meters per second"
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Solution Tab */}
          {activeTab === 'solution' && solution && (
            <div className="w-full animate-fade-in">
              {/* Floating Action Bar */}
              <div className="sticky top-4 z-10 mb-6">
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl border border-teal-100 dark:border-teal-800 shadow-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Voice Solution Ready
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        From transcription: "{transcription.substring(0, 30)}..."
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        className="border-teal-200 dark:border-teal-600 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownload}
                        className="border-teal-200 dark:border-teal-600 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Solution Content */}
              <Card className="w-full">
                <CardHeader className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/30 dark:to-blue-800/30 border-b border-teal-200/50 dark:border-teal-700/50">
                  <div className="space-y-4">
                    <CardTitle className="flex items-center space-x-2 text-xl">
                      <div className="w-8 h-8 bg-gradient-to-r from-teal-600 to-blue-600 rounded-lg flex items-center justify-center">
                        <Brain className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-teal-800 dark:text-teal-200">AI Solution</span>
                    </CardTitle>
                    <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Voice Input:</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 italic">"{transcription}"</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  {solution.success ? (
                    <SolutionRenderer solution={solution.solution} />
                  ) : (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-red-600 dark:text-red-400">
                        Error: {solution.error || 'Failed to solve problem'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'solution' && !solution && (
            <Card className="w-full max-w-2xl mx-auto">
              <CardContent className="p-12">
                <div className="text-center space-y-4">
                  <Brain className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600" />
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                    No Solution Yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Speak your problem using voice input and solve it first.
                  </p>
                  <Button
                    onClick={() => setActiveTab('input')}
                    className="mt-4"
                  >
                    Go to Voice Input
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analysis Tab */}
          {activeTab === 'analysis' && (
            <div className="w-full space-y-6 animate-fade-in">
              {/* Training Statistics */}
              {trainingStats && (
                <Card className="w-full">
                  <CardHeader className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/30 dark:to-blue-800/30 border-b border-teal-200/50 dark:border-teal-700/50">
                    <CardTitle className="flex items-center space-x-2 text-xl">
                      <div className="w-8 h-8 bg-gradient-to-r from-teal-600 to-blue-600 rounded-lg flex items-center justify-center">
                        <BarChart3 className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-teal-800 dark:text-teal-200">Voice Training Dataset Statistics</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-teal-50 dark:bg-teal-900/20 p-6 rounded-xl">
                        <h3 className="font-medium text-teal-800 dark:text-teal-300">Total Samples</h3>
                        <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">
                          {trainingStats.total_samples?.toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl">
                        <h3 className="font-medium text-blue-800 dark:text-blue-300">Vocabulary Size</h3>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                          {trainingStats.vocabulary_size?.toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-xl">
                        <h3 className="font-medium text-indigo-800 dark:text-indigo-300">Avg Words/Sample</h3>
                        <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                          {trainingStats.avg_word_count?.toFixed(1)}
                        </p>
                      </div>
                      
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-xl">
                        <h3 className="font-medium text-purple-800 dark:text-purple-300">Enhancement</h3>
                        <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                          {trainingStats.enhancement_enabled ? '✅ Active' : '❌ Disabled'}
                        </p>
                      </div>
                    </div>

                    {trainingStats.common_words_top_10 && (
                      <div className="mt-8">
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-4">
                          Most Common Words in Training Data:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {trainingStats.common_words_top_10.map((word, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium"
                            >
                              {word}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Search Results */}
              {searchResults.length > 0 && (
                <Card className="w-full">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-800/30 border-b border-blue-200/50 dark:border-blue-700/50">
                    <CardTitle className="flex items-center space-x-2 text-xl">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                        <Waves className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-blue-800 dark:text-blue-200">Similar Training Samples</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="space-y-4">
                      {searchResults.map((result, index) => (
                        <div
                          key={index}
                          className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-600"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-sm font-mono text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 px-2 py-1 rounded">
                              {result.audio_id}
                            </span>
                            <span className="text-lg font-bold text-green-600 dark:text-green-400">
                              {(result.similarity * 100).toFixed(1)}% match
                            </span>
                          </div>
                          <p className="text-gray-800 dark:text-gray-200 mb-2">
                            {result.text}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {result.word_count} words
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Empty State */}
              {!trainingStats && searchResults.length === 0 && (
                <Card className="w-full max-w-2xl mx-auto">
                  <CardContent className="p-12">
                    <div className="text-center space-y-4">
                      <BarChart3 className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600" />
                      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                        No Analysis Data
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        Training statistics and sample search results will appear here.
                      </p>
                      <Button
                        onClick={fetchTrainingStats}
                        className="mt-4"
                      >
                        Load Training Stats
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceView;
