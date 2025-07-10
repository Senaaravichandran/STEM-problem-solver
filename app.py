from flask import Flask, request, jsonify, render_template, send_from_directory
import requests
import json
import time
from datetime import datetime
import os

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'

# Configuration
DEFAULT_API_KEY = '729f85d6374d26fa145e19311616481801359c1a31bbc9a31fe51eefc35ada7d'
DEFAULT_MODEL = "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free"

def call_together_api(prompt, model=DEFAULT_MODEL, temperature=0.2, max_tokens=2048, api_key=None):
    """Make API call to Together.xyz with proper error handling and retries"""
    url = "https://api.together.xyz/inference"
    
    if not api_key:
        api_key = DEFAULT_API_KEY
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Format prompt according to model requirements
    formatted_prompt = f"[INST]{prompt}[/INST]"
    
    data = {
        "model": model,
        "prompt": formatted_prompt,
        "temperature": temperature,
        "max_tokens": max_tokens
    }
    
    # Implement retry mechanism
    max_retries = 3
    base_wait = 2
    
    for attempt in range(max_retries):
        try:
            response = requests.post(url, headers=headers, json=data, timeout=60)
            
            if response.status_code == 200:
                result = response.json()
                return {
                    'success': True,
                    'result': result['output']['choices'][0]['text']
                }
            elif response.status_code == 401:
                if api_key != DEFAULT_API_KEY:
                    # Try with default key as fallback
                    return call_together_api(prompt, model, temperature, max_tokens, DEFAULT_API_KEY)
                else:
                    return {
                        'success': False,
                        'error': 'API key authentication failed'
                    }
            else:
                if attempt == max_retries - 1:
                    return {
                        'success': False,
                        'error': f'API call failed with status code {response.status_code}'
                    }
        
        except Exception as e:
            if attempt == max_retries - 1:
                return {
                    'success': False,
                    'error': f'Error during API call: {str(e)}'
                }
        
        # Wait before retry with exponential backoff
        wait_time = base_wait ** attempt
        time.sleep(wait_time)
    
    return {
        'success': False,
        'error': 'Failed to get a response after multiple attempts'
    }

@app.route('/')
def index():
    """Serve the main page"""
    return render_template('index.html')

@app.route('/api/solve-problem', methods=['POST'])
def solve_problem():
    """API endpoint for solving STEM problems"""
    data = request.get_json()
    
    problem = data.get('problem', '')
    subject = data.get('subject', 'Mathematics')
    difficulty = data.get('difficulty', 'Intermediate')
    show_steps = data.get('show_steps', True)
    include_theory = data.get('include_theory', True)
    include_diagrams = data.get('include_diagrams', True)
    temperature = data.get('temperature', 0.2)
    model = data.get('model', DEFAULT_MODEL)
    api_key = data.get('api_key')
    
    if not problem:
        return jsonify({'success': False, 'error': 'Problem text is required'})
    
    # Construct the prompt
    prompt = f"""
    You are an expert professor specialized in {subject} with years of experience teaching at all levels from beginner to graduate level.
    
    I need you to solve the following {difficulty}-level {subject} problem step by step:
    
    PROBLEM: {problem}
    
    Requirements:
    1. Start with a brief overview of the concepts involved.
    2. {f"Break down the solution into clear, logical steps showing all calculations." if show_steps else "Provide a concise solution."}
    3. {f"Explain the underlying theoretical principles and concepts relevant to this problem." if include_theory else ""}
    4. {f"Describe any diagrams, graphs, or visual representations that would be helpful." if include_diagrams else ""}
    5. End with a summary of the key takeaways from this problem.
    
    Format your response with appropriate sections and mathematical notation where applicable.
    """
    
    result = call_together_api(prompt, model, temperature, 2048, api_key)
    return jsonify(result)

