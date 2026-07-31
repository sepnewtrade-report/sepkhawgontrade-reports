import yfinance as yf
ticker = yf.Ticker("HOLO")
info = ticker.info
hist = ticker.history(period="1d")
print(f"Name: {info.get('shortName')}")
print(f"Price: {hist['Close'].iloc[-1] if not hist.empty else 'N/A'}")
print(f"Market Cap: {info.get('marketCap')}")
print(f"Volume: {hist['Volume'].iloc[-1] if not hist.empty else 'N/A'}")
print(f"Float: {info.get('floatShares')}")
print(f"Short Float %: {info.get('shortPercentOfFloat')}")
