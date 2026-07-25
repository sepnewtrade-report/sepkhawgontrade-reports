import yfinance as yf

tickers = ['CLS', 'VPG', 'UFPT', 'WLDN']

def main():
    print("Fetching what's next report tickers...")
    for t in tickers:
        try:
            ticker = yf.Ticker(t)
            hist = ticker.history(period='3mo')
            if hist.empty:
                print(f"No data for {t}")
                continue
                
            close_prices = hist['Close']
            last_close = close_prices.iloc[-1]
            prev_close = close_prices.iloc[-2]
            pct_change_daily = ((last_close - prev_close) / prev_close) * 100
            
            # 1 week change (5 trading days)
            hist_1mo = ticker.history(period='1mo')
            close_1mo = hist_1mo['Close']
            last_c = close_1mo.iloc[-1]
            prev_w_c = close_1mo.iloc[-6]
            pct_change_weekly = ((last_c - prev_w_c) / prev_w_c) * 100
            
            # RSI
            delta = close_prices.diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
            rs = gain / loss
            rsi = 100 - (100 / (1 + rs))
            last_rsi = rsi.iloc[-1]
            
            # MACD
            exp1 = close_prices.ewm(span=12, adjust=False).mean()
            exp2 = close_prices.ewm(span=26, adjust=False).mean()
            macd = exp1 - exp2
            signal = macd.ewm(span=9, adjust=False).mean()
            last_macd = macd.iloc[-1]
            last_signal = signal.iloc[-1]
            macd_status = "Bullish" if last_macd > last_signal else "Bearish"
            
            # Volume
            vol = hist['Volume'].iloc[-1]
            
            print(f"\nTicker: {t}")
            print(f"  Close Price: ${last_close:.2f}")
            print(f"  Weekly Change: {pct_change_weekly:+.2f}%")
            print(f"  Daily Change: {pct_change_daily:+.2f}%")
            print(f"  RSI (14)   : {last_rsi:.2f}")
            print(f"  MACD       : {macd_status} (MACD={last_macd:.4f}, Signal={last_signal:.4f})")
            print(f"  Volume     : {vol:,}")
        except Exception as e:
            print(f"Error fetching {t}: {e}")

if __name__ == "__main__":
    main()