@app.route('/api/explain-concept', methods=['POST'])
def explain_concept():
    """API endpoint for explaining STEM concepts"""
    data = request.get_json()
    
    concept = data.get('concept', '')
    subject = data.get('subject', 'Mathematics')
    level = data.get('level', 'Intermediate')
    include_examples = data.get('include_examples', True)
    include_history = data.get('include_history', False)
    temperature = data.get('temperature', 0.2)
    model = data.get('model', DEFAULT_MODEL)
    api_key = data.get('api_key')
    
    if not concept:
        return jsonify({'success': False, 'error': 'Concept name is required'})
    
    prompt = f"""
    As an expert professor in {subject}, provide a clear and comprehensive explanation of the concept of '{concept}' at an {level.lower()} level.
    
    Structure your explanation as follows:
    1. Definition and basic explanation
    2. Key principles and mechanisms
    3. {"Historical development and important contributors" if include_history else ""}
    4. {"Practical examples and real-world applications" if include_examples else ""}
    5. Common misconceptions or challenging aspects
    6. Related concepts that build upon this knowledge
    
    Make your explanation engaging and approachable while maintaining scientific accuracy.
    """
    
    result = call_together_api(prompt, model, temperature, 2048, api_key)
    return jsonify(result)

@app.route('/api/get-formulas', methods=['POST'])
def get_formulas():
    """API endpoint for getting formula references"""
    data = request.get_json()
    
    subject = data.get('subject', 'Physics')
    topic = data.get('topic', 'General')
    search = data.get('search', '')
    temperature = data.get('temperature', 0.1)
    model = data.get('model', DEFAULT_MODEL)
    api_key = data.get('api_key')
    
    prompt = f"""
    As an expert in {subject}, provide a well-organized reference guide for the most important formulas in {topic}.
    
    {f'Focus specifically on formulas related to "{search}".' if search else ''}
    
    For each formula:
    1. Write the formula with clear notation
    2. Define each variable and constant
    3. Note the units used (SI preferred)
    4. Provide a brief explanation of when and how the formula is used
    5. Note any special conditions or limitations
    
    Format your response as a clear reference guide with sections and subsections as appropriate.
    """
    
    result = call_together_api(prompt, model, temperature, 2048, api_key)
    return jsonify(result)

@app.route('/api/study-tips', methods=['POST'])
def study_tips():
    """API endpoint for getting personalized study tips"""
    data = request.get_json()
    
    subject = data.get('subject', 'General STEM')
    learning_style = data.get('learning_style', 'Visual')
    goal = data.get('goal', 'General Understanding')
    challenges = data.get('challenges', [])
    temperature = data.get('temperature', 0.3)
    model = data.get('model', DEFAULT_MODEL)
    api_key = data.get('api_key')
    
    prompt = f"""
    As an experienced STEM educator, provide personalized study advice for a student with the following profile:
    
    Subject: {subject}
    Learning Style: {learning_style}
    Study Goal: {goal}
    Challenges: {', '.join(challenges)}
    
    Please include:
    1. Specific study techniques tailored to their learning style and challenges
    2. Recommended study resources (types of books, online platforms, etc.)
    3. Effective problem-solving approaches for {subject}
    4. Time management and organization strategies
    5. Methods to test understanding and track progress
    
    Make your advice practical, specific, and actionable.
    """
    
    result = call_together_api(prompt, model, temperature, 2048, api_key)
    return jsonify(result)

@app.route('/api/models')
def get_models():
    """Get available AI models"""
    models = {
        "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free": "Llama 3.3 70B (Recommended)",
        "meta-llama/Llama-3.1-70B-Instruct": "Llama 3.1 70B",
        "meta-llama/Llama-3-8B-Instruct": "Llama 3 8B (Faster)",
        "mistralai/Mixtral-8x7B-Instruct-v0.1": "Mixtral 8x7B"
    }
    return jsonify(models)

@app.route('/static/<path:filename>')
def static_files(filename):
    """Serve static files"""
    return send_from_directory('static', filename)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)