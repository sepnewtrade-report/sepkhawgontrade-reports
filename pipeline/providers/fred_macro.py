import os
import requests
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from .base import MacroProvider

class FREDMacroProvider(MacroProvider):
    """
    FRED Macro Provider for tracking Federal Reserve Funds Rate, 2Y/10Y Yields, CPI, PCE, Unemployment, GDP.
    Uses official FRED API if FRED_API_KEY is present, or public open economic data endpoints as fallback.
    """
    INDICATOR_MAP = {
        "FEDFUNDS": {"name": "Fed Funds Rate", "series_id": "FEDFUNDS"},
        "2Y_YIELD": {"name": "2Y Treasury Yield", "series_id": "DGS2"},
        "10Y_YIELD": {"name": "10Y Treasury Yield", "series_id": "DGS10"},
        "CPI": {"name": "Consumer Price Index (CPI)", "series_id": "CPIAUCSL"},
        "PCE": {"name": "Personal Consumption Expenditures (PCE)", "series_id": "PCE"},
        "UNEMPLOYMENT": {"name": "Unemployment Rate", "series_id": "UNRATE"},
        "GDP": {"name": "Real Gross Domestic Product (GDP)", "series_id": "GDPC1"},
    }

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("FRED_API_KEY")

    def fetch_macro_indicators(self, indicators: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        target_keys = indicators or list(self.INDICATOR_MAP.keys())
        results = []

        for key in target_keys:
            if key not in self.INDICATOR_MAP:
                continue

            info = self.INDICATOR_MAP[key]
            series_id = info["series_id"]
            name = info["name"]
            
            obs_value = None
            obs_date = None
            source_url = f"https://fred.stlouisfed.org/series/{series_id}"

            if self.api_key:
                url = f"https://api.stlouisfed.org/fred/series/observations?series_id={series_id}&api_key={self.api_key}&file_type=json&sort_order=desc&limit=1"
                try:
                    res = requests.get(url, timeout=10)
                    if res.status_code == 200:
                        data = res.json()
                        observations = data.get("observations", [])
                        if observations:
                            latest = observations[0]
                            obs_value = float(latest["value"]) if latest["value"] != "." else None
                            obs_date = latest["date"]
                except Exception as e:
                    print(f"[FRED Macro] Error calling FRED API for {series_id}: {e}")

            # Fallback if no API key or API call failed
            if obs_value is None:
                # Use public treasury/macro data fallback or yfinance macro symbols
                try:
                    import yfinance as yf
                    yf_symbol_map = {
                        "DGS2": "^IRX",
                        "DGS10": "^TNX",
                        "FEDFUNDS": "^IRX"
                    }
                    if series_id in yf_symbol_map:
                        t = yf.Ticker(yf_symbol_map[series_id])
                        h = t.history(period="5d")
                        if not h.empty:
                            obs_value = float(h['Close'].iloc[-1])
                            obs_date = h.index[-1].strftime("%Y-%m-%d")
                except Exception:
                    pass

            results.append({
                "indicator": key,
                "name": name,
                "value": obs_value,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "source": "FRED / Federal Reserve Economic Data",
                "source_url": source_url,
                "observation_date": obs_date or datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                "retrieved_at": datetime.now(timezone.utc).isoformat()
            })

        return results
