import yfinance as yf
import json
from datetime import datetime, timedelta

# Check tickers reporting around Aug 10 - Aug 11, 2026
tickers_to_check = [
    'PLTR', 'TTWO', 'ANET', 'DIS', 'LLY', 'ELF', 'DDOG', 'SHOP', 'OXY', 'RBLX', 
    'ABNB', 'UPST', 'HIMS', 'CELH', 'SYK', 'ICLR', 'BMRN', 'A', 'KEY', 'CSCO',
    'AMAT', 'DE', 'HD', 'WMT', 'TGT', 'ROST', 'PANW', 'SNPS', 'ZM'
]

actual_24h_reports = []

for t in tickers_to_check:
    try:
        tk = yf.Ticker(t)
        news = tk.news
        hist = tk.history(period='5d')
        if not hist.empty:
            price = float(hist['Close'].iloc[-1])
            prev = float(hist['Close'].iloc[-2]) if len(hist) > 1 else price
            chg = ((price - prev) / prev) * 100.0
            vol = int(hist['Volume'].iloc[-1])
            
            # Print news headlines to verify recent 24h earnings events
            recent_headlines = []
            if news:
                for item in news[:3]:
                    title = item.get('title', '')
                    pub_time = item.get('providerPublishTime', 0)
                    recent_headlines.append({
                        'title': title,
                        'published': datetime.fromtimestamp(pub_time).strftime('%Y-%m-%d %H:%M:%S') if pub_time else ''
                    })
            
            print(f"[{t}] Price=${price:.2f} ({chg:+.2f}%)")
            for h in recent_headlines[:2]:
                print(f"   - {h['published']}: {h['title']}")
    except Exception as e:
        print(f"Error {t}: {e}")
