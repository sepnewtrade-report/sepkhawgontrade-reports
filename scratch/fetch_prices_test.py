import yfinance as yf

tickers = ['ONDS', 'HYLN', 'CRWV', 'CAVA', 'HRB', 'SMCI', 'ARM', 'COIN', 'PLTR', 'MSTR', 'ASTS', 'SOUN', 'IONQ', 'BBAI', 'RGTI', 'NVDA', 'TSM', 'AVGO', 'MSFT']
results = {}

for t in tickers:
    try:
        tk = yf.Ticker(t)
        hist = tk.history(period='5d')
        if not hist.empty:
            close = hist['Close'].iloc[-1]
            prev = hist['Close'].iloc[-2]
            chg = ((close - prev)/prev)*100
            vol = hist['Volume'].iloc[-1]
            results[t] = {
                'price': float(close),
                'change_pct': float(chg),
                'volume': int(vol)
            }
            print(f"{t}: ${close:.2f} ({chg:+.2f}%) vol={vol}")
        else:
            print(f"{t}: empty history")
    except Exception as e:
        print(f"{t}: error {e}")

import json
with open("scratch/today_prices.json", "w") as f:
    json.dump(results, f, indent=2)
