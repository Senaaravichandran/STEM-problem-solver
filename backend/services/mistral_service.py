import requests
import json
import time
import logging
import socket
from typing import Dict, List, Optional, Any
from urllib3.util.retry import Retry
from requests.adapters import HTTPAdapter

logger = logging.getLogger(__name__)

class MistralService:
    """Service for interacting with Mistral AI API with robust error handling and retry logic"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.mistral.ai/v1"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "User-Agent": "STEM-Problem-Solver/1.0"
        }
        
        # Create a session with retry strategy
        self.session = requests.Session()
        
        # Configure retry strategy
        retry_strategy = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["HEAD", "GET", "OPTIONS", "POST"]
        )
        
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)
    
    def test_connectivity(self) -> bool:
        """Test internet connectivity and DNS resolution"""
        try:
            # Test DNS resolution
            socket.gethostbyname("api.mistral.ai")
            logger.info("DNS resolution successful for api.mistral.ai")
            
            # Test basic connectivity
            response = requests.get("https://httpbin.org/get", timeout=10)
            if response.status_code == 200:
                logger.info("Internet connectivity verified")
                return True
            else:
                logger.warning(f"Connectivity test failed with status: {response.status_code}")
                return False
                
        except socket.gaierror as e:
            logger.error(f"DNS resolution failed: {str(e)}")
            return False
        except requests.exceptions.RequestException as e:
            logger.error(f"Connectivity test failed: {str(e)}")
            return False
    
    def verify_api_key(self) -> bool:
        """Verify the API key is valid by testing with a simple request"""
        try:
            url = f"{self.base_url}/models"
            response = self.session.get(
                url,
                headers=self.headers,
                timeout=30
            )
            
            if response.status_code == 200:
                logger.info("API key verification successful")
                return True
            elif response.status_code == 401:
                logger.error("API key verification failed - Invalid API key")
                return False
            else:
                logger.warning(f"API key verification returned status: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"API key verification error: {str(e)}")
            return False
    
    def chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: str = "mistral-large-latest",
        temperature: float = 0.7,
        max_tokens: int = 2048,
        top_p: float = 1.0,
        stream: bool = False
    ) -> Dict[str, Any]:
        """
        Generate chat completion using Mistral API with comprehensive error handling
        
        Args:
            messages: List of message objects with 'role' and 'content'
            model: Model to use for completion
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate
            top_p: Top-p sampling parameter
            stream: Whether to stream the response
            
        Returns:
            API response containing the completion
            
        Raises:
            Exception: When API request fails after all retries
        """
        url = f"{self.base_url}/chat/completions"
        
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "top_p": top_p,
            "stream": stream
        }
        
        # Pre-flight checks
        logger.info(f"Starting API request to Mistral with model: {model}")
        logger.info(f"API Key status: {'Valid' if self.api_key else 'Missing'}")
        
        # Test connectivity first
        if not self.test_connectivity():
            error_msg = "Network connectivity test failed. Please check your internet connection and try again."
            logger.error(error_msg)
            raise Exception(error_msg)
        
        # Test API key if this is the first request
        if not hasattr(self, '_api_key_verified'):
            if not self.verify_api_key():
                error_msg = "API key verification failed. Please check your Mistral AI API key."
                logger.error(error_msg)
                raise Exception(error_msg)
            self._api_key_verified = True
        
        max_retries = 3
        retry_delay = 1
        
        for attempt in range(max_retries):
            try:
                logger.info(f"Attempt {attempt + 1}/{max_retries} - Making request to: {url}")
                logger.debug(f"Request payload: {json.dumps(payload, indent=2)}")
                
                response = self.session.post(
                    url,
                    headers=self.headers,
                    json=payload,
                    timeout=60
                )
                
                logger.info(f"Response received - Status: {response.status_code}")
                
                if response.status_code == 200:
                    result = response.json()
                    logger.info("API request successful")
                    return result
                
                elif response.status_code == 401:
                    error_msg = "Authentication failed. Please verify your Mistral AI API key."
                    logger.error(f"{error_msg} Response: {response.text}")
                    raise Exception(error_msg)
                
                elif response.status_code == 429:
                    wait_time = retry_delay * (2 ** attempt)
                    logger.warning(f"Rate limit hit. Waiting {wait_time} seconds before retry...")
                    time.sleep(wait_time)
                    continue
                
                elif response.status_code >= 500:
                    if attempt < max_retries - 1:
                        wait_time = retry_delay * (2 ** attempt)
                        logger.warning(f"Server error {response.status_code}. Retrying in {wait_time} seconds...")
                        time.sleep(wait_time)
                        continue
                    else:
                        error_msg = f"Server error after {max_retries} attempts: {response.status_code}"
                        logger.error(f"{error_msg} Response: {response.text}")
                        raise Exception(error_msg)
                
                else:
                    error_msg = f"Unexpected response status: {response.status_code}"
                    logger.error(f"{error_msg} Response: {response.text}")
                    raise Exception(error_msg)
                    
            except requests.exceptions.ConnectionError as e:
                if "getaddrinfo failed" in str(e):
                    error_msg = "DNS resolution failed. Please check your internet connection and DNS settings."
                    logger.error(f"{error_msg} Error: {str(e)}")
                    raise Exception(error_msg)
                elif attempt < max_retries - 1:
                    wait_time = retry_delay * (2 ** attempt)
                    logger.warning(f"Connection error on attempt {attempt + 1}. Retrying in {wait_time} seconds...")
                    time.sleep(wait_time)
                    continue
                else:
                    error_msg = f"Connection failed after {max_retries} attempts"
                    logger.error(f"{error_msg} Error: {str(e)}")
                    raise Exception(error_msg)
                    
            except requests.exceptions.Timeout as e:
                if attempt < max_retries - 1:
                    wait_time = retry_delay * (2 ** attempt)
                    logger.warning(f"Request timeout on attempt {attempt + 1}. Retrying in {wait_time} seconds...")
                    time.sleep(wait_time)
                    continue
                else:
                    error_msg = f"Request timeout after {max_retries} attempts"
                    logger.error(f"{error_msg} Error: {str(e)}")
                    raise Exception(error_msg)
                    
            except requests.exceptions.RequestException as e:
                error_msg = f"Request failed: {str(e)}"
                logger.error(error_msg)
                raise Exception(error_msg)
                
            except json.JSONDecodeError as e:
                error_msg = f"Invalid JSON response: {str(e)}"
                logger.error(error_msg)
                raise Exception(error_msg)
                
            except Exception as e:
                error_msg = f"Unexpected error: {str(e)}"
                logger.error(error_msg)
                raise Exception(error_msg)
        
        # This should never be reached, but just in case
        error_msg = f"All {max_retries} attempts failed"
        logger.error(error_msg)
        raise Exception(error_msg)
    
    def health_check(self) -> Dict[str, Any]:
        """
        Perform a comprehensive health check of the Mistral AI service
        
        Returns:
            Dictionary containing health status information
        """
        health_status = {
            "service": "mistral_ai",
            "status": "unknown",
            "connectivity": False,
            "api_key_valid": False,
            "api_accessible": False,
            "last_check": time.strftime("%Y-%m-%d %H:%M:%S"),
            "errors": []
        }
        
        try:
            # Test internet connectivity
            if self.test_connectivity():
                health_status["connectivity"] = True
            else:
                health_status["errors"].append("Internet connectivity failed")
            
            # Test API key
            if self.verify_api_key():
                health_status["api_key_valid"] = True
                health_status["api_accessible"] = True
            else:
                health_status["errors"].append("API key verification failed")
            
            # Determine overall status
            if health_status["connectivity"] and health_status["api_key_valid"]:
                health_status["status"] = "healthy"
            elif health_status["connectivity"]:
                health_status["status"] = "degraded"
            else:
                health_status["status"] = "unhealthy"
                
        except Exception as e:
            health_status["status"] = "error"
            health_status["errors"].append(f"Health check failed: {str(e)}")
            logger.error(f"Health check error: {str(e)}")
        
        return health_status
    
    def solve_problem(
        self,
        problem: str,
        subject: str,
        difficulty: str,
        show_steps: bool = True,
        include_theory: bool = True,
        include_diagrams: bool = True,
        temperature: float = 0.2
    ) -> str:
        """
        Solve a STEM problem using Mistral AI with enhanced error handling
        
        Args:
            problem: The problem statement
            subject: Subject area (Physics, Chemistry, etc.)
            difficulty: Difficulty level
            show_steps: Whether to show detailed steps
            include_theory: Whether to include theoretical explanations
            include_diagrams: Whether to suggest diagrams
            temperature: Model temperature
            
        Returns:
            Generated solution
            
        Raises:
            Exception: When the problem cannot be solved due to API issues
        """
        try:
            logger.info(f"Solving {difficulty}-level {subject} problem")
            
            system_prompt = f"""You are an expert professor specialized in {subject} with years of experience teaching at all levels from beginner to graduate level.

