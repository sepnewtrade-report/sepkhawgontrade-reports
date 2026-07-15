import numpy as np
import math

class BaseStrategy:
    def __init__(self, name):
        self.name = name

    def evaluate(self, ticker, data):
        """
        Evaluates a stock ticker and its technical/fundamental data.
        Returns a dictionary representing the signal details if a signal is triggered, else None.
        """
        raise NotImplementedError("Strategies must implement the evaluate method.")


# ==================== Options Greeks & Pricing Helpers ====================
def normal_pdf(x):
    return math.exp(-0.5 * x**2) / math.sqrt(2 * math.pi)

def normal_cdf(x):
    return 0.5 * (1.0 + math.erf(x / math.sqrt(2.0)))

def calculate_bs_greeks(S, K, T_days, sigma, r=0.045, option_type="call"):
    if T_days <= 0:
        T_days = 0.5  # avoid division by zero
    T = T_days / 365.0
    if sigma <= 0:
        sigma = 0.01  # avoid division by zero
        
    d1 = (math.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * math.sqrt(T))
    d2 = d1 - sigma * math.sqrt(T)
    
    if option_type == "call":
        delta = normal_cdf(d1)
        theta = (- (S * normal_pdf(d1) * sigma) / (2 * math.sqrt(T)) - r * K * math.exp(-r * T) * normal_cdf(d2)) / 365.0
        prob_itm = normal_cdf(d2)
    else:
        delta = normal_cdf(d1) - 1.0
        theta = (- (S * normal_pdf(d1) * sigma) / (2 * math.sqrt(T)) + r * K * math.exp(-r * T) * normal_cdf(-d2)) / 365.0
        prob_itm = normal_cdf(-d2)
        
    gamma = normal_pdf(d1) / (S * sigma * math.sqrt(T))
    
    return {
        "delta": float(delta),
        "gamma": float(gamma),
        "theta": float(theta),
        "prob_itm": float(prob_itm)
    }


class ShortSqueezeStrategy(BaseStrategy):
    def __init__(self):
        super().__init__("Short Squeeze")

    def evaluate(self, ticker, data):
        fund = data.get("fundamentals", {})
        tech = data.get("technicals", {})
        hist = data.get("history", {})
        
        short_pct = fund.get("short_interest_ratio") or 0
        current_price = fund.get("current_price")
        
        # High short interest threshold: short_pct > 0.08 (8%) or raw short ratio > 5
        is_high_short = short_pct > 0.08 or (isinstance(short_pct, (int, float)) and short_pct > 8)
        
        # Check volume trend (last volume > 1.2x of 10-day average volume)
        volumes = hist.get("volume", [])
        avg_volume = sum(volumes[-10:]) / 10 if len(volumes) >= 10 else 1.0
        last_volume = volumes[-1] if volumes else 0
        volume_spike = last_volume > (1.2 * avg_volume)
        
        # Bullish momentum (RSI rising out of oversold, e.g., RSI > 40 and MACD hist > 0)
        rsi = tech.get("rsi", 50)
        macd_hist = tech.get("macd_hist", 0)
        momentum = rsi > 40 or macd_hist > 0
        
        if is_high_short and (volume_spike or momentum):
            # Calculate confidence score (0 to 1)
            confidence = min(1.0, (short_pct * 5.0) + (1.2 if volume_spike else 0.5) / 2.0)
            short_pct_str = f"{short_pct:.1%}" if short_pct < 1.0 else f"{short_pct}%"
            return {
                "ticker": ticker,
                "strategy_name": self.name,
                "signal_type": "BUY",
                "price": current_price,
                "confidence": float(round(confidence, 2)),
                "reason": f"High short interest ({short_pct_str}) with volume spike & bullish momentum."
            }
        return None


class WhaleFlowStrategy(BaseStrategy):
    def __init__(self):
        super().__init__("Whale Flow")
        # Known institutional/whale favorite high-conviction tickers
        self.whale_favorites = {"NVDA", "AMD", "LLY", "TSM", "PLTR", "MSFT", "AMZN", "META", "TSLA", "AVGO"}

    def evaluate(self, ticker, data):
        if ticker not in self.whale_favorites:
            return None
            
        fund = data.get("fundamentals", {})
        tech = data.get("technicals", {})
        
        current_price = fund.get("current_price")
        rsi = tech.get("rsi", 50)
        macd_hist = tech.get("macd_hist", 0)
        ema_20 = tech.get("ema_20", current_price)
        
        # Bullish signal: Price above EMA-20 and MACD histogram is positive
        bullish_structure = current_price >= ema_20 and macd_hist > 0
        
        if bullish_structure:
            # Score confidence based on RSI (healthy range: 45 to 65)
            confidence = 0.85 if (45 <= rsi <= 65) else 0.70
            return {
                "ticker": ticker,
                "strategy_name": self.name,
                "signal_type": "BUY",
                "price": current_price,
                "confidence": float(confidence),
                "reason": f"Whale favorite showing strong structure: price (${current_price:.2f}) above 20-day EMA with positive MACD momentum."
            }
        return None


