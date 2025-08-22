import requests
import json
import time
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class TogetherAIService:
    """Together.xyz AI service for ConceptExplainer and StudyTips (using free Llama model)"""
    
    def __init__(self):
        self.api_key = "729f85d6374d26fa145e19311616481801359c1a31bbc9a31fe51eefc35ada7d"
        self.base_url = "https://api.together.xyz/inference"
        self.model = "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free"
        self.max_retries = 3
        self.base_wait = 2
        
    def _make_api_call(self, prompt: str, temperature: float = 0.2, max_tokens: int = 2048) -> Optional[str]:
        """Make API call to Together.xyz with proper error handling and retries"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        # Format prompt according to model requirements
        formatted_prompt = f"[INST]{prompt}[/INST]"
        
        data = {
            "model": self.model,
            "prompt": formatted_prompt,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        for attempt in range(self.max_retries):
            try:
                logger.info(f"Making Together.xyz API call (attempt {attempt+1}/{self.max_retries})")
                response = requests.post(self.base_url, headers=headers, json=data, timeout=60)
                
                if response.status_code == 200:
                    result = response.json()
                    content = result['output']['choices'][0]['text']
                    logger.info("Together.xyz API call successful")
                    return content
                elif response.status_code == 401:
                    logger.error("Together.xyz API key invalid")
                    return None
                elif response.status_code == 429:
                    logger.warning(f"Together.xyz rate limit hit, retrying in {self.base_wait ** attempt} seconds")
                else:
                    logger.warning(f"Together.xyz API call failed with status code {response.status_code}")
                    
            except Exception as e:
                logger.warning(f"Together.xyz API call error: {str(e)}")
            
            # Wait before retry with exponential backoff
            if attempt < self.max_retries - 1:
                wait_time = self.base_wait ** attempt
                time.sleep(wait_time)
        
        logger.error("Together.xyz API: Failed to get response after multiple attempts")
        return None
    
    def explain_concept(self, concept: str, subject: str = "General", level: str = "intermediate",
                       include_examples: bool = True, include_history: bool = False, 
                       temperature: float = 0.3) -> str:
        """Explain a concept using Together.xyz Llama model"""
        try:
            prompt = f"""You are an expert educator. Explain the concept of '{concept}' in {subject} at a {level} level.

Requirements:
- Make the explanation clear, comprehensive, and educational
- Use simple language appropriate for {level} level students
- Structure your response with clear sections
{'- Include 2-3 practical examples to illustrate the concept' if include_examples else ''}
{'- Include relevant historical context and development' if include_history else ''}
- Ensure accuracy and educational value

Concept to explain: {concept}
Subject area: {subject}
Academic level: {level}

Provide a well-structured explanation that helps students understand this concept thoroughly."""
            
            result = self._make_api_call(prompt, temperature, max_tokens=3000)
            
            if result:
                return result.strip()
            else:
                return "Unable to explain concept at this time. Please try again later."
                
        except Exception as e:
            logger.error(f"Error in Together.xyz concept explanation: {str(e)}")
            return f"Error explaining concept: {str(e)}"
    
    def get_study_tips(self, subject: str, learning_style: str = "Visual", 
                      study_goal: str = "General Understanding", challenges: list = None,
                      temperature: float = 0.3) -> str:
        """Get personalized study tips using Together.xyz Llama model"""
        try:
            challenges_text = ""
            if challenges and len(challenges) > 0:
                challenges_text = f"\nSpecific challenges to address: {', '.join(challenges)}"
            
            prompt = f"""You are an experienced academic advisor and study skills expert. Create personalized study tips and strategies.

Student Profile:
- Subject: {subject}
- Learning Style: {learning_style}
- Study Goal: {study_goal}{challenges_text}

Please provide:
1. **Subject-Specific Study Strategies** - Tailored methods for {subject}
2. **Learning Style Optimization** - Techniques that work best for {learning_style} learners
3. **Goal-Oriented Planning** - Structured approach to achieve {study_goal}
4. **Practical Study Schedule** - Daily/weekly routine recommendations
5. **Resource Recommendations** - Tools, apps, and materials to enhance learning
6. **Assessment & Progress Tracking** - Ways to measure improvement
{'7. **Challenge Solutions** - Specific strategies to overcome identified challenges' if challenges else ''}

Make all tips:
- Actionable and specific
- Backed by proven study techniques
- Adaptable to different schedules
- Focused on long-term retention and understanding

Provide comprehensive, practical advice that a student can immediately implement."""
            
            result = self._make_api_call(prompt, temperature, max_tokens=2500)
            
            if result:
                return result.strip()
            else:
                return "Unable to generate study tips at this time. Please try again later."
                
        except Exception as e:
            logger.error(f"Error in Together.xyz study tips generation: {str(e)}")
            return f"Error getting study tips: {str(e)}"
