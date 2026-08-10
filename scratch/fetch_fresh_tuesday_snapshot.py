# -*- coding: utf-8 -*-
import yfinance as yf
import json

# Comprehensive market check for Tuesday, August 11, 2026
symbols = {
    # Indices & Commodities
    'SP500': '^GSPC',
    'NASDAQ': '^IXIC',
    'DOW': '^DJI',
    'GOLD': 'GC=F',
    'VIX': '^VIX',
    'US10Y': '^TNX',
    'OIL': 'CL=F',
    'BITCOIN': 'BTC-USD',
    
    # Key Mega-Cap & Market Movers
    'MSFT': 'MSFT',
    'AAPL': 'AAPL',
    'NVDA': 'NVDA',
    'AMZN': 'AMZN',
    'GOOGL': 'GOOGL',
    'META': 'META',
    'TSLA': 'TSLA',
    'AVGO': 'AVGO',
    'PLTR': 'PLTR',
    'AMD': 'AMD',
    'SMCI': 'SMCI',
    'TTWO': 'TTWO',
    'LLY': 'LLY',
    'DDOG': 'DDOG'
}

data_snapshot = {}

for name, sym in symbols.items():
    try:
        tk = yf.Ticker(sym)
        df = tk.history(period='5d')
        if not df.empty:
            price = float(df['Close'].iloc[-1])
            prev = float(df['Close'].iloc[-2]) if len(df) > 1 else price
            chg = ((price - prev) / prev) * 100.0
            vol = int(df['Volume'].iloc[-1])
            
            data_snapshot[name] = {
                'symbol': sym,
                'price': round(price, 2),
                'change_pct': round(chg, 2),
                'volume': vol
            }
            print(f"{name:<10} ({sym:<8}): ${price:,.2f} ({chg:+.2f}%)")
    except Exception as e:
        print(f"Error {name}: {e}")

with open("scratch/tuesday_fresh_snapshot.json", "w", encoding="utf-8") as f:
    json.dump(data_snapshot, f, indent=2, ensure_ascii=False)

print("\nSaved fresh snapshot to scratch/tuesday_fresh_snapshot.json")
