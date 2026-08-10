import yfinance as yf
import pandas as pd
import json

# Tickers known to report around early August
test_tickers = ['PLTR', 'SMCI', 'TTWO', 'ANET', 'DIS', 'LLY', 'ELF', 'DDOG', 'SHOP', 'OXY', 'RBLX', 'ABNB', 'UPST', 'HIMS', 'CELH']

past_24h_earnings = {}

for t in test_tickers:
    try:
        tk = yf.Ticker(t)
        info = tk.info
        hist = tk.history(period='5d')
        
        if not hist.empty:
            price = float(hist['Close'].iloc[-1])
            prev = float(hist['Close'].iloc[-2]) if len(hist) > 1 else price
            chg = ((price - prev) / prev) * 100.0
            vol = int(hist['Volume'].iloc[-1])
            
            # Check earnings history/dates if available
            cal = tk.calendar
            
            past_24h_earnings[t] = {
                'name': info.get('shortName') or info.get('longName') or t,
                'price': round(price, 2),
                'change_pct': round(chg, 2),
                'volume': vol,
                'revenue_growth': round(info.get('revenueGrowth', 0.0) * 100, 2) if info.get('revenueGrowth') else 0.0,
                'earnings_growth': round(info.get('earningsGrowth', 0.0) * 100, 2) if info.get('earningsGrowth') else 0.0,
                'pe': round(info.get('trailingPE', 0.0), 2) if info.get('trailingPE') else 0.0
            }
            print(f"{t}: Price=${price:.2f} ({chg:+.2f}%), Vol={vol:,}")
    except Exception as e:
        print(f"Error {t}: {e}")

with open("scratch/check_24h_earnings.json", "w") as f:
    json.dump(past_24h_earnings, f, indent=2)
