import yfinance as yf
import pandas as pd
import numpy as np

tickers = {
    "^SPX": "S&P 500",
    "^IXIC": "Nasdaq Composite",
    "^DJI": "Dow Jones Industrial Average",
    "^VIX": "CBOE Volatility Index",
    "GME": "GameStop Corp.",
    "AMC": "AMC Entertainment Holdings",
    "CLOV": "Clover Health Investments",
    "SOUN": "SoundHound AI Inc."
}

def calculate_rsi(series, period=14):
    delta = series.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss
    return 100 - (100 / (1 + rs))

def calculate_macd(series):
    exp1 = series.ewm(span=12, adjust=False).mean()
    exp2 = series.ewm(span=26, adjust=False).mean()
    macd = exp1 - exp2
    signal = macd.ewm(span=9, adjust=False).mean()
    return macd, signal

def main():
    print("Fetching actual closing prices and indicators for Friday, July 24, 2026...")
    for ticker_id, name in tickers.items():
        try:
            ticker = yf.Ticker(ticker_id)
            # Fetch 3 months of daily data to calculate indicators
            hist = ticker.history(period="3mo")
            if hist.empty:
                print(f"No data found for {ticker_id}")
                continue
                
            close_prices = hist["Close"]
            last_close = close_prices.iloc[-1]
            prev_close = close_prices.iloc[-2]
            pct_change = ((last_close - prev_close) / prev_close) * 100
            
            # Calculate RSI
            rsi_series = calculate_rsi(close_prices)
            last_rsi = rsi_series.iloc[-1] if not rsi_series.empty else None
            
            # Calculate MACD
            macd_series, signal_series = calculate_macd(close_prices)
            last_macd = macd_series.iloc[-1] if not macd_series.empty else None
            last_signal = signal_series.iloc[-1] if not signal_series.empty else None
            macd_status = "Bullish" if last_macd > last_signal else "Bearish"
            
            # Volume
            last_volume = hist["Volume"].iloc[-1]
            
            print(f"\nTicker: {ticker_id} ({name})")
            print(f"  Close Price: ${last_close:.2f}")
            print(f"  Change %   : {pct_change:+.2f}%")
            print(f"  RSI (14)   : {last_rsi:.2f}" if last_rsi is not None else "  RSI (14)   : N/A")
            print(f"  MACD       : {macd_status} (MACD={last_macd:.4f}, Signal={last_signal:.4f})")
            print(f"  Volume     : {last_volume:,}")
        except Exception as e:
            print(f"Error fetching {ticker_id}: {e}")

if __name__ == "__main__":
    main()
