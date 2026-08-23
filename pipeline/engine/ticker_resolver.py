import re
from typing import List, Dict, Any, Tuple

# Common US Tickers and Company Names mapping for resolution
KNOWN_COMPANIES = {
    "APPLE": "AAPL",
    "MICROSOFT": "MSFT",
    "NVIDIA": "NVDA",
    "ALPHABET": "GOOGL",
    "GOOGLE": "GOOGL",
    "AMAZON": "AMZN",
    "TESLA": "TSLA",
    "META": "META",
    "FACEBOOK": "META",
    "BROADCOM": "AVGO",
    "ADVANCED MICRO DEVICES": "AMD",
    "AMD": "AMD",
    "PALANTIR": "PLTR",
    "TAIWAN SEMICONDUCTOR": "TSM",
    "TSMC": "TSM",
    "ROCKET LAB": "RKLB",
    "SUPER MICRO": "SMCI",
    "MARVELL": "MRVL",
    "ELI LILLY": "LLY",
    "NETFLIX": "NFLX",
    "QUALCOMM": "QCOM"
}

EXCLUDED_WORDS = {
    "RSI", "EMA", "MACD", "FED", "CPI", "USD", "GDP", "FOMC", "SEC",
    "ETF", "USA", "PE", "EPS", "CEO", "IPO", "AI", "NYSE", "AMEX",
    "BATS", "VWAP", "SMA", "THB", "EUR", "GBP", "JPY", "CNY",
    "NASDAQ", "SPY", "QQQ", "DIA", "IWM", "FOR", "AND", "THE", "NEW"
}

class TickerResolver:
    @staticmethod
    def resolve(headline: str, summary: str, provided_tickers: List[str]) -> Tuple[List[str], List[str], str, str]:
        """
        Resolves tickers, company names, sector, and ticker resolution status (RESOLVED, AMBIGUOUS, UNRESOLVED).
        """
        text = f"{headline} {summary}".upper()
        found_tickers = set(provided_tickers or [])
        found_companies = set()

        # 1. Direct Regex Ticker Matching (e.g. $NVDA, (AAPL), NASDAQ:MSFT)
        regex_matches = re.findall(r'[\$\(]([A-Z]{1,5})[\)\s\.,]', text)
        for m in regex_matches:
            if m not in EXCLUDED_WORDS:
                found_tickers.add(m)

        # 2. Company Name Matching
        for comp_name, ticker in KNOWN_COMPANIES.items():
            if comp_name in text:
                found_tickers.add(ticker)
                found_companies.add(comp_name.title())

        valid_tickers = [t for t in found_tickers if t not in EXCLUDED_WORDS]

        # Determine ambiguity
        ticker_status = "RESOLVED"
        if not valid_tickers:
            ticker_status = "UNRESOLVED"
        elif len(valid_tickers) > 3:
            ticker_status = "AMBIGUOUS"

        # Basic sector mapping heuristic
        sector = "Technology"
        if any(t in ["LLY", "PFE", "MRK", "JNJ", "UNH"] for t in valid_tickers):
            sector = "Healthcare"
        elif any(t in ["XOM", "CVX", "COP", "SLB"] for t in valid_tickers):
            sector = "Energy"
        elif any(t in ["JPM", "BAC", "WFC", "C", "GS", "MS"] for t in valid_tickers):
            sector = "Financials"

        return valid_tickers, list(found_companies), sector, ticker_status
