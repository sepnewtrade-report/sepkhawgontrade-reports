import requests
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional
from .base import NewsProvider

class CompanyIRProvider(NewsProvider):
    """
    Ingests official company investor relations releases, RSS feeds, and official announcements.
    """
    def __init__(self, rss_feeds: Optional[List[str]] = None):
        self.rss_feeds = rss_feeds or [
            "https://feed.businesswire.com/rss/home/?rss=G1QFDFhZX0lWDU5YWA==",
            "https://www.prnewswire.com/rss/news-releases-list.rss"
        ]

    def fetch_news(self, tickers: Optional[List[str]] = None, time_window_hours: int = 24) -> List[Dict[str, Any]]:
        news_items = []
        cutoff = datetime.now(timezone.utc) - timedelta(hours=time_window_hours)

        for feed_url in self.rss_feeds:
            try:
                res = requests.get(feed_url, timeout=10, headers={"User-Agent": "SepKhawGonTrade/1.0"})
                if res.status_code != 200:
                    continue

                root = ET.fromstring(res.content)
                # Parse RSS channel items
                for item in root.findall('.//item'):
                    title_elem = item.find('title')
                    link_elem = item.find('link')
                    pub_date_elem = item.find('pubDate')
                    desc_elem = item.find('description')

                    title = title_elem.text if title_elem is not None else ""
                    link = link_elem.text if link_elem is not None else ""
                    desc = desc_elem.text if desc_elem is not None else ""
                    pub_date_str = pub_date_elem.text if pub_date_elem is not None else ""

                    pub_dt = datetime.now(timezone.utc)
                    if pub_date_str:
                        try:
                            from email.utils import parsedate_to_datetime
                            pub_dt = parsedate_to_datetime(pub_date_str)
                        except Exception:
                            pass

                    if pub_dt < cutoff:
                        continue

                    # Filter by tickers if supplied
                    matched_tickers = []
                    if tickers:
                        for t in tickers:
                            if f"({t})" in title or f" {t} " in title or f"${t}" in title:
                                matched_tickers.append(t)
                        if not matched_tickers:
                            continue

                    news_items.append({
                        "id": f"ir_{hash(link)}",
                        "headline": title,
                        "summary": desc[:500] if desc else title,
                        "source_name": "Company Investor Relations / Official PR",
                        "source_url": link,
                        "source_type": "COMPANY_IR",
                        "source_tier": "TIER_1_PRIMARY",
                        "published_at": pub_dt.isoformat(),
                        "retrieved_at": datetime.now(timezone.utc).isoformat(),
                        "event_time": pub_dt.isoformat(),
                        "tickers": matched_tickers,
                        "company_names": [],
                        "event_type": "CORPORATE_ANNOUNCEMENT",
                        "raw_payload": {"title": title, "link": link}
                    })
            except Exception as e:
                print(f"[Company IR] Error fetching feed {feed_url}: {e}")

        return news_items
