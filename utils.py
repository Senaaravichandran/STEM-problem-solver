import requests
import json
import time
import streamlit as st

def call_together_api(prompt, model="meta-llama/Llama-3.3-70B-Instruct-Turbo-Free", temperature=0.2, max_tokens=2048, api_key=None):
    """Make API call to Together.xyz with proper error handling and retries"""
    url = "https://api.together.xyz/inference"
    
    # Use the provided API key or get from session state
    if not api_key:
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
                    st.error("API key invalid. Using default API key.")
                    # Try with default key as fallback
                    if api_key != '729f85d6374d26fa145e19311616481801359c1a31bbc9a31fe51eefc35ada7d':
                        st.session_state.api_key = '729f85d6374d26fa145e19311616481801359c1a31bbc9a31fe51eefc35ada7d'
                        return call_together_api(prompt, model, temperature, max_tokens, '729f85d6374d26fa145e19311616481801359c1a31bbc9a31fe51eefc35ada7d')
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