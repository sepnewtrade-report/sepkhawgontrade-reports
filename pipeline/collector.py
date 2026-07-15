import yfinance as yf
from concurrent.futures import ThreadPoolExecutor
import pandas as pd
import numpy as np
from datetime import datetime

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
        current_price = info.get("currentPrice") or info.get("regularMarketPrice") or hist['Close'].iloc[-1]
        fundamentals = {
            "market_cap": info.get("marketCap"),
            "short_interest_ratio": info.get("shortPercentOfFloat") or info.get("shortRatio"),
            "shares_outstanding": info.get("sharesOutstanding"),
            "float_shares": info.get("floatShares"),
            "long_name": info.get("longName", ticker),
            "sector": info.get("sector", "Other"),
            "industry": info.get("industry", "Other"),
            "current_price": current_price,
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
        
        # Calculate 30-day Historical Volatility (HV)
        closes = hist['Close'].values
        if len(closes) >= 21:
            log_returns = np.log(closes[1:] / closes[:-1])
            hv_30 = float(np.std(log_returns) * np.sqrt(252))
        else:
            hv_30 = 0.35  # fallback
            
        options_data = {
            "hv_30": hv_30,
            "short_term": None,
            "medium_term": None
        }
        
        # Fetch Options Chain Data if available
        expirations = t.options
        if expirations:
            today = datetime.today()
            short_exp = None
            short_dte = None
            med_exp = None
            med_dte = None
            
            # Find options DTE matching categories
            for exp in expirations:
                try:
                    exp_date = datetime.strptime(exp, "%Y-%m-%d")
                    dte = (exp_date - today).days
                    
                    # Short-term (1-5 DTE)
                    if 1 <= dte <= 7:
                        if short_dte is None or dte < short_dte:
                            short_dte = dte
                            short_exp = exp
                            
                    # Medium-term (30-45 DTE)
                    if 28 <= dte <= 50:
                        if med_dte is None or abs(dte - 37) < abs(med_dte - 37):
                            med_dte = dte
                            med_exp = exp
                except Exception as e:
                    print(f"Error parsing expiration date '{exp}': {e}")
            
            # Helper to extract and filter option contracts
            def get_atm_options(exp_date):
                if not exp_date:
                    return None
                try:
                    chain = t.option_chain(exp_date)
                    calls = chain.calls
                    puts = chain.puts
                    
                    if calls.empty or puts.empty:
                        return None
                        
                    # Filter ATM (5 closest to current price)
                    calls['dist'] = (calls['strike'] - current_price).abs()
                    calls_atm = calls.sort_values('dist').head(5).drop(columns=['dist'])
                    
                    puts['dist'] = (puts['strike'] - current_price).abs()
                    puts_atm = puts.sort_values('dist').head(5).drop(columns=['dist'])
                    
                    # Convert to list of dictionaries
                    calls_list = calls_atm.to_dict(orient="records")
                    puts_list = puts_atm.to_dict(orient="records")
                    
                    return {
                        "expiration": exp_date,
                        "dte": (datetime.strptime(exp_date, "%Y-%m-%d") - today).days,
                        "calls": calls_list,
                        "puts": puts_list
                    }
                except Exception as e:
                    print(f"Error fetching option chain for {ticker} on {exp_date}: {e}")
                    return None
            
            if short_exp:
                options_data["short_term"] = get_atm_options(short_exp)
            if med_exp:
                options_data["medium_term"] = get_atm_options(med_exp)
                
        return ticker, {
            "fundamentals": fundamentals,
            "history": history_data,
            "options": options_data
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
