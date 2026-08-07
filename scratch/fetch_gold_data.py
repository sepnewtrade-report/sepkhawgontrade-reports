import yfinance as yf

gold_tickers = ['GC=F', 'SI=F', 'GLD', 'IAU', 'GDX', 'GDXJ', 'NEM', 'AEM', 'GOLD', 'KGC', 'AU', 'DX-Y.NYB', '^TNX']
print("Fetching live gold market data...")
for sym in gold_tickers:
    try:
        t = yf.Ticker(sym)
        info = t.info
        price = info.get("currentPrice") or info.get("regularMarketPrice")
        prev_close = info.get("previousClose") or info.get("regularMarketPreviousClose")
        if price is None or prev_close is None:
            hist = t.history(period="5d")
            if not hist.empty:
                price = hist["Close"].iloc[-1]
                prev_close = hist["Close"].iloc[-2] if len(hist) > 1 else hist["Open"].iloc[-1]
        change_pct = ((price - prev_close) / prev_close * 100) if (price and prev_close) else 0.0
        print(f"{sym}: Price=${price:.2f}, Change={change_pct:+.2f}%")
    except Exception as e:
        print(f"Error {sym}: {e}")
