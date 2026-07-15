import pandas as pd
import numpy as np

def verify_data(collected_data):
    """
    Validates and cleans stock data to prevent calculation errors, 
    stock split anomalies, and missing values.
    """
    cleaned_data = {}
    logs = []
    
    for ticker, data in collected_data.items():
        try:
            fund = data.get("fundamentals", {})
            hist = data.get("history", {})
            
            # Check 1: Empty check
            if not fund or not hist or 'close' not in hist or not hist['close']:
                logs.append({
                    "item": ticker,
                    "status": "rejected",
                    "details": "Missing fundamental or historical data"
                })
                continue
                
            # Check 2: Valid price checks
            current_price = fund.get("current_price")
            if current_price is None or current_price <= 0:
                logs.append({
                    "item": ticker,
                    "status": "rejected",
                    "details": f"Invalid current price: {current_price}"
                })
                continue
                
            # Check 3: Minimum history points for indicators
            close_prices = hist['close']
            if len(close_prices) < 20:
                logs.append({
                    "item": ticker,
                    "status": "rejected",
                    "details": f"Insufficient history length: {len(close_prices)} (min 20 required)"
                })
                continue
                
            # Check 4: Check for NaN values in history and interpolate if minor, reject if severe
            df = pd.DataFrame(hist)
            if df.isnull().sum().sum() > 0:
                # Interpolate if minimal NaNs
                null_pct = df.isnull().mean().max()
                if null_pct < 0.1:
                    df = df.interpolate(method='linear').ffill().bfill()
                    # Re-assign back to dict
                    data["history"] = df.to_dict(orient="list")
                    logs.append({
                        "item": ticker,
                        "status": "corrected",
                        "details": f"Minor missing data corrected via interpolation ({null_pct:.1%})"
                    })
                else:
                    logs.append({
                        "item": ticker,
                        "status": "rejected",
                        "details": f"Too many missing data values: {null_pct:.1%}"
                    })
                    continue

            # Check 5: Stock split anomaly checker
            # Check if there is an extreme price deviation between current_price and the most recent close
            last_close = close_prices[-1]
            price_ratio = current_price / last_close
            if price_ratio > 10.0 or price_ratio < 0.1:
                logs.append({
                    "item": ticker,
                    "status": "rejected",
                    "details": f"Extreme price deviation detected. Current: ${current_price:.2f}, Last Hist Close: ${last_close:.2f}"
                })
                continue
                
            # All checks passed!
            cleaned_data[ticker] = data
            logs.append({
                "item": ticker,
                "status": "verified_ok",
                "details": f"Data clean. Current price: ${current_price:.2f}, History: {len(close_prices)} days"
            })
            
        except Exception as e:
            logs.append({
                "item": ticker,
                "status": "rejected",
                "details": f"Unexpected QA error: {str(e)}"
            })
            
    print(f"QA Verification complete: {len(cleaned_data)} passed, {len(collected_data) - len(cleaned_data)} rejected.")
    return cleaned_data, logs


def verify_options_data(collected_data):
    """
    Specifically validates options data structures (Implied Volatilities, Greeks, DTE)
    to filter out incomplete or anomaly contracts.
    """
    cleaned_options_data = {}
    logs = []
    
    for ticker, data in collected_data.items():
        opts = data.get("options")
        if not opts:
            logs.append({
                "item": ticker,
                "status": "warning",
                "details": "No options data found"
            })
            continue
            
        hv_30 = opts.get("hv_30")
        if hv_30 is None or hv_30 <= 0:
            logs.append({
                "item": ticker,
                "status": "warning",
                "details": f"Invalid historical volatility: {hv_30}"
            })
            continue
            
        short = opts.get("short_term")
        medium = opts.get("medium_term")
        
        if not short and not medium:
            logs.append({
                "item": ticker,
                "status": "warning",
                "details": "Both short-term and medium-term option chains are empty"
            })
            continue
            
        # Verify contracts in short_term and medium_term
        def check_term(term_data, name):
            if not term_data:
                return False
            exp = term_data.get("expiration")
            dte = term_data.get("dte")
            if not exp or dte is None or dte <= 0:
                return False
                
            calls = term_data.get("calls", [])
            puts = term_data.get("puts", [])
            if not calls and not puts:
                return False
                
            # Filter clean contracts
            clean_calls = []
            for c in calls:
                strike = c.get("strike")
                iv = c.get("impliedVolatility", 0)
                premium = c.get("lastPrice") or (c.get("bid", 0) + c.get("ask", 0)) / 2.0
                if strike and strike > 0 and iv > 0 and premium > 0:
                    clean_calls.append(c)
                    
            clean_puts = []
            for p in puts:
                strike = p.get("strike")
                iv = p.get("impliedVolatility", 0)
                premium = p.get("lastPrice") or (p.get("bid", 0) + p.get("ask", 0)) / 2.0
                if strike and strike > 0 and iv > 0 and premium > 0:
                    clean_puts.append(p)
                    
            term_data["calls"] = clean_calls
            term_data["puts"] = clean_puts
            return len(clean_calls) > 0 or len(clean_puts) > 0

        short_ok = check_term(short, "short-term")
        med_ok = check_term(medium, "medium-term")
        
        if short_ok or med_ok:
            cleaned_options_data[ticker] = data
            logs.append({
                "item": ticker,
                "status": "verified_ok",
                "details": f"Options QA Passed. Short term active: {short_ok}, Medium term active: {med_ok}"
            })
        else:
            logs.append({
                "item": ticker,
                "status": "rejected",
                "details": "No valid option contracts (strikes, non-zero IV/premium) found after cleaning"
            })
            
    print(f"Options QA Verification complete: {len(cleaned_options_data)} passed, {len(collected_data) - len(cleaned_options_data)} warning/rejected.")
    return cleaned_options_data, logs


if __name__ == "__main__":
    # Test stub
    test_stub = {
        "AAPL": {
            "fundamentals": {"current_price": 180.0, "long_name": "Apple"},
            "history": {"close": [178.0]*30, "volume": [10000]*30}
        },
        "BAD": {
            "fundamentals": {"current_price": -5.0},
            "history": {"close": [10]*5}
        }
    }
    cleaned, logs = verify_data(test_stub)
    print("\nLogs:")
    for log in logs:
        print(log)
