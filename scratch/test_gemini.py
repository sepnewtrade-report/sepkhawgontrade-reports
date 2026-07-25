import os
import sys
from google import genai
from google.genai import types

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import gemini_utils

def main():
    api_keys = gemini_utils.get_api_keys()
    if not api_keys:
        print("No API keys found!")
        return
        
    model = "gemini-2.5-flash"
    prompt = "What is the S&P 500 closing price on Friday July 24, 2026?"
    
    print(f"Testing {model} with search grounding...")
    config = types.GenerateContentConfig(
        system_instruction="You are a financial analyst.",
        tools=[types.Tool(google_search=types.GoogleSearch())]
    )
    
    try:
        response = gemini_utils.generate_content_with_rotation(
            api_keys=api_keys,
            model=model,
            contents=prompt,
            config=config
        )
        print("Response received successfully:")
        print(response.text)
    except Exception as e:
        print(f"Error occurred: {e}")

if __name__ == "__main__":
    main()
