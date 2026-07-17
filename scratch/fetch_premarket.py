import yfinance as yf
import json
import sys

tickers = ["NFLX", "TRV", "RF", "FITB", "WDC", "STX", "MU", "CJMB", "BIYA", "GCTK", "SDOT", "PMAX", "VIVS", "JSPR", "VMAR", "KAPA", "RGNX"]

result = {}
for ticker in tickers:
    try:
        t = yf.Ticker(ticker)
        info = t.info
        
        # Extract pre-market data
        pre_price = info.get("preMarketPrice")
        pre_change = info.get("preMarketChangePercent")
        pre_vol = info.get("preMarketVolume")
        
        # Regular market data as fallback or comparison
        reg_price = info.get("currentPrice") or info.get("regularMarketPrice")
        reg_change = info.get("regularMarketChangePercent")
        reg_vol = info.get("regularMarketVolume") or info.get("volume")
        
        prev_close = info.get("previousClose") or info.get("regularMarketPreviousClose")
        market_cap = info.get("marketCap")
        long_name = info.get("longName") or info.get("shortName") or ticker
        industry = info.get("industry")
        sector = info.get("sector")
        
        result[ticker] = {
            "longName": long_name,
            "sector": sector,
            "industry": industry,
            "marketCap": market_cap,
            "previousClose": prev_close,
            "preMarketPrice": pre_price,
            "preMarketChangePercent": pre_change,
            "preMarketVolume": pre_vol,
            "regularMarketPrice": reg_price,
            "regularMarketChangePercent": reg_change,
            "regularMarketVolume": reg_vol
        }
    except Exception as e:
        result[ticker] = {"error": str(e)}

print(json.dumps(result, indent=2))
