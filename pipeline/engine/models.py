from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

@dataclass
class NewsEvent:
    id: str
    headline: str
    summary: str
    source_name: str
    source_url: str
    source_type: str                  # OFFICIAL_FILING, COMPANY_IR, FINANCIAL_NEWS, etc.
    source_tier: str                  # TIER_1_PRIMARY, TIER_2_PROFESSIONAL, TIER_3_AGGREGATOR, TIER_4_UNVERIFIED
    published_at: str                 # ISO timestamp
    retrieved_at: str                 # ISO timestamp
    event_time: str                   # ISO timestamp of actual event
    tickers: List[str] = field(default_factory=list)
    company_names: List[str] = field(default_factory=list)
    sector: str = "Unknown"
    event_type: str = "GENERAL_NEWS"  # EARNINGS, M_AND_A, CONTRACT, FDA, LITIGATION, GUIDANCE, etc.
    region: str = "US"
    sentiment: str = "NEUTRAL"        # BULLISH, BEARISH, NEUTRAL
    market_impact: str = "MEDIUM"     # VERY HIGH, HIGH, MEDIUM, LOW, BACKGROUND
    freshness_score: float = 0.0      # 0-100
    reliability_score: float = 0.0    # 0-100
    relevance_score: float = 0.0      # 0-100
    confirmation_score: float = 0.0   # 0-100
    overall_score: float = 0.0        # 0-100
    score_category: str = "WATCH"     # CRITICAL, HIGH, IMPORTANT, WATCH, LOW PRIORITY
    verification_status: str = "UNCONFIRMED" # VERIFIED_PRIMARY, VERIFIED_MULTI_SOURCE, SECONDARY_CONFIRMED, UNCONFIRMED, CONFLICTING, OUTDATED, RETRACTED
    ticker_status: str = "RESOLVED"   # RESOLVED, AMBIGUOUS, UNRESOLVED
    duplicate_group_id: Optional[str] = None
    related_events: List[str] = field(default_factory=list)
    primary_source_url: Optional[str] = None
    secondary_sources: List[str] = field(default_factory=list)
    evidence: List[Dict[str, Any]] = field(default_factory=list)
    claims: List[Dict[str, Any]] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return self.__dict__

@dataclass
class EventCluster:
    cluster_id: str
    canonical_event: NewsEvent
    original_source: str
    supporting_sources: List[str] = field(default_factory=list)
    duplicate_articles: List[Dict[str, Any]] = field(default_factory=list)
    first_publication_time: str = ""
    latest_update_time: str = ""

@dataclass
class EvidenceCard:
    ticker: str
    headline: str
    event_type: str
    source_name: str
    source_tier: str
    published_et: str
    published_bangkok: str
    retrieved_bangkok: str
    verification_status: str
    secondary_confirmations_count: int
    market_impact: str
    news_score: float
    score_category: str
    original_source_url: str
    related_source_urls: List[str]
    evidence_claims: List[Dict[str, Any]]
    score_breakdown: Dict[str, float]
