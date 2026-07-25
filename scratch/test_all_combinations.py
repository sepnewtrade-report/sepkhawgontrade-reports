import gemini_utils
from google import genai

keys = gemini_utils.get_api_keys()
models = [
    'gemini-2.0-flash-lite',
    'gemini-2.5-flash-lite',
    'gemini-3.5-flash',
    'gemini-3.6-flash',
    'gemini-3.1-flash-lite',
    'gemini-2.0-flash',
    'gemini-2.5-pro'
]

print(f"Testing {len(keys)} keys against {len(models)} models...")
found = False
for model in models:
    for i, key in enumerate(keys):
        try:
            client = genai.Client(api_key=key)
            resp = client.models.generate_content(model=model, contents="ping")
            print(f"SUCCESS: Model '{model}' worked with API Key {i+1}!")
            found = True
            break
        except Exception as e:
            # print(f"Failed '{model}' with API Key {i+1}: {e}")
            pass
    if found:
        break

if not found:
    print("No model/key combination worked due to rate limits or not found.")
