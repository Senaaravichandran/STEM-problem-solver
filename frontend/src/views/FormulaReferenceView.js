import React, { useState } from 'react';
import { Calculator, Loader2, Copy, Download, Search, Settings, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../components/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import SolutionRenderer from '../components/SolutionRenderer';
import { ApiService } from '../services/api';

const FormulaReferenceView = () => {
  const [subject, setSubject] = useState('Physics');
  const [topic, setTopic] = useState('Mechanics');
  const [searchTerm, setSearchTerm] = useState('');
  const [formulas, setFormulas] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('input');
  const [isConfigCollapsed, setIsConfigCollapsed] = useState(false);

  const subjectTopics = {
    Physics: ['Mechanics', 'Thermodynamics', 'Electromagnetism', 'Optics', 'Quantum Physics', 'Relativity'],
    Chemistry: ['Stoichiometry', 'Thermochemistry', 'Chemical Equilibrium', 'Acids & Bases', 'Electrochemistry', 'Organic Chemistry'],
    Mathematics: ['Algebra', 'Calculus', 'Statistics', 'Geometry', 'Trigonometry', 'Linear Algebra'],
    Biology: ['Genetics', 'Ecology', 'Cellular Biology', 'Physiology', 'Evolution', 'Biochemistry'],
    'Computer Science': ['Algorithms', 'Data Structures', 'Complexity Theory', 'Machine Learning', 'Database Systems', 'Networks']
  };

  const handleGetFormulas = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await ApiService.getFormulas({
        subject,
        topic,
        searchTerm,
      });

      setFormulas(response);
      setActiveTab('formulas');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (formulas?.formulas) {
      navigator.clipboard.writeText(formulas.formulas);
    }
  };

  const handleDownload = () => {
    if (formulas?.formulas) {
      const blob = new Blob([`${subject} - ${topic} Formulas\n\n${formulas.formulas}`], {
        type: 'text/plain',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `formulas-${subject}-${topic}-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleQuickAccess = (quickSubject) => {
    setSubject(quickSubject);
    setTopic(subjectTopics[quickSubject][0]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Formula Reference
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Quick reference for formulas and equations across STEM fields
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
                  <Settings className="w-4 h-4" />
                  <span>Search Setup</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('formulas')}
                disabled={!formulas}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'formulas' && formulas
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : formulas
                    ? 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                    : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Formula Guide</span>
                  {formulas && (
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
            <Card className="w-full max-w-5xl mx-auto animate-fade-in">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-800/30 border-b border-blue-200/50 dark:border-blue-700/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                      <Calculator className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-blue-800 dark:text-blue-200">Formula Search Configuration</span>
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column - Subject & Topic */}
                  <div className="space-y-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 space-y-4">
                      <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">Subject & Topic</h3>
                      
                      <div>
                        <label className="text-sm font-medium text-blue-700 dark:text-blue-300 block mb-2">Subject</label>
                        <select
                          value={subject}
                          onChange={(e) => {
                            setSubject(e.target.value);
                            setTopic(subjectTopics[e.target.value][0]);
                          }}
                          className="w-full p-3 border border-blue-200 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        >
                          {Object.keys(subjectTopics).map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-blue-700 dark:text-blue-300 block mb-2">Topic</label>
                        <select
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                          className="w-full p-3 border border-blue-200 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        >
                          {subjectTopics[subject].map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-blue-700 dark:text-blue-300 block mb-2">
                          Search Term <span className="text-gray-500 text-xs">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="e.g., Newton's Law, Ohm's Law, Quadratic"
                          className="w-full p-3 border border-blue-200 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Middle Column - Quick Access */}
                  <div className="space-y-6">
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6 space-y-4">
                      <h3 className="text-lg font-semibold text-indigo-800 dark:text-indigo-200">Quick Access</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Jump to common subjects
                      </p>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {Object.keys(subjectTopics).map((quickSubject) => (
                          <Button
                            key={quickSubject}
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickAccess(quickSubject)}
                            className={`text-sm transition-all ${
                              subject === quickSubject
                                ? 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-200 dark:border-indigo-600'
                                : 'border-indigo-200 dark:border-indigo-600 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                            }`}
                          >
                            {quickSubject}
                          </Button>
                        ))}
                      </div>

                      {/* Formula Examples */}
                      <div className="mt-6 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Popular Formulas</h4>
                        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                          {subject === 'Physics' && (
                            <>
                              <div>• F = ma (Newton's Second Law)</div>
                              <div>• E = mc² (Mass-Energy Equivalence)</div>
                              <div>• V = IR (Ohm's Law)</div>
                            </>
                          )}
                          {subject === 'Chemistry' && (
                            <>
                              <div>• PV = nRT (Ideal Gas Law)</div>
                              <div>• pH = -log[H⁺] (pH Formula)</div>
                              <div>• ΔG = ΔH - TΔS (Gibbs Free Energy)</div>
                            </>
                          )}
                          {subject === 'Mathematics' && (
                            <>
                              <div>• ax² + bx + c = 0 (Quadratic Equation)</div>
                              <div>• A = πr² (Circle Area)</div>
                              <div>• sin²θ + cos²θ = 1 (Pythagorean Identity)</div>
                            </>
                          )}
                          {subject === 'Biology' && (
                            <>
                              <div>• Hardy-Weinberg Principle</div>
                              <div>• Population Growth Models</div>
                              <div>• Enzyme Kinetics (Michaelis-Menten)</div>
                            </>
                          )}
                          {subject === 'Computer Science' && (
                            <>
                              <div>• O(n log n) (Time Complexity)</div>
                              <div>• Shannon's Entropy Formula</div>
                              <div>• Bayes' Theorem</div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Action */}
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 space-y-6 text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto">
                        <Search className="w-8 h-8 text-white" />
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                          Ready to Search?
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Find formulas and equations for {subject} - {topic}
                        </p>
                      </div>

                      <Button
                        onClick={handleGetFormulas}
                        disabled={loading}
                        className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                            Searching...
                          </>
                        ) : (
                          <>
                            <Search className="h-6 w-6 mr-3" />
                            Get Formulas
                          </>
                        )}
                      </Button>

                      {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg text-left">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span className="font-semibold text-red-700 dark:text-red-400">Error</span>
                          </div>
                          <p className="mt-2 text-red-600 dark:text-red-400 text-sm">{error}</p>
                        </div>
                      )}

                      {/* Current Selection Display */}
                      <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 text-left">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Current Selection</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600 dark:text-gray-400">Subject:</span>
                            <span className="font-medium text-blue-600 dark:text-blue-400">{subject}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600 dark:text-gray-400">Topic:</span>
                            <span className="font-medium text-indigo-600 dark:text-indigo-400">{topic}</span>
                          </div>
                          {searchTerm && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600 dark:text-gray-400">Search:</span>
                              <span className="font-medium text-purple-600 dark:text-purple-400">{searchTerm}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'formulas' && formulas && (
            <div className="w-full animate-fade-in">
              {/* Floating Action Bar */}
              <div className="sticky top-4 z-10 mb-6">
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl border border-blue-100 dark:border-blue-800 shadow-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Formula Guide Ready
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(formulas.metadata.timestamp).toLocaleString()}
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
                    </div>
                  </div>
                </div>
              </div>

              {/* Formula Content */}
              <Card className="w-full">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-800/30 border-b border-blue-200/50 dark:border-blue-700/50">
                  <div className="space-y-4">
                    <CardTitle className="flex items-center space-x-2 text-xl">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                        <Calculator className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-blue-800 dark:text-blue-200">Formula Reference Guide</span>
                    </CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {formulas.metadata.subject}
                      </span>
                      <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                        {formulas.metadata.topic}
                      </span>
                      {formulas.metadata.searchTerm && (
                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                          "{formulas.metadata.searchTerm}"
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <SolutionRenderer solution={formulas.formulas} />
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'formulas' && !formulas && (
            <Card className="w-full max-w-2xl mx-auto">
              <CardContent className="p-12">
                <div className="text-center space-y-4">
                  <Calculator className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600" />
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                    No Formulas Yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Configure your search parameters and generate formula references first.
                  </p>
                  <Button
                    onClick={() => setActiveTab('input')}
                    className="mt-4"
                  >
                    Configure Search
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormulaReferenceView;
