import os
import requests
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from .base import NewsProvider

class AlphaVantageAdapter(NewsProvider):
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("ALPHA_VANTAGE_API_KEY")
        self.base_url = "https://www.alphavantage.co/query"

    def fetch_news(self, tickers: Optional[List[str]] = None, time_window_hours: int = 24) -> List[Dict[str, Any]]:
        news_items = []
        if not self.api_key:
            return news_items

        ticker_str = ",".join(tickers) if tickers else "AAPL,NVDA,MSFT,AMZN"
        url = f"{self.base_url}?function=NEWS_SENTIMENT&tickers={ticker_str}&apikey={self.api_key}&limit=50"

        try:
            res = requests.get(url, timeout=10)
            if res.status_code == 200:
                data = res.json()
                feed = data.get("feed", [])
                for item in feed:
                    pub_str = item.get("time_published", "")
                    pub_dt = datetime.now(timezone.utc)
                    if len(pub_str) >= 15:
                        try:
                            pub_dt = datetime.strptime(pub_str[:15], "%Y%m%dT%H%M%S").replace(tzinfo=timezone.utc)
                        except Exception:
                            pass

                    item_tickers = [t.get("ticker") for t in item.get("ticker_sentiment", []) if "ticker" in t]

                    news_items.append({
                        "id": f"av_{hash(item.get('url', ''))}",
                        "headline": item.get("title", ""),
                        "summary": item.get("summary", ""),
                        "source_name": item.get("source", "Alpha Vantage Provider"),
                        "source_url": item.get("url", ""),
                        "source_type": "NEWS_SENTIMENT",
                        "source_tier": "TIER_3_AGGREGATOR",
                        "published_at": pub_dt.isoformat(),
                        "retrieved_at": datetime.now(timezone.utc).isoformat(),
                        "event_time": pub_dt.isoformat(),
                        "tickers": item_tickers,
                        "company_names": [],
                        "event_type": "MARKET_NEWS",
                        "raw_payload": item
                    })
        except Exception as e:
            print(f"[AlphaVantage] Error fetching news: {e}")

        return news_items
