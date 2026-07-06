import os
import sys
import json
from google import genai
from google.genai import types

def clean_json_text(text):
    if not text:
        return ""
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()

def main():
    if len(sys.argv) < 2:
        print("Usage: python market_scanner.py <output_json_path>", file=sys.stderr)
        sys.exit(1)
        
    output_file = sys.argv[1]

    # Manually load .env from project root if it exists
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip() and not line.startswith("#"):
                    parts = line.strip().split("=", 1)
                    if len(parts) == 2:
                        os.environ[parts[0].strip()] = parts[1].strip().strip('"').strip("'")
                        
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY environment variable not set. Please set it in .env file in the project root.", file=sys.stderr)
        sys.exit(1)
        
    model_name = "gemini-3.5-flash"

    client = genai.Client(api_key=api_key)

    schema = types.Schema(
        type=types.Type.OBJECT,
        properties={
            "sectors": types.Schema(
                type=types.Type.ARRAY,
                items=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "sectorName": types.Schema(type=types.Type.STRING),
                        "stocks": types.Schema(
                            type=types.Type.ARRAY,
                            items=types.Schema(
                                type=types.Type.OBJECT,
                                properties={
                                    "ticker": types.Schema(type=types.Type.STRING),
                                    "name": types.Schema(type=types.Type.STRING),
                                    "price": types.Schema(type=types.Type.STRING),
                                    "volume": types.Schema(type=types.Type.STRING),
                                    "change": types.Schema(type=types.Type.STRING),
                                    "reason": types.Schema(type=types.Type.STRING)
                                },
                                required=["ticker", "name", "price", "volume", "change", "reason"]
                            )
                        )
                    },
                    required=["sectorName", "stocks"]
                )
            ),
            "socialTrends": types.Schema(
                type=types.Type.ARRAY,
                items=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "ticker": types.Schema(type=types.Type.STRING),
                        "name": types.Schema(type=types.Type.STRING),
                        "price": types.Schema(type=types.Type.STRING),
                        "change": types.Schema(type=types.Type.STRING),
                        "mentions": types.Schema(type=types.Type.STRING),
                        "platforms": types.Schema(type=types.Type.STRING),
                        "sentiment": types.Schema(type=types.Type.STRING),
                        "summary": types.Schema(type=types.Type.STRING)
                    },
                    required=["ticker", "name", "price", "change", "mentions", "platforms", "sentiment", "summary"]
                )
            )
        },
        required=["sectors", "socialTrends"]
    )

    system_instruction = (
        "You are an expert US financial market scanner and social media sentiment analyst.\n"
        "Your task is to use Google Search to find current, live information at this exact moment:\n"
        "1. Identify the Top 10 US stocks by trading volume for these sectors: Technology, Financials, Healthcare, Consumer Discretionary, Communication Services, Energy, Biotechnology, Space, and Robotics.\n"
        "2. Identify the most active/discussed US stocks in global retail investor forums and social channels (Reddit, X, Stocktwits) right now.\n\n"
        "CRITICAL: All stock prices must be the latest live price (including Pre-market, After-Hours, or Overnight prices if active).\n\n"
        "Format the output strictly as a JSON object matching the requested schema. Ensure all fields are populated with current actual values. "
        "Do not include any markdown format blocks, output raw JSON only."
    )

    user_prompt = (
        "Scan the US market right now. Fetch the top 10 stocks by volume for Technology, Financials, Healthcare, Consumer Discretionary, Communication Services, Energy, Biotechnology, Space, and Robotics. "
        "Use the latest live prices (including Pre-market/After-hours/Overnight if active). "
        "Also scan global social platforms (X, Reddit, Stocktwits) to identify top trending stocks with mention volume, sentiment, price, change, and discussion summaries. "
        "Return the resulting structured data."
    )

    try:
        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            tools=[types.Tool(google_search=types.GoogleSearch())],
            response_mime_type="application/json",
            response_schema=schema
        )
        
        response = client.models.generate_content(
            model=model_name,
            contents=user_prompt,
            config=config
        )
        
        json_data = response.text
        if not json_data:
            raise Exception("Gemini returned empty response")
            
        cleaned = clean_json_text(json_data)
        # Parse to validate JSON format (strict=False handles raw newlines/tabs inside strings)
        parsed = json.loads(cleaned, strict=False)
        
        # Save to output file
        output_dir = os.path.dirname(os.path.abspath(output_file))
        if output_dir:
            os.makedirs(output_dir, exist_ok=True)
            
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(parsed, f, ensure_ascii=False, indent=2)
            
        print(f"Success: Market scan saved to {output_file}")
        sys.exit(0)
    except Exception as e:
        debug_filename = "debug_market.txt"
        try:
            with open(debug_filename, "w", encoding="utf-8") as df:
                df.write(response.text if 'response' in locals() and response.text else "No response text")
        except Exception:
            pass
        print(f"Error during generation: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
