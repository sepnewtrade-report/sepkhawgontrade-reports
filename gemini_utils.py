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
                                os.environ.setdefault(key, val)
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

def generate_content_with_rotation(api_keys, model, contents, config=None, max_retries=2):
    if not api_keys:
        print("Error: No Gemini API keys found. Please set GEMINI_API_KEY in .env file.", file=sys.stderr)
        sys.exit(1)
        
    models_to_try = [model]
    if "gemini-2.5-flash" not in models_to_try:
        models_to_try.append("gemini-2.5-flash")
    if "gemini-2.0-flash" not in models_to_try:
        models_to_try.append("gemini-2.0-flash")

    last_exception = None
    for current_model in models_to_try:
        for retry in range(max_retries):
            for attempt, key in enumerate(api_keys):
                try:
                    client = genai.Client(api_key=key)
                    response = client.models.generate_content(
                        model=current_model,
                        contents=contents,
                        config=config
                    )
                    return response
                except Exception as e:
                    err_msg = str(e).lower()
                    if "429" in err_msg or "resource_exhausted" in err_msg or "quota" in err_msg or "limit" in err_msg:
                        sleep_time = (retry + 1) * 3
                        print(f"Warning: Model {current_model} rate limit (429) hit. Falling back/retrying (sleep {sleep_time}s)...", file=sys.stderr)
                        time.sleep(sleep_time)
                    else:
                        print(f"Warning: Model {current_model} API Key {attempt+1}/{len(api_keys)} failed: {e}", file=sys.stderr)
                        time.sleep(1)
                    last_exception = e
            
    raise Exception(f"All API key and model attempts failed. Last error: {last_exception}")
