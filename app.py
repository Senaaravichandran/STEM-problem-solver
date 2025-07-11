from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import requests
import json
import time
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

class STEMSolver:
    def __init__(self):
        self.default_api_key = "729f85d6374d26fa145e19311616481801359c1a31bbc9a31fe51eefc35ada7d"
        self.base_url = "https://api.together.xyz/inference"
        
    def call_together_api(self, prompt, model="meta-llama/Llama-3.3-70B-Instruct-Turbo-Free", 
                         temperature=0.2, max_tokens=2048, api_key=None):
        """Make API call to Together.xyz with proper error handling and retries"""
        
        if not api_key:
            api_key = self.default_api_key
        
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
                response = requests.post(self.base_url, headers=headers, json=data, timeout=60)
                
                if response.status_code == 200:
                    result = response.json()
                    if result and 'output' in result and 'choices' in result['output'] and len(result['output']['choices']) > 0:
                        return {
                            "success": True,
                            "result": result['output']['choices'][0]['text'],
                            "error": None
                        }
                    else:
                        return {
                            "success": False,
                            "result": None,
                            "error": "Invalid response format from API"
                        }
                elif response.status_code == 401:
                    return {
                        "success": False,
                        "result": None,
                        "error": "API key invalid"
                    }
                else:
                    if attempt == max_retries - 1:
                        return {
                            "success": False,
                            "result": None,
                            "error": f"API call failed with status code {response.status_code}"
                        }
            
            except Exception as e:
                if attempt == max_retries - 1:
                    return {
                        "success": False,
                        "result": None,
                        "error": f"Error during API call: {str(e)}"
                    }
            
            # Wait before retry with exponential backoff
            wait_time = base_wait ** attempt
            time.sleep(wait_time)

