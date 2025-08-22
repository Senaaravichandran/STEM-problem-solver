import os
import logging
import base64
import json
from PIL import Image
from io import BytesIO
from typing import Dict, Any, Optional
import time
import random
from huggingface_hub import InferenceClient

logger = logging.getLogger(__name__)

class HuggingFaceImageService:
    """Enhanced Hugging Face Image Generation Service for STEM education using NextStep-1-Large model"""
    
    def __init__(self):
        # Try both environment variable names for HuggingFace token
        self.hf_token = os.getenv('HF_TOKEN') or os.getenv('HUGGINGFACE_TOKEN')
        if not self.hf_token:
            logger.warning("HuggingFace token not found. Image generation will not work.")
        
        # Initialize Qwen-Image model
        self.primary_model = "Qwen/Qwen-Image"
        self.fallback_model = "black-forest-labs/FLUX.1-schnell"
        
        # Initialize InferenceClient for fal-ai provider
        try:
            self.client = InferenceClient(
                provider="fal-ai",
                api_key=self.hf_token,
            )
            logger.info(f"Initialized fal-ai client with Qwen/Qwen-Image model")
        except Exception as e:
            logger.error(f"Failed to initialize fal-ai client: {e}")
            self.client = None
        
        # Model configuration - all using Qwen/Qwen-Image
        self.models = {
            "general": "Qwen/Qwen-Image",
            "artistic": "Qwen/Qwen-Image", 
            "realistic": "Qwen/Qwen-Image",
            "educational": "Qwen/Qwen-Image",
            "diagram": "Qwen/Qwen-Image"
        }
        
        # Load training data for prompt enhancement
        self.training_data = self._load_training_data()
        
        # Analyze training data patterns for better tuning
        self.caption_patterns = self._analyze_caption_patterns()
        
        logger.info("HuggingFace Image Service initialized successfully")
    
    def _load_training_data(self) -> Dict[str, Any]:
        """Load and process training data from image dataset"""
        try:
            data_path = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'image')
            training_data = {
                'captions': [],
                'descriptions': [],
                'stem_keywords': []
            }
            
            # Load captions from captions.txt
            captions_file = os.path.join(data_path, 'captions.txt')
            if os.path.exists(captions_file):
                with open(captions_file, 'r', encoding='utf-8') as f:
                    lines = f.readlines()[1:]  # Skip header
                    for line in lines[:1000]:  # Limit for performance
                        if ',' in line:
                            try:
                                _, caption = line.strip().split(',', 1)
                                training_data['captions'].append(caption.strip())
                            except:
                                continue
            
            # Load training CSV data for additional patterns
            train_csv = os.path.join(data_path, 'train.csv')
            if os.path.exists(train_csv):
                with open(train_csv, 'r', encoding='utf-8') as f:
                    lines = f.readlines()[1:300]  # Skip header, limit for performance
                    for line in lines:
                        try:
                            # Extract captions from CSV format
                            if '"[' in line and ']"' in line:
                                start = line.find('"[') + 2
                                end = line.find(']"')
                                if start < end:
                                    captions_text = line[start:end]
                                    # Split and clean individual captions
                                    captions = [c.strip().strip("'").strip('"') 
                                              for c in captions_text.split("'") if len(c.strip()) > 15]
                                    training_data['captions'].extend(captions[:2])  # Limit per entry
                        except:
                            continue
            
            # Enhanced keywords from actual dataset analysis
            training_data['stem_keywords'] = [
                'airplane', 'aircraft', 'building', 'person', 'people', 'dog', 'animal',
                'outdoor', 'water', 'tree', 'grass', 'colorful', 'bright', 'detailed',
                'professional', 'clear', 'high quality', 'well-lit', 'beautiful',
                'mathematical diagram', 'scientific illustration', 'educational chart', 
                'technical drawing', 'formula visualization', 'engineering blueprint'
            ]
            
            # Remove duplicates and filter quality captions
            training_data['captions'] = list(set([
                cap for cap in training_data['captions'] 
                if len(cap) > 15 and len(cap) < 150 and not cap.startswith('[')
            ]))
            
            logger.info(f"Loaded {len(training_data['captions'])} captions for prompt enhancement")
            return training_data
            
        except Exception as e:
            logger.error(f"Error loading training data: {str(e)}")
            return {'captions': [], 'descriptions': [], 'stem_keywords': []}
    
    def _analyze_caption_patterns(self) -> Dict[str, Any]:
        """Analyze patterns in training captions for optimized prompt generation"""
        try:
            captions = self.training_data.get('captions', [])
            if not captions:
                return {}
            
            patterns = {
                'quality_terms': [],
                'descriptive_words': [],
                'common_subjects': []
            }
            
            # Analyze word frequency in captions
            from collections import Counter
            all_words = []
            
            for caption in captions[:300]:  # Analyze subset
                words = [w.lower().strip('.,!?') for w in caption.split()]
                all_words.extend(words)
            
            word_counts = Counter(all_words)
            
            # Extract quality and descriptive terms
            quality_keywords = ['bright', 'colorful', 'beautiful', 'clear', 'detailed',
                              'professional', 'clean', 'sharp', 'vivid', 'stunning',
                              'high', 'quality', 'well', 'excellent', 'amazing']
            
            patterns['quality_terms'] = [word for word in quality_keywords 
                                       if word in word_counts and word_counts[word] > 2]
            
            # Extract most common descriptive adjectives
            descriptive_words = [word for word, count in word_counts.most_common(30)
                               if len(word) > 4 and count > 3]
            patterns['descriptive_words'] = descriptive_words[:10]
            
            logger.info(f"Analyzed patterns: {len(patterns['quality_terms'])} quality terms found")
            return patterns
            
        except Exception as e:
            logger.error(f"Error analyzing caption patterns: {str(e)}")
            return {}
    
    def _enhance_prompt(self, prompt: str, context: str = "", style: str = "educational") -> str:
        """Enhanced prompt optimization using training data patterns"""
        try:
            # Clean and enhance the base prompt
            enhanced_prompt = prompt.strip()
            
            # Analyze training data for similar concepts
            relevant_captions = self._find_similar_captions(enhanced_prompt)
            
            # Extract style patterns from training data
            if relevant_captions:
                style_patterns = self._extract_style_patterns(relevant_captions)
                if style_patterns:
                    enhanced_prompt = f"{enhanced_prompt}, {', '.join(style_patterns[:2])}"
            
            # Add STEM-specific qualifiers based on style
            if style == "educational":
                educational_qualifiers = [
                    "educational illustration",
                    "clear and detailed diagram", 
                    "scientific accuracy",
                    "pedagogical visualization",
                    "academic quality illustration"
                ]
                qualifier = random.choice(educational_qualifiers)
                enhanced_prompt = f"{enhanced_prompt}, {qualifier}"
            
            elif style == "diagram":
                # Use training data patterns for technical illustrations
                diagram_patterns = self._get_diagram_patterns_from_training()
                qualifier = random.choice(diagram_patterns)
                enhanced_prompt = f"{enhanced_prompt}, {qualifier}"
            
            # Apply training data insights for quality terms
            quality_terms = self._get_quality_terms_from_training_data()
            selected_quality = random.sample(quality_terms, min(2, len(quality_terms)))
            enhanced_prompt = f"{enhanced_prompt}, {', '.join(selected_quality)}"
            
            # Add context if provided
            if context:
                enhanced_prompt = f"{context}: {enhanced_prompt}"
            
            # Optimize specifically for Qwen/Qwen-Image model
            enhanced_prompt = self._optimize_for_qwen_model(enhanced_prompt)
            
            logger.info(f"Training-enhanced prompt: {enhanced_prompt[:150]}...")
            return enhanced_prompt
            
        except Exception as e:
            logger.error(f"Error enhancing prompt: {str(e)}")
            return prompt
    
    def _find_similar_captions(self, prompt: str) -> list:
        """Find captions from training data similar to the prompt using learned patterns"""
        try:
            captions = self.training_data.get('captions', [])
            if not captions:
                return []
            
            # Extract key words from prompt
            prompt_words = set(prompt.lower().split())
            similar_captions = []
            
            # Use analyzed patterns to improve matching
            quality_terms = self.caption_patterns.get('quality_terms', [])
            descriptive_words = self.caption_patterns.get('descriptive_words', [])
            
            # Search through training captions with weighted matching
            for caption in captions[:1500]:  # Search more captions
                caption_words = set(caption.lower().split())
                
                # Calculate weighted similarity
                word_overlap = prompt_words.intersection(caption_words)
                quality_overlap = set(quality_terms).intersection(caption_words)
                descriptive_overlap = set(descriptive_words).intersection(caption_words)
                
                # Score based on different types of matches
                score = len(word_overlap) + (len(quality_overlap) * 0.5) + (len(descriptive_overlap) * 0.3)
                
                if score >= 1.0:  # Threshold for relevance
                    similar_captions.append((caption, score))
                    
                if len(similar_captions) >= 15:  # Get more options
                    break
            
            # Sort by score and return top matches
            similar_captions.sort(key=lambda x: x[1], reverse=True)
            return [caption for caption, score in similar_captions[:8]]
            
        except Exception as e:
            logger.error(f"Error finding similar captions: {str(e)}")
            return []
    
    def _extract_style_patterns(self, captions: list) -> list:
        """Extract descriptive patterns from training captions"""
        try:
            # Common high-quality descriptive terms found in training data
            pattern_words = []
            
            for caption in captions:
                words = caption.lower().split()
                # Look for quality descriptors
                quality_descriptors = [w for w in words if w in [
                    'bright', 'colorful', 'clear', 'detailed', 'beautiful',
                    'stunning', 'professional', 'clean', 'sharp', 'vivid',
                    'crisp', 'well-lit', 'high-quality', 'artistic'
                ]]
                pattern_words.extend(quality_descriptors)
            
            # Return most relevant patterns
            from collections import Counter
            if pattern_words:
                common_patterns = Counter(pattern_words).most_common(4)
                return [pattern[0] for pattern in common_patterns]
            
            return ['detailed', 'high quality']
            
        except Exception as e:
            logger.error(f"Error extracting style patterns: {str(e)}")
            return ['detailed', 'clear']
    
    def _get_diagram_patterns_from_training(self) -> list:
        """Get technical diagram patterns optimized for training data"""
        return [
            "technical diagram", "schematic illustration", "professional blueprint",
            "clean line art", "structured layout", "engineering drawing",
            "scientific illustration", "instructional diagram"
        ]
    
    def _get_quality_terms_from_training_data(self) -> list:
        """Quality terms that work well with the training dataset"""
        return [
            "high quality", "detailed", "professional", "clean design",
            "well-lit", "crisp", "sharp details", "clear focus",
            "vibrant", "well-composed"
        ]
    
    def _optimize_for_qwen_model(self, prompt: str) -> str:
        """Optimize prompt specifically for Qwen/Qwen-Image model performance"""
        try:
            # Qwen/Qwen-Image model-specific optimizations
            optimized = prompt
            
            # Qwen models work well with clear, descriptive prompts
            if 'detailed' not in optimized.lower():
                optimized = f"{optimized}, detailed"
                
            if 'high quality' not in optimized.lower():
                optimized = f"{optimized}, high quality"
            
            # Add Qwen-preferred style specifications
            qwen_specs = "clear, vivid, well-composed, professional quality"
            optimized = f"{optimized}, {qwen_specs}"
            
            # Clean up formatting
            optimized = optimized.replace(' ,', ',').replace('  ', ' ').strip()
            
            return optimized
            
        except Exception as e:
            logger.error(f"Error optimizing for Qwen: {str(e)}")
            return prompt

    def generate_image(self, prompt: str, context: str = "", size: str = "512x512", 
                      quality: str = "standard", style: str = "educational") -> Dict[str, Any]:
        """Generate image using Qwen/Qwen-Image via fal-ai provider"""
        try:
            start_time = time.time()
            
            # Check if client is available
            if not self.client:
                return {
                    "success": False,
                    "error": "HuggingFace client not initialized. Please check your HuggingFace token in the .env file.\n\n" +
                             "Steps to fix:\n" +
                             "1. Get a token from https://huggingface.co/settings/tokens\n" +
                             "2. Add it to your .env file as: HUGGINGFACE_TOKEN=your_token_here\n" +
                             "3. Restart the application",
                    "model_used": self.primary_model,
                    "processing_time": 0,
                    "setup_required": True
                }
            
            # Enhance the prompt for better results
            enhanced_prompt = self._enhance_prompt(prompt, context, style)
            
            logger.info(f"Generating image with Qwen/Qwen-Image via fal-ai provider")
            logger.info(f"Enhanced prompt: {enhanced_prompt[:100]}...")
            
            # Generate image using InferenceClient with Qwen/Qwen-Image
            used_model = self.primary_model  # Track which model was actually used
            try:
                image = self.client.text_to_image(
                    enhanced_prompt,
                    model=self.primary_model,  # Use Qwen/Qwen-Image
                )
                logger.info(f"Image generation successful with Qwen/Qwen-Image, image type: {type(image)}")
            except Exception as api_error:
                logger.error(f"Qwen/Qwen-Image API error: {str(api_error)}")
                # Try with fallback model if Qwen fails
                try:
                    logger.info(f"Falling back to {self.fallback_model}")
                    used_model = self.fallback_model  # Update the used model
                    image = self.client.text_to_image(
                        enhanced_prompt,
                        model=self.fallback_model,
                    )
                    logger.info(f"Fallback successful with {self.fallback_model}")
                except Exception as retry_error:
                    logger.error(f"Fallback also failed: {str(retry_error)}")
                    return {
                        "success": False,
                        "error": f"Image generation failed with both models: {str(api_error)}",
                        "model": f"{self.primary_model} (fal-ai)",
                        "processing_time": round(time.time() - start_time, 2)
                    }
            
            # Process the PIL Image
            if image:
                # Optimize image size if too large
                if image.size[0] > 1024 or image.size[1] > 1024:
                    image.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
                
                # Convert to base64 for frontend with compression
                buffer = BytesIO()
                image.save(buffer, format='PNG', optimize=True, compress_level=6)
                image_base64 = base64.b64encode(buffer.getvalue()).decode()
                
                processing_time = time.time() - start_time
                
                return {
                    "success": True,
                    "image_url": f"data:image/png;base64,{image_base64}",
                    "model": f"{used_model} (fal-ai)",
                    "revised_prompt": enhanced_prompt,
                    "processing_time": round(processing_time, 2),
                    "metadata": {
                        "timestamp": time.time(),
                        "model": used_model,
                        "size": size,
                        "quality": quality,
                        "style": style,
                        "original_prompt": prompt,
                        "provider": "fal-ai"
                    }
                }
            else:
                raise Exception("Failed to generate image - no image returned")
                
        except Exception as e:
            logger.error(f"Error generating image with {self.primary_model}: {str(e)}")
            
            # Provide user-friendly error messages
            error_message = str(e)
            if "authentication" in error_message.lower() or "unauthorized" in error_message.lower():
                error_message = "Authentication required. Please add your HuggingFace token to the .env file and restart the application. Get a free token at: https://huggingface.co/settings/tokens"
            elif "rate limit" in error_message.lower():
                error_message = "Rate limit exceeded. Please wait a moment and try again."
            elif "timeout" in error_message.lower():
                error_message = "Request timeout. The service might be busy, please try again."
            
            return {
                "success": False,
                "error": error_message,
                "model": f"{self.primary_model} (HuggingFace)",
                "processing_time": 0,
                "suggestion": "Try again with a simpler prompt, or check your internet connection."
            }
    
    def generate_educational_diagram(self, concept: str, subject: str, 
                                   difficulty: str = "intermediate") -> Dict[str, Any]:
        """Generate educational diagrams for STEM concepts"""
        
        # Create specialized prompts for different subjects
        subject_prompts = {
            "Physics": f"Clear scientific diagram illustrating {concept} in physics, with labels and arrows, educational style, technical drawing",
            "Chemistry": f"Chemical diagram showing {concept}, molecular structure, clean scientific illustration with proper notation",
            "Mathematics": f"Mathematical visualization of {concept}, geometric diagram with clear notation, educational graph, clean lines",
            "Biology": f"Biological diagram depicting {concept}, anatomical illustration with labels, scientific accuracy, educational poster style",
            "Engineering": f"Technical engineering diagram of {concept}, blueprint style with measurements, professional technical drawing"
        }
        
        base_prompt = subject_prompts.get(subject, f"Educational diagram illustrating {concept}")
        context = f"{subject} education - {difficulty} level"
        
        return self.generate_image(
            prompt=base_prompt,
            context=context,
            style="diagram",
            quality="high",
            size="768x768"
        )
    
    def generate_problem_illustration(self, problem_text: str, subject: str) -> Dict[str, Any]:
        """Generate illustration for STEM problems"""
        
        # Extract key concepts and create focused prompt
        # Limit problem text for better prompt processing
        limited_text = problem_text[:150] + "..." if len(problem_text) > 150 else problem_text
        
        prompt = f"Visual illustration for {subject} problem: {limited_text}"
        context = f"Problem solving visualization - {subject}"
        
        return self.generate_image(
            prompt=prompt,
            context=context,
            style="educational",
            quality="standard",
            size="512x512"
        )
    
    def get_training_stats(self) -> Dict[str, Any]:
        """Get statistics about training data and service status"""
        return {
            "service": f"{self.primary_model} (HuggingFace)",
            "captions_loaded": len(self.training_data.get('captions', [])),
            "stem_keywords": len(self.training_data.get('stem_keywords', [])),
            "models_available": list(self.models.keys()),
            "default_model": self.primary_model,
            "api_status": "Connected" if self.client else "Not Connected",
            "features": [
                "Educational diagrams",
                "Problem illustrations", 
                "STEM concept visualization",
                "Prompt enhancement",
                f"Fast generation with {self.primary_model}"
            ]
        }
    
    def health_check(self) -> Dict[str, Any]:
        """Check health of HuggingFace image service"""
        try:
            return {
                "status": "healthy" if self.client else "unhealthy",
                "api_accessible": bool(self.client),
                "token_configured": bool(self.hf_token),
                "models_available": len(self.models),
                "model": self.primary_model,
                "provider": "fal-ai",
                "response_time": "Variable depending on model load"
            }
            
        except Exception as e:
            logger.error(f"Health check failed: {str(e)}")
            return {
                "status": "unhealthy",
                "error": str(e),
                "api_accessible": False,
                "token_configured": bool(self.hf_token)
            }
