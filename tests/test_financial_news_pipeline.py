import unittest
import os
import json
from datetime import datetime, timezone

from pipeline.providers.sec_edgar import SECEdgarProvider
from pipeline.providers.company_ir import CompanyIRProvider
from pipeline.providers.fred_macro import FREDMacroProvider
from pipeline.providers.yfinance_adapter import YFinanceAdapter

from pipeline.engine.models import NewsEvent
from pipeline.engine.ticker_resolver import TickerResolver
from pipeline.engine.verification_engine import VerificationEngine
from pipeline.engine.duplicate_detector import DuplicateDetector
from pipeline.engine.scoring_engine import ScoringEngine
import pipeline.db as db

class TestFinancialNewsPipeline(unittest.TestCase):
    def setUp(self):
        db.init_db()

    def test_ticker_resolver(self):
        tickers, comps, sector, status = TickerResolver.resolve(
            headline="Rocket Lab (RKLB) signs $500M contract with NASA",
            summary="Rocket Lab USA, Inc. announces deal",
            provided_tickers=["RKLB"]
        )
        self.assertIn("RKLB", tickers)
        self.assertEqual(status, "RESOLVED")

    def test_scoring_engine(self):
        evt = NewsEvent(
            id="test_01",
            headline="NVIDIA Announces Blackwell Ramp Up",
            summary="Record Blackwell AI server demand",
            source_name="NVIDIA IR",
            source_url="https://nvidia.com",
            source_type="COMPANY_IR",
            source_tier="TIER_1_PRIMARY",
            published_at=datetime.now(timezone.utc).isoformat(),
            retrieved_at=datetime.now(timezone.utc).isoformat(),
            event_time=datetime.now(timezone.utc).isoformat(),
            tickers=["NVDA"],
            event_type="CORPORATE_ANNOUNCEMENT",
            verification_status="VERIFIED_PRIMARY"
        )
        scored = ScoringEngine.score_event(evt)
        self.assertGreaterEqual(scored.overall_score, 85.0)
        self.assertIn(scored.score_category, ["CRITICAL", "HIGH"])

    def test_duplicate_detector(self):
        e1 = NewsEvent(
            id="e1", headline="Company wins $500M contract", summary="Firm receives deal",
            source_name="SEC", source_url="url1", source_type="FILING", source_tier="TIER_1_PRIMARY",
            published_at=datetime.now(timezone.utc).isoformat(), retrieved_at=datetime.now(timezone.utc).isoformat(),
            event_time=datetime.now(timezone.utc).isoformat(), tickers=["RKLB"]
        )
        e2 = NewsEvent(
            id="e2", headline="Company wins $500M contract deal", summary="Firm receives big deal",
            source_name="News", source_url="url2", source_type="NEWS", source_tier="TIER_3_AGGREGATOR",
            published_at=datetime.now(timezone.utc).isoformat(), retrieved_at=datetime.now(timezone.utc).isoformat(),
            event_time=datetime.now(timezone.utc).isoformat(), tickers=["RKLB"]
        )
        canonicals, clusters = DuplicateDetector.cluster_events([e1, e2])
        self.assertEqual(len(canonicals), 1)
        self.assertEqual(canonicals[0].id, "e1")

    def test_database_persistence(self):
        evt = NewsEvent(
            id="db_test_01",
            headline="Fed Holds Interest Rates Constant",
            summary="Federal Reserve FOMC decision",
            source_name="Federal Reserve",
            source_url="https://federalreserve.gov",
            source_type="OFFICIAL",
            source_tier="TIER_1_PRIMARY",
            published_at=datetime.now(timezone.utc).isoformat(),
            retrieved_at=datetime.now(timezone.utc).isoformat(),
            event_time=datetime.now(timezone.utc).isoformat(),
            tickers=["MACRO"],
            event_type="FED_DECISION",
            verification_status="VERIFIED_PRIMARY",
            overall_score=95.0,
            score_category="CRITICAL",
            ticker_status="RESOLVED"
        )
        db.save_news_event(evt.to_dict())
        db.log_audit("db_test_01", "TEST_SAVE", "UnitTest", "Saved successfully")
        
        recent = db.get_recent_news_events(limit=5)
        saved_ids = [r["id"] for r in recent]
        self.assertIn("db_test_01", saved_ids)

if __name__ == "__main__":
    unittest.main()