You excel at solving {subject} problems with clear, step-by-step explanations that help students understand both the solution process and underlying concepts."""

            # Build user prompt based on requirements
            requirements = []
            requirements.append("1. Start with a brief overview of the concepts involved.")
            
            if show_steps:
                requirements.append("2. Break down the solution into clear, logical steps showing all calculations.")
            else:
                requirements.append("2. Provide a concise solution.")
            
            if include_theory:
                requirements.append("3. Explain the underlying theoretical principles and concepts relevant to this problem.")
            
            if include_diagrams:
                requirements.append("4. Describe any diagrams, graphs, or visual representations that would be helpful.")
            
            requirements.append("5. End with a summary of the key takeaways from this problem.")

            user_prompt = f"""
I need you to solve the following {difficulty}-level {subject} problem step by step:

PROBLEM: {problem}

Context for reference:

Relevant scientific concepts and terminology available for reference.

Requirements:
{chr(10).join(requirements)}

Format your response with appropriate sections and mathematical notation where applicable.
Use clear headings and organize the content for easy reading.
"""

            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
            
            response = self.chat_completion(
                messages=messages,
                temperature=temperature,
                max_tokens=3000
            )
            
            solution = response['choices'][0]['message']['content']
            logger.info("Problem solved successfully")
            return solution
            
        except Exception as e:
            logger.error(f"Error solving problem: {str(e)}")
            
            # Provide helpful error message based on the error type
            if "DNS resolution failed" in str(e) or "getaddrinfo failed" in str(e):
                raise Exception("Network connection issue: Unable to reach Mistral AI servers. Please check your internet connection and try again.")
            elif "API key" in str(e).lower():
                raise Exception("Authentication issue: Please verify your Mistral AI API key is correct.")
            elif "timeout" in str(e).lower():
                raise Exception("Request timeout: The AI service is taking too long to respond. Please try again.")
            elif "rate limit" in str(e).lower():
                raise Exception("Rate limit exceeded: Too many requests. Please wait a moment and try again.")
            else:
                raise Exception(f"AI service error: {str(e)}")
    
    def explain_concept(
        self,
        concept: str,
        subject: str,
        level: str = "intermediate",
        include_examples: bool = True,
        include_history: bool = False,
        temperature: float = 0.3
    ) -> str:
        """
        Explain a STEM concept using Mistral AI with enhanced error handling
        
        Args:
            concept: The concept to explain
            subject: Subject area
            level: Explanation level (beginner, intermediate, advanced)
            include_examples: Whether to include examples
            include_history: Whether to include historical context
            temperature: Model temperature
            
        Returns:
            Generated explanation
        """
        system_prompt = f"""You are an expert professor in {subject} with a talent for explaining complex concepts in clear, engaging ways appropriate for different learning levels."""

        user_prompt = f"""
