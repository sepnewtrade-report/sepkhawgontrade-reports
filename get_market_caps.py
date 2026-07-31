import yfinance as yf

tickers = ['MSFT', 'AAPL', 'KPTI', 'NUWE', 'RDDT']
for t in tickers:
    stock = yf.Ticker(t)
    info = stock.info
    market_cap = info.get('marketCap', 0)
    print(f"{t}: Market Cap = {market_cap} / {market_cap/1e9:.2f} Billion")
