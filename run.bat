@echo off
title Advanced STEM Problem Solver

echo 🧪 Starting Advanced STEM Problem Solver...
echo ==========================================

REM Check if virtual environment exists
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate

REM Install dependencies
echo 📚 Installing dependencies...
pip install -r requirements.txt

REM Start the application
echo 🚀 Starting Flask application...
echo.
echo 🌐 Application will be available at: http://localhost:5000
echo ⏹️  Press Ctrl+C to stop the server
echo.

python app.py

pause