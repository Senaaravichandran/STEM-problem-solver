import React, { useState } from 'react';
import { BookOpen, Loader2, Copy, Download, Target } from 'lucide-react';
import { Button } from '../components/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import SolutionRenderer from '../components/SolutionRenderer';
import { ApiService } from '../services/api';

const StudyTipsView = () => {
  const [subject, setSubject] = useState('General STEM');
  const [learningStyle, setLearningStyle] = useState('Visual');
  const [studyGoal, setStudyGoal] = useState('General Understanding');
  const [challenges, setChallenges] = useState([]);
  const [tips, setTips] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const subjects = [
    'General STEM', 'Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science'
  ];

  const learningStyles = [
    'Visual', 'Auditory', 'Reading/Writing', 'Kinesthetic', 'Not Sure'
  ];

  const studyGoals = [
    'General Understanding', 'Exam Preparation', 'Problem-Solving Skills',
    'Research Preparation', 'Long-term Retention', 'Career Development'
  ];

  const challengeOptions = [
    'Complex Concepts', 'Mathematical Calculations', 'Memorization',
    'Problem-Solving', 'Time Management', 'Test Anxiety',
    'Staying Motivated', 'Note Taking', 'Group Study'
  ];

  const handleChallengeChange = (challenge, checked) => {
    if (checked) {
      setChallenges([...challenges, challenge]);
    } else {
      setChallenges(challenges.filter(c => c !== challenge));
    }
  };

  const handleGetTips = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await ApiService.getStudyTips({
        subject,
        learningStyle,
        studyGoal,
        challenges,
      });

      setTips(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (tips?.tips) {
      navigator.clipboard.writeText(tips.tips);
    }
  };

  const handleDownload = () => {
    if (tips?.tips) {
      const blob = new Blob([`Study Tips for ${subject}\n\n${tips.tips}`], {
        type: 'text/plain',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `study-tips-${subject.replace(' ', '-')}-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-800 via-blue-600 to-blue-400 bg-clip-text text-transparent">
          Study Tips
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Get personalized study techniques and advice for mastering STEM subjects
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card className="animate-slide-up">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-b border-blue-200/50 dark:border-blue-700/50">
            <CardTitle className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <span className="text-blue-800 dark:text-blue-200">Your Study Profile</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            {/* Subject Selection */}
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

            {/* Learning Style */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-700 dark:text-blue-300">Learning Style</label>
              <select
                value={learningStyle}
                onChange={(e) => setLearningStyle(e.target.value)}
                className="w-full p-3 border border-blue-200 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                {learningStyles.map((style) => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
            </div>

            {/* Study Goal */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-700 dark:text-blue-300">Study Goal</label>
              <select
                value={studyGoal}
                onChange={(e) => setStudyGoal(e.target.value)}
                className="w-full p-3 border border-blue-200 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                {studyGoals.map((goal) => (
                  <option key={goal} value={goal}>{goal}</option>
                ))}
              </select>
            </div>

            {/* Challenges */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-blue-700 dark:text-blue-300">Select Your Challenges</label>
              <div className="grid grid-cols-2 gap-2">
                {challengeOptions.map((challenge) => (
                  <label key={challenge} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={challenges.includes(challenge)}
                      onChange={(e) => handleChallengeChange(challenge, e.target.checked)}
                      className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{challenge}</span>
                  </label>
                ))}
              </div>
              {challenges.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Selected challenges:</p>
                  <div className="flex flex-wrap gap-1">
                    {challenges.map((challenge) => (
                      <span
                        key={challenge}
                        className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium"
                      >
                        {challenge}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Get Tips Button */}
            <Button
              onClick={handleGetTips}
              disabled={loading}
              className="w-full h-12 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Generating Tips...
                </>
              ) : (
                <>
                  <Target className="h-5 w-5 mr-2" />
                  Get Study Tips
                </>
              )}
            </Button>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Quick Tips */}
            <div className="space-y-2 mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="text-sm font-medium">Quick Study Tips</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Use the Pomodoro Technique (25 min study, 5 min break)</li>
                <li>• Practice active recall instead of passive reading</li>
                <li>• Create mind maps for complex concepts</li>
                <li>• Teach concepts to others to test understanding</li>
                <li>• Use spaced repetition for long-term retention</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Tips Section */}
        <Card className="animate-slide-up">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Personalized Study Plan</CardTitle>
              {tips && (
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
            {tips ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Generated on {new Date(tips.metadata.timestamp).toLocaleString()}
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                      {tips.metadata.subject}
                    </span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                      {tips.metadata.learningStyle}
                    </span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                      {tips.metadata.studyGoal}
                    </span>
                  </div>
                </div>
                <SolutionRenderer solution={tips.tips} />
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Fill in your study profile and click "Get Study Tips" to receive personalized advice</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudyTipsView;