solver = STEMSolver()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/solve', methods=['POST'])
def solve_problem():
    """Solve a STEM problem with detailed explanation"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No data provided"})
            
        problem = data.get('problem', '')
        subject = data.get('subject', 'General')
        difficulty = data.get('difficulty', 'Intermediate')
        show_steps = data.get('show_steps', True)
        include_theory = data.get('include_theory', True)
        include_diagrams = data.get('include_diagrams', True)
        model = data.get('model', 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free')
        temperature = data.get('temperature', 0.2)
        api_key = data.get('api_key')
        
        if not problem:
            return jsonify({"success": False, "error": "Problem text is required"})
        
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
        
        result = solver.call_together_api(prompt, model, temperature, 2048, api_key)
        
        if result and result["success"]:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            return jsonify({
                "success": True,
                "solution": result["result"],
                "timestamp": timestamp,
                "problem": problem,
                "subject": subject
            })
        else:
            error_msg = result["error"] if result else "Unknown error occurred"
            return jsonify({"success": False, "error": error_msg})
            
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/api/explain', methods=['POST'])
def explain_concept():
    """Explain a STEM concept with examples and applications"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No data provided"})
            
        concept = data.get('concept', '')
        subject = data.get('subject', 'General')
        level = data.get('level', 'Intermediate')
        include_examples = data.get('include_examples', True)
        include_history = data.get('include_history', False)
        model = data.get('model', 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free')
        temperature = data.get('temperature', 0.2)
        api_key = data.get('api_key')
        
        if not concept:
            return jsonify({"success": False, "error": "Concept is required"})
        
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
        
        result = solver.call_together_api(prompt, model, temperature, 2048, api_key)
        
        if result and result["success"]:
            return jsonify({
                "success": True,
                "explanation": result["result"],
                "concept": concept,
                "subject": subject
            })
        else:
            error_msg = result["error"] if result else "Unknown error occurred"
            return jsonify({"success": False, "error": error_msg})
            
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/api/formulas', methods=['POST'])
def get_formulas():
    """Get formula reference for a specific topic"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No data provided"})
            
        subject = data.get('subject', 'Physics')
        topic = data.get('topic', 'General')
        search_term = data.get('search_term', '')
        model = data.get('model', 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free')
        api_key = data.get('api_key')
        
        prompt = f"""
        As an expert in {subject}, provide a well-organized reference guide for the most important formulas in {topic}.
        
        {f'Focus specifically on formulas related to "{search_term}".' if search_term else ''}
        
        For each formula:
        1. Write the formula with clear notation
        2. Define each variable and constant
        3. Note the units used (SI preferred)
        4. Provide a brief explanation of when and how the formula is used
        5. Note any special conditions or limitations
        
        Format your response as a clear reference guide with sections and subsections as appropriate.
        """
        
        result = solver.call_together_api(prompt, model, 0.1, 2048, api_key)
        
        if result and result["success"]:
            return jsonify({
                "success": True,
                "formulas": result["result"],
                "subject": subject,
                "topic": topic
            })
        else:
            error_msg = result["error"] if result else "Unknown error occurred"
            return jsonify({"success": False, "error": error_msg})
            
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/api/study-tips', methods=['POST'])
def get_study_tips():
    """Get personalized study tips and advice"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No data provided"})
            
        subject = data.get('subject', 'General STEM')
        learning_style = data.get('learning_style', 'Visual')
        study_goal = data.get('study_goal', 'General Understanding')
        challenges = data.get('challenges', [])
        model = data.get('model', 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free')
        api_key = data.get('api_key')
        
        prompt = f"""
        As an experienced STEM educator, provide personalized study advice for a student with the following profile:
        
        Subject: {subject}
        Learning Style: {learning_style}
        Study Goal: {study_goal}
        Challenges: {', '.join(challenges)}
        
        Please include:
        1. Specific study techniques tailored to their learning style and challenges
        2. Recommended study resources (types of books, online platforms, etc.)
        3. Effective problem-solving approaches for {subject}
        4. Time management and organization strategies
        5. Methods to test understanding and track progress
        
        Make your advice practical, specific, and actionable.
        """
        
        result = solver.call_together_api(prompt, model, 0.3, 2048, api_key)
        
        if result and result["success"]:
            return jsonify({
                "success": True,
                "study_tips": result["result"],
                "subject": subject
            })
        else:
            error_msg = result["error"] if result else "Unknown error occurred"
            return jsonify({"success": False, "error": error_msg})
            
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/api/models', methods=['GET'])
def get_models():
    """Get available AI models"""
    models = {
        "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free": "Llama 3.3 70B (Recommended)",
        "meta-llama/Llama-3.1-70B-Instruct": "Llama 3.1 70B",
        "meta-llama/Llama-3-8B-Instruct": "Llama 3 8B (Faster)",
        "mistralai/Mixtral-8x7B-Instruct-v0.1": "Mixtral 8x7B"
    }
    return jsonify({"models": models})

@app.route('/api/subjects', methods=['GET'])
def get_subjects():
    """Get available subjects and their topics"""
    subjects = {
        "Physics": ["Mechanics", "Thermodynamics", "Electromagnetism", "Optics", "Quantum Physics", "Relativity"],
        "Chemistry": ["Stoichiometry", "Thermochemistry", "Chemical Equilibrium", "Acids & Bases", "Electrochemistry", "Organic Chemistry"],
        "Mathematics": ["Algebra", "Calculus", "Statistics", "Geometry", "Trigonometry", "Linear Algebra"],
        "Biology": ["Genetics", "Ecology", "Cellular Biology", "Physiology", "Evolution", "Biochemistry"],
        "Computer Science": ["Algorithms", "Data Structures", "Programming", "Database Systems", "Machine Learning", "Web Development"],
        "Engineering": ["Fluid Mechanics", "Structural Analysis", "Circuit Theory", "Signal Processing", "Control Systems", "Thermodynamics"]
    }
    return jsonify({"subjects": subjects})

@app.route('/api/examples', methods=['GET'])
def get_example_problems():
    """Get example problems for each subject"""
    examples = {
        "Physics": "A block of mass 2kg slides down a frictionless inclined plane that makes an angle of 30° with the horizontal. Calculate the acceleration of the block.",
        "Chemistry": "Calculate the pH of a 0.1M HCl solution and explain the dissociation process.",
        "Mathematics": "Find the derivative of f(x) = 3x⁴ - 2x³ + 5x - 7 using the power rule.",
        "Biology": "Explain the process of cellular respiration and calculate the net ATP production from one glucose molecule.",
        "Computer Science": "Write an algorithm to find the maximum element in an array and analyze its time complexity.",
        "Engineering": "Calculate the stress in a steel beam with a rectangular cross-section under a given load."
    }
    return jsonify({"examples": examples})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)