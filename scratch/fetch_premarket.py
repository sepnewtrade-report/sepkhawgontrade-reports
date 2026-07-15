import yfinance as yf
import json

tickers = ["ASML", "IBM", "BLK", "JNJ", "CELC", "SEI", "CPRX", "CLSK", "WULF", "AAL"]
results = {}

for ticker in tickers:
    try:
        t = yf.Ticker(ticker)
        info = t.info
        
        # Calculate premarket change
        prev_close = info.get("previousClose") or info.get("regularMarketPreviousClose")
        premarket_price = info.get("preMarketPrice")
        
        premarket_change = None
        if premarket_price and prev_close:
            premarket_change = ((premarket_price - prev_close) / prev_close) * 100
            
        results[ticker] = {
            "name": info.get("longName"),
            "business": info.get("longBusinessSummary"),
            "sector": info.get("sector"),
            "industry": info.get("industry"),
            "prevClose": prev_close,
            "preMarketPrice": premarket_price,
            "preMarketChangePct": premarket_change,
            "volume": info.get("volume") or info.get("regularMarketVolume"),
            "avgVolume": info.get("averageVolume") or info.get("averageVolume10days"),
            "marketCap": info.get("marketCap")
        }
    except Exception as e:
        results[ticker] = {"error": str(e)}

print(json.dumps(results, indent=2))
