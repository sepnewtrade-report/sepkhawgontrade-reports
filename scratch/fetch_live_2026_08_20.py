# -*- coding: utf-8 -*-
import os
import sys
import json
import yfinance as yf

symbols = {
    "S&P 500": "^GSPC",
    "Nasdaq": "^IXIC",
    "Dow Jones": "^DJI",
    "Russell 2000": "^RUT",
    "SPY": "SPY",
    "QQQ": "QQQ",
    "IWM": "IWM",
    "RSP": "RSP",
    "VIX": "^VIX",
    "US 10Y Yield": "^TNX",
    "DXY": "DX-Y.NYB",
    "Gold": "GC=F",
    "WTI Crude": "CL=F",
    "NVDA": "NVDA",
    "AAPL": "AAPL",
    "MSFT": "MSFT",
    "AMZN": "AMZN",
    "TSLA": "TSLA",
    "META": "META",
    "GOOGL": "GOOGL"
}

sector_etfs = {
    "Technology (XLK)": "XLK",
    "Financials (XLF)": "XLF",
    "Health Care (XLV)": "XLV",
    "Consumer Discretionary (XLY)": "XLY",
    "Communication Services (XLC)": "XLC",
    "Industrials (XLI)": "XLI",
    "Consumer Staples (XLP)": "XLP",
    "Energy (XLE)": "XLE",
    "Utilities (XLU)": "XLU",
    "Real Estate (XLRE)": "XLRE",
    "Materials (XLB)": "XLB"
}

quotes = {}
print("=== FETCHING LIVE QUOTES FOR 2026-08-20 ===")
for name, sym in symbols.items():
    try:
        t = yf.Ticker(sym)
        h = t.history(period="5d").dropna(subset=['Close'])
        if not h.empty:
            c = float(h['Close'].iloc[-1])
            p = float(h['Close'].iloc[-2]) if len(h) > 1 else c
            chg = ((c - p) / p) * 100.0 if p > 0 else 0.0
            date_str = str(h.index[-1].date())
            quotes[name] = {"close": c, "change_pct": chg, "date": date_str}
            print(f"{name:20s} ({sym:10s}): Close={c:10.2f}, Chg={chg:+6.2f}%, Date={date_str}")
    except Exception as e:
        print(f"Error fetching {name} ({sym}): {e}")

sector_quotes = {}
print("\n=== FETCHING SECTOR ETF QUOTES ===")
for name, sym in sector_etfs.items():
    try:
        t = yf.Ticker(sym)
        h = t.history(period="5d").dropna(subset=['Close'])
        if not h.empty:
            c = float(h['Close'].iloc[-1])
            p = float(h['Close'].iloc[-2]) if len(h) > 1 else c
            chg = ((c - p) / p) * 100.0 if p > 0 else 0.0
            sector_quotes[name] = {"close": c, "change_pct": chg}
            print(f"{name:30s}: Close={c:8.2f}, Chg={chg:+6.2f}%")
    except Exception as e:
        print(f"Error fetching sector {name}: {e}")
