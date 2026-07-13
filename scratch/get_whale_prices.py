import yfinance as yf
import pandas as pd
import json

tickers = ["IREN", "RKLB", "META", "NVDA", "TSLA", "PLTR", "SMCI", "WOLF", "ASTS", "PSX", "XOM", "CVX"]

results = {}
for ticker in tickers:
    try:
        t = yf.Ticker(ticker)
        # Fetch history for the past 5 days
        hist = t.history(period="5d")
        if hist.empty:
            print(f"Empty history for {ticker}")
            continue
        
        # Get historical prices for the last few days
        price_list = []
        for date, row in hist.iterrows():
            price_list.append({
                "date": str(date.date()),
                "open": row["Open"],
                "high": row["High"],
                "low": row["Low"],
                "close": row["Close"],
                "volume": int(row["Volume"])
            })
        
        results[ticker] = price_list
        print(f"Processed {ticker}: Latest Close = {price_list[-1]['close']:.2f}")
    except Exception as e:
        print(f"Error processing {ticker}: {e}")

with open("scratch/whale_prices_check.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)
