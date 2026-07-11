import pandas as pd
import numpy as np

def calculate_rsi(series, period=14):
    delta = series.diff()
    gain = (delta.where(delta > 0, 0)).copy()
    loss = (-delta.where(delta < 0, 0)).copy()
    
    # Wilder's exponential smoothing
    avg_gain = gain.ewm(alpha=1/period, min_periods=period).mean()
    avg_loss = loss.ewm(alpha=1/period, min_periods=period).mean()
    
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    return rsi

def calculate_macd(series, fast=12, slow=26, signal=9):
    ema_fast = series.ewm(span=fast, adjust=False).mean()
    ema_slow = series.ewm(span=slow, adjust=False).mean()
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal, adjust=False).mean()
    macd_hist = macd_line - signal_line
    return macd_line, signal_line, macd_hist

def calculate_atr(df, period=14):
    high = df['high']
    low = df['low']
    close_prev = df['close'].shift(1)
    
    tr1 = high - low
    tr2 = (high - close_prev).abs()
    tr3 = (low - close_prev).abs()
    
    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    atr = tr.ewm(alpha=1/period, min_periods=period).mean()
    return atr

def calculate_cmf(df, period=20):
    high = df['high']
    low = df['low']
    close = df['close']
    volume = df['volume']
    
    # Avoid division by zero
    hl_range = high - low
    hl_range = hl_range.replace(0, 1e-9)
    
    mf_multiplier = ((close - low) - (high - close)) / hl_range
    mf_volume = mf_multiplier * volume
    
    cmf = mf_volume.rolling(window=period).sum() / volume.rolling(window=period).sum()
    return cmf

def scan_stocks(cleaned_data):
    """
    Computes technical indicators for each verified stock.
    Modifies the stock data to include technical values for the last date.
    """
    scanned_data = {}
    
    for ticker, data in cleaned_data.items():
        try:
            hist = data["history"]
            df = pd.DataFrame(hist)
            
            # Calculate Indicators
            df['rsi_14'] = calculate_rsi(df['close'])
            macd_l, macd_s, macd_h = calculate_macd(df['close'])
            df['macd_line'] = macd_l
            df['macd_signal'] = macd_s
            df['macd_hist'] = macd_h
            df['atr_14'] = calculate_atr(df)
            df['sma_50'] = df['close'].rolling(window=50).mean()
            df['sma_200'] = df['close'].rolling(window=200).mean()
            df['ema_20'] = df['close'].ewm(span=20, adjust=False).mean()
            df['cmf_20'] = calculate_cmf(df, period=20)
            
            # Extract the last row (current day technical indicators)
            last_row = df.iloc[-1]
            
            # If technical indicator is NaN due to short history, fallback to standard values
            rsi = last_row['rsi_14'] if not pd.isna(last_row['rsi_14']) else 50.0
            macd_val = last_row['macd_hist'] if not pd.isna(last_row['macd_hist']) else 0.0
            atr = last_row['atr_14'] if not pd.isna(last_row['atr_14']) else (last_row['close'] * 0.02)
            sma_50 = last_row['sma_50'] if not pd.isna(last_row['sma_50']) else last_row['close']
            sma_200 = last_row['sma_200'] if not pd.isna(last_row['sma_200']) else last_row['close']
            ema_20 = last_row['ema_20'] if not pd.isna(last_row['ema_20']) else last_row['close']
            cmf_val = last_row['cmf_20'] if not pd.isna(last_row['cmf_20']) else 0.0
            
            # Update data
            data["technicals"] = {
                "rsi": float(rsi),
                "macd_line": float(last_row['macd_line'] if not pd.isna(last_row['macd_line']) else 0.0),
                "macd_signal": float(last_row['macd_signal'] if not pd.isna(last_row['macd_signal']) else 0.0),
                "macd_hist": float(macd_val),
                "atr": float(atr),
                "sma_50": float(sma_50),
                "sma_200": float(sma_200),
                "ema_20": float(ema_20),
                "cmf": float(cmf_val)
            }
            
            scanned_data[ticker] = data
            
        except Exception as e:
            print(f"Error scanning technicals for {ticker}: {e}")
            
    print(f"Stock technical scanning completed for {len(scanned_data)} stocks.")
    return scanned_data

if __name__ == "__main__":
    # Test stub with mock random price walk
    np.random.seed(42)
    closes = np.cumsum(np.random.normal(0.5, 2, 100)) + 150
    highs = closes + np.random.uniform(0.5, 3, 100)
    lows = closes - np.random.uniform(0.5, 3, 100)
    opens = closes - np.random.normal(0, 1, 100)
    volumes = np.random.randint(10000, 100000, 100).tolist()
    
    test_stub = {
        "TSLA": {
            "fundamentals": {"current_price": closes[-1], "long_name": "Tesla"},
            "history": {
                "open": opens.tolist(),
                "high": highs.tolist(),
                "low": lows.tolist(),
                "close": closes.tolist(),
                "volume": volumes
            }
        }
    }
    
    scanned = scan_stocks(test_stub)
    print("\nTSLA Technicals:")
    print(scanned["TSLA"]["technicals"])
