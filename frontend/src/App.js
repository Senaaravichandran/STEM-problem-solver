import React, { useState } from 'react';
import Navigation from './navigation/Navigation';
import ProblemSolverView from './views/ProblemSolverView';
import ConceptExplainerView from './views/ConceptExplainerView';
import FormulaReferenceView from './views/FormulaReferenceView';
import StudyTipsView from './views/StudyTipsView';
import SettingsView from './views/SettingsView';
import ImageGenerator from './components/ImageGenerator';
import VoiceView from './views/VoiceView';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

function App() {
  const [currentView, setCurrentView] = useState('solver');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'solver':
        return <ProblemSolverView />;
      case 'voice':
        return <VoiceView />;
      case 'explainer':
        return <ConceptExplainerView />;
      case 'formulas':
        return <FormulaReferenceView />;
      case 'study':
        return <StudyTipsView />;
      case 'images':
        return <ImageGenerator />;
      case 'settings':
        return <SettingsView />;
      default:
        return <ProblemSolverView />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="flex h-screen">
          <Navigation 
            currentView={currentView} 
            onViewChange={setCurrentView}
          />
          
          <main className="flex-1 lg:ml-0 min-w-0">
            <div className="h-full container mx-auto px-4 py-8 lg:px-8">
              <div className="h-full animate-fade-in">
                {renderCurrentView()}
              </div>
            </div>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