Provide a clear and comprehensive explanation of the concept of '{concept}' at an {level} level in {subject}.

Structure your explanation as follows:
1. Definition and basic explanation
2. Key principles and mechanisms
3. {"Historical development and important contributors" if include_history else ""}
4. {"Practical examples and real-world applications" if include_examples else ""}
5. Common misconceptions or challenging aspects
6. Related concepts that build upon this knowledge

Make your explanation engaging and approachable while maintaining scientific accuracy.
Use clear headings and organize the content for easy understanding.
"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        
        response = self.chat_completion(
            messages=messages,
            temperature=temperature,
            max_tokens=2500
        )
        
        return response['choices'][0]['message']['content']
    
    def get_formulas(
        self,
        subject: str,
        topic: str,
        search_term: str = "",
        temperature: float = 0.1
    ) -> str:
        """
        Get formula reference using Mistral AI
        
        Args:
            subject: Subject area
            topic: Specific topic within subject
            search_term: Optional search term for specific formulas
            temperature: Model temperature
            
        Returns:
            Generated formula reference
        """
        system_prompt = f"""You are an expert in {subject} with comprehensive knowledge of formulas and equations. You provide well-organized, accurate formula references."""

        user_prompt = f"""
Provide a well-organized reference guide for the most important formulas in {topic} within {subject}.

{f'Focus specifically on formulas related to "{search_term}".' if search_term else ''}

For each formula:
1. Write the formula with clear notation
2. Define each variable and constant
3. Note the units used (SI preferred)
4. Provide a brief explanation of when and how the formula is used
5. Note any special conditions or limitations

Format your response as a clear reference guide with sections and subsections as appropriate.
Use mathematical notation and organize content for easy reference.
"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        
        response = self.chat_completion(
            messages=messages,
            temperature=temperature,
            max_tokens=2500
        )
        
        return response['choices'][0]['message']['content']
    
    def get_study_tips(
        self,
        subject: str,
        learning_style: str,
        study_goal: str,
        challenges: List[str],
        temperature: float = 0.3
    ) -> str:
        """
        Get personalized study tips using Mistral AI
        
        Args:
            subject: Subject area
            learning_style: Learning style preference
            study_goal: Study goal
            challenges: List of challenges faced
            temperature: Model temperature
            
        Returns:
            Generated study tips
        """
        system_prompt = """You are an experienced STEM educator with expertise in learning psychology and study techniques. You provide personalized, practical study advice."""

        user_prompt = f"""
Provide personalized study advice for a student with the following profile:

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
6. Motivation and mindset tips

Make your advice practical, specific, and actionable.
Use clear headings and organize the content for easy implementation.
"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        
        response = self.chat_completion(
            messages=messages,
            temperature=temperature,
            max_tokens=2500
        )
        
        return response['choices'][0]['message']['content']
