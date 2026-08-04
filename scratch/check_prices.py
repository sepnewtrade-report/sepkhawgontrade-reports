import yfinance as yf

tickers = ['MSTR', 'SOFI', 'MARA', 'IONQ', 'DOCN', 'AMD', 'SMCI', 'CVNA', 'SERV', 'RGTI', 'ASTS', 'LUNR', 'NVDA', 'TSLA', 'AAPL']
for ticker in tickers:
    try:
        t = yf.Ticker(ticker)
        info = t.info
        p = info.get("currentPrice") or info.get("regularMarketPrice")
        c = info.get("regularMarketChangePercent", 0.0)
        if p is None:
            hist = t.history(period="1d")
            if not hist.empty:
                p = hist["Close"].iloc[-1]
                op = hist["Open"].iloc[-1]
                if op:
                    c = ((p - op) / op) * 100.0
        print(f"{ticker}: Price=${p:.2f}, Change={c:.2f}%")
    except Exception as e:
        print(f"Error {ticker}: {e}")
