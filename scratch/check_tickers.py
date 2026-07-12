import yfinance as yf
import pandas as pd
import json

tickers = ["RIVN", "HIMS", "RH", "SIRI", "APLD", "SOUN", "GRPN", "GME", "LFVN", "EVGO", "TEM", "WULF", "SPWR", "CHWY", "DJT", "UPST", "BYND", "CVNA"]

results = []
for ticker in tickers:
    try:
        t = yf.Ticker(ticker)
        # Fetch history for the past 10 days
        hist = t.history(period="10d")
        if hist.empty:
            print(f"Empty history for {ticker}")
            continue
        
        # Calculate price change over last 5 trading days
        # E.g. close on last day vs close 5 trading days ago
        close_latest = hist['Close'].iloc[-1]
        close_5d_ago = hist['Close'].iloc[-5] if len(hist) >= 5 else hist['Close'].iloc[0]
        change_5d = ((close_latest - close_5d_ago) / close_5d_ago) * 100
        
        close_7d_ago = hist['Close'].iloc[-7] if len(hist) >= 7 else hist['Close'].iloc[0]
        change_7d = ((close_latest - close_7d_ago) / close_7d_ago) * 100
        
        # Volume info
        latest_vol = hist['Volume'].iloc[-1]
        avg_vol = hist['Volume'].mean()
        vol_ratio = latest_vol / avg_vol if avg_vol > 0 else 0
        
        info = t.info
        short_percent = info.get("shortPercentOfFloat", 0) * 100 if info.get("shortPercentOfFloat") is not None else 0
        shares_short = info.get("sharesShort", 0)
        days_to_cover = info.get("shortRatio", 0)
        
        # fallback for shortPercentOfFloat if it is 0, sometimes yfinance doesn't have it but has sharesShort and float
        float_shares = info.get("floatShares", 1)
        if short_percent == 0 and shares_short > 0 and float_shares > 1:
            short_percent = (shares_short / float_shares) * 100
            
        results.append({
            "ticker": ticker,
            "name": info.get("longName", ""),
            "price": close_latest,
            "change_5d": change_5d,
            "change_7d": change_7d,
            "volume_latest": int(latest_vol),
            "volume_avg_10d": int(avg_vol),
            "volume_ratio": vol_ratio,
            "short_percent": short_percent,
            "shares_short": shares_short,
            "days_to_cover": days_to_cover
        })
        print(f"Processed {ticker}: Price={close_latest:.2f}, 5d_change={change_5d:+.2f}%, Short%={short_percent:.2f}%, DTC={days_to_cover:.2f}")
    except Exception as e:
        print(f"Error processing {ticker}: {e}")

# Save results
with open("scratch_tickers_data.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)
