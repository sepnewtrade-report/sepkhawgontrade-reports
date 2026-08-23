import yfinance as yf

cosmic_tickers = {
    'XBI': 'XBI',
    'IBB': 'IBB',
    'RXRX': 'RXRX',
    'SDGR': 'SDGR',
    'ABSI': 'ABSI',
    'RLAY': 'RLAY',
    'CRSP': 'CRSP',
    'NTLA': 'NTLA',
    'BEAM': 'BEAM',
    'SPY': 'SPY',
    'QQQ': 'QQQ',
    'NVDA': 'NVDA',
    'AAPL': 'AAPL',
    'MSFT': 'MSFT',
    'BTC-USD': 'BTC-USD',
    'GC=F': 'GC=F',
    'DX-Y.NYB': 'DX-Y.NYB',
    '^TNX': '^TNX'
}

print("=== Fetching Live Cosmic Trade Signal Tickers ===")
for name, sym in cosmic_tickers.items():
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
