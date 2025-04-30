import streamlit as st
import requests
import json
import time
import os
from datetime import datetime

# Configuration
st.set_page_config(
    page_title="Advanced STEM Problem Solver",
    page_icon="🧪",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- Functions for API calls ---
def call_together_api(prompt, model="meta-llama/Llama-3.3-70B-Instruct-Turbo-Free", temperature=0.2, max_tokens=2048):
    """Make API call to Together.xyz with proper error handling and retries"""
    url = "https://api.together.xyz/inference"
    
    # Use default API key if not available in session state
    api_key = st.session_state.get('api_key', '729f85d6374d26fa145e19311616481801359c1a31bbc9a31fe51eefc35ada7d')
    
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
            with st.spinner(f"Solving problem (attempt {attempt+1}/{max_retries})..."):
                response = requests.post(url, headers=headers, json=data, timeout=60)
                
                # Check if response was successful
                if response.status_code == 200:
                    result = response.json()
                    return result['output']['choices'][0]['text']
                elif response.status_code == 401:
                    st.warning("API key error. Using default key.")
                    # If user-provided key failed, use default
                    if api_key != '729f85d6374d26fa145e19311616481801359c1a31bbc9a31fe51eefc35ada7d':
                        st.session_state.api_key = '729f85d6374d26fa145e19311616481801359c1a31bbc9a31fe51eefc35ada7d'
                        return call_together_api(prompt, model, temperature, max_tokens)
                    else:
                        st.error("Default API key also failed. Please try again later.")
                        return None
                else:
                    st.warning(f"API call failed with status code {response.status_code}. Retrying...")
        
        except Exception as e:
            st.warning(f"Error during API call: {str(e)}. Retrying...")
        
        # Wait before retry with exponential backoff
        wait_time = base_wait ** attempt
        time.sleep(wait_time)
    
    st.error("Failed to get a response after multiple attempts. Please try again later.")
    return None

# --- CSS for styling ---
def load_css():
    st.markdown("""
    <style>
    /* Main container styling */
    .main {
        background-color: #f8f9fa;
        color: #212529;
    }
    
    /* Custom container */
    .custom-container {
        background-color: #ffffff;
        padding: 2rem;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        margin-bottom: 1.5rem;
    }
    
    /* Headers */
    h1 {
        color: #0c2461;
        font-weight: 800;
        font-size: 2.5rem;
        margin-bottom: 1rem;
    }
    
    h2 {
        color: #1e3799;
        font-weight: 600;
        font-size: 1.8rem;
        margin-bottom: 0.8rem;
    }
    
    h3 {
        color: #3c6382;
        font-weight: 600;
        font-size: 1.4rem;
    }
    
    /* Topic selector */
    .stSelectbox > div > div {
        background-color: #f1f2f6;
        border-radius: 5px;
        border: 1px solid #dfe4ea;
    }
    
    /* Buttons */
    .stButton > button {
        background-color: #3498db;
        color: white;
        border: none;
        border-radius: 5px;
        padding: 0.5rem 1.5rem;
        font-weight: 600;
        transition: all 0.3s ease;
    }
    
    .stButton > button:hover {
        background-color: #2980b9;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    
    .secondary-button > button {
        background-color: #95a5a6;
    }
    
    .secondary-button > button:hover {
        background-color: #7f8c8d;
    }
    
    /* Text areas */
    .stTextArea > div > div > textarea {
        border: 1px solid #dfe4ea;
        border-radius: 5px;
        background-color: #f8f9fa;
        font-size: 1rem;
        padding: 0.8rem;
    }
    
    /* Status messages */
    .stSuccess {
        background-color: #d4edda;
        border-color: #c3e6cb;
        padding: 1rem;
        border-radius: 5px;
        color: #155724;
    }
    
    .stError {
        background-color: #f8d7da;
        border-color: #f5c6cb;
        padding: 1rem;
        border-radius: 5px;
        color: #721c24;
    }
    
    /* Info box */
    .info-box {
        background-color: #e3f2fd;
        border-left: 5px solid #2196f3;
        padding: 1rem;
        margin: 1rem 0;
        border-radius: 5px;
    }
    
    /* Solution display */
    .solution-container {
        background-color: #f0f8ff;
        border-radius: 8px;
        border: 1px solid #d1e3fa;
        padding: 1.5rem;
        margin-top: 1rem;
    }
    
    /* Footer */
    footer {
        margin-top: 3rem;
        text-align: center;
        color: #7f8c8d;
        font-size: 0.8rem;
        border-top: 1px solid #ecf0f1;
        padding-top: 1rem;
    }
    
    /* Tabs styling */
    .stTabs [data-baseweb="tab-list"] {
        gap: 2px;
    }
    
    .stTabs [data-baseweb="tab"] {
        background-color: #f1f2f6;
        border-radius: 4px 4px 0px 0px;
        padding: 10px 20px;
        border: 1px solid #dfe4ea;
    }
    
    .stTabs [aria-selected="true"] {
        background-color: #3498db;
        color: white;
    }
    
    /* Card styling */
    .card {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        padding: 15px;
        margin-bottom: 15px;
        transition: transform 0.3s ease;
    }
    
    .card:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    
    /* Expander styling */
    .streamlit-expanderHeader {
        font-size: 1.1rem;
        color: #3498db;
    }
    </style>
    """, unsafe_allow_html=True)

# Initialize session state
if 'history' not in st.session_state:
    st.session_state.history = []
if 'api_key' not in st.session_state:
    st.session_state.api_key = "729f85d6374d26fa145e19311616481801359c1a31bbc9a31fe51eefc35ada7d"
if 'model' not in st.session_state:
    st.session_state.model = "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free"

# Load CSS
load_css()

# --- Sidebar ---
st.sidebar.title("🧪 STEM Solver Settings")

with st.sidebar.expander("📋 API Configuration", expanded=False):
    api_key = st.text_input("Together API Key", 
                           value=st.session_state.get('api_key', ''), 
                           type="password",
                           help="Get your API key from https://api.together.xyz/settings/api-keys")
    if api_key:
        st.session_state.api_key = api_key
        st.success("API key saved!")

with st.sidebar.expander("⚙️ Model Settings", expanded=False):
    model_options = {
        "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free": "Llama 3.3 70B (Recommended)",
        "meta-llama/Llama-3.1-70B-Instruct": "Llama 3.1 70B",
        "meta-llama/Llama-3-8B-Instruct": "Llama 3 8B (Faster)",
        "mistralai/Mixtral-8x7B-Instruct-v0.1": "Mixtral 8x7B"
    }
    selected_model = st.selectbox("Select AI Model", 
                               options=list(model_options.keys()),
                               format_func=lambda x: model_options[x],
                               index=list(model_options.keys()).index(st.session_state.model))
    st.session_state.model = selected_model
    
    temperature = st.slider("Temperature (Creativity)", 0.0, 1.0, 0.2, 0.1, 
                         help="Higher values make output more creative, lower values more deterministic")

# Subject guides
st.sidebar.header("📚 Subject Guides")
subject_info = {
    "Physics": "Mechanics, Thermodynamics, Electromagnetism, Quantum Physics, Optics, etc.",
    "Chemistry": "Organic Chemistry, Inorganic Chemistry, Physical Chemistry, Biochemistry, etc.",
    "Mathematics": "Algebra, Calculus, Statistics, Geometry, Trigonometry, etc.",
    "Biology": "Molecular Biology, Genetics, Ecology, Physiology, etc.",
    "Computer Science": "Algorithms, Data Structures, Programming, Database Systems, etc."
}

for subject, topics in subject_info.items():
    with st.sidebar.expander(f"{subject}"):
        st.write(f"**Topics covered:** {topics}")

# History section in sidebar
st.sidebar.header("📝 Recent Problems")
if st.session_state.history:
    for i, (timestamp, problem, _) in enumerate(st.session_state.history[-5:]):
        with st.sidebar.container():
            st.markdown(f"**{timestamp}**")
            st.markdown(f"*{problem[:50]}{'...' if len(problem) > 50 else ''}*")
            if st.button(f"Load Problem #{i+1}", key=f"load_{i}"):
                st.session_state.loaded_problem = problem

# Example problems
st.sidebar.markdown("---")
with st.sidebar.expander("🔍 Example Problems"):
    example_problems = {
        "Physics": "A block of mass 2kg slides down a frictionless inclined plane that makes an angle of 30° with the horizontal. Calculate the acceleration of the block.",
        "Chemistry": "Calculate the pH of a 0.1M HCl solution.",
        "Mathematics": "Find the derivative of f(x) = 3x⁴ - 2x³ + 5x - 7.",
        "Biology": "Explain the process of cellular respiration and calculate the net ATP production.",
        "Computer Science": "Write an algorithm to find the maximum element in an array and analyze its time complexity."
    }
    
    for subject, problem in example_problems.items():
        if st.button(f"Load {subject} Example", key=f"example_{subject}"):
            st.session_state.loaded_problem = problem

# --- Main Content ---
st.title("🧪 Advanced STEM Problem Solver")

# Tabs for different features
tabs = st.tabs(["Problem Solver", "Concept Explainer", "Formula Reference", "Study Tips"])

with tabs[0]:  # Problem Solver Tab
    st.markdown("""
    <div class="info-box">
    📝 Enter your STEM problem below for a detailed step-by-step solution with explanations of key concepts.
    </div>
    """, unsafe_allow_html=True)
    
    # Subject selector
    col1, col2 = st.columns([1, 1])
    with col1:
        subject = st.selectbox("Select Subject", 
                              ["Physics", "Chemistry", "Mathematics", "Biology", "Computer Science"])
    with col2:
        difficulty = st.select_slider("Difficulty Level", 
                                    options=["Beginner", "Intermediate", "Advanced", "University", "Graduate"])
    
    # Problem input
    problem = st.text_area("Enter your problem:", 
                          height=150, 
                          placeholder="Type or paste your problem here...",
                          value=st.session_state.get('loaded_problem', ''))
    
    # Additional options
    col1, col2, col3 = st.columns([1, 1, 1])
    with col1:
        show_steps = st.checkbox("Show detailed steps", value=True)
    with col2:
        include_theory = st.checkbox("Include theoretical explanations", value=True)
    with col3:
        include_diagrams = st.checkbox("Suggest diagrams where applicable", value=True)
    
    # Solve button
    solve_col, clear_col = st.columns([1, 5])
    with solve_col:
        solve_button = st.button("🔍 Solve Problem", type="primary", use_container_width=True)
    with clear_col:
        if st.button("Clear", use_container_width=False):
            st.session_state.loaded_problem = ""
            st.experimental_rerun()
    
    # Process the solution
    if solve_button and problem:
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
        
        # Call API
        try:
            solution = call_together_api(
                prompt=prompt,
                model=st.session_state.model,
                temperature=temperature
            )
            
            # Display solution if successful
            if solution:
                st.markdown("""
                <div class="solution-container">
                <h2>📝 Solution</h2>
                """, unsafe_allow_html=True)
                
                st.markdown(solution)
                st.markdown("</div>", unsafe_allow_html=True)
                
                # Add to history
                timestamp = datetime.now().strftime("%H:%M:%S")
                st.session_state.history.append((timestamp, problem, solution))
                
                # Download button for solution
                st.download_button(
                    label="Download Solution",
                    data=f"Problem:\n{problem}\n\nSolution:\n{solution}",
                    file_name=f"{subject.lower()}_solution_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt",
                    mime="text/plain"
                )
            else:
                st.error("Failed to get a solution. Please try again.")
        except Exception as e:
            st.error(f"An error occurred: {str(e)}")

with tabs[1]:  # Concept Explainer Tab
    st.markdown("""
    <div class="info-box">
    🧠 Get clear explanations of complex STEM concepts with examples and applications.
    </div>
    """, unsafe_allow_html=True)
    
    concept_subject = st.selectbox("Subject Area", 
                                 ["Physics", "Chemistry", "Mathematics", "Biology", "Computer Science"],
                                 key="concept_subject")
    
    concept = st.text_input("Enter concept to explain:", placeholder="e.g., Quantum Entanglement, Stoichiometry, Integration by Parts...")
    
    col1, col2 = st.columns([1, 1])
    with col1:
        explanation_level = st.radio("Explanation Level", ["Beginner", "Intermediate", "Advanced"])
    with col2:
        include_examples = st.checkbox("Include practical examples", value=True)
        include_history = st.checkbox("Include historical context", value=False)
    
    if st.button("Explain Concept", type="primary") and concept:
        prompt = f"""
        As an expert professor in {concept_subject}, provide a clear and comprehensive explanation of the concept of '{concept}' at an {explanation_level.lower()} level.
        
        Structure your explanation as follows:
        1. Definition and basic explanation
        2. Key principles and mechanisms
        3. {"Historical development and important contributors" if include_history else ""}
        4. {"Practical examples and real-world applications" if include_examples else ""}
        5. Common misconceptions or challenging aspects
        6. Related concepts that build upon this knowledge
        
        Make your explanation engaging and approachable while maintaining scientific accuracy.
        """
        
        try:
            explanation = call_together_api(
                prompt=prompt,
                model=st.session_state.model,
                temperature=temperature
            )
            
            if explanation:
                st.markdown(f"""
                <div class="solution-container">
                <h2>🧠 {concept}</h2>
                """, unsafe_allow_html=True)
                
                st.markdown(explanation)
                st.markdown("</div>", unsafe_allow_html=True)
            else:
                st.error("Failed to get an explanation. Please try again.")
        except Exception as e:
            st.error(f"An error occurred: {str(e)}")

with tabs[2]:  # Formula Reference Tab
    st.markdown("""
    <div class="info-box">
    📊 Quick reference for formulas and equations across STEM fields.
    </div>
    """, unsafe_allow_html=True)
    
    col1, col2 = st.columns([1, 2])
    
    with col1:
        formula_subject = st.selectbox(
            "Subject", 
            ["Physics", "Chemistry", "Mathematics", "Biology", "Engineering"],
            key="formula_subject"
        )
        
        # Dynamic topic selection based on subject
        topics = {
            "Physics": ["Mechanics", "Thermodynamics", "Electromagnetism", "Optics", "Quantum Physics", "Relativity"],
            "Chemistry": ["Stoichiometry", "Thermochemistry", "Chemical Equilibrium", "Acids & Bases", "Electrochemistry", "Organic Chemistry"],
            "Mathematics": ["Algebra", "Calculus", "Statistics", "Geometry", "Trigonometry", "Linear Algebra"],
            "Biology": ["Genetics", "Ecology", "Cellular Biology", "Physiology", "Evolution", "Biochemistry"],
            "Engineering": ["Fluid Mechanics", "Structural Analysis", "Circuit Theory", "Signal Processing", "Control Systems", "Thermodynamics"]
        }
        
        formula_topic = st.selectbox("Topic", topics.get(formula_subject, ["General"]))
        
        formula_search = st.text_input("Search for specific formula:", placeholder="e.g., Newton's Second Law")
        
        if st.button("Get Formulas", type="primary"):
            prompt = f"""
            As an expert in {formula_subject}, provide a well-organized reference guide for the most important formulas in {formula_topic}.
            
            {f'Focus specifically on formulas related to "{formula_search}".' if formula_search else ''}
            
            For each formula:
            1. Write the formula with clear notation
            2. Define each variable and constant
            3. Note the units used (SI preferred)
            4. Provide a brief explanation of when and how the formula is used
            5. Note any special conditions or limitations
            
            Format your response as a clear reference guide with sections and subsections as appropriate.
            """
            
            try:
                formulas = call_together_api(
                    prompt=prompt,
                    model=st.session_state.model,
                    temperature=0.1  # Lower temperature for more factual content
                )
                
                if formulas:
                    st.session_state.current_formulas = formulas
                else:
                    st.error("Failed to get formulas. Please try again.")
            except Exception as e:
                st.error(f"An error occurred: {str(e)}")
    
    with col2:
        # Display formulas
        if 'current_formulas' in st.session_state and st.session_state.current_formulas:
            st.markdown("""
            <div class="solution-container">
            <h2>📊 Formula Reference</h2>
            """, unsafe_allow_html=True)
            
            st.markdown(st.session_state.current_formulas)
            st.markdown("</div>", unsafe_allow_html=True)
            
            # Download button for formulas
            st.download_button(
                label="Download Formula Sheet",
                data=st.session_state.current_formulas,
                file_name=f"{formula_subject}_{formula_topic}_formulas.txt",
                mime="text/plain"
            )
        else:
            st.info("Select a subject and topic, then click 'Get Formulas' to display the reference guide.")

with tabs[3]:  # Study Tips Tab
    st.markdown("""
    <div class="info-box">
    📚 Get personalized study techniques and advice for mastering STEM subjects.
    </div>
    """, unsafe_allow_html=True)
    
    study_subject = st.selectbox("Subject", ["General STEM", "Physics", "Chemistry", "Mathematics", "Biology", "Computer Science"], key="study_subject")
    
    col1, col2 = st.columns([1, 1])
    with col1:
        learning_style = st.selectbox("Your Learning Style", ["Visual", "Auditory", "Reading/Writing", "Kinesthetic", "Not Sure"])
    with col2:
        study_goal = st.selectbox("Study Goal", ["General Understanding", "Exam Preparation", "Problem-Solving Skills", "Research Preparation", "Long-term Retention"])
    
    challenges = st.multiselect("Select Your Challenges", 
                              ["Complex Concepts", "Mathematical Calculations", "Memorization", "Problem-Solving", "Time Management", "Test Anxiety", "Staying Motivated"])
    
    if st.button("Get Study Tips", type="primary"):
        prompt = f"""
        As an experienced STEM educator, provide personalized study advice for a student with the following profile:
        
        Subject: {study_subject}
        Learning Style: {learning_style}
        Study Goal: {study_goal}
        Challenges: {', '.join(challenges)}
        
        Please include:
        1. Specific study techniques tailored to their learning style and challenges
        2. Recommended study resources (types of books, online platforms, etc.)
        3. Effective problem-solving approaches for {study_subject}
        4. Time management and organization strategies
        5. Methods to test understanding and track progress
        
        Make your advice practical, specific, and actionable.
        """
        
        try:
            study_tips = call_together_api(
                prompt=prompt,
                model=st.session_state.model,
                temperature=0.3
            )
            
            if study_tips:
                st.markdown("""
                <div class="solution-container">
                <h2>📚 Personalized Study Plan</h2>
                """, unsafe_allow_html=True)
                
                st.markdown(study_tips)
                st.markdown("</div>", unsafe_allow_html=True)
                
                # Download button for study plan
                st.download_button(
                    label="Download Study Plan",
                    data=study_tips,
                    file_name=f"{study_subject.lower().replace(' ', '_')}_study_plan.txt",
                    mime="text/plain"
                )
            else:
                st.error("Failed to get study tips. Please try again.")
        except Exception as e:
            st.error(f"An error occurred: {str(e)}")

# Footer
st.markdown("""
<footer>
<p>🧪 Advanced STEM Problem Solver | Created for educational purposes | Last updated: April 2025</p>
<p>This tool is designed to help with understanding STEM concepts and problems, not to replace learning or academic integrity.</p>
</footer>
""", unsafe_allow_html=True)