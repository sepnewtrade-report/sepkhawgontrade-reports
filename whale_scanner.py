import os
import sys
import json
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from google import genai
from google.genai import types

def clean_json_text(text):
    if not text:
        return ""
    text = text.strip()
    # Strip markdown formatting if present
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()

def get_whale_schema():
    return types.Schema(
        type=types.Type.OBJECT,
        properties={
            "investorName": types.Schema(type=types.Type.STRING),
            "firmName": types.Schema(type=types.Type.STRING),
            "aum": types.Schema(type=types.Type.STRING),
            "style": types.Schema(type=types.Type.STRING),
            "longPortfolio": types.Schema(
                type=types.Type.ARRAY,
                items=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "ticker": types.Schema(type=types.Type.STRING),
                        "name": types.Schema(type=types.Type.STRING),
                        "price": types.Schema(type=types.Type.STRING),
                        "change": types.Schema(type=types.Type.STRING),
                        "shares": types.Schema(type=types.Type.STRING),
                        "value": types.Schema(type=types.Type.STRING),
                        "weight": types.Schema(type=types.Type.STRING)
                    },
                    required=["ticker", "name", "price", "change", "shares", "value", "weight"]
                )
            ),
            "optionsPositions": types.Schema(
                type=types.Type.ARRAY,
                items=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "ticker": types.Schema(type=types.Type.STRING),
                        "type": types.Schema(type=types.Type.STRING),
                        "underlyingPrice": types.Schema(type=types.Type.STRING),
                        "price": types.Schema(type=types.Type.STRING),
                        "change": types.Schema(type=types.Type.STRING),
                        "contracts": types.Schema(type=types.Type.STRING),
                        "value": types.Schema(type=types.Type.STRING),
                        "strikePrice": types.Schema(type=types.Type.STRING),
                        "expiryDate": types.Schema(type=types.Type.STRING)
                    },
                    required=["ticker", "type", "underlyingPrice", "price", "change", "contracts", "value", "strikePrice", "expiryDate"]
                )
            ),
            "shortPositions": types.Schema(
                type=types.Type.ARRAY,
                items=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "ticker": types.Schema(type=types.Type.STRING),
                        "name": types.Schema(type=types.Type.STRING),
                        "price": types.Schema(type=types.Type.STRING),
                        "change": types.Schema(type=types.Type.STRING),
                        "size": types.Schema(type=types.Type.STRING),
                        "reason": types.Schema(type=types.Type.STRING)
                    },
                    required=["ticker", "name", "price", "change", "size", "reason"]
                )
            ),
            "recentTransactions": types.Schema(
                type=types.Type.ARRAY,
                items=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "date": types.Schema(type=types.Type.STRING),
                        "ticker": types.Schema(type=types.Type.STRING),
                        "action": types.Schema(type=types.Type.STRING),
                        "price": types.Schema(type=types.Type.STRING),
                        "size": types.Schema(type=types.Type.STRING)
                    },
                    required=["date", "ticker", "action", "price", "size"]
                )
            )
        },
        required=["investorName", "firmName", "aum", "style", "longPortfolio", "optionsPositions", "shortPositions", "recentTransactions"]
    )

