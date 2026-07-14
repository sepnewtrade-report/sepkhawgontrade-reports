import yfinance as yf
import pandas as pd
import json
from datetime import datetime, timedelta

tickers = ["RIVN", "HIMS", "APLD", "SOUN", "GRPN", "GME", "TEM", "WULF", "UPST", "BYND", "CVNA", "EVGO", "CHWY", "DJT", "LUNR"]

results = []
for ticker in tickers:
    try:
        t = yf.Ticker(ticker)
        # Fetch history for the past 15 days
        hist = t.history(period="15d")
        if hist.empty:
            print(f"Empty history for {ticker}")
            continue
        
        # Calculate price change over last 5 trading days
        close_latest = hist['Close'].iloc[-1]
        close_5d_ago = hist['Close'].iloc[-5] if len(hist) >= 5 else hist['Close'].iloc[0]
        change_5d = ((close_latest - close_5d_ago) / close_5d_ago) * 100
        
        # Volume info
        latest_vol = hist['Volume'].iloc[-1]
        avg_vol = hist['Volume'].rolling(window=10).mean().iloc[-1]
        vol_ratio = latest_vol / avg_vol if avg_vol > 0 else 0
        
        info = t.info
        short_percent = info.get("shortPercentOfFloat", 0) * 100 if info.get("shortPercentOfFloat") is not None else 0
        shares_short = info.get("sharesShort", 0)
        days_to_cover = info.get("shortRatio", 0)
        float_shares = info.get("floatShares", 1)
        
        if short_percent == 0 and shares_short > 0 and float_shares > 1:
            short_percent = (shares_short / float_shares) * 100
            
        # Try to get option chain info
        options_dates = t.options
        otm_call_oi = 0
        otm_call_volume = 0
        otm_strike_desc = "N/A"
        
        if options_dates:
            # Get the nearest expiration date option chain
            nearest_expiry = options_dates[0]
            opt = t.option_chain(nearest_expiry)
            calls = opt.calls
            
            # Out-of-the-money calls are calls with strike > current price
            otm_calls = calls[calls['strike'] > close_latest]
            if not otm_calls.empty:
                # Sort by open interest or volume
                otm_calls_sorted = otm_calls.sort_values(by='openInterest', ascending=False)
                top_otm_call = otm_calls_sorted.iloc[0]
                otm_strike_desc = f"Strike ${top_otm_call['strike']:.1f} (OI: {int(top_otm_call['openInterest'])}, Vol: {int(top_otm_call['volume']) if 'volume' in top_otm_call and not pd.isna(top_otm_call['volume']) else 0})"
                otm_call_oi = int(otm_calls['openInterest'].sum())
                if 'volume' in otm_calls:
                    otm_call_volume = int(otm_calls['volume'].dropna().sum())
        
        results.append({
            "ticker": ticker,
            "name": info.get("longName", ticker),
            "price": float(close_latest),
            "change_5d": float(change_5d),
            "volume_latest": int(latest_vol),
            "volume_avg_10d": int(avg_vol) if not pd.isna(avg_vol) else int(latest_vol),
            "volume_ratio": float(vol_ratio),
            "short_percent": float(short_percent),
            "shares_short": int(shares_short) if shares_short is not None else 0,
            "days_to_cover": float(days_to_cover) if days_to_cover is not None else 0.0,
            "otm_call_oi": otm_call_oi,
            "otm_call_volume": otm_call_volume,
            "otm_strike_desc": otm_strike_desc
        })
        print(f"Processed {ticker}: Price={close_latest:.2f}, 5d_change={change_5d:+.2f}%, Short%={short_percent:.2f}%, DTC={days_to_cover:.2f}, OTM_OI={otm_call_oi}")
    except Exception as e:
        print(f"Error processing {ticker}: {e}")

# Save results
with open("scratch/scratch_squeeze_data.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)
print("Finished!")
