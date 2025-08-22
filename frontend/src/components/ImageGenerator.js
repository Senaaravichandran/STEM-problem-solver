import React, { useState } from 'react';
import './ImageGenerator.css';

const ImageGenerator = () => {
  const [activeTab, setActiveTab] = useState('generate');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Image Generation State
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageContext, setImageContext] = useState('');
  const [imageSize, setImageSize] = useState('1024x1024');
  const [imageQuality, setImageQuality] = useState('standard');
  const [imageStyle, setImageStyle] = useState('vivid');

  // Diagram Generation State
  const [concept, setConcept] = useState('');
  const [subject, setSubject] = useState('Physics');
  const [difficulty, setDifficulty] = useState('intermediate');

  // Problem Illustration State
  const [problemText, setProblemText] = useState('');
  const [problemSubject, setProblemSubject] = useState('Mathematics');

  // Image Analysis State
  const [analysisImageUrl, setAnalysisImageUrl] = useState('');
  const [analysisQuestion, setAnalysisQuestion] = useState('');

  const [trainingStats, setTrainingStats] = useState(null);

  const generateImage = async () => {
    if (!imagePrompt.trim()) {
      setError('Please enter an image prompt');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://localhost:5000/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: imagePrompt,
          context: imageContext,
          size: imageSize,
          quality: imageQuality,
          style: imageStyle
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to generate image');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateDiagram = async () => {
    if (!concept.trim()) {
      setError('Please enter a concept');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://localhost:5000/api/generate-diagram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          concept,
          subject,
          difficulty
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to generate diagram');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateProblemIllustration = async () => {
    if (!problemText.trim()) {
      setError('Please enter a problem statement');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://localhost:5000/api/generate-problem-illustration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          problem: problemText,
          subject: problemSubject
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to generate illustration');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const analyzeImage = async () => {
    if (!analysisImageUrl.trim()) {
      setError('Please enter an image URL');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://localhost:5000/api/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: analysisImageUrl,
          question: analysisQuestion
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to analyze image');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTrainingStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/image-training-stats');
      const data = await response.json();

      if (data.success) {
        setTrainingStats(data.stats);
      } else {
        setError(data.error || 'Failed to get training statistics');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
      console.error('Error:', err);
    }
  };

  const createFineTuningDataset = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/create-fine-tuning-dataset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        alert(`Fine-tuning dataset created successfully! ${data.entries_count} entries created.`);
      } else {
        setError(data.error || 'Failed to create fine-tuning dataset');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    getTrainingStats();
  }, []);

  return (
    <div className="image-generator">
      <div className="header">
        <h2>🎨 AI Image Generator & Analyzer</h2>
        <p>Powered by OpenAI DALL-E with enhanced training data from 40K+ image captions</p>
      </div>

      <div className="tabs">
        <button 
          className={activeTab === 'generate' ? 'active' : ''} 
          onClick={() => setActiveTab('generate')}
        >
          🖼️ Generate Image
        </button>
        <button 
          className={activeTab === 'diagram' ? 'active' : ''} 
          onClick={() => setActiveTab('diagram')}
        >
          📊 Educational Diagram
        </button>
        <button 
          className={activeTab === 'illustration' ? 'active' : ''} 
          onClick={() => setActiveTab('illustration')}
        >
          🔬 Problem Illustration
        </button>
        <button 
          className={activeTab === 'analyze' ? 'active' : ''} 
          onClick={() => setActiveTab('analyze')}
        >
          👁️ Analyze Image
        </button>
        <button 
          className={activeTab === 'training' ? 'active' : ''} 
          onClick={() => setActiveTab('training')}
        >
          🧠 Training Data
        </button>
      </div>

      <div className="content">
        {activeTab === 'generate' && (
          <div className="tab-content">
            <h3>Generate Custom Image</h3>
            <div className="form-group">
              <label>Image Prompt:</label>
              <textarea
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="Describe the image you want to generate..."
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>Context (Optional):</label>
              <input
                type="text"
                value={imageContext}
                onChange={(e) => setImageContext(e.target.value)}
                placeholder="Additional context for the image..."
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Size:</label>
                <select value={imageSize} onChange={(e) => setImageSize(e.target.value)}>
                  <option value="1024x1024">1024x1024</option>
                  <option value="1792x1024">1792x1024</option>
                  <option value="1024x1792">1024x1792</option>
                </select>
              </div>
              <div className="form-group">
                <label>Quality:</label>
                <select value={imageQuality} onChange={(e) => setImageQuality(e.target.value)}>
                  <option value="standard">Standard</option>
                  <option value="hd">HD</option>
                </select>
              </div>
              <div className="form-group">
                <label>Style:</label>
                <select value={imageStyle} onChange={(e) => setImageStyle(e.target.value)}>
                  <option value="vivid">Vivid</option>
                  <option value="natural">Natural</option>
                </select>
              </div>
            </div>
            <button 
              onClick={generateImage} 
              disabled={loading || !imagePrompt.trim()}
              className="generate-btn"
            >
              {loading ? '🔄 Generating...' : '🎨 Generate Image'}
            </button>
          </div>
        )}

        {activeTab === 'diagram' && (
          <div className="tab-content">
            <h3>Generate Educational Diagram</h3>
            <div className="form-group">
              <label>Concept:</label>
              <input
                type="text"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="Enter the concept to illustrate..."
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Subject:</label>
                <select value={subject} onChange={(e) => setSubject(e.target.value)}>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Biology">Biology</option>
                  <option value="Computer Science">Computer Science</option>
                </select>
              </div>
              <div className="form-group">
                <label>Difficulty:</label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
            <button 
              onClick={generateDiagram} 
              disabled={loading || !concept.trim()}
              className="generate-btn"
            >
              {loading ? '🔄 Generating...' : '📊 Generate Diagram'}
            </button>
          </div>
        )}

        {activeTab === 'illustration' && (
          <div className="tab-content">
            <h3>Generate Problem Illustration</h3>
            <div className="form-group">
              <label>Problem Statement:</label>
              <textarea
                value={problemText}
                onChange={(e) => setProblemText(e.target.value)}
                placeholder="Enter the problem statement..."
                rows={4}
              />
            </div>
            <div className="form-group">
              <label>Subject:</label>
              <select value={problemSubject} onChange={(e) => setProblemSubject(e.target.value)}>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="Computer Science">Computer Science</option>
              </select>
            </div>
            <button 
              onClick={generateProblemIllustration} 
              disabled={loading || !problemText.trim()}
              className="generate-btn"
            >
              {loading ? '🔄 Generating...' : '🔬 Generate Illustration'}
            </button>
          </div>
        )}

        {activeTab === 'analyze' && (
          <div className="tab-content">
            <h3>Analyze Image with GPT-4 Vision</h3>
            <div className="form-group">
              <label>Image URL:</label>
              <input
                type="url"
                value={analysisImageUrl}
                onChange={(e) => setAnalysisImageUrl(e.target.value)}
                placeholder="Enter the URL of the image to analyze..."
              />
            </div>
            <div className="form-group">
              <label>Question (Optional):</label>
              <input
                type="text"
                value={analysisQuestion}
                onChange={(e) => setAnalysisQuestion(e.target.value)}
                placeholder="Ask a specific question about the image..."
              />
            </div>
            <button 
              onClick={analyzeImage} 
              disabled={loading || !analysisImageUrl.trim()}
              className="generate-btn"
            >
              {loading ? '🔄 Analyzing...' : '👁️ Analyze Image'}
            </button>
          </div>
        )}

        {activeTab === 'training' && (
          <div className="tab-content">
            <h3>Training Data & Fine-tuning</h3>
            {trainingStats && (
              <div className="stats-display">
                <div className="stat-item">
                  <strong>Image Captions:</strong> {trainingStats.captions_count?.toLocaleString()}
                </div>
                <div className="stat-item">
                  <strong>Descriptions:</strong> {trainingStats.descriptions_count?.toLocaleString()}
                </div>
                <div className="stat-item">
                  <strong>Image Paths:</strong> {trainingStats.image_paths_count?.toLocaleString()}
                </div>
                
                {trainingStats.sample_captions && trainingStats.sample_captions.length > 0 && (
                  <div className="samples">
                    <h4>Sample Captions:</h4>
                    <ul>
                      {trainingStats.sample_captions.map((caption, index) => (
                        <li key={index}>{caption}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            <button 
              onClick={createFineTuningDataset} 
              disabled={loading}
              className="generate-btn fine-tune-btn"
            >
              {loading ? '🔄 Creating...' : '🧠 Create Fine-tuning Dataset'}
            </button>
            
            <div className="info-box">
              <h4>📚 About the Training Data</h4>
              <p>
                Our image generation model is enhanced with a comprehensive dataset of over 40,000 
                image captions and descriptions. This training data helps create more accurate and 
                contextually appropriate images for educational content.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            <strong>❌ Error:</strong> {error}
          </div>
        )}

        {result && (
          <div className="result-section">
            <h3>✅ Result</h3>
            
            {result.image_url && (
              <div className="image-result">
                <img src={result.image_url} alt="Generated" className="generated-image" />
                <div className="image-info">
                  <p><strong>Model:</strong> {result.model}</p>
                  {result.revised_prompt && (
                    <p><strong>Revised Prompt:</strong> {result.revised_prompt}</p>
                  )}
                  {result.metadata && (
                    <div className="metadata">
                      <p><strong>Size:</strong> {result.metadata.size}</p>
                      <p><strong>Quality:</strong> {result.metadata.quality}</p>
                      <p><strong>Style:</strong> {result.metadata.style}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {result.analysis && (
              <div className="analysis-result">
                <h4>🔍 Analysis</h4>
                <p>{result.analysis}</p>
                <p><strong>Model:</strong> {result.model}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;
