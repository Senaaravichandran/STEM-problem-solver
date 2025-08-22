import React, { useState } from 'react';
import { Calculator, Loader2, Copy, Download, Search } from 'lucide-react';
import { Button } from '../components/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { ApiService } from '../services/api';
import SolutionRenderer from '../components/SolutionRenderer';

const FormulaReferenceView = () => {
  const [subject, setSubject] = useState('Physics');
  const [topic, setTopic] = useState('Mechanics');
  const [searchTerm, setSearchTerm] = useState('');
  const [formulas, setFormulas] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
          Formula Reference
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Quick reference for formulas and equations across STEM fields
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <Card className="animate-slide-up">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-b border-blue-200/50 dark:border-blue-700/50">
            <CardTitle className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Calculator className="h-4 w-4 text-white" />
              </div>
              <span className="text-blue-800 dark:text-blue-200">Search Formulas</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            {/* Subject Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-700 dark:text-blue-300">Subject</label>
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

            {/* Topic Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-700 dark:text-blue-300">Topic</label>
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

            {/* Search Term */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-700 dark:text-blue-300">Search Term (Optional)</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="e.g., Newton's Law, Ohm's Law"
                className="w-full p-3 border border-blue-200 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Get Formulas Button */}
            <Button
              onClick={handleGetFormulas}
              disabled={loading}
              className="w-full h-12 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  Get Formulas
                </>
              )}
            </Button>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Quick Access */}
            <div className="space-y-2 mt-6">
              <h4 className="text-sm font-medium">Quick Access</h4>
              <div className="grid grid-cols-2 gap-2">
                {['Physics', 'Chemistry', 'Mathematics', 'Biology'].map((quickSubject) => (
                  <Button
                    key={quickSubject}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSubject(quickSubject);
                      setTopic(subjectTopics[quickSubject][0]);
                    }}
                    className="text-xs"
                  >
                    {quickSubject}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulas Section */}
        <Card className="lg:col-span-2 animate-slide-up">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Formula Reference</CardTitle>
              {formulas && (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {formulas ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Generated on {new Date(formulas.metadata.timestamp).toLocaleString()}
                  </div>
                  <div className="flex space-x-4 text-sm">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                      {formulas.metadata.subject}
                    </span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                      {formulas.metadata.topic}
                    </span>
                    {formulas.metadata.searchTerm && (
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                        {formulas.metadata.searchTerm}
                      </span>
                    )}
                  </div>
                </div>
                <SolutionRenderer solution={formulas.formulas} />
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a subject and topic, then click "Get Formulas" to display the reference guide</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FormulaReferenceView;
