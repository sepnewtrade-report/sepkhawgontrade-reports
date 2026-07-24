import yfinance as yf

symbols = ['INTC', 'ORCL', 'AMKR', 'MXL', 'LMT', 'ACI', 'DECK', 'WLDS', 'TSLA', 'NVDA']
tickers = yf.Tickers(" ".join(symbols))

for sym in symbols:
    info = tickers.tickers[sym].info
    name = info.get('shortName', 'N/A')
    change = info.get('regularMarketChangePercent', 0)
    vol = info.get('regularMarketVolume', 0)
    mcap = info.get('marketCap', 0)
    print(f"{sym} | {name} | {change} | {vol} | {mcap}")
