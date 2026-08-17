import yfinance as yf
import json

indices = {
    'S&P 500': '^GSPC',
    'Nasdaq Composite': '^IXIC',
    'Dow Jones': '^DJI',
    'Russell 2000': '^RUT',
    'US 10Y Yield': '^TNX',
    'VIX': '^VIX',
    'Gold': 'GC=F',
    'WTI Oil': 'CL=F',
    'Brent Oil': 'BZ=F',
    'Bitcoin': 'BTC-USD',
    'US Dollar Index': 'DX-Y.NYB'
}

data = {}
print("=== FETCHING MARKET DATA ===")
for name, ticker in indices.items():
    try:
        t = yf.Ticker(ticker)
        h = t.history(period='5d')
        if not h.empty:
            close = float(h['Close'].iloc[-1])
            prev = float(h['Close'].iloc[-2]) if len(h) > 1 else close
            change_pct = float(((close - prev) / prev) * 100.0)
            data[name] = {
                'ticker': ticker,
                'price': round(close, 2),
                'prev': round(prev, 2),
                'change_pct': round(change_pct, 2)
            }
            print(f"{name} ({ticker}): {close:.2f} ({change_pct:+.2f}%)")
    except Exception as e:
        print(f"Error fetching {name}: {e}")

with open('scratch/market_data_cache.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Saved market data to scratch/market_data_cache.json")
