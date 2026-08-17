import yfinance as yf
import json

symbols = {
    "SPX": "^GSPC",
    "NDX": "^IXIC",
    "DJI": "^DJI",
    "RUT": "^RUT",
    "VIX": "^VIX",
    "TNX": "^TNX",
    "DXY": "DX-Y.NYB",
    "GOLD": "GC=F",
    "SILVER": "SI=F",
    "WTI": "CL=F",
    "BRENT": "BZ=F",
    "BTC": "BTC-USD",
    "GDX": "GDX",
    "GDXJ": "GDXJ",
    "NEM": "NEM",
    "AEM": "AEM",
    "GOLD_STOCK": "GOLD",
    "KGC": "KGC",
    "NVDA": "NVDA",
    "TSLA": "TSLA",
    "AAPL": "AAPL",
    "MSFT": "MSFT",
    "AMZN": "AMZN",
    "META": "META",
    "GOOGL": "GOOGL",
    "AMD": "AMD"
}

results = {}
for name, sym in symbols.items():
    try:
        t = yf.Ticker(sym)
        hist = t.history(period="5d")
        if not hist.empty:
            close_price = float(hist['Close'].iloc[-1])
            prev_close = float(hist['Close'].iloc[-2]) if len(hist) >= 2 else close_price
            change_pct = ((close_price - prev_close) / prev_close) * 100 if prev_close != 0 else 0
            high_price = float(hist['High'].iloc[-1])
            low_price = float(hist['Low'].iloc[-1])
            volume = int(hist['Volume'].iloc[-1])
            
            results[name] = {
                "symbol": sym,
                "close": round(close_price, 2),
                "prev_close": round(prev_close, 2),
                "change_pct": round(change_pct, 2),
                "high": round(high_price, 2),
                "low": round(low_price, 2),
                "volume": volume
            }
    except Exception as e:
        results[name] = {"error": str(e)}

with open("scratch/market_data_2026_08_15.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print("Fetched market data successfully.")
