from datetime import datetime, timezone
from typing import Dict, Any, Tuple
from .models import NewsEvent

class ScoringEngine:
    @staticmethod
    def calculate_freshness(published_at_iso: str) -> Tuple[float, str]:
        """
        Calculates Freshness Score (0-100) and classification (BREAKING, CURRENT, RECENT, BACKGROUND).
        0-6h: BREAKING (90-100)
        6-24h: CURRENT (70-89)
        24-72h: RECENT (40-69)
        >72h: BACKGROUND (<40)
        """
        try:
            pub_dt = datetime.fromisoformat(published_at_iso.replace("Z", "+00:00"))
        except Exception:
            pub_dt = datetime.now(timezone.utc)

        now_dt = datetime.now(timezone.utc)
        age_hours = max(0.0, (now_dt - pub_dt).total_seconds() / 3600.0)

        if age_hours <= 6:
            score = 100.0 - (age_hours / 6.0) * 10.0
            category = "BREAKING"
        elif age_hours <= 24:
            score = 90.0 - ((age_hours - 6) / 18.0) * 20.0
            category = "CURRENT"
        elif age_hours <= 72:
            score = 70.0 - ((age_hours - 24) / 48.0) * 30.0
            category = "RECENT"
        else:
            score = max(10.0, 40.0 - (age_hours - 72) * 0.2)
            category = "BACKGROUND"

        return round(score, 1), category

    @staticmethod
    def calculate_reliability(source_tier: str) -> float:
        """
        Tier 1 Primary: 100.0
        Tier 2 Professional: 85.0
        Tier 3 Aggregator: 65.0
        Tier 4 Social/Unverified: 30.0
        """
        weights = {
            "TIER_1_PRIMARY": 100.0,
            "TIER_2_PROFESSIONAL": 85.0,
            "TIER_3_AGGREGATOR": 65.0,
            "TIER_4_UNVERIFIED": 30.0
        }
        return weights.get(source_tier, 50.0)

    @staticmethod
    def classify_market_impact(event_type: str, headline: str, summary: str) -> Tuple[float, str]:
        """
        Classifies Market Impact (VERY HIGH, HIGH, MEDIUM, LOW, BACKGROUND) and returns impact score 0-100.
        Rule-based first per Section 13.
        """
        text = f"{event_type} {headline} {summary}".upper()

        very_high_keywords = ["EARNINGS SURPRISE", "BANKRUPTCY", "ACQUISITION", "MERGER", "FDA APPROVAL", "FDA REJECTION", "CHAPTER 11", "SEC INVESTIGATION", "GUIDANCE CUT", "GUIDANCE RAISE"]
        high_keywords = ["NEW CONTRACT", "PATENT", "PARTNERSHIP", "MANAGEMENT CHANGE", "CEO RESIGNATION", "INSIDER BUYING", "BUYBACK"]
        
        if any(kw in text for kw in very_high_keywords) or event_type in ["EARNINGS_SURPRISE", "M_AND_A", "FDA_DECISION"]:
            return 95.0, "VERY HIGH"
        elif any(kw in text for kw in high_keywords) or event_type in ["SEC_8_K", "CONTRACT", "GUIDANCE"]:
            return 80.0, "HIGH"
        elif "FDA" in text or "SEC" in text:
            return 65.0, "MEDIUM"
        else:
            return 50.0, "LOW"

    @classmethod
    def score_event(cls, event: NewsEvent) -> NewsEvent:
        """
        Computes 5-Factor Score breakdown & overall news score (0-100):
        Reliability (25%) + Freshness (25%) + Market Impact (20%) + Relevance (15%) + Confirmation (15%)
        """
        # 1. Reliability (25%)
        rel_score = cls.calculate_reliability(event.source_tier)

        # 2. Freshness (25%)
        fresh_score, fresh_cat = cls.calculate_freshness(event.published_at)

        # 3. Market Impact (20%)
        impact_score, impact_level = cls.classify_market_impact(event.event_type, event.headline, event.summary)

        # 4. Relevance (15%)
        relevance_score = 90.0 if event.tickers and event.ticker_status == "RESOLVED" else (60.0 if event.ticker_status == "AMBIGUOUS" else 40.0)

        # 5. Confirmation (15%)
        conf_map = {
            "VERIFIED_PRIMARY": 100.0,
            "VERIFIED_MULTI_SOURCE": 95.0,
            "SECONDARY_CONFIRMED": 80.0,
            "UNCONFIRMED": 40.0,
            "CONFLICTING": 20.0,
            "OUTDATED": 10.0,
            "RETRACTED": 0.0
        }
        conf_score = conf_map.get(event.verification_status, 40.0)

        # Compute weighted overall score
        overall = (rel_score * 0.25) + (fresh_score * 0.25) + (impact_score * 0.20) + (relevance_score * 0.15) + (conf_score * 0.15)
        overall = round(overall, 1)

        # Assign Score Category
        if overall >= 90:
            category = "CRITICAL"
        elif overall >= 80:
            category = "HIGH"
        elif overall >= 70:
            category = "IMPORTANT"
        elif overall >= 60:
            category = "WATCH"
        else:
            category = "LOW PRIORITY"

        # Update event fields
        event.reliability_score = rel_score
        event.freshness_score = fresh_score
        event.market_impact = impact_level
        event.relevance_score = relevance_score
        event.confirmation_score = conf_score
        event.overall_score = overall
        event.score_category = category

        return event
