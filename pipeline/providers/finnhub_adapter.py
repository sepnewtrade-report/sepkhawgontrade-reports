import os
import requests
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional
from .base import NewsProvider, FundamentalProvider

class FinnhubAdapter(NewsProvider, FundamentalProvider):
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("FINNHUB_API_KEY")
        self.base_url = "https://finnhub.io/api/v1"

    def fetch_news(self, tickers: Optional[List[str]] = None, time_window_hours: int = 24) -> List[Dict[str, Any]]:
        news_items = []
        if not self.api_key:
            return news_items

        to_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        from_date = (datetime.now(timezone.utc) - timedelta(hours=time_window_hours)).strftime("%Y-%m-%d")

        target_tickers = tickers or ["AAPL", "NVDA", "MSFT", "AMZN", "GOOGL", "TSLA"]

        for ticker in target_tickers:
            url = f"{self.base_url}/company-news?symbol={ticker}&from={from_date}&to={to_date}&token={self.api_key}"
            try:
                res = requests.get(url, timeout=10)
                if res.status_code == 200:
                    articles = res.json()
                    if isinstance(articles, list):
                        for art in articles:
                            pub_ts = art.get("datetime")
                            pub_dt = datetime.fromtimestamp(pub_ts, tz=timezone.utc) if pub_ts else datetime.now(timezone.utc)
                            
                            news_items.append({
                                "id": f"fh_{art.get('id', hash(art.get('url', '')))}",
                                "headline": art.get("headline", ""),
                                "summary": art.get("summary", ""),
                                "source_name": art.get("source", "Finnhub Provider"),
                                "source_url": art.get("url", ""),
                                "source_type": "FINANCIAL_NEWS",
                                "source_tier": "TIER_3_AGGREGATOR",
                                "published_at": pub_dt.isoformat(),
                                "retrieved_at": datetime.now(timezone.utc).isoformat(),
                                "event_time": pub_dt.isoformat(),
                                "tickers": [ticker],
                                "company_names": [],
                                "event_type": art.get("category", "COMPANY_NEWS").upper(),
                                "raw_payload": art
                            })
            except Exception as e:
                print(f"[Finnhub] Error fetching news for {ticker}: {e}")

        return news_items

    def fetch_company_profile(self, ticker: str) -> Dict[str, Any]:
        if not self.api_key:
            return {}
        url = f"{self.base_url}/stock/profile2?symbol={ticker}&token={self.api_key}"
        try:
            res = requests.get(url, timeout=10)
            if res.status_code == 200:
                return res.json()
        except Exception as e:
            print(f"[Finnhub] Error fetching profile for {ticker}: {e}")
        return {}