class OversoldOpportunityStrategy(BaseStrategy):
    def __init__(self):
        super().__init__("Oversold Opportunity")

    def evaluate(self, ticker, data):
        fund = data.get("fundamentals", {})
        tech = data.get("technicals", {})
        
        current_price = fund.get("current_price")
        rsi = tech.get("rsi", 50)
        sma_200 = tech.get("sma_200", current_price)
        
        # Oversold (RSI < 35) and secular uptrend (price above or near 200 SMA)
        is_oversold = rsi < 35
        is_secular_uptrend = current_price >= (sma_200 * 0.95) # price is at least 95% of SMA 200
        
        if is_oversold and is_secular_uptrend:
            confidence = min(0.95, 0.5 + (35 - rsi) / 20.0) # lower RSI = higher confidence
            return {
                "ticker": ticker,
                "strategy_name": self.name,
                "signal_type": "BUY",
                "price": current_price,
                "confidence": float(round(confidence, 2)),
                "reason": f"Oversold RSI ({rsi:.1f}) in a primary uptrend (above/near 200-day SMA)."
            }
        return None


class BreakoutStrategy(BaseStrategy):
    def __init__(self):
        super().__init__("Breakout")

    def evaluate(self, ticker, data):
        fund = data.get("fundamentals", {})
        tech = data.get("technicals", {})
        hist = data.get("history", {})
        
        current_price = fund.get("current_price")
        sma_50 = tech.get("sma_50", current_price)
        
        # Check if closing price is breaking out to a new 20-day high
        close_prices = hist.get("close", [])
        if len(close_prices) < 20:
            return None
            
        prev_20_days = close_prices[-21:-1]
        highest_prev = max(prev_20_days) if prev_20_days else current_price
        
        is_breakout = current_price > highest_prev
        above_sma50 = current_price > sma_50
        
        # Volume confirmation
        volumes = hist.get("volume", [])
        avg_volume = sum(volumes[-20:-1]) / 20 if len(volumes) >= 20 else 1.0
        last_volume = volumes[-1] if volumes else 0
        volume_confirmed = last_volume > (1.3 * avg_volume)
        
        if is_breakout and above_sma50 and volume_confirmed:
            confidence = 0.80 if tech.get("rsi", 50) < 70 else 0.65 # penalize if overbought
            return {
                "ticker": ticker,
                "strategy_name": self.name,
                "signal_type": "BUY",
                "price": current_price,
                "confidence": float(confidence),
                "reason": f"Price broke out above 20-day high (${highest_prev:.2f}) on elevated volume (+{(last_volume/avg_volume - 1)*100:.0f}% vs 20-day avg)."
            }
        return None


class OptionsScreenStrategy(BaseStrategy):
    def __init__(self):
        super().__init__("Options Screen")

    def evaluate(self, ticker, data):
        opts_data = data.get("options", {})
        fund = data.get("fundamentals", {})
        
        if not opts_data or (not opts_data.get("short_term") and not opts_data.get("medium_term")):
            return None
            
        hv_30 = opts_data.get("hv_30", 0.35)
        current_price = fund.get("current_price")
        
        results = {
            "ticker": ticker,
            "hv_30": hv_30,
            "short_term_candidates": [],
            "medium_term_candidates": []
        }
        
        def filter_candidates(term_key):
            term_data = opts_data.get(term_key)
            if not term_data:
                return []
                
            candidates = []
            exp_date = term_data.get("expiration")
            dte = term_data.get("dte", 0)
            
            # Evaluate Calls and Puts
            for o_type in ["calls", "puts"]:
                contracts = term_data.get(o_type, [])
                for contract in contracts:
                    strike = contract.get("strike")
                    premium = contract.get("lastPrice") or (contract.get("bid", 0) + contract.get("ask", 0)) / 2.0
                    iv = contract.get("impliedVolatility", 0.0)
                    
                    if premium <= 0 or iv <= 0:
                        continue
                        
                    # Calculate Greeks
                    greeks = calculate_bs_greeks(
                        S=current_price, 
                        K=strike, 
                        T_days=dte, 
                        sigma=iv, 
                        option_type="call" if o_type == "calls" else "put"
                    )
                    
                    # Target delta 0.40 to 0.60
                    abs_delta = abs(greeks["delta"])
                    if 0.40 <= abs_delta <= 0.60:
                        candidates.append({
                            "ticker": ticker,
                            "type": "CALL" if o_type == "calls" else "PUT",
                            "strike": strike,
                            "expiration": exp_date,
                            "dte": dte,
                            "premium": premium,
                            "iv": iv,
                            "delta": greeks["delta"],
                            "gamma": greeks["gamma"],
                            "theta": greeks["theta"],
                            "prob_itm": greeks["prob_itm"]
                        })
            return candidates

        results["short_term_candidates"] = filter_candidates("short_term")
        results["medium_term_candidates"] = filter_candidates("medium_term")
        
        # Trigger signal if we find any valid candidates in either term
        if results["short_term_candidates"] or results["medium_term_candidates"]:
            return results
        return None


class StrategyEngine:
    def __init__(self):
        self.strategies = [
            ShortSqueezeStrategy(),
            WhaleFlowStrategy(),
            OversoldOpportunityStrategy(),
            BreakoutStrategy()
        ]

    def run(self, scanned_data):
        signals = []
        print(f"Running Strategy Engine against {len(scanned_data)} scanned tickers...")
        for ticker, data in scanned_data.items():
            for strategy in self.strategies:
                signal = strategy.evaluate(ticker, data)
                if signal:
                    signals.append(signal)
                    print(f"  [SIGNAL] {ticker} triggered {strategy.name} strategy!")
        print(f"Strategy Engine complete. Generated {len(signals)} signals.")
        return signals

