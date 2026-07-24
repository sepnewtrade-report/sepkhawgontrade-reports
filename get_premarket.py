import yfinance as yf

symbols = ['SPY', 'QQQ', 'AAPL', 'MSFT', 'GOOG', 'TSLA', 'NVDA', 'AMD', 'META', 'AMZN', 'LMT', 'WLDS', 'MSTR', 'COIN']
tickers = yf.Tickers(" ".join(symbols))

print("Ticker | Name | PreMarket% | Vol | Market%")
for sym in symbols:
    info = tickers.tickers[sym].info
    name = info.get('shortName', 'N/A')
    # Try to get preMarket values if available, else fallback
    pre_change = info.get('preMarketChangePercent', 0)
    reg_change = info.get('regularMarketChangePercent', 0)
    vol = info.get('regularMarketVolume', 0)
    pre_vol = info.get('preMarketVolume', vol)
    
    # If pre_change is missing or 0, maybe the market is closed or it's not fetching pre-market correctly
    print(f"{sym} | {name} | Pre: {pre_change}% | Reg: {reg_change}% | Vol: {pre_vol}")
