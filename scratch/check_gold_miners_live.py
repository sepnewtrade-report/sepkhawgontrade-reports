import yfinance as yf

gold_tickers = {
    'AEM': 'AEM',
    'GLD': 'GLD',
    'IAU': 'IAU',
    'GDX': 'GDX',
    'GDXJ': 'GDXJ',
    'NEM': 'NEM',
    'GOLD': 'GOLD',
    'SGOL': 'SGOL'
}

for name, sym in gold_tickers.items():
    try:
        t = yf.Ticker(sym)
        h = t.history(period='5d').dropna(subset=['Close'])
        if not h.empty:
            close = float(h['Close'].iloc[-1])
            prev = float(h['Close'].iloc[-2]) if len(h) > 1 else close
            chg = ((close - prev) / prev) * 100.0 if prev > 0 else 0.0
            print(f"{name} ({sym}): Close=${close:.2f}, Prev=${prev:.2f}, Change={chg:+.2f}%")
        else:
            print(f"{name} ({sym}): No history")
    except Exception as e:
        print(f"{name} ({sym}): Error {e}")
