import yfinance as yf
import json

symbols = [
    "SPY", "QQQ", "IWM", "DX-Y.NYB", "^TNX", "^VIX", "BTC-USD", "ETH-USD",
    "GC=F", "SI=F", "CL=F", "BZ=F", "GDX", "GDXJ", "NEM", "AEM", "GOLD", "KGC",
    "NVDA", "TSLA", "AAPL", "MSFT", "AMZN", "META", "GOOGL", "AMD", "PLTR", "SOFI",
    "SMCI", "RKLB", "LUNR", "ASTS", "CRWV", "CAVA", "ONDS", "HRB", "HYLN",
    "BBL.BK", "KBANK.BK", "SCB.BK", "PTT.BK", "AOT.BK", "CPALL.BK", "DELTA.BK"
]

results = {}
for sym in symbols:
    try:
        t = yf.Ticker(sym)
        hist = t.history(period="5d")
        if not hist.empty:
            close_p = float(hist['Close'].iloc[-1])
            prev_p = float(hist['Close'].iloc[-2]) if len(hist) >= 2 else close_p
            chg = ((close_p - prev_p) / prev_p) * 100 if prev_p != 0 else 0
            vol = int(hist['Volume'].iloc[-1])
            high_p = float(hist['High'].iloc[-1])
            low_p = float(hist['Low'].iloc[-1])
            
            results[sym] = {
                "price": round(close_p, 2),
                "prev_close": round(prev_p, 2),
                "change_pct": round(chg, 2),
                "high": round(high_p, 2),
                "low": round(low_p, 2),
                "volume": vol
            }
    except Exception as e:
        print(f"Error fetching {sym}: {e}")

with open("scratch/all_daily_prices_2026_08_15.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print("Saved all daily prices successfully.")
