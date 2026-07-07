import os
import sys
import time
from google import genai
from google.genai import types

def load_environment():
    # Load from project root .env and notebooklm-manager/.env
    root_dir = os.path.dirname(os.path.abspath(__file__))
    env_paths = [
        os.path.join(root_dir, ".env"),
        os.path.join(root_dir, "notebooklm-manager", ".env")
    ]
    for env_path in env_paths:
        if os.path.exists(env_path):
            try:
                with open(env_path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#"):
                            parts = line.split("=", 1)
                            if len(parts) == 2:
                                key = parts[0].strip()
                                val = parts[1].strip().strip('"').strip("'")
                                os.environ[key] = val
            except Exception as e:
                print(f"Warning: Failed to load env from {env_path}: {e}", file=sys.stderr)

def get_api_keys():
    load_environment()
    keys = []
    
    # Check GEMINI_API_KEY (comma separated list)
    main_key = os.environ.get("GEMINI_API_KEY")
    if main_key:
        if "," in main_key:
            keys.extend([k.strip() for k in main_key.split(",") if k.strip()])
        else:
            keys.append(main_key.strip())
            
    # Check GEMINI_API_KEY_1, GEMINI_API_KEY_2, etc.
    i = 1
    while True:
        key = os.environ.get(f"GEMINI_API_KEY_{i}")
        if not key:
            break
        if key.strip() not in keys:
            keys.append(key.strip())
        i += 1
        
    return keys

def generate_content_with_rotation(api_keys, model, contents, config=None):
    if not api_keys:
        print("Error: No Gemini API keys found. Please set GEMINI_API_KEY in .env file.", file=sys.stderr)
        sys.exit(1)
        
    last_exception = None
    for attempt, key in enumerate(api_keys):
        try:
            client = genai.Client(api_key=key)
            response = client.models.generate_content(
                model=model,
                contents=contents,
                config=config
            )
            return response
        except Exception as e:
            err_msg = str(e).lower()
            if "429" in err_msg or "resource_exhausted" in err_msg or "quota" in err_msg or "limit" in err_msg or "exhausted" in err_msg:
                print(f"Warning: API Key {attempt+1}/{len(api_keys)} hit rate limit/quota. Error: {e}", file=sys.stderr)
            else:
                print(f"Warning: API Key {attempt+1}/{len(api_keys)} failed with error: {e}", file=sys.stderr)
            
            print("Rotating to next API key...", file=sys.stderr)
            last_exception = e
            time.sleep(1) # sleep briefly before retry
            
    raise Exception(f"All {len(api_keys)} API keys failed. Last error: {last_exception}")