def fetch_individual_whale(client, model_name, investor, firm):
    schema = get_whale_schema()
    
    system_instruction = (
        "You are an expert US financial researcher.\n"
        f"Search Google to extract the current portfolio, options positions, short positions, and recent transactions for: {investor} ({firm}).\n"
        "Extract:\n"
        "- Long Stock portfolio (exactly top 3 holdings: ticker, name, price, change %, shares, value, weight)\n"
        "- Options positions (exactly top 2 call/put option positions: ticker, type, underlyingPrice (price of the underlying stock), price (option premium price), change %, contracts, value, strikePrice (strike price in contract), expiryDate (contract expiration date). If none, return empty list or mock hedge positions for SPY/QQQ)\n"
        "- Short positions (exactly top 2 short campaigns or positions, price, change %, size, reason. If none, return empty list)\n"
        "- Recent 1-Month Transactions: Transactions executed in the past 30 days (exactly top 2 transactions: date, ticker, buy/sell action, price, size. If none, return empty list)\n"
        "Keep descriptions and summaries highly concise (under 8 words per field). Limit search results to Form 13F and official filings to keep output short and prevent truncation. CRITICAL: Do not use unescaped double quotes inside any string properties. Use single quotes instead."
    )
    
    config = types.GenerateContentConfig(
        system_instruction=system_instruction,
        tools=[types.Tool(google_search=types.GoogleSearch())],
        response_mime_type="application/json",
        response_schema=schema,
        max_output_tokens=4096
    )
    
    prompt = f"Search and analyze current filings, options, shorts and 30-day transactions for {investor} of {firm}. Return raw JSON."
    response = client.models.generate_content(model=model_name, contents=prompt, config=config)
    
    cleaned = clean_json_text(response.text)
    try:
        return json.loads(cleaned)
    except Exception as e:
        debug_filename = f"debug_{investor.replace(' ', '_')}.txt"
        with open(debug_filename, "w", encoding="utf-8") as df:
            df.write(response.text)
        raise Exception(f"Whale {investor} parse error: {e}. Raw response saved to {debug_filename}")

def synthesize_overview(client, model_name, whales_data):
    schema = types.Schema(
        type=types.Type.OBJECT,
        properties={
            "marketSentiment": types.Schema(type=types.Type.STRING),
            "topSectorRotation": types.Schema(
                type=types.Type.ARRAY,
                items=types.Schema(type=types.Type.STRING)
            ),
            "criticalPeriodHighlights": types.Schema(
                type=types.Type.ARRAY,
                items=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "timestamp": types.Schema(type=types.Type.STRING),
                        "marketEvent": types.Schema(type=types.Type.STRING),
                        "whaleActivity": types.Schema(type=types.Type.STRING),
                        "impact": types.Schema(type=types.Type.STRING)
                    },
                    required=["timestamp", "marketEvent", "whaleActivity", "impact"]
                )
            )
        },
        required=["marketSentiment", "topSectorRotation", "criticalPeriodHighlights"]
    )
    
    # Compile text summary of whale data as context
    summary_parts = []
    for w in whales_data:
        name = w.get("investorName", "Unknown")
        firm = w.get("firmName", "Unknown")
        style = w.get("style", "")
        longs = [x.get("ticker", "") for x in w.get("longPortfolio", [])]
        shorts = [x.get("ticker", "") for x in w.get("shortPositions", [])]
        txs = [f"{x.get('action', '')} {x.get('ticker', '')}" for x in w.get("recentTransactions", [])]
        summary_parts.append(
            f"- {name} ({firm}): Style={style}, Top Holdings={','.join(longs)}, Shorts={','.join(shorts)}, Transactions={','.join(txs)}"
        )
    
    summary_text = "\n".join(summary_parts)
    
    system_instruction = (
        "You are an expert US financial analyst.\n"
        "Synthesize the general institutional market sentiment and top 3 sector rotations based on the provided summary of whale activities.\n"
        "Also synthesize exactly top 3 critical period highlights on key dates between April 2026 and July 2026 (such as CPI releases, Fed Chair meetings, or index sell-offs) detailing what these whales did on those dates.\n"
        "CRITICAL: All events, timestamps, and highlights MUST only reference key dates and occurrences between April 2026 and July 2026. Do not mention dates before April 2026 (such as February or March 2026) or previous years (such as 2024, 2023). All dates in critical period logs must belong to the period from April 1, 2026 to July 4, 2026.\n"
        "Keep summaries highly concise (under 12 words per sentence). CRITICAL: Do not use unescaped double quotes inside any string properties. Use single quotes instead."
    )
    
    config = types.GenerateContentConfig(
        system_instruction=system_instruction,
        response_mime_type="application/json",
        response_schema=schema,
        max_output_tokens=4096
    )
    
    prompt = f"Here is the summary of the {len(whales_data)} whales activities:\n{summary_text}\n\nSynthesize the market sentiment, sector rotation, and critical period logs. Return raw JSON."
    
    response = client.models.generate_content(model=model_name, contents=prompt, config=config)
    cleaned = clean_json_text(response.text)
    
    try:
        return json.loads(cleaned)
    except Exception as e:
        with open("debug_overview.txt", "w", encoding="utf-8") as df:
            df.write(response.text)
        raise Exception(f"Overview parse error: {e}. Raw response saved to debug_overview.txt")

