import yfinance as yf
from concurrent.futures import ThreadPoolExecutor
import pandas as pd
import numpy as np

DEFAULT_TICKERS = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "AMD", "PLTR", "TSM", 
    "META", "AVGO", "SMCI", "MRVL", "LLY", "TSLA", "NFLX", "QCOM"
]

def fetch_single_ticker(ticker):
    try:
        t = yf.Ticker(ticker)
        # Fetch 3 months of daily data to calculate technical indicators (RSI, MACD) accurately
        hist = t.history(period="3mo")
        if hist.empty:
            return ticker, None
        
        info = t.info
        # Get important fundamentals for scanning
        fundamentals = {
            "market_cap": info.get("marketCap"),
            "short_interest_ratio": info.get("shortPercentOfFloat") or info.get("shortRatio"),
            "shares_outstanding": info.get("sharesOutstanding"),
            "float_shares": info.get("floatShares"),
            "long_name": info.get("longName", ticker),
            "sector": info.get("sector", "Other"),
            "industry": info.get("industry", "Other"),
            "current_price": info.get("currentPrice") or info.get("regularMarketPrice") or hist['Close'].iloc[-1],
            "prev_close": info.get("previousClose") or info.get("regularMarketPreviousClose") or hist['Close'].iloc[-2]
        }
        
        # Prepare historical data DataFrame dict
        history_data = {
            "date": hist.index.strftime("%Y-%m-%d").tolist(),
            "open": hist["Open"].tolist(),
            "high": hist["High"].tolist(),
            "low": hist["Low"].tolist(),
            "close": hist["Close"].tolist(),
            "volume": hist["Volume"].tolist()
        }
        
        return ticker, {
            "fundamentals": fundamentals,
            "history": history_data
        }
    except Exception as e:
        print(f"Error collecting data for {ticker}: {e}")
        return ticker, None

def collect_data(tickers=None, max_workers=8):
    if not tickers:
        tickers = DEFAULT_TICKERS
    
    results = {}
    print(f"Collecting market data for {len(tickers)} tickers using {max_workers} workers...")
    
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(fetch_single_ticker, t): t for t in tickers}
        for future in futures:
            ticker = futures[future]
            try:
                t_name, data = future.result()
                if data:
                    results[t_name] = data
            except Exception as e:
                print(f"Failed to fetch {ticker}: {e}")
                
    print(f"Successfully collected data for {len(results)}/{len(tickers)} tickers.")
    return results

if __name__ == "__main__":
    test_data = collect_data(["AAPL", "NVDA"], max_workers=2)
    for ticker, info in test_data.items():
        print(f"\n{ticker} - {info['fundamentals']['long_name']}")
        print(f"Current Price: {info['fundamentals']['current_price']}")
        print(f"Data Points: {len(info['history']['close'])}")
