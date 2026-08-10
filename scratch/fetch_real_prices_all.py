import yfinance as yf
import pandas as pd
import numpy as np
import json

tickers = [
    'NVDA', 'PLTR', 'TSLA', 'AMD', 'AMZN', 
    'SMCI', 'ARM', 'COIN', 'ASTS', 'SOUN', 
    'IONQ', 'GLD', 'NEM', 'GOLD', 'MSFT', 
    'AAPL', 'META', 'GOOGL', 'AVGO'
]

results = {}

for t in tickers:
    try:
        data = yf.Ticker(t)
        df = data.history(period='2mo')
        if not df.empty:
            price = float(df['Close'].iloc[-1])
            prev_price = float(df['Close'].iloc[-2]) if len(df) > 1 else price
            chg_pct = ((price - prev_price) / prev_price) * 100.0
            vol = int(df['Volume'].iloc[-1])
            
            delta = df['Close'].diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
            rs = gain / loss
            rsi = float(100 - (100 / (1 + rs)).iloc[-1])
            
            results[t] = {
                'price': round(price, 2),
                'change_pct': round(chg_pct, 2),
                'volume': vol,
                'rsi': round(rsi, 2)
            }
            print(f"{t:<6}: Price=${price:.2f} ({chg_pct:+.2f}%), RSI={rsi:.2f}, Vol={vol:,}")
        else:
            print(f"{t:<6}: No history data")
    except Exception as e:
        print(f"{t:<6}: Error {e}")

with open("scratch/actual_prices.json", "w") as f:
    json.dump(results, f, indent=2)

print("\nSaved actual prices to scratch/actual_prices.json")
