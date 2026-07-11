class RiskEngine:
    def __init__(self, account_size=10000.0, risk_per_trade_pct=0.02):
        """
        Initializes Risk Engine.
        - account_size: Total AUM (e.g. $10,000)
        - risk_per_trade_pct: Maximum account risk per trade (e.g. 2%)
        """
        self.account_size = account_size
        self.risk_per_trade = account_size * risk_per_trade_pct

    def process_signals(self, signals, scanned_data):
        """
        Appends stop loss, take profit, and position sizing to each signal.
        """
        processed_signals = []
        print(f"Risk Engine processing {len(signals)} raw signals (AUM: ${self.account_size})...")
        
        for sig in signals:
            try:
                ticker = sig["ticker"]
                price = sig["price"]
                confidence = sig["confidence"]
                
                # Fetch ATR for this ticker
                stock_data = scanned_data.get(ticker, {})
                tech = stock_data.get("technicals", {})
                atr = tech.get("atr", price * 0.02)
                
                # 1. Stop Loss: 2 * ATR below current price (for BUY signal)
                stop_loss = price - (2.0 * atr)
                
                # Ensure Stop Loss is positive and reasonable (at most 25% away)
                if stop_loss <= 0 or stop_loss < (price * 0.75):
                    stop_loss = price * 0.90 # Default fallback: 10% stop loss
                
                # 2. Take Profit: 4 * ATR above current price (Risk-Reward Ratio 1:2)
                take_profit = price + (4.0 * atr)
                
                # Calculate risk amount per share
                risk_per_share = price - stop_loss
                
                # 3. Position Sizing:
                # Formula: Position Size = (Account Risk * Confidence) / Risk Per Share
                # This scales position sizes down if confidence is low.
                allocated_risk = self.risk_per_trade * confidence
                shares_to_buy = allocated_risk / risk_per_share if risk_per_share > 0 else 0
                
                # Cap allocation at 15% of total portfolio value to ensure diversification
                max_shares = (self.account_size * 0.15) / price
                shares_to_buy = min(shares_to_buy, max_shares)
                shares_to_buy = max(1.0, round(shares_to_buy, 1))
                
                total_capital_allocation = shares_to_buy * price
                
                # Update signal dict
                sig_updated = sig.copy()
                sig_updated["stop_loss"] = float(round(stop_loss, 2))
                sig_updated["take_profit"] = float(round(take_profit, 2))
                sig_updated["position_size"] = float(round(total_capital_allocation, 2))
                sig_updated["shares"] = float(shares_to_buy)
                
                processed_signals.append(sig_updated)
                print(f"  [RISK OK] {ticker}: Buy {shares_to_buy} shares @ ${price:.2f} (Total: ${total_capital_allocation:.2f}, SL: ${stop_loss:.2f}, TP: ${take_profit:.2f})")
                
            except Exception as e:
                print(f"Error evaluating risk for {sig.get('ticker')}: {e}")
                
        return processed_signals
