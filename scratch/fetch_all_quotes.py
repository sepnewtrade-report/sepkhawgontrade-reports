import yfinance as yf

tickers = ['SMCI', 'AVGO', 'LLY', 'MRVL', 'WBD', 'HONA', 'SNDK', 'QCOM', 'WLDS', 'OPEN', 'KULR', 'BBAI']
print("Fetching real-time quotes for Aug 7 reports...")
for t_name in tickers:
    try:
        t = yf.Ticker(t_name)
        info = t.info
        p = info.get("currentPrice") or info.get("regularMarketPrice")
        prev = info.get("previousClose") or info.get("regularMarketPreviousClose")
        if p is None or prev is None:
            hist = t.history(period="5d")
            if not hist.empty:
                p = hist["Close"].iloc[-1]
                prev = hist["Close"].iloc[-2] if len(hist)>1 else hist["Open"].iloc[-1]
        chg = ((p - prev)/prev*100) if (p and prev) else 0.0
        print(f"{t_name}: Price=${p:.2f}, Change={chg:+.2f}%")
    except Exception as e:
        print(f"Error {t_name}: {e}")
