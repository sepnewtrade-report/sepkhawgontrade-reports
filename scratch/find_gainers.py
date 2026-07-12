import yfinance as yf
import pandas as pd
import json

tickers = [
    "RIVN", "HIMS", "RH", "SIRI", "APLD", "SOUN", "GRPN", "GME", "LFVN", "EVGO", 
    "TEM", "WULF", "SPWR", "CHWY", "DJT", "UPST", "BYND", "CVNA", "MSTR", 
    "PLUG", "LYFT", "RUN", "LUNR", "FLWS", "BATL", "SUNE", "AMC", "SPCE", 
    "NKLA", "NVAX", "LAZR", "BLNK"
]

results = []
for ticker in tickers:
    try:
        t = yf.Ticker(ticker)
        hist = t.history(period="12d")
        if hist.empty:
            continue
        
        # We want to check different lookback windows for the best return:
        # last 5 trading days
        close_latest = hist['Close'].iloc[-1]
        
        # 5 days ago (which is index -6 if hist has 12 days, e.g. -1 is latest, -2 is 1 day ago, -6 is 5 days ago)
        # Let's calculate percentage change for last 5, 6, 7, 8 trading days to see if there was a strong surge in the past week
        changes = {}
        for d in [3, 5, 7, 10]:
            if len(hist) > d:
                prev_close = hist['Close'].iloc[-(d+1)]
                pct = ((close_latest - prev_close) / prev_close) * 100
                changes[f"change_{d}d"] = pct
            else:
                changes[f"change_{d}d"] = 0.0
                
        # Also let's find the max price in the last 7 days and see how much it surged from the low in the last 10 days
        low_10d = hist['Low'].iloc[-10:].min()
        high_10d = hist['High'].iloc[-10:].max()
        max_surge = ((high_10d - low_10d) / low_10d) * 100 if low_10d > 0 else 0
        
        info = t.info
        short_percent = info.get("shortPercentOfFloat", 0) * 100 if info.get("shortPercentOfFloat") is not None else 0
        shares_short = info.get("sharesShort", 0)
        days_to_cover = info.get("shortRatio", 0)
        
        float_shares = info.get("floatShares", 1)
        if short_percent == 0 and shares_short > 0 and float_shares > 1:
            short_percent = (shares_short / float_shares) * 100
            
        results.append({
            "ticker": ticker,
            "name": info.get("longName", ""),
            "price": close_latest,
            "changes": changes,
            "max_surge_10d": max_surge,
            "short_percent": short_percent,
            "days_to_cover": days_to_cover,
            "volume_latest": int(hist['Volume'].iloc[-1]),
            "volume_avg_10d": int(hist['Volume'].mean())
        })
    except Exception as e:
        print(f"Error {ticker}: {e}")

# Print sorted by max surge in the last 10 days
results.sort(key=lambda x: x["max_surge_10d"], reverse=True)
for r in results:
    print(f"{r['ticker']}: Price={r['price']:.2f}, MaxSurge10d={r['max_surge_10d']:.2f}%, Short%={r['short_percent']:.2f}%, DTC={r['days_to_cover']:.2f}")

with open("scratch_gainers_data.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)
