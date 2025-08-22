import React, { useState } from 'react';
import { Send, Loader2, Download, Share, Copy, Brain, Image, FileText, History, ChevronDown, ChevronUp, BookOpen, Target, Lightbulb } from 'lucide-react';
import { Button } from '../components/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import VoiceInputButton from '../components/VoiceInputButton';
import SolutionRenderer from '../components/SolutionRenderer';
import { ApiService } from '../services/api';

const ProblemSolverView = () => {
  const [problem, setProblem] = useState('');
  const [subject, setSubject] = useState('Physics');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [showSteps, setShowSteps] = useState(true);
  const [includeTheory, setIncludeTheory] = useState(true);
  const [includeDiagrams, setIncludeDiagrams] = useState(true);
  const [temperature, setTemperature] = useState(0.2);
  const [solution, setSolution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('solve');
  const [activeTab, setActiveTab] = useState('problem');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const subjects = [
    'Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science'
  ];

  const difficultyLevels = [
    'Beginner', 'Intermediate', 'Advanced', 'University', 'Graduate'
  ];

  const handleVoiceTranscription = (transcription) => {
    setProblem(transcription);
    setTimeout(() => {
      handleSolve();
    }, 500);
  };

  const handleSolve = async () => {
    if (!problem.trim()) {
      setError('Please enter a problem to solve');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === 'generate-image') {
        const response = await fetch('http://localhost:5000/api/generate-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: problem,
            context: `Educational ${subject} content`,
            size: '512x512',
            quality: 'standard',
            style: 'educational'
          }),
        });

        const data = await response.json();

        if (data.success) {
          setSolution({
            solution: `Generated Image: ${problem}`,
            imageUrl: data.image_url,
            model: data.model,
            revisedPrompt: data.enhanced_prompt || data.revised_prompt,
            metadata: {
              ...data.metadata,
              type: 'image',
              subject: subject,
              difficulty: difficulty,
              processing_time: data.processing_time,
              timestamp: Date.now()
            }
          });
          setActiveTab('solution');
        } else {
          setError(data.error || 'Failed to generate image');
        }
      } else {
        const response = await ApiService.solveProblem({
          problem,
          subject,
          difficulty,
          showSteps,
          includeTheory,
          includeDiagrams,
          temperature,
        });

        setSolution(response);
        setActiveTab('solution');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (solution?.solution) {
      if (solution.metadata?.type === 'image') {
        const imageDetails = `Generated Image

Original Prompt: ${problem}

${solution.revisedPrompt ? `Enhanced Prompt: ${solution.revisedPrompt}` : ''}

Image URL: ${solution.imageUrl}

Model: ${solution.model}
Generated on: ${new Date(solution.metadata.timestamp).toLocaleString()}`;
        navigator.clipboard.writeText(imageDetails);
      } else {
        navigator.clipboard.writeText(solution.solution);
      }
    }
  };

  const handleDownload = () => {
    if (solution?.solution) {
      if (solution.metadata?.type === 'image') {
        const link = document.createElement('a');
        link.href = solution.imageUrl;
        link.download = `generated-image-${Date.now()}.png`;
        link.click();
      } else {
        const blob = new Blob([`Problem: ${problem}\n\nSolution:\n${solution.solution}`], {
          type: 'text/plain',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `solution-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex-shrink-0 text-center space-y-2 mb-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-800 via-blue-600 to-blue-400 bg-clip-text text-transparent">
          Problem Solver
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Get step-by-step solutions to complex STEM problems with AI assistance
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex-shrink-0 mb-6">
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('problem')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'problem'
                ? 'bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-300 shadow-md border border-blue-200 dark:border-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Problem</span>
          </button>
          <button
            onClick={() => setActiveTab('solution')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'solution'
                ? 'bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-300 shadow-md border border-blue-200 dark:border-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            <Brain className="h-4 w-4" />
            <span>Solution</span>
            {solution && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'notes'
                ? 'bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-300 shadow-md border border-blue-200 dark:border-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Notes</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'history'
                ? 'bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-300 shadow-md border border-blue-200 dark:border-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            <History className="h-4 w-4" />
            <span>History</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0">
        {activeTab === 'problem' && (
          <div className="h-full">
            <div className={`transition-all duration-300 ${solution ? 'grid lg:grid-cols-3 gap-6' : 'max-w-4xl mx-auto'}`}>
              {/* Problem Input Panel */}
              <div className={`${solution ? 'lg:col-span-1' : 'w-full'}`}>
                <Card className="h-full animate-slide-up">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-b border-blue-200/50 dark:border-blue-700/50">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                          <Send className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-blue-800 dark:text-blue-200">Problem Details</span>
                      </div>
                      {solution && (
                        <button
                          onClick={() => setIsCollapsed(!isCollapsed)}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                        </button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className={`${isCollapsed ? 'hidden' : 'block'} space-y-4 p-6`}>
                    {/* Mode Selector */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 backdrop-blur rounded-lg p-6 border border-blue-200/50 dark:border-blue-700/50">
                      <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">
                        Select Mode
                      </h3>
                      <div className="flex space-x-4">
                        <button
                          onClick={() => setMode('solve')}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                            mode === 'solve'
                              ? 'bg-blue-600 text-white shadow-lg border border-blue-500'
                              : 'bg-blue-100 dark:bg-blue-800/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-700/40 border border-blue-300 dark:border-blue-600'
                          }`}
                        >
                          <Brain size={20} />
                          <span>Solve Problem</span>
                        </button>
                        <button
                          onClick={() => setMode('generate-image')}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                            mode === 'generate-image'
                              ? 'bg-blue-600 text-white shadow-lg border border-blue-500'
                              : 'bg-blue-100 dark:bg-blue-800/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-700/40 border border-blue-300 dark:border-blue-600'
                          }`}
                        >
                          <Image size={20} />
                          <span>Generate Image</span>
                        </button>
                      </div>
                    </div>

                    {/* Subject and Difficulty */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-blue-700 dark:text-blue-300">Subject</label>
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
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-blue-700 dark:text-blue-300">Difficulty</label>
                        <select
                          value={difficulty}
                          onChange={(e) => setDifficulty(e.target.value)}
                          className="w-full p-3 border border-blue-200 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        >
                          {difficultyLevels.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Problem Input */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-blue-700 dark:text-blue-300">
                          {mode === 'generate-image' ? 'Image Generation Prompt' : 'Problem Statement'}
                        </label>
                        <VoiceInputButton 
                          onTranscription={handleVoiceTranscription}
                          isLoading={loading}
                        />
                      </div>
                      <textarea
                        value={problem}
                        onChange={(e) => setProblem(e.target.value)}
                        placeholder={mode === 'generate-image' 
                          ? "Describe the image you want to generate..."
                          : "Enter your problem here or use the microphone..."
                        }
                        rows={6}
                        className="w-full p-3 border border-blue-200 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                      />
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300">Solution Options</h4>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={showSteps}
                            onChange={(e) => setShowSteps(e.target.checked)}
                            className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm">Show detailed steps</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={includeTheory}
                            onChange={(e) => setIncludeTheory(e.target.checked)}
                            className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm">Include theoretical explanations</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={includeDiagrams}
                            onChange={(e) => setIncludeDiagrams(e.target.checked)}
                            className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm">Suggest diagrams where applicable</span>
                        </label>
                      </div>
                    </div>

                    {/* Temperature Slider */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        Model Temperature: {temperature}
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
                        <span>More focused</span>
                        <span>More creative</span>
                      </div>
                    </div>

                    {/* Solve Button */}
                    <Button
                      onClick={handleSolve}
                      disabled={loading || !problem.trim()}
                      className={`w-full h-12 text-lg transition-all duration-200 shadow-lg ${
                        mode === 'generate-image'
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25'
                          : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-blue-500/25'
                      }`}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          {mode === 'generate-image' ? 'Generating...' : 'Solving...'}
                        </>
                      ) : (
                        <>
                          {mode === 'generate-image' ? (
                            <>
                              <Image className="h-5 w-5 mr-2" />
                              Generate Image
                            </>
                          ) : (
                            <>
                              <Send className="h-5 w-5 mr-2" />
                              Solve Problem
                            </>
                          )}
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

              {/* Solution Preview Panel */}
              {solution && (
                <div className="lg:col-span-2">
                  <Card className="h-full animate-slide-up">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-800/30 border-b border-blue-200/50 dark:border-blue-700/50">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-2">
                          <Brain className="h-5 w-5 text-blue-600" />
                          <span className="text-blue-800 dark:text-blue-200">Solution Preview</span>
                        </CardTitle>
                        <Button
                          onClick={() => setActiveTab('solution')}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          View Full Solution
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Solution Metadata */}
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-800/20 rounded-lg border border-blue-200/50 dark:border-blue-700/50">
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span>
                              {solution.metadata?.type === 'image' ? 'Generated' : 'Solved'} on {new Date(solution.metadata.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 text-sm">
                            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full font-medium border border-blue-200 dark:border-blue-700">
                              {solution.metadata.subject}
                            </span>
                            <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full font-medium border border-indigo-200 dark:border-indigo-700">
                              {solution.metadata?.type === 'image' ? 'AI Generated Image' : solution.metadata.difficulty}
                            </span>
                          </div>
                        </div>

                        {/* Solution Preview Content */}
                        <div className="overflow-y-auto custom-scrollbar max-h-80">
                          {solution.metadata?.type === 'image' ? (
                            <div className="text-center">
                              <img 
                                src={solution.imageUrl} 
                                alt={solution.revisedPrompt || problem}
                                className="w-full max-w-lg mx-auto rounded-lg shadow-lg"
                                style={{ maxHeight: '300px', objectFit: 'contain' }}
                              />
                              <p className="mt-4 text-gray-600 dark:text-gray-400">
                                Click "View Full Solution" to see details and enhanced prompt
                              </p>
                            </div>
                          ) : (
                            <SolutionRenderer solution={solution.solution.length > 500 ? 
                              solution.solution.substring(0, 500) + '...\n\n*Click "View Full Solution" to see the complete solution*' : 
                              solution.solution
                            } />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Solution Tab - Full Width */}
        {activeTab === 'solution' && (
          <div className="h-full">
            {solution ? (
              <Card className="h-full animate-slide-up">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-800/30 border-b border-blue-200/50 dark:border-blue-700/50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Brain className="h-6 w-6 text-blue-600" />
                      <span className="text-xl text-blue-800 dark:text-blue-200">Detailed Solution</span>
                    </CardTitle>
                    <div className="flex space-x-3">
                      <Button
                        variant="outline"
                        onClick={handleCopy}
                        className="hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-600 text-blue-600 dark:text-blue-400"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Solution
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleDownload}
                        className="hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-600 text-blue-600 dark:text-blue-400"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        className="hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-600 text-blue-600 dark:text-blue-400"
                      >
                        <Share className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="max-w-5xl mx-auto space-y-6">
                    {/* Enhanced Solution Display */}
                    {solution.metadata?.type === 'image' ? (
                      <div className="space-y-6">
                        {/* Generated Image Display */}
                        <div className="text-center">
                          <img 
                            src={solution.imageUrl} 
                            alt={solution.revisedPrompt || problem}
                            className="max-w-full mx-auto rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700"
                            style={{ maxHeight: '600px', objectFit: 'contain' }}
                          />
                        </div>
                        
                        {/* Image Details Cards */}
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="solution-content-block">
                            <h4 className="font-bold text-gray-900 dark:text-gray-900 mb-3 flex items-center">
                              <Target className="solution-checkmark" />
                              Original Prompt
                            </h4>
                            <p className="text-gray-800 dark:text-gray-800">{problem}</p>
                          </div>
                          
                          {solution.revisedPrompt && solution.revisedPrompt !== problem && (
                            <div className="solution-info-block">
                              <h4 className="font-bold text-gray-800 dark:text-gray-800 mb-3 flex items-center">
                                <Lightbulb className="solution-checkmark" />
                                Enhanced Prompt
                              </h4>
                              <p className="text-gray-700 dark:text-gray-700">{solution.revisedPrompt}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <SolutionRenderer solution={solution.solution} />
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="h-full flex items-center justify-center">
                <Card className="max-w-md w-full">
                  <CardContent className="p-8 text-center">
                    <Brain className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      No Solution Yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Go to the Problem tab to enter a problem and generate a solution.
                    </p>
                    <Button
                      onClick={() => setActiveTab('problem')}
                      className="mt-4 bg-blue-600 hover:bg-blue-700"
                    >
                      Go to Problem Tab
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div className="h-full">
            <Card className="h-full animate-slide-up">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-800/30 border-b border-blue-200/50 dark:border-blue-700/50">
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <span className="text-blue-800 dark:text-blue-200">Study Notes</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <textarea
                    placeholder="Take notes about this problem and solution..."
                    rows={15}
                    className="w-full p-4 border border-blue-200 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                  />
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" className="border-blue-200 dark:border-blue-600 text-blue-600 dark:text-blue-400">
                      Save Notes
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Export Notes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="h-full">
            <Card className="h-full animate-slide-up">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-800/30 border-b border-blue-200/50 dark:border-blue-700/50">
                <CardTitle className="flex items-center space-x-2">
                  <History className="h-5 w-5 text-blue-600" />
                  <span className="text-blue-800 dark:text-blue-200">Solution History</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <History className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    No History Yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Your solved problems will appear here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemSolverView;
