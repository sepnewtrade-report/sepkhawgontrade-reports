# -*- coding: utf-8 -*-
import yfinance as yf
import pandas as pd

symbols = {
    'S&P 500': '^GSPC',
    'Nasdaq': '^IXIC',
    'Dow Jones': '^DJI',
    'Russell 2000': '^RUT',
    'VIX': '^VIX',
    'US 10Y Yield': '^TNX',
    'DXY': 'DX-Y.NYB',
    'Gold Futures': 'GC=F',
    'WTI Crude': 'CL=F',
    'Bitcoin': 'BTC-USD',
    'SPY': 'SPY',
    'QQQ': 'QQQ',
    'IWM': 'IWM',
    'RSP': 'RSP'
}

sectors = {
    'Technology (XLK)': 'XLK',
    'Financials (XLF)': 'XLF',
    'Health Care (XLV)': 'XLV',
    'Consumer Discretionary (XLY)': 'XLY',
    'Communication Services (XLC)': 'XLC',
    'Industrials (XLI)': 'XLI',
    'Consumer Staples (XLP)': 'XLP',
    'Energy (XLE)': 'XLE',
    'Utilities (XLU)': 'XLU',
    'Real Estate (XLRE)': 'XLRE',
    'Materials (XLB)': 'XLB'
}

stocks = {
    'NVDA': 'NVDA',
    'AAPL': 'AAPL',
    'MSFT': 'MSFT',
    'AMZN': 'AMZN',
    'TSLA': 'TSLA',
    'META': 'META',
    'GOOGL': 'GOOGL'
}

print('=== MARKET SYMBOLS ===')
for name, sym in symbols.items():
    try:
        t = yf.Ticker(sym)
        h = t.history(period='5d').dropna(subset=['Close'])
        if len(h) >= 2:
            c = float(h['Close'].iloc[-1])
            p = float(h['Close'].iloc[-2])
            chg = ((c - p) / p) * 100.0
            date_str = str(h.index[-1].date())
            print(f"{name:20s} ({sym:10s}): Close={c:10.2f}, Prev={p:10.2f}, Chg={chg:+6.2f}%, Date={date_str}")
        else:
            print(f"{name:20s}: No history data")
    except Exception as e:
        print(f"Error {name}: {e}")

print('\n=== 11 SECTOR ETFS ===')
sec_list = []
for name, sym in sectors.items():
    try:
        t = yf.Ticker(sym)
        h = t.history(period='5d').dropna(subset=['Close'])
        if len(h) >= 2:
            c = float(h['Close'].iloc[-1])
            p = float(h['Close'].iloc[-2])
            chg = ((c - p) / p) * 100.0
            sec_list.append({'name': name, 'sym': sym, 'close': c, 'chg': chg})
    except Exception as e:
        print(f"Error {name}: {e}")

sec_df = pd.DataFrame(sec_list).sort_values(by='chg', ascending=False)
for idx, row in sec_df.reset_index(drop=True).iterrows():
    print(f"Rank {idx+1:2d}: {row['name']:30s} | Close=${row['close']:7.2f} | Chg={row['chg']:+6.2f}%")

print('\n=== TOP STOCKS ===')
for name, sym in stocks.items():
    try:
        t = yf.Ticker(sym)
        h = t.history(period='5d').dropna(subset=['Close'])
        if len(h) >= 2:
            c = float(h['Close'].iloc[-1])
            p = float(h['Close'].iloc[-2])
            chg = ((c - p) / p) * 100.0
            print(f"{name:10s}: Close=${c:8.2f}, Chg={chg:+6.2f}%")
    except Exception as e:
        print(f"Error {name}: {e}")
