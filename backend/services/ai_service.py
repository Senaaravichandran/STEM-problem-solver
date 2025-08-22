import os
import logging
import requests
import os
import logging
from typing import Dict, Any, Optional
from huggingface_hub import InferenceClient
from mistralai import Mistral
from .hf_image_service import HuggingFaceImageService
from .together_ai_service import TogetherAIService

logger = logging.getLogger(__name__)

class AIService:
    """Enhanced AI service supporting multiple models including Mistral, HuggingFace DeepSeek, and Together.xyz"""
    
    def __init__(self):
        # Mistral AI Configuration
        self.mistral_api_key = os.getenv('MISTRAL_API_KEY')
        self.mistral_client = None
        
        # HuggingFace Configuration
        self.hf_token = os.getenv('HUGGINGFACE_TOKEN')
        self.hf_client = None
        
        # Together.xyz Configuration (for ConceptExplainer and StudyTips)
        self.together_client = TogetherAIService()
        
        # Default model configurations
        self.mistral_model = "mistral-large-latest"
        self.deepseek_model = "deepseek-ai/DeepSeek-V3-0324"
        
        # Initialize clients
        self._initialize_clients()
        
        # Initialize HuggingFace image service
        self.image_service = HuggingFaceImageService()
        logger.info("HuggingFace image service initialized")
    
    def _initialize_clients(self):
        """Initialize AI clients with proper error handling"""
        try:
            # Initialize Together.xyz client (always available)
            logger.info("Together.xyz client initialized for ConceptExplainer and StudyTips")
            
            # Initialize Mistral client
            if self.mistral_api_key:
                self.mistral_client = Mistral(api_key=self.mistral_api_key)
                logger.info("Mistral client initialized successfully")
            else:
                logger.warning("Mistral API key not found")
            
            # Initialize HuggingFace client
            if self.hf_token:
                os.environ["HUGGINGFACE_HUB_TOKEN"] = self.hf_token
                self.hf_client = InferenceClient()
                logger.info("HuggingFace client initialized successfully")
            else:
                logger.warning("HuggingFace token not found, using public models")
                self.hf_client = InferenceClient()
                
        except Exception as e:
            logger.error(f"Error initializing AI clients: {str(e)}")
    
    def _create_enhanced_prompt(self, problem: str, subject: str, difficulty: str, 
                              show_steps: bool, include_theory: bool, include_diagrams: bool) -> str:
        """Create an enhanced prompt for STEM problem solving"""
        
        prompt = f"""You are an expert STEM educator and problem solver specializing in {subject}. 
Your expertise spans from beginner to graduate-level concepts, with a focus on clear, pedagogical explanations.

PROBLEM TO SOLVE:
{problem}

CONTEXT:
- Subject: {subject}
- Difficulty Level: {difficulty}
- Student needs: {"Step-by-step breakdown" if show_steps else "Direct solution"}
- Theory requirement: {"Include underlying concepts" if include_theory else "Focus on solution only"}
- Visual aids: {"Suggest diagrams/graphs" if include_diagrams else "Text-based solution"}

RESPONSE REQUIREMENTS:
1. **Problem Analysis**: Briefly identify the key concepts and approach needed
2. **Solution Strategy**: {"Provide detailed step-by-step breakdown" if show_steps else "Present the solution clearly"}
3. **Mathematical Work**: Show all calculations with proper notation
4. **Conceptual Explanation**: {"Explain underlying theories and principles" if include_theory else "Focus on the problem-solving process"}
5. **Visual Recommendations**: {"Describe helpful diagrams, graphs, or visual representations" if include_diagrams else ""}
6. **Key Insights**: Summarize the most important takeaways
7. **Practice Direction**: Suggest related problems or concepts to explore

FORMAT:
- Use clear markdown formatting with proper headers
- Include mathematical expressions in LaTeX notation where applicable
- Organize content with bullet points and numbered lists for clarity
- Make explanations appropriate for {difficulty} level

TONE:
- Encouraging and supportive
- Clear and precise
- Educational and insightful
- Adapted to {difficulty} difficulty level

Please provide a comprehensive solution that helps the student both solve this specific problem and understand the underlying concepts for future learning."""

        return prompt
    
    def solve_with_mistral(self, problem: str, subject: str, difficulty: str, 
                          show_steps: bool = True, include_theory: bool = True, 
                          include_diagrams: bool = True, temperature: float = 0.2) -> Dict[str, Any]:
        """Solve problem using Mistral AI"""
        try:
            if not self.mistral_client:
                raise Exception("Mistral client not initialized")
            
            # Create enhanced prompt
            prompt = self._create_enhanced_prompt(
                problem, subject, difficulty, show_steps, include_theory, include_diagrams
            )
            
            # Create system message for subject expertise
            system_message = f"""You are a world-class {subject} professor with decades of teaching experience. 
You excel at breaking down complex problems into understandable steps and explaining concepts clearly 
to students at all levels from beginner to graduate level. Your teaching style is patient, thorough, 
and always focused on helping students truly understand both the solution process and underlying principles."""
            
            messages = [
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt}
            ]
            
            logger.info(f"Making request to Mistral API with model: {self.mistral_model}")
            
            response = self.mistral_client.chat.complete(
                model=self.mistral_model,
                messages=messages,
                temperature=temperature,
                max_tokens=4000,
                top_p=1.0
            )
            
            solution = response.choices[0].message.content
            
            return {
                "solution": solution,
                "model_used": "Mistral AI",
                "model_version": self.mistral_model,
                "success": True,
                "confidence": "high",
                "processing_time": 0,
                "metadata": {
                    "subject": subject,
                    "difficulty": difficulty,
                    "temperature": temperature,
                    "timestamp": None  # Will be set by the calling function
                }
            }
            
        except Exception as e:
            logger.error(f"Error with Mistral API: {str(e)}")
            raise Exception(f"Mistral AI request failed: {str(e)}")
    
    def solve_with_deepseek(self, problem: str, subject: str, difficulty: str, 
                           show_steps: bool = True, include_theory: bool = True, 
                           include_diagrams: bool = True, temperature: float = 0.2) -> Dict[str, Any]:
        """Solve problem using HuggingFace DeepSeek model"""
        try:
            if not self.hf_client:
                raise Exception("HuggingFace client not initialized")
            
            # Create enhanced prompt
            prompt = self._create_enhanced_prompt(
                problem, subject, difficulty, show_steps, include_theory, include_diagrams
            )
            
            logger.info(f"Making request to HuggingFace DeepSeek model: {self.deepseek_model}")
            
            completion = self.hf_client.chat.completions.create(
                model=self.deepseek_model,
                messages=[
                    {
                        "role": "system",
                        "content": f"""You are an expert {subject} educator specializing in problem-solving and concept explanation. 
Your role is to provide clear, comprehensive solutions that help students learn effectively."""
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=temperature,
                max_tokens=4000,
                top_p=0.9
            )
            
            solution = completion.choices[0].message.content
            
            return {
                "solution": solution,
                "model_used": "DeepSeek V3",
                "model_version": self.deepseek_model,
                "success": True,
                "confidence": "high",
                "processing_time": 0,
                "metadata": {
                    "subject": subject,
                    "difficulty": difficulty,
                    "temperature": temperature,
                    "timestamp": None  # Will be set by the calling function
                }
            }
            
        except Exception as e:
            logger.error(f"Error with DeepSeek API: {str(e)}")
            raise Exception(f"DeepSeek AI request failed: {str(e)}")
    
    def solve_problem(self, problem: str, subject: str, difficulty: str, 
                     show_steps: bool = True, include_theory: bool = True, 
                     include_diagrams: bool = True, temperature: float = 0.2,
                     preferred_model: str = "mistral") -> Dict[str, Any]:
        """
        Solve problem with fallback between models for maximum reliability
        
        Args:
            problem: The problem statement
            subject: Subject area (Physics, Chemistry, etc.)
            difficulty: Difficulty level (Beginner, Intermediate, etc.)
            show_steps: Whether to show step-by-step solution
            include_theory: Whether to include theoretical explanations
            include_diagrams: Whether to suggest visual aids
            temperature: Model creativity (0.0-1.0)
            preferred_model: 'mistral' or 'deepseek'
        """
        from datetime import datetime
        
        # Try preferred model first
        models_to_try = []
        if preferred_model == "mistral":
            models_to_try = [
                ("mistral", self.solve_with_mistral),
                ("deepseek", self.solve_with_deepseek)
            ]
        else:
            models_to_try = [
                ("deepseek", self.solve_with_deepseek),
                ("mistral", self.solve_with_mistral)
            ]
        
        last_error = None
        
        for model_name, solve_function in models_to_try:
            try:
                logger.info(f"Attempting to solve with {model_name}")
                result = solve_function(
                    problem, subject, difficulty, show_steps, 
                    include_theory, include_diagrams, temperature
                )
                
                # Add timestamp
                result["metadata"]["timestamp"] = datetime.utcnow().isoformat()
                result["metadata"]["processing_time"] = None  # Could be calculated
                
                logger.info(f"Successfully solved problem with {model_name}")
                return result
                
            except Exception as e:
                last_error = e
                logger.warning(f"Failed to solve with {model_name}: {str(e)}")
                continue
        
        # If all models fail, raise the last error
        if last_error:
            raise last_error
        else:
            raise Exception("All AI models are currently unavailable")
    
    def health_check(self) -> Dict[str, Any]:
        """Check health status of all AI services"""
        status = {
            "mistral": {"available": False, "error": None},
            "deepseek": {"available": False, "error": None},
            "overall": "unhealthy"
        }
        
        # Test Mistral
        try:
            if self.mistral_client:
                # Simple test request
                test_response = self.mistral_client.chat.complete(
                    model=self.mistral_model,
                    messages=[{"role": "user", "content": "Test"}],
                    max_tokens=10
                )
                status["mistral"]["available"] = True
        except Exception as e:
            status["mistral"]["error"] = str(e)
        
        # Test DeepSeek
        try:
            if self.hf_client:
                # Simple test request
                test_response = self.hf_client.chat.completions.create(
                    model=self.deepseek_model,
                    messages=[{"role": "user", "content": "Test"}],
                    max_tokens=10
                )
                status["deepseek"]["available"] = True
        except Exception as e:
            status["deepseek"]["error"] = str(e)
        
        # Determine overall status
        status["overall_status"] = status["mistral"]["available"] or status["deepseek"]["available"]
        
        return status
    
    def explain_concept(self, concept: str, subject: str = "General", level: str = "intermediate",
                       include_examples: bool = True, include_history: bool = False, 
                       temperature: float = 0.3) -> str:
        """Explain a concept using Together.xyz Llama model (free tier)"""
        try:
            logger.info(f"Using Together.xyz for concept explanation: {concept}")
            return self.together_client.explain_concept(
                concept=concept,
                subject=subject,
                level=level,
                include_examples=include_examples,
                include_history=include_history,
                temperature=temperature
            )
        except Exception as e:
            logger.error(f"Error explaining concept with Together.xyz: {str(e)}")
            # Fallback to Mistral if available
            try:
                if self.mistral_client:
                    logger.info("Falling back to Mistral for concept explanation")
                    prompt = f"""Explain the concept of '{concept}' in {subject} at a {level} level.
                    {'Include practical examples.' if include_examples else ''}
                    {'Include historical context.' if include_history else ''}
                    Make the explanation clear and educational."""
                    
                    messages = [{"role": "user", "content": prompt}]
                    response = self.mistral_client.chat.complete(
                        model=self.mistral_model,
                        messages=messages,
                        temperature=temperature,
                        max_tokens=3000
                    )
                    return response.choices[0].message.content
                else:
                    return "AI service not available for concept explanation."
            except Exception as fallback_error:
                logger.error(f"Fallback to Mistral also failed: {str(fallback_error)}")
                return f"Error explaining concept: {str(e)}"
    
    def get_formulas(self, subject: str, topic: str = "", search_term: str = "", 
                    temperature: float = 0.1) -> str:
        """Get formulas for a subject/topic"""
        try:
            prompt = f"""Provide key formulas for {subject}"""
            if topic:
                prompt += f" focusing on {topic}"
            if search_term:
                prompt += f" related to {search_term}"
            prompt += ". Format with clear explanations and variable definitions."
            
            if self.mistral_client:
                messages = [{"role": "user", "content": prompt}]
                response = self.mistral_client.chat.complete(
                    model=self.mistral_model,
                    messages=messages,
                    temperature=temperature,
                    max_tokens=2000
                )
                return response.choices[0].message.content
            else:
                return "AI service not available for formula reference."
        except Exception as e:
            logger.error(f"Error getting formulas: {str(e)}")
            return f"Error getting formulas: {str(e)}"
    
    def get_study_tips(self, subject: str, learning_style: str = "Visual", 
                      study_goal: str = "General Understanding", challenges: list = None,
                      temperature: float = 0.3) -> str:
        """Get personalized study tips using Together.xyz Llama model (free tier)"""
        try:
            logger.info(f"Using Together.xyz for study tips: {subject}")
            return self.together_client.get_study_tips(
                subject=subject,
                learning_style=learning_style,
                study_goal=study_goal,
                challenges=challenges,
                temperature=temperature
            )
        except Exception as e:
            logger.error(f"Error getting study tips with Together.xyz: {str(e)}")
            # Fallback to Mistral if available
            try:
                if self.mistral_client:
                    logger.info("Falling back to Mistral for study tips")
                    prompt = f"""Provide study tips for {subject} for a {learning_style} learner 
                    with the goal of {study_goal}."""
                    if challenges:
                        prompt += f" Address these challenges: {', '.join(challenges)}"
                    prompt += " Make tips practical and actionable."
                    
                    messages = [{"role": "user", "content": prompt}]
                    response = self.mistral_client.chat.complete(
                        model=self.mistral_model,
                        messages=messages,
                        temperature=temperature,
                        max_tokens=2000
                    )
                    return response.choices[0].message.content
                else:
                    return "AI service not available for study tips."
            except Exception as fallback_error:
                logger.error(f"Fallback to Mistral also failed: {str(fallback_error)}")
                return f"Error getting study tips: {str(e)}"
    
    def generate_image(self, prompt: str, context: str = "", size: str = "512x512", 
                      quality: str = "standard", style: str = "educational") -> Dict[str, Any]:
        """Generate image using HuggingFace Stable Diffusion with enhanced prompts"""
        try:
            return self.image_service.generate_image(
                prompt=prompt,
                context=context,
                size=size,
                quality=quality,
                style=style
            )
        except Exception as e:
            logger.error(f"Error generating image: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def generate_educational_diagram(self, concept: str, subject: str, 
                                   difficulty: str = "intermediate") -> Dict[str, Any]:
        """Generate educational diagrams for STEM concepts"""
        try:
            return self.image_service.generate_educational_diagram(
                concept=concept,
                subject=subject,
                difficulty=difficulty
            )
        except Exception as e:
            logger.error(f"Error generating educational diagram: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def generate_problem_illustration(self, problem_text: str, subject: str) -> Dict[str, Any]:
        """Generate illustration for STEM problems"""
        try:
            return self.image_service.generate_problem_illustration(
                problem_text=problem_text,
                subject=subject
            )
        except Exception as e:
            logger.error(f"Error generating problem illustration: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def analyze_image(self, image_url: str, question: str = "") -> Dict[str, Any]:
        """Analyze images - Feature not available with HuggingFace service"""
        try:
            return {
                "success": False,
                "error": "Image analysis not available with HuggingFace service",
                "suggestion": "Upload image and use problem-solving features instead"
            }
        except Exception as e:
            logger.error(f"Error with image analysis: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def get_image_training_stats(self) -> Dict[str, Any]:
        """Get statistics about image training data"""
        try:
            return self.image_service.get_training_stats()
        except Exception as e:
            logger.error(f"Error getting training stats: {str(e)}")
            return {
                "error": str(e)
            }
    
    def create_fine_tuning_dataset(self) -> Dict[str, Any]:
        """Create fine-tuning dataset from image training data"""
        try:
            return self.image_service.create_fine_tuning_dataset()
        except Exception as e:
            logger.error(f"Error creating fine-tuning dataset: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
