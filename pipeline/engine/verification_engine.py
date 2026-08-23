import re
from typing import List, Dict, Any, Tuple
from .models import NewsEvent

class VerificationEngine:
    @staticmethod
    def extract_claims(headline: str, summary: str) -> List[Dict[str, Any]]:
        """
        Extract key numerical and contract/financial claims from text.
        """
        text = f"{headline}. {summary}"
        claims = []

        # Money amounts ($500M, $1.5B, 500 million)
        money_matches = re.findall(r'(\$\d+(?:\.\d+)?\s*(?:[M|B|K|million|billion|trillion]+)?)', text, re.IGNORECASE)
        for m in money_matches:
            claims.append({"claim_type": "MONEY_AMOUNT", "value": m, "context": text[:200]})

        # Percentage changes (e.g. up 15%, earnings +25%)
        pct_matches = re.findall(r'([+-]?\d+(?:\.\d+)?\%)', text)
        for p in pct_matches:
            claims.append({"claim_type": "PERCENTAGE_CHANGE", "value": p, "context": text[:200]})

        # Contract / M&A key phrases
        if re.search(r'\b(contract|deal|award|partnership|acquisition|merger|fda approval|guidance)\b', text, re.IGNORECASE):
            claims.append({"claim_type": "MATERIAL_EVENT", "value": "Material Corporate Event", "context": headline})

        return claims

    @classmethod
    def verify_event(cls, event: NewsEvent, all_events: List[NewsEvent]) -> Tuple[str, List[str], List[Dict[str, Any]]]:
        """
        Verifies event against source tier hierarchy and other collected events.
        Statuses: VERIFIED_PRIMARY, VERIFIED_MULTI_SOURCE, SECONDARY_CONFIRMED, UNCONFIRMED, CONFLICTING, OUTDATED, RETRACTED
        """
        claims = cls.extract_claims(event.headline, event.summary)
        secondary_sources = []
        conflicting_found = False

        # 1. Primary Source Check
        if event.source_tier == "TIER_1_PRIMARY":
            verification_status = "VERIFIED_PRIMARY"
            primary_url = event.source_url
        else:
            primary_url = None
            verification_status = "UNCONFIRMED"

        # 2. Search for supporting or conflicting secondary sources in all_events
        for other in all_events:
            if other.id == event.id:
                continue

            # Check ticker overlap
            common_tickers = set(event.tickers).intersection(set(other.tickers))
            if not common_tickers and event.tickers:
                continue

            # Check headline/summary similarity or money claim discrepancy
            event_money = [c["value"] for c in claims if c["claim_type"] == "MONEY_AMOUNT"]
            other_claims = cls.extract_claims(other.headline, other.summary)
            other_money = [c["value"] for c in other_claims if c["claim_type"] == "MONEY_AMOUNT"]

            # Conflict Detection: Disagreeing money figures
            if event_money and other_money and event_money[0] != other_money[0]:
                # Disagreement detected
                conflicting_found = True
                verification_status = "CONFLICTING"
                break

            # Secondary confirmation match
            if other.source_url not in secondary_sources and other.source_url != event.source_url:
                secondary_sources.append(other.source_url)
                if other.source_tier == "TIER_1_PRIMARY":
                    primary_url = other.source_url
                    if verification_status != "CONFLICTING":
                        verification_status = "VERIFIED_PRIMARY"

        if not conflicting_found and verification_status != "VERIFIED_PRIMARY":
            if len(secondary_sources) >= 2:
                verification_status = "VERIFIED_MULTI_SOURCE"
            elif len(secondary_sources) == 1:
                verification_status = "SECONDARY_CONFIRMED"
            elif event.source_tier == "TIER_4_UNVERIFIED":
                verification_status = "UNCONFIRMED"

        return verification_status, secondary_sources, claims
