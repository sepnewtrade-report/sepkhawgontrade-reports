import yfinance as yf
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from .base import MarketDataProvider, FundamentalProvider, NewsProvider

class YFinanceAdapter(MarketDataProvider, FundamentalProvider, NewsProvider):
    def fetch_quotes(self, tickers: List[str]) -> Dict[str, Dict[str, Any]]:
        results = {}
        for ticker in tickers:
            try:
                t = yf.Ticker(ticker)
                info = t.info or {}
                price = info.get("currentPrice") or info.get("regularMarketPrice")
                prev = info.get("previousClose") or info.get("regularMarketPreviousClose")
                change = info.get("regularMarketChangePercent")
                if price is None:
                    h = t.history(period="5d")
                    if not h.empty:
                        price = float(h['Close'].iloc[-1])
                        prev = float(h['Close'].iloc[-2]) if len(h) > 1 else price
                        change = ((price - prev) / prev) * 100.0 if prev else 0.0

                results[ticker] = {
                    "price": price,
                    "previous_close": prev,
                    "change_percent": change,
                    "volume": info.get("regularMarketVolume"),
                    "market_cap": info.get("marketCap"),
                    "sector": info.get("sector"),
                    "industry": info.get("industry")
                }
            except Exception as e:
                print(f"[yFinance] Error fetching quote for {ticker}: {e}")
        return results

    def fetch_historical(self, tickers: List[str], period: str = "1mo") -> Dict[str, Any]:
        results = {}
        for ticker in tickers:
            try:
                t = yf.Ticker(ticker)
                h = t.history(period=period)
                results[ticker] = h.to_dict()
            except Exception as e:
                print(f"[yFinance] Error fetching history for {ticker}: {e}")
        return results

    def fetch_company_profile(self, ticker: str) -> Dict[str, Any]:
        try:
            t = yf.Ticker(ticker)
            return t.info or {}
        except Exception:
            return {}

    def fetch_news(self, tickers: Optional[List[str]] = None, time_window_hours: int = 24) -> List[Dict[str, Any]]:
        news_items = []
        target_tickers = tickers or ["AAPL", "NVDA", "MSFT", "AMZN", "GOOGL"]
        for ticker in target_tickers:
            try:
                t = yf.Ticker(ticker)
                yf_news = t.news or []
                for item in yf_news:
                    title = item.get("title") or item.get("headline", "")
                    link = item.get("link") or item.get("url", "")
                    publisher = item.get("publisher") or item.get("provider", {}).get("displayName", "Yahoo Finance")
                    pub_ts = item.get("providerPublishTime")
                    pub_dt = datetime.fromtimestamp(pub_ts, tz=timezone.utc) if pub_ts else datetime.now(timezone.utc)

                    news_items.append({
                        "id": f"yf_{item.get('uuid', hash(link))}",
                        "headline": title,
                        "summary": title,
                        "source_name": publisher,
                        "source_url": link,
                        "source_type": "SECONDARY_REFERENCE",
                        "source_tier": "TIER_3_AGGREGATOR",
                        "published_at": pub_dt.isoformat(),
                        "retrieved_at": datetime.now(timezone.utc).isoformat(),
                        "event_time": pub_dt.isoformat(),
                        "tickers": [ticker],
                        "company_names": [],
                        "event_type": "MARKET_NEWS",
                        "raw_payload": item
                    })
            except Exception as e:
                print(f"[yFinance] Error fetching news for {ticker}: {e}")

        return news_items
