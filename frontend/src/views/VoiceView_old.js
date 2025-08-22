import React, { useState } from 'react';
import VoiceInput from '../components/VoiceInput';
import { Mic, Volume2, Brain, Waves, BarChart3 } from 'lucide-react';

const VoiceView = () => {
  const [transcription, setTranscription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [solution, setSolution] = useState(null);
  const [trainingStats, setTrainingStats] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

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
      }
    } catch (error) {
      console.error('Error searching samples:', error);
    }
  };

  React.useEffect(() => {
    fetchTrainingStats();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
            <Mic className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
            Voice Problem Solver
          </h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Speak your STEM problems and get AI-powered solutions with voice input enhanced by 13,101 speech training samples
        </p>
      </div>

      {/* Voice Input Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          Voice Input
        </h2>
        
        <VoiceInput 
          onTranscription={handleTranscription}
          isLoading={isLoading}
        />

        {/* Transcription Display */}
        {transcription && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">
              Transcription:
            </h3>
            <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border">
              <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                {transcription}
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={solveVoiceProblem}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Brain className="w-4 h-4" />
                {isLoading ? 'Solving...' : 'Solve Problem'}
              </button>
              
              <button
                onClick={searchSimilarSamples}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Waves className="w-4 h-4" />
                Find Similar Samples
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Training Statistics */}
      {trainingStats && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Voice Training Dataset Statistics
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 dark:text-blue-300">Total Samples</h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {trainingStats.total_samples?.toLocaleString()}
              </p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h3 className="font-medium text-green-800 dark:text-green-300">Vocabulary Size</h3>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {trainingStats.vocabulary_size?.toLocaleString()}
              </p>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <h3 className="font-medium text-purple-800 dark:text-purple-300">Avg Words/Sample</h3>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {trainingStats.avg_word_count?.toFixed(1)}
              </p>
            </div>
            
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <h3 className="font-medium text-orange-800 dark:text-orange-300">Enhancement</h3>
              <p className="text-sm font-bold text-orange-600 dark:text-orange-400">
                {trainingStats.enhancement_enabled ? '✅ Active' : '❌ Disabled'}
              </p>
            </div>
          </div>

          {trainingStats.common_words_top_10 && (
            <div className="mt-4">
              <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
                Most Common Words:
              </h4>
              <div className="flex flex-wrap gap-2">
                {trainingStats.common_words_top_10.map((word, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded text-sm"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">
            Similar Training Samples
          </h2>
          
          <div className="space-y-3">
            {searchResults.map((result, index) => (
              <div
                key={index}
                className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-mono text-slate-500 dark:text-slate-400">
                    {result.audio_id}
                  </span>
                  <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    {(result.similarity * 100).toFixed(1)}% match
                  </span>
                </div>
                <p className="text-slate-700 dark:text-slate-300">
                  {result.text}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {result.word_count} words
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Solution Display */}
      {solution && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">
            AI Solution
          </h2>
          
          {solution.success ? (
            <div className="space-y-4">
              {solution.solution && (
                <div>
                  <h3 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Solution:
                  </h3>
                  <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                      {solution.solution}
                    </p>
                  </div>
                </div>
              )}
              
              {solution.explanation && (
                <div>
                  <h3 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Explanation:
                  </h3>
                  <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                      {solution.explanation}
                    </p>
                  </div>
                </div>
              )}
              
              {solution.steps && solution.steps.length > 0 && (
                <div>
                  <h3 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Step-by-step Solution:
                  </h3>
                  <div className="space-y-2">
                    {solution.steps.map((step, index) => (
                      <div key={index} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <div className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <p className="text-slate-800 dark:text-slate-200">
                            {step}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400">
                Error: {solution.error || 'Failed to solve problem'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VoiceView;
