# 🧪 Advanced STEM Problem Solver - Flask Edition

A futuristic, modern web application that uses AI to solve complex problems in **Physics, Chemistry, Biology, Math, and Computer Science**. Built with Flask backend and a sleek HTML/CSS/JS frontend featuring glassmorphism design, dark/light themes, and responsive layout.

## 🌟 Features

- 🔬 **Problem Solver** – Step-by-step solutions to STEM problems with detailed explanations
- 🧠 **Concept Explainer** – Clear explanations of complex STEM concepts with examples
- 📊 **Formula Reference** – Quick lookup of essential formulas with definitions and usage
- 🎓 **Study Tips Generator** – Personalized study plans based on learning style and goals
- 🎨 **Futuristic UI** – Modern glassmorphism design with smooth animations
- 🌙 **Dark/Light Theme** – Toggle between themes with persistent preferences
- 📱 **Responsive Design** – Works perfectly on desktop, tablet, and mobile
- ⚡ **Fast & Efficient** – Flask backend with optimized API calls
- 💾 **Auto-save** – Automatically saves your work in local storage
- ⌨️ **Keyboard Shortcuts** – Powerful keyboard navigation and shortcuts

## 🛠️ Tech Stack

### Backend
- **Framework:** Flask 3.0
- **Language:** Python 3.8+
- **API Integration:** Together.xyz (LLaMA, Mixtral models)
- **HTTP Client:** Requests

### Frontend
- **Languages:** HTML5, CSS3, JavaScript (ES6+)
- **Design:** Glassmorphism, CSS Grid, Flexbox
- **Fonts:** Inter, JetBrains Mono
- **Icons:** Font Awesome 6
- **Features:** CSS Variables, Custom Properties, Responsive Design

## 🚀 Installation & Setup

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)
- A Together.xyz API key (free at [together.xyz](https://api.together.xyz/settings/api-keys))

### 1. Clone the Repository
```bash
git clone <repository-url>
cd stem-problem-solver-flask
```

### 2. Create Virtual Environment
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure API Key (Optional)
The app comes with a default API key, but you can use your own:
- Get your free API key from [Together.xyz](https://api.together.xyz/settings/api-keys)
- Enter it in the settings panel (gear icon) in the app

### 5. Run the Application
```bash
python app.py
```

The application will be available at `http://localhost:5000`

## 🎮 Usage Guide

### Problem Solver
1. Select your subject (Physics, Chemistry, Mathematics, Biology, Computer Science)
2. Choose difficulty level (Beginner to Graduate)
3. Enter your problem description
4. Configure options (detailed steps, theory, diagrams)
5. Click "Solve Problem" and get detailed solutions

### Concept Explainer
1. Choose subject area
2. Set explanation level
3. Enter the concept you want explained
4. Select additional options (examples, historical context)
5. Get comprehensive explanations

### Formula Reference
1. Select subject and topic
2. Optionally search for specific formulas
3. Get organized formula sheets with definitions and usage notes

### Study Tips
1. Choose your subject
2. Select learning style and study goals
3. Pick your specific challenges
4. Receive personalized study recommendations

## ⚙️ Configuration

### Settings Panel
Access via the gear icon in the navigation bar:

- **API Key:** Enter your Together.xyz API key
- **AI Model:** Choose from available models:
  - Llama 3.3 70B (Recommended)
  - Llama 3.1 70B
  - Llama 3 8B (Faster)
  - Mixtral 8x7B
- **Temperature:** Control creativity/randomness (0.0-1.0)

### Theme Toggle
- Click the moon/sun icon to switch between dark and light themes
- Theme preference is automatically saved

### Keyboard Shortcuts
- `Ctrl/Cmd + Enter` - Execute current action
- `Ctrl/Cmd + ,` - Open settings
- `Alt + ←/→` - Navigate between tabs

## 🎨 Design Features

### Glassmorphism UI
- Semi-transparent backgrounds with blur effects
- Subtle borders and shadows
- Modern, floating card design

### Responsive Layout
- Mobile-first design approach
- Adaptive navigation and content layout
- Touch-friendly interface elements

### Smooth Animations
- Hover effects and micro-interactions
- Page transitions and loading animations
- Performance-optimized CSS animations

### Accessibility
- Keyboard navigation support
- Focus indicators
- Semantic HTML structure
- Color contrast compliance

## 📁 Project Structure

```
stem-problem-solver-flask/
├── app.py                 # Flask backend application
├── requirements.txt       # Python dependencies
├── README.md             # Project documentation
├── templates/
│   └── index.html        # Main HTML template
├── static/
│   ├── css/
│   │   └── style.css     # Futuristic styling
│   └── js/
│       └── script.js     # Frontend functionality
└── utils.py              # Utility functions (legacy)
```

## 🔧 Development

### Adding New Features
1. Backend: Add new routes in `app.py`
2. Frontend: Update HTML structure in `templates/index.html`
3. Styling: Add CSS in `static/css/style.css`
4. Functionality: Add JavaScript in `static/js/script.js`

### Customizing Themes
Edit CSS custom properties in `static/css/style.css`:
```css
:root {
    --primary-color: #0066ff;
    --bg-primary: #0a0e1a;
    /* ... other variables */
}
```

### Adding New AI Models
Update the models list in both:
- `app.py` (backend route)
- `static/js/script.js` (frontend options)

## 🌐 Deployment

### Local Development
```bash
python app.py
```

### Production Deployment
For production, consider using:
- **Gunicorn** for WSGI server
- **Nginx** for reverse proxy
- **Docker** for containerization

Example with Gunicorn:
```bash
pip install gunicorn
gunicorn --bind 0.0.0.0:5000 app:app
```

## 🚨 Troubleshooting

### Common Issues

**API Key Errors:**
- Ensure your Together.xyz API key is valid
- Check rate limits on your API account
- Verify internet connection

**Loading Issues:**
- Check browser console for JavaScript errors
- Ensure all static files are loading correctly
- Try clearing browser cache

**Performance Issues:**
- Use faster AI models (Llama 3 8B)
- Reduce temperature for faster responses
- Check network connectivity

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Together.xyz** for providing free AI model access
- **Font Awesome** for beautiful icons
- **Google Fonts** for Inter and JetBrains Mono fonts
- **The open-source community** for inspiration and tools

## 📞 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section
2. Search existing issues
3. Create a new issue with detailed information

---

**Built with ❤️ for educational excellence and STEM learning**