def main():
    if len(sys.argv) < 2:
        print("Usage: python whale_scanner.py <output_json_path>", file=sys.stderr)
        sys.exit(1)
        
    output_file = sys.argv[1]

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY environment variable not set.", file=sys.stderr)
        sys.exit(1)
        
    model_name = "gemini-3.5-flash"
    client = genai.Client(api_key=api_key)

    whale_list = [
        {"investor": "Warren Buffett", "firm": "Berkshire Hathaway"},
        {"investor": "Ken Griffin", "firm": "Citadel Advisors"},
        {"investor": "Jim Simons", "firm": "Renaissance Technologies"},
        {"investor": "Michael Burry", "firm": "Scion Asset Management"},
        {"investor": "Ray Dalio", "firm": "Bridgewater Associates"},
        {"investor": "Chase Coleman", "firm": "Tiger Global Management"},
        {"investor": "David Tepper", "firm": "Appaloosa Management"},
        {"investor": "Bill Ackman", "firm": "Pershing Square"},
        {"investor": "Carl Icahn", "firm": "Icahn Enterprises"},
        {"investor": "Paul Singer", "firm": "Elliott Investment Management"},
        {"investor": "Cathie Wood", "firm": "ARK Investment Management"},
        {"investor": "Larry Fink", "firm": "BlackRock"}
    ]

    final_payload = {
        "overview": None,
        "whales": []
    }

    print("Initiating concurrent queries for 10 Whales...")
    
    # Process 10 whales in parallel (max 2 concurrent workers for rate limit safety)
    with ThreadPoolExecutor(max_workers=2) as executor:
        whale_futures = {
            executor.submit(fetch_individual_whale, client, model_name, w["investor"], w["firm"]): w
            for w in whale_list
        }
        
        for future in as_completed(whale_futures):
            w = whale_futures[future]
            try:
                whale_data = future.result()
                final_payload["whales"].append(whale_data)
                print(f"Successfully processed {w['investor']} ({w['firm']})")
            except Exception as e:
                print(f"Error processing {w['investor']}: {e}", file=sys.stderr)
                final_payload["whales"].append({
                    "investorName": w["investor"],
                    "firmName": w["firm"],
                    "aum": "N/A",
                    "style": "Active Portfolio",
                    "longPortfolio": [],
                    "optionsPositions": [],
                    "shortPositions": [],
                    "recentTransactions": []
                })
            time.sleep(1)

    # Sort whales array to match the requested input order
    order_map = {w["investor"]: i for i, w in enumerate(whale_list)}
    final_payload["whales"].sort(key=lambda x: order_map.get(x.get("investorName"), 99))

    # 2. Synthesize overview using the successfully retrieved whale data as context
    print("Synthesizing market overview based on compiled whale profiles...")
    try:
        final_payload["overview"] = synthesize_overview(client, model_name, final_payload["whales"])
        print("Market overview successfully compiled.")
    except Exception as e:
        print(f"Error synthesizing overview: {e}", file=sys.stderr)
        final_payload["overview"] = {
            "marketSentiment": "Mixed / Defensive",
            "topSectorRotation": ["Financials", "Energy", "Technology"],
            "criticalPeriodHighlights": []
        }

    now = time.localtime()
    thai_timestamp = f"{now.tm_mday}/{now.tm_mon}/{now.tm_year + 543} {now.tm_hour:02d}:{now.tm_min:02d}:{now.tm_sec:02d}"

    result_payload = {
        "lastUpdated": thai_timestamp,
        "data": final_payload
    }

    try:
        output_dir = os.path.dirname(os.path.abspath(output_file))
        if output_dir:
            os.makedirs(output_dir, exist_ok=True)
            
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(result_payload, f, ensure_ascii=False, indent=2)
            
        print(f"Success: Full database compiled and saved to {output_file}")
        sys.exit(0)
    except Exception as e:
        print(f"Error saving database JSON: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
