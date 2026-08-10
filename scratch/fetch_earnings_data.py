import yfinance as yf
import json

tickers = [
    'MSFT', 'AAPL', 'NVDA', 'META', 'AMZN', 'GOOGL', 'TSLA', 'PLTR', 'AMD', 'SMCI', 'AVGO', 'ARM', 'COIN', 'NFLX'
]

earnings_data = {}

for t in tickers:
    try:
        tk = yf.Ticker(t)
        info = tk.info
        hist = tk.history(period='2mo')
        
        price = float(hist['Close'].iloc[-1]) if not hist.empty else info.get('currentPrice', 0.0)
        prev = float(hist['Close'].iloc[-2]) if len(hist) > 1 else price
        chg = ((price - prev) / prev) * 100.0
        vol = int(hist['Volume'].iloc[-1]) if not hist.empty else 0
        
        delta = hist['Close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        rsi = float(100 - (100 / (1 + rs)).iloc[-1]) if not hist.empty else 50.0
        
        # Get earnings dates and info
        calendar = tk.calendar
        rev_growth = info.get('revenueGrowth', 0.0)
        earnings_growth = info.get('earningsGrowth', 0.0)
        pe = info.get('trailingPE', 0.0)
        fwd_pe = info.get('forwardPE', 0.0)
        market_cap = info.get('marketCap', 0)
        
        earnings_data[t] = {
            'price': round(price, 2),
            'change_pct': round(chg, 2),
            'volume': vol,
            'rsi': round(rsi, 2),
            'market_cap_B': round(market_cap / 1e9, 2) if market_cap else 0.0,
            'trailing_pe': round(pe, 2) if pe else 0.0,
            'forward_pe': round(fwd_pe, 2) if fwd_pe else 0.0,
            'revenue_growth_pct': round(rev_growth * 100, 2) if rev_growth else 0.0,
            'earnings_growth_pct': round(earnings_growth * 100, 2) if earnings_growth else 0.0,
        }
        print(f"Fetched {t}: Price=${price:.2f} ({chg:+.2f}%), RevGrowth={rev_growth*100:.1f}%, Cap=${market_cap/1e9:.1f}B")
    except Exception as e:
        print(f"Error fetching {t}: {e}")

with open("scratch/detailed_earnings_data.json", "w", encoding="utf-8") as f:
    json.dump(earnings_data, f, indent=2, ensure_ascii=False)

print("\nSaved detailed earnings data to scratch/detailed_earnings_data.json")
