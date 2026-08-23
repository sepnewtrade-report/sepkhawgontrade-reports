import os
import requests
import json
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional
from .base import FilingProvider

class SECEdgarProvider(FilingProvider):
    def __init__(self, user_agent: Optional[str] = None):
        self.user_agent = user_agent or os.getenv("SEC_EDGAR_USER_AGENT", "SepKhawGonTrade intelligence@sepkhawgontrade.com")
        self.headers = {"User-Agent": self.user_agent, "Accept-Encoding": "gzip, deflate"}
        self.rss_url = "https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&type=&company=&dateb=&owner=include&count=100&output=atom"
        self.company_facts_url = "https://data.sec.gov/api/xbrl/companyfacts/CIK{cik.zfill(10)}.json"

    def fetch_filings(self, tickers: Optional[List[str]] = None, form_types: Optional[List[str]] = None, time_window_hours: int = 24) -> List[Dict[str, Any]]:
        filings = []
        try:
            res = requests.get(self.rss_url, headers=self.headers, timeout=15)
            if res.status_code == 200:
                root = ET.fromstring(res.content)
                ns = {'atom': 'http://www.w3.org/2005/Atom'}
                
                cutoff = datetime.now(timezone.utc) - timedelta(hours=time_window_hours)
                
                for entry in root.findall('atom:entry', ns):
                    title_elem = entry.find('atom:title', ns)
                    updated_elem = entry.find('atom:updated', ns)
                    link_elem = entry.find('atom:link', ns)
                    summary_elem = entry.find('atom:summary', ns)
                    
                    title = title_elem.text if title_elem is not None else ""
                    updated_str = updated_elem.text if updated_elem is not None else ""
                    link = link_elem.attrib.get('href', '') if link_elem is not None else ""
                    summary = summary_elem.text if summary_elem is not None else ""
                    
                    # Parse timestamp
                    pub_dt = None
                    if updated_str:
                        try:
                            pub_dt = datetime.fromisoformat(updated_str.replace("Z", "+00:00"))
                        except Exception:
                            pub_dt = datetime.now(timezone.utc)
                    else:
                        pub_dt = datetime.now(timezone.utc)

                    if pub_dt < cutoff:
                        continue
                        
                    # Extract Form Type and Ticker / Company
                    # Typical title format: "8-K - ROCKET LAB USA, INC. (0001819994) (Filer)"
                    parts = title.split(" - ")
                    form_type = parts[0].strip() if len(parts) > 0 else "FILING"
                    company_info = parts[1].strip() if len(parts) > 1 else title
                    
                    # Target form filter if provided
                    if form_types and not any(ft.upper() in form_type.upper() for ft in form_types):
                        continue

                    # Rough ticker extraction or company matching
                    extracted_tickers = []
                    if tickers:
                        for t in tickers:
                            if f"({t})" in title or f" {t} " in title or t in company_info:
                                extracted_tickers.append(t)
                        if not extracted_tickers:
                            # If tickers filter was provided but none matched this filing
                            continue

                    filings.append({
                        "id": f"sec_{hash(link)}",
                        "headline": f"SEC {form_type}: {company_info}",
                        "summary": summary or f"Official SEC filing {form_type} submitted to EDGAR.",
                        "source_name": "SEC EDGAR",
                        "source_url": link,
                        "source_type": "OFFICIAL_FILING",
                        "source_tier": "TIER_1_PRIMARY",
                        "published_at": pub_dt.isoformat(),
                        "retrieved_at": datetime.now(timezone.utc).isoformat(),
                        "event_time": pub_dt.isoformat(),
                        "tickers": extracted_tickers,
                        "company_names": [company_info],
                        "event_type": f"SEC_{form_type.replace('-', '_').upper()}",
                        "raw_payload": {
                            "title": title,
                            "form_type": form_type,
                            "summary": summary
                        }
                    })
        except Exception as e:
            print(f"[SEC EDGAR] Fetch error: {e}")
            
        return filings
