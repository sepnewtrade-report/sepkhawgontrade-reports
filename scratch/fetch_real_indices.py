import yfinance as yf
import json

indices = {
    'S&P 500': '^GSPC',
    'Nasdaq Composite': '^IXIC',
    'Dow Jones': '^DJI',
    'Gold': 'GC=F',
    'VIX': '^VIX',
    '10Y Yield': '^TNX'
}

index_results = {}

for name, symbol in indices.items():
    try:
        tk = yf.Ticker(symbol)
        df = tk.history(period='5d')
        if not df.empty:
            price = float(df['Close'].iloc[-1])
            prev = float(df['Close'].iloc[-2]) if len(df) > 1 else price
            chg = ((price - prev) / prev) * 100.0
            index_results[name] = {
                'symbol': symbol,
                'price': round(price, 2),
                'change_pct': round(chg, 2)
            }
            print(f"{name:<18} ({symbol}): ${price:,.2f} ({chg:+.2f}%)")
        else:
            print(f"{name:<18} ({symbol}): No data")
    except Exception as e:
        print(f"Error {name}: {e}")

with open("scratch/real_indices.json", "w") as f:
    json.dump(index_results, f, indent=2)
