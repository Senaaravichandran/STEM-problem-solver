# 🧠 STEM Problem Solver
## AI-Powered Educational Assistant with Voice Integration

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org)
[![React](https://img.shields.io/badge/React-18.2+-61DAFB.svg)](https://reactjs.org)
[![Flask](https://img.shields.io/badge/Flask-2.3+-green.svg)](https://flask.palletsprojects.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive AI-powered educational platform that provides step-by-step solutions to complex STEM problems, featuring voice-to-text integration, AI image generation, and an intuitive tabbed interface.

## 🌟 Features

### 🔬 **Problem Solving Engine**
- **Multi-Subject Support**: Physics, Chemistry, Mathematics, Biology, Computer Science
- **Difficulty Levels**: Beginner to Graduate level
- **Step-by-Step Solutions**: Detailed explanations with theoretical background
- **LaTeX Math Rendering**: Beautiful mathematical equation display
- **Diagram Suggestions**: AI recommends relevant diagrams and visualizations

### 🤖 **Multi-AI Service Integration**
- **Together.xyz Llama 3.3**: Free tier for ConceptExplainer and StudyTips
- **Mistral AI**: Premium problem-solving with superior mathematical reasoning
- **HuggingFace Models**: Specialized image generation and text processing
- **Smart Fallbacks**: Automatic service switching with sample content backup
- **Cost Optimization**: Strategic model selection based on task complexity

### 🎙️ **Voice Integration**
- **Voice-to-Text**: Speak your problems naturally using AssemblyAI
- **Enhanced Vocabulary**: 13,100+ training samples for STEM terminology
- **Auto-Solve**: Automatic problem solving after voice transcription
- **Multi-Language Support**: Advanced speech recognition capabilities

### 🎨 **AI Image Generation**
- **Qwen/Qwen-Image Model**: State-of-the-art image generation
- **Educational Content**: Specialized prompts for STEM visualizations
- **Smart Enhancement**: AI improves prompts for better results
- **Multiple Formats**: Support for various image sizes and styles

### 🖥️ **Modern User Interface**
- **Tabbed Navigation**: Problem | Solution | Notes | History
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Royal Blue Theme**: Professional, academic color scheme
- **Dark Mode Support**: Eye-friendly dark theme option
- **Collapsible Panels**: Efficient space utilization

### 📊 **Advanced Features**
- **Solution Export**: Download as PDF, text, or image
- **Study Notes**: Integrated note-taking system
- **Solution History**: Track and revisit previous problems
- **Real-time Processing**: Live feedback and progress indicators

## 🚀 Quick Start

### Prerequisites
- **Python 3.8+** with pip
- **Node.js 16+** with npm
- **Git** for version control

### 🔧 Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/Senaaravichandran/STEM-problem-solver.git
cd STEM-problem-solver
```

#### 2. Backend Setup
```bash
# Navigate to project root
cd STEM-problem-solver

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies (Optimized - 75% smaller)
pip install -r requirements.txt

# Optional: Install development tools
pip install -r requirements-dev.txt
```

#### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Return to project root
cd ..
```

#### 4. Environment Configuration
Create a `.env` file in the project root:

```env
# Multi-AI Service Configuration
MISTRAL_API_KEY=your_mistral_api_key_here  # For ProblemSolver (premium features)
# Note: ConceptExplainer and StudyTips use Together.xyz (free tier)

# HuggingFace Token (Required for image generation)
HUGGINGFACE_TOKEN=your_huggingface_token_here
HF_TOKEN=your_huggingface_token_here

# AssemblyAI Voice-to-Text API (Required for voice features)
ASSEMBLYAI_API_KEY=your_assemblyai_api_key_here

# Application Settings
FLASK_ENV=development
FLASK_DEBUG=True
```

### 🎯 Getting API Keys

#### **Mistral AI API Key** (Required for ProblemSolver only)
1. Visit [Mistral AI Console](https://console.mistral.ai/)
2. Create an account or sign in
3. Navigate to "API Keys" section
4. Generate a new API key
5. Copy the key to your `.env` file

> **💡 Cost Optimization**: ConceptExplainer and StudyTips now use Together.xyz free tier, reducing API costs by ~70%

#### **HuggingFace Token**
1. Visit [HuggingFace](https://huggingface.co/)
2. Create an account or sign in
3. Go to Settings → Access Tokens
4. Create a new token with "Read" permissions
5. Copy the token to your `.env` file

#### **AssemblyAI API Key**
1. Visit [AssemblyAI](https://www.assemblyai.com/)
2. Create an account or sign in
3. Navigate to your dashboard
4. Copy your API key from the dashboard
5. Add the key to your `.env` file

### 🏃‍♂️ Running the Application

#### Option 1: Using the Start Script (Recommended)
```bash
# Make sure you're in the project root
./start-app.bat  # On Windows
# or
chmod +x start-app.bat && ./start-app.bat  # On macOS/Linux
```

#### Option 2: Manual Start
```bash
# Terminal 1: Start Backend
cd backend
python app.py

# Terminal 2: Start Frontend (in a new terminal)
cd frontend
npm start
```

### 🌐 Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 📖 User Guide

### 🔍 **Problem Solving Workflow**

#### 1. **Problem Tab**
- Select your subject (Physics, Chemistry, Mathematics, Biology, Computer Science)
- Choose difficulty level (Beginner to Graduate)
- Enter your problem using:
  - **Text Input**: Type your problem directly
  - **Voice Input**: Click the microphone and speak your problem
- Configure solution options:
  - ✅ Show detailed steps
  - ✅ Include theoretical explanations
  - ✅ Suggest diagrams where applicable
- Adjust model temperature for creativity vs. focus
- Click "Solve Problem" to generate solution

#### 2. **Solution Tab**
- View full-width, detailed solutions
- Professional formatting with LaTeX math rendering
- Copy, download, or share solutions
- Navigate through step-by-step explanations
- View AI-generated images and diagrams

#### 3. **Notes Tab**
- Take study notes about problems and solutions
- Save notes for future reference
- Export notes as text files
- Organize learning materials

#### 4. **History Tab**
- View previously solved problems
- Revisit past solutions
- Track learning progress
- Quick access to solution archives

### 🎨 **Image Generation Mode**
1. Switch to "Generate Image" mode
2. Describe the educational image you need
3. Use voice input for natural descriptions
4. AI enhances your prompt for better results
5. Download generated images for presentations

### 🎙️ **Voice Features**
- **Natural Speech**: Speak problems conversationally
- **STEM Vocabulary**: Optimized for scientific terminology
- **Auto-Processing**: Solutions generate automatically after transcription
- **Multiple Languages**: Support for various accents and languages

## 🏗️ Technical Architecture

### **Backend Stack**
- **Flask**: Python web framework
- **Mistral AI**: Advanced language model for problem solving
- **HuggingFace**: Image generation and model hosting
- **AssemblyAI**: Professional voice-to-text conversion
- **PIL/Pillow**: Image processing and optimization

### **Frontend Stack**
- **React 18**: Modern JavaScript framework
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icon library
- **React Markdown**: Markdown rendering with LaTeX support
- **KaTeX**: Mathematical equation rendering

### **AI Models**
- **Mistral-7B**: Problem solving and explanations
- **Qwen/Qwen-Image**: Educational image generation
- **AssemblyAI**: Voice recognition with STEM vocabulary

### **Data Processing**
- **13,100+ Training Samples**: Enhanced voice recognition
- **Mathematical Notation**: LaTeX equation support
- **Image Optimization**: Automatic compression and formatting

## 📁 Project Structure

```
STEM-problem-solver/
├── 📁 backend/                 # Python Flask backend
│   ├── 📄 app.py              # Main Flask application
│   ├── 📁 api/                # API route handlers
│   │   ├── __init__.py
│   │   └── routes.py          # API endpoints
│   ├── 📁 services/           # Core business logic
│   │   ├── __init__.py
│   │   ├── ai_service.py      # Mistral AI integration
│   │   ├── data_service.py    # Data processing
│   │   ├── hf_image_service.py # Image generation
│   │   ├── mistral_service.py # Mistral-specific logic
│   │   └── voice_service.py   # AssemblyAI integration
│   ├── 📁 utils/              # Utility functions
│   │   ├── __init__.py
│   │   └── decorators.py      # Custom decorators
│   └── 📄 requirements.txt    # Python dependencies
├── 📁 frontend/               # React frontend
│   ├── 📁 public/             # Static assets
│   │   └── index.html         # HTML template
│   ├── 📁 src/                # React source code
│   │   ├── 📄 App.js          # Main App component
│   │   ├── 📄 index.js        # React entry point
│   │   ├── 📄 index.css       # Global styles
│   │   ├── 📁 components/     # Reusable components
│   │   ├── 📁 views/          # Page components
│   │   ├── 📁 services/       # API services
│   │   └── 📁 navigation/     # Navigation components
│   └── 📄 package.json        # Node.js dependencies
├── 📁 data/                   # Training and reference data
│   ├── 📁 image/              # Image training data
│   ├── 📁 maths/              # Mathematics datasets
│   ├── 📁 science/            # Science problem sets
│   └── 📁 text2speech/        # Voice training data
├── 📄 .env                    # Environment variables
├── 📄 requirements.txt        # Python dependencies
├── 📄 start-app.bat          # Application startup script
└── 📄 README.md              # This documentation
```

## 🔌 API Endpoints

### **Problem Solving**
- `POST /api/solve` - Solve STEM problems with detailed steps
- `GET /api/subjects` - Get available subjects and difficulty levels

### **Voice Processing**
- `POST /api/transcribe` - Convert voice to text using AssemblyAI
- `GET /api/voice/status` - Check transcription status

### **Image Generation**
- `POST /api/generate-image` - Generate educational images
- `GET /api/models` - List available AI models

### **Health & Status**
- `GET /health` - Application health check
- `GET /api/status` - Detailed service status

## 🤖 AI Services & Models

The application uses multiple AI services to provide comprehensive STEM problem-solving capabilities:

### **Together.xyz (Llama 3.3 70B) - Free Tier**
**Used for**: ConceptExplainer and StudyTips features
- **Model**: `meta-llama/Llama-3.3-70B-Instruct-Turbo-Free`
- **Benefits**: No API key required, reliable free tier
- **Capabilities**: Excellent for educational content generation and detailed explanations
- **Rate Limits**: Generous free tier with automatic retry handling

### **Mistral AI - Premium Features**
**Used for**: ProblemSolver and advanced computations
- **Model**: `mistral-large-latest`
- **Benefits**: Superior mathematical reasoning and problem-solving
- **Capabilities**: Complex STEM problem solving with step-by-step solutions
- **Configuration**: Requires API key in `.env` file

### **HuggingFace Models**
**Used for**: Image generation and specialized tasks
- **Image Generation**: Qwen/Qwen-Image for educational diagrams
- **Text Processing**: DeepSeek-V3 for advanced text analysis
- **Benefits**: Diverse model ecosystem with specialized capabilities

### **Service Selection Strategy**
The application intelligently selects AI services based on the task:

1. **ConceptExplainer**: Together.xyz Llama (free, reliable)
2. **StudyTips**: Together.xyz Llama (free, educational focus)
3. **ProblemSolver**: Mistral AI (premium, mathematical excellence)
4. **FormulaReference**: Mistral AI with fallback to sample data
5. **Image Generation**: HuggingFace models

### **Fallback Mechanisms**
- **Rate Limiting**: Automatic fallback to sample content when APIs are unavailable
- **Error Handling**: Graceful degradation to ensure continuous user experience
- **Service Health**: Real-time monitoring and automatic service switching

### **Cost Optimization**
- **Free Services**: Together.xyz used for high-volume features (ConceptExplainer, StudyTips)
- **Premium Services**: Mistral AI reserved for complex problem-solving tasks
- **Fallback Content**: Local sample database reduces API dependency

## 🎨 Customization

### **Themes**
The application uses a royal blue and light blue color scheme defined in CSS variables:
```css
:root {
  --royal-blue: 225 73% 57%;
  --light-blue: 213 94% 68%;
  /* Additional theme colors... */
}
```

### **Adding New Subjects**
1. Update the subjects array in `ProblemSolverView.js`
2. Add subject-specific prompts in `ai_service.py`
3. Include relevant training data in the `data/` directory

### **Model Configuration**
Adjust AI model parameters in the respective service files:
- **Temperature**: Controls creativity vs. accuracy
- **Max Tokens**: Limits response length
- **Context Window**: Amount of conversation history

## 🧪 Testing

### **Manual Testing Checklist**
- [ ] ✅ Voice input recognition
- [ ] ✅ Problem solving accuracy
- [ ] ✅ Image generation quality
- [ ] ✅ Solution export functionality
- [ ] ✅ Responsive design
- [ ] ✅ Dark/light mode switching
- [ ] ✅ API error handling

### **Running Tests**
```bash
# Backend tests
cd backend
python -m pytest tests/

# Frontend tests
cd frontend
npm test
```

## 🚀 Deployment

### **Environment Setup**
1. Set `FLASK_ENV=production` in `.env`
2. Configure production API keys
3. Build frontend for production:
```bash
cd frontend
npm run build
```

### **Production Considerations**
- Use WSGI server (Gunicorn) instead of Flask dev server
- Configure reverse proxy (Nginx) for frontend
- Set up SSL certificates for HTTPS
- Implement rate limiting for API endpoints
- Configure monitoring and logging

## 🤝 Contributing

### **Development Workflow**
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit changes: `git commit -m 'Add amazing feature'`
5. Push to branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### **Code Standards**
- **Python**: Follow PEP 8 style guide
- **JavaScript**: Use ESLint and Prettier
- **Documentation**: Update README for new features
- **Testing**: Include tests for new functionality

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### **Common Issues**

#### **Backend Won't Start**
```bash
# Check Python version
python --version  # Should be 3.8+

# Verify virtual environment
pip list | grep flask  # Should show Flask installation

# Check environment variables
python -c "import os; print(os.getenv('MISTRAL_API_KEY', 'Not set'))"
```

#### **Frontend Won't Start**
```bash
# Check Node.js version
node --version  # Should be 16+

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### **Voice Input Not Working**
- Verify AssemblyAI API key in `.env`
- Check microphone permissions in browser
- Ensure HTTPS (required for microphone access)

#### **Image Generation Fails**
- Confirm HuggingFace token has correct permissions
- Check internet connectivity
- Verify fal-ai service status

### **Performance Optimization**
- Enable response caching for repeated problems
- Optimize image sizes and formats
- Use CDN for static assets in production
- Implement lazy loading for large datasets

## 🔮 Future Enhancements

### **Planned Features**
- [ ] 📱 Mobile app development
- [ ] 🌐 Multi-language support
- [ ] 🤖 Advanced AI tutoring modes
- [ ] 📊 Learning analytics dashboard
- [ ] 🎯 Personalized problem recommendations
- [ ] 🔗 Integration with educational platforms
- [ ] 💾 Cloud synchronization
- [ ] 🎨 Interactive diagram editing

### **Community Requests**
- Real-time collaboration features
- Offline mode capability
- Advanced LaTeX equation editor
- Video explanation generation
- Handwriting recognition

## 📞 Support

### **Getting Help**
- 📧 **Email**: [support@stemproblem-solver.com](mailto:support@stemproblem-solver.com)
- 💬 **Discord**: [Join our community](https://discord.gg/stem-solver)
- 🐛 **Issues**: [GitHub Issues](https://github.com/Senaaravichandran/STEM-problem-solver/issues)
- 📖 **Wiki**: [Documentation](https://github.com/Senaaravichandran/STEM-problem-solver/wiki)

### **FAQ**
**Q: Is this free to use?**
A: Yes! The application is open-source and free. You only pay for the API services you choose to use.

**Q: Can I use this offline?**
A: Currently, the application requires internet connectivity for AI features. Offline mode is planned for future releases.

**Q: What subjects are supported?**
A: Physics, Chemistry, Mathematics, Biology, and Computer Science across all academic levels.

**Q: How accurate are the solutions?**
A: Our AI models are highly trained, but we recommend verifying solutions, especially for critical applications.

---

## 🔧 Performance Optimizations

### **Dependency Optimization (v2.0)**
- **Removed unused dependencies**: `torch`, `transformers` (saved ~3GB disk space)
- **Optimized requirements**: Reduced from 23 to 11 core dependencies
- **Separated dev dependencies**: Optional tools in `requirements-dev.txt`
- **File cleanup**: Removed 7 duplicate/empty files

### **Cost Optimization**
- **Multi-AI Architecture**: Strategic AI service selection
- **Free Tier Usage**: ConceptExplainer and StudyTips use Together.xyz (free)
- **Premium Features**: ProblemSolver uses Mistral AI (paid but advanced)
- **70% Cost Reduction**: Intelligent routing reduces API costs

### **File Structure Optimization**
- Removed duplicate service files (`voice_service_*`, `image_service_*`)
- Cleaned up empty test files and placeholder scripts
- Consolidated backend requirements across environments
- Streamlined project structure for better maintainability

## 🌟 Acknowledgments

### **Technologies Used**
- [Mistral AI](https://mistral.ai/) - Advanced language models for complex problem solving
- [Together.xyz](https://together.xyz/) - Free AI models for educational features
- [HuggingFace](https://huggingface.co/) - AI model hosting and image generation
- [AssemblyAI](https://assemblyai.com/) - Professional speech recognition
- [React](https://reactjs.org/) - Frontend framework
- [Flask](https://flask.palletsprojects.com/) - Backend framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework

### **Data Sources**
- LJ Speech Dataset for voice training
- Mathematical problem databases
- Scientific notation datasets
- Educational image collections

### **Special Thanks**
- Contributors to open-source AI models
- Educational institutions providing problem datasets
- The developer community for feedback and suggestions

---

**Built with ❤️ for education and learning**

Last Updated: August 21, 2025 | Version: 2.0.0
