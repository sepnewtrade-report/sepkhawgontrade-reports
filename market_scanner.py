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

def override_prices_with_yfinance(data):
    import yfinance as yf
    from concurrent.futures import ThreadPoolExecutor
    
    # Collect all tickers
    tickers = set()
    if "sectors" in data and isinstance(data["sectors"], list):
        for sec in data["sectors"]:
            if "stocks" in sec and isinstance(sec["stocks"], list):
                for stock in sec["stocks"]:
                    if "ticker" in stock:
                        tickers.add(stock["ticker"])
                        
    if "socialTrends" in data and isinstance(data["socialTrends"], list):
        for trend in data["socialTrends"]:
            if "ticker" in trend:
                tickers.add(trend["ticker"])
                
    # Fetch in parallel
    results = {}
    def fetch_quote(ticker):
        try:
            # clean ticker name just in case
            t_name = ticker.strip().upper()
            t = yf.Ticker(t_name)
            info = t.info
            price = info.get("currentPrice") or info.get("regularMarketPrice")
            prev_close = info.get("previousClose") or info.get("regularMarketPreviousClose")
            
            # fallback to history if info doesn't have it
            if price is None:
                hist = t.history(period="1d")
                if not hist.empty:
                    price = hist['Close'].iloc[-1]
                    prev_close = hist['Open'].iloc[-1]
                    
            if price is not None and prev_close is not None:
                change = ((price - prev_close) / prev_close) * 100
                return ticker, price, change
        except Exception:
            pass
        return ticker, None, None

    with ThreadPoolExecutor(max_workers=25) as executor:
        for ticker, price, change in executor.map(fetch_quote, list(tickers)):
            if price is not None:
                results[ticker] = (price, change)
                
    # Overwrite in data
    if "sectors" in data and isinstance(data["sectors"], list):
        for sec in data["sectors"]:
            if "stocks" in sec and isinstance(sec["stocks"], list):
                for stock in sec["stocks"]:
                    ticker = stock.get("ticker")
                    if ticker in results:
                        price, change = results[ticker]
                        stock["price"] = f"${price:.2f}"
                        stock["change"] = f"{change:+.2f}%"
                        
    if "socialTrends" in data and isinstance(data["socialTrends"], list):
        for trend in data["socialTrends"]:
            ticker = trend.get("ticker")
            if ticker in results:
                price, change = results[ticker]
                trend["price"] = f"${price:.2f}"
                trend["change"] = f"{change:+.2f}%"

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
                                    "rsi": types.Schema(type=types.Type.STRING),
                                    "macd": types.Schema(type=types.Type.STRING),
                                    "reason": types.Schema(type=types.Type.STRING)
                                },
                                required=["ticker", "name", "price", "volume", "change", "rsi", "macd", "reason"]
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
        "2. For each stock, identify its current technical indicators: RSI (14-day relative strength index, e.g., '55'), trading Volume (e.g. '12.4M'), and MACD signal (e.g. 'Bullish Cross' or 'Bearish').\n"
        "3. Identify the most active/discussed US stocks in global retail investor forums and social channels (Reddit, X, Stocktwits) right now.\n\n"
        "CRITICAL: Do NOT include any inline search citations (such as [1], [2], [1.3.7]) or footnote links anywhere in the JSON keys or values. Strip all citations and footnotes, returning only pure raw data. All stock prices must be the latest live price (including Pre-market, After-Hours, or Overnight prices if active). To guarantee accuracy, prioritize querying Yahoo Finance or Google Finance quotes directly for each ticker (e.g., search 'SPCE stock price yahoo finance' or 'AAPL quote google finance'). Pay extra attention to stocks that had recent reverse stock splits (such as SPCE, which trades around $2.70+, NOT $1.50). Double check quotes to ensure post-split values are represented.\n\n"
        "Format the output strictly as a JSON object matching the requested schema. Ensure all fields are populated with current actual values. "
        "Do not include any markdown format blocks, output raw JSON only."
    )

    user_prompt = (
        "Scan the US market right now. Fetch the top 10 stocks by volume for Technology, Financials, Healthcare, Consumer Discretionary, Communication Services, Energy, Biotechnology, Space, and Robotics. "
        "For each stock, retrieve the current RSI (14-day) and MACD indicators alongside the price and volume. "
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
        parsed = json.loads(cleaned, strict=False)
        
        # Override prices with yfinance data for 100% accuracy
        try:
            print("Verifying and correcting stock prices using yfinance...")
            override_prices_with_yfinance(parsed)
        except Exception as e:
            print(f"Warning: Failed to override prices with yfinance: {e}", file=sys.stderr)
        
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
