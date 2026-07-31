import yfinance as yf
import pandas as pd
import json

tickers = ["SERV", "SYPR", "MGNI", "AMPL", "SOUN", "BBAI", "HOLO", "LUNR", "FFIE", "GWAV", "KOSS", "CHWY", "CRKN", "PEGY", "ASTS", "RKLB"]

data = []
for t in tickers:
    try:
        ticker = yf.Ticker(t)
        info = ticker.info
        hist = ticker.history(period="5d")
        if not hist.empty:
            price = hist['Close'].iloc[-1]
            prev_price = hist['Close'].iloc[-2] if len(hist) > 1 else price
            pct_change = ((price - prev_price) / prev_price) * 100
            vol = hist['Volume'].iloc[-1]
            avg_vol = info.get('averageVolume', 0)
            rvol = vol / avg_vol if avg_vol else 0
            
            data.append({
                'Ticker': t,
                'Name': info.get('shortName', t),
                'Price': round(price, 2),
                'Change': round(pct_change, 2),
                'Volume': vol,
                'AvgVol': avg_vol,
                'RVOL': round(rvol, 2),
                'MarketCap': info.get('marketCap', 0),
                'Float': info.get('floatShares', 0),
                'ShortFloat': info.get('shortPercentOfFloat', 0)
            })
    except Exception as e:
        pass

df = pd.DataFrame(data)
if not df.empty:
    df = df.sort_values(by='Change', ascending=False)
    print(df.to_json(orient='records', indent=2))
