from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

class NewsProvider(ABC):
    @abstractmethod
    def fetch_news(self, tickers: Optional[List[str]] = None, time_window_hours: int = 24) -> List[Dict[str, Any]]:
        """Fetch raw news items from provider."""
        pass

class FilingProvider(ABC):
    @abstractmethod
    def fetch_filings(self, tickers: Optional[List[str]] = None, form_types: Optional[List[str]] = None, time_window_hours: int = 24) -> List[Dict[str, Any]]:
        """Fetch SEC / regulatory corporate filings."""
        pass

class MarketDataProvider(ABC):
    @abstractmethod
    def fetch_quotes(self, tickers: List[str]) -> Dict[str, Dict[str, Any]]:
        """Fetch current quotes for tickers."""
        pass

    @abstractmethod
    def fetch_historical(self, tickers: List[str], period: str = "1mo") -> Dict[str, Any]:
        """Fetch historical market data."""
        pass

class FundamentalProvider(ABC):
    @abstractmethod
    def fetch_company_profile(self, ticker: str) -> Dict[str, Any]:
        """Fetch company fundamentals & profile."""
        pass

class MacroProvider(ABC):
    @abstractmethod
    def fetch_macro_indicators(self, indicators: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """Fetch economic macro observations."""
        pass
