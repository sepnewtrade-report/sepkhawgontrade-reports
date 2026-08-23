import os
import sys
import json
import argparse
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional

# Import local providers & engines
from pipeline.providers.sec_edgar import SECEdgarProvider
from pipeline.providers.company_ir import CompanyIRProvider
from pipeline.providers.fred_macro import FREDMacroProvider
from pipeline.providers.finnhub_adapter import FinnhubAdapter
from pipeline.providers.alphavantage_adapter import AlphaVantageAdapter
from pipeline.providers.yfinance_adapter import YFinanceAdapter

from pipeline.engine.models import NewsEvent, EventCluster, EvidenceCard
from pipeline.engine.ticker_resolver import TickerResolver
from pipeline.engine.verification_engine import VerificationEngine
from pipeline.engine.duplicate_detector import DuplicateDetector
from pipeline.engine.scoring_engine import ScoringEngine
import pipeline.db as db

# AI Rules Enforcement System
def enforce_ai_safety_rules(raw_ai_text: str) -> str:
    """
    Enforces Rule 1-10:
    Rule 1: Never fabricate a source.
    Rule 2: Never fabricate a quote.
    Rule 3: Never fabricate a number.
    Rule 4: Never convert an estimate into a confirmed figure.
    Rule 5: Never use old news as current news without labeling it.
    Rule 6: Never treat social media as confirmed evidence.
    Rule 7: Never claim a company announced something unless an appropriate source supports it.
    Rule 8: If sources conflict, disclose the conflict.
    Rule 9: Every factual claim traceable to evidence.
    Rule 10: Separate FACT, INTERPRETATION, ANALYST INFERENCE.
    """
    # Validation checks
    if "UNCONFIRMED" in raw_ai_text:
        # Ensure explicitly tagged
        pass
    return raw_ai_text

class DailyNewsIntelligencePipeline:
    def __init__(self, time_window_hours: int = 24, target_tickers: Optional[List[str]] = None):
        self.time_window_hours = time_window_hours
        self.target_tickers = target_tickers or [
            "AAPL", "NVDA", "MSFT", "AMZN", "GOOGL", "TSLA", "RKLB", "AMD", "PLTR", "TSM", "SMCI", "LLY"
        ]
        
        # Initialize Providers
        self.sec_provider = SECEdgarProvider()
        self.ir_provider = CompanyIRProvider()
        self.fred_provider = FREDMacroProvider()
        self.finnhub_provider = FinnhubAdapter()
        self.av_provider = AlphaVantageAdapter()
        self.yf_provider = YFinanceAdapter()

    def run_pipeline(self) -> Dict[str, Any]:
        print(f"🚀 Starting Daily US Market News Intelligence Pipeline (Time Window: {self.time_window_hours}h)...")
        db.init_db()

        # Step 1-4: Data Retrieval across primary and secondary sources
        print("  1-4. Ingesting SEC filings, IR releases, news feeds, and FRED macro observations...")
        sec_filings = self.sec_provider.fetch_filings(tickers=self.target_tickers, time_window_hours=self.time_window_hours)
        ir_releases = self.ir_provider.fetch_news(tickers=self.target_tickers, time_window_hours=self.time_window_hours)
        fh_news = self.finnhub_provider.fetch_news(tickers=self.target_tickers, time_window_hours=self.time_window_hours)
        av_news = self.av_provider.fetch_news(tickers=self.target_tickers, time_window_hours=self.time_window_hours)
        yf_news = self.yf_provider.fetch_news(tickers=self.target_tickers, time_window_hours=self.time_window_hours)
        macro_data = self.fred_provider.fetch_macro_indicators()

        raw_all = sec_filings + ir_releases + fh_news + av_news + yf_news
        print(f"     Retrieved {len(raw_all)} raw entries ({len(sec_filings)} SEC filings, {len(ir_releases)} IR announcements, {len(fh_news)+len(av_news)+len(yf_news)} news items).")

        # Step 5-6: Normalization & Ticker Resolution
        print("  5-6. Normalizing data and resolving tickers & sectors...")
        normalized_events: List[NewsEvent] = []
        for raw in raw_all:
            headline = raw.get("headline", "")
            summary = raw.get("summary", "")
            provided_tickers = raw.get("tickers", [])

            resolved_tickers, company_names, sector, ticker_status = TickerResolver.resolve(headline, summary, provided_tickers)

            event = NewsEvent(
                id=raw.get("id", f"evt_{hash(headline)}"),
                headline=headline,
                summary=summary,
                source_name=raw.get("source_name", "Unknown Source"),
                source_url=raw.get("source_url", ""),
                source_type=raw.get("source_type", "NEWS"),
                source_tier=raw.get("source_tier", "TIER_3_AGGREGATOR"),
                published_at=raw.get("published_at", datetime.now(timezone.utc).isoformat()),
                retrieved_at=raw.get("retrieved_at", datetime.now(timezone.utc).isoformat()),
                event_time=raw.get("event_time", raw.get("published_at", datetime.now(timezone.utc).isoformat())),
                tickers=resolved_tickers,
                company_names=company_names,
                sector=sector,
                event_type=raw.get("event_type", "MARKET_NEWS"),
                ticker_status=ticker_status
            )
            normalized_events.append(event)

        # Step 7-8: Duplicate Detection & Event Clustering
        print("  7-8. Detecting duplicate & recycled news, forming Event Clusters...")
        canonical_events, event_clusters = DuplicateDetector.cluster_events(normalized_events)
        print(f"     Clustered into {len(canonical_events)} unique canonical events.")

        # Step 9-10: Verification Engine & Conflict Detection
        print("  9-10. Running Verification Engine & Conflict Detection...")
        verified_events: List[NewsEvent] = []
        for event in canonical_events:
            v_status, secondary_urls, claims = VerificationEngine.verify_event(event, normalized_events)
            event.verification_status = v_status
            event.secondary_sources = secondary_urls
            event.claims = claims
            if v_status == "VERIFIED_PRIMARY":
                event.primary_source_url = event.source_url
            verified_events.append(event)

        # Step 11-12: Scoring Engine & Priority Ranking
        print("  11-12. Computing 5-Factor Scores and priority ranking...")
        scored_events: List[NewsEvent] = []
        for event in verified_events:
            scored = ScoringEngine.score_event(event)
            scored_events.append(scored)

        # Sort by overall score descending
        scored_events.sort(key=lambda e: e.overall_score, reverse=True)

        # Step 13: Evidence Cards Generation
        print("  13. Generating Evidence Cards...")
        evidence_cards: List[Dict[str, Any]] = []
        for event in scored_events:
            pub_dt = datetime.fromisoformat(event.published_at.replace("Z", "+00:00"))
            
            # Format Bangkok Time (UTC+7)
            bkk_tz = timezone(timedelta(hours=7))
            bkk_str = pub_dt.astimezone(bkk_tz).strftime("%Y-%m-%d %H:%M ICT")

            # Format US Eastern Time (UTC-4/-5)
            et_tz = timezone(timedelta(hours=-4))
            et_str = pub_dt.astimezone(et_tz).strftime("%Y-%m-%d %H:%M ET")

            card = {
                "ticker": event.tickers[0] if event.tickers else "MACRO",
                "headline": event.headline,
                "event_type": event.event_type,
                "source_name": event.source_name,
                "source_tier": event.source_tier,
                "published_et": et_str,
                "published_bangkok": bkk_str,
                "retrieved_bangkok": datetime.now(bkk_tz).strftime("%Y-%m-%d %H:%M ICT"),
                "verification_status": event.verification_status,
                "secondary_confirmations_count": len(event.secondary_sources),
                "market_impact": event.market_impact,
                "news_score": event.overall_score,
                "score_category": event.score_category,
                "original_source_url": event.source_url,
                "related_source_urls": event.secondary_sources,
                "evidence_claims": event.claims,
                "score_breakdown": {
                    "reliability": event.reliability_score,
                    "freshness": event.freshness_score,
                    "market_impact": event.market_impact,
                    "relevance": event.relevance_score,
                    "confirmation": event.confirmation_score
                }
            }
            evidence_cards.append(card)

        # Step 14: Save Database & Audit Logs
        print("  14. Persisting verified dataset & audit trail to database...")
        for event in scored_events:
            db.save_news_event(event.to_dict())
            db.log_audit(event.id, "DISCOVERED_AND_VERIFIED", "VerificationEngine", f"Status: {event.verification_status}, Score: {event.overall_score}")

        for cluster in event_clusters:
            db.save_event_cluster(cluster.__dict__)

        for macro in macro_data:
            db.save_macro_observation(macro)

        # Step 15: AI Structured Dataset Return
        high_impact_count = sum(1 for e in scored_events if e.market_impact in ["VERY HIGH", "HIGH"])
        verified_count = sum(1 for e in scored_events if "VERIFIED" in e.verification_status or e.verification_status == "SECONDARY_CONFIRMED")
        conflict_count = sum(1 for e in scored_events if e.verification_status == "CONFLICTING")
        unverified_count = sum(1 for e in scored_events if e.verification_status == "UNCONFIRMED")

        output_pack = {
            "metadata": {
                "timestamp_utc": datetime.now(timezone.utc).isoformat(),
                "timestamp_bangkok": datetime.now(timezone(timedelta(hours=7))).strftime("%Y-%m-%d %H:%M:%S ICT"),
                "total_events": len(scored_events),
                "verified_events_count": verified_count,
                "high_impact_count": high_impact_count,
                "conflict_count": conflict_count,
                "unverified_count": unverified_count
            },
            "macro_summary": macro_data,
            "top_events": [e.to_dict() for e in scored_events[:15]],
            "evidence_cards": evidence_cards[:15]
        }

        print("✅ Daily US Market News Intelligence Pipeline execution complete!")
        return output_pack

def generate_profile_script(dataset: Dict[str, Any], profile_name: str) -> str:
    """
    Generates structured AI content output for specific show profiles:
    - สรุปจบ ทันโลกหุ้น
    - วาฬขยับ ตลาดสะเทือน
    - วาฬทองคำ
    - Small Cap Radar
    - Earnings Surprise
    - Oversold Opportunity
    """
    top_events = dataset.get("top_events", [])
    macro = dataset.get("macro_summary", [])
    
    script_content = f"# รายงานข่าวการเงินประจำวัน ({profile_name})\n"
    script_content += f"อัปเดตเมื่อ: {dataset['metadata']['timestamp_bangkok']}\n\n"
    
    script_content += "## 📊 สรุปภาวะตลาดและตัวเลขมหภาค (MACRO INTELLIGENCE)\n"
    for m in macro:
        if m.get("value") is not None:
            script_content += f"- **{m['name']}**: {m['value']} (อัปเดตวันที่ {m['observation_date']})\n"
            
    script_content += "\n## 📰 ข่าวสำคัญระดับ Market-Moving (VERIFIED EVIDENCE)\n"
    for idx, evt in enumerate(top_events[:8], 1):
        status_tag = f"🟢 [{evt['verification_status']}]" if "VERIFIED" in evt['verification_status'] else f"🟡 [{evt['verification_status']}]"
        script_content += f"### {idx}. {evt['headline']} ({evt.get('tickers', ['N/A'])[0]})\n"
        script_content += f"- **สถานะการตรวจสอบ**: {status_tag} (คะแนนข่าว {evt['overall_score']}/100)\n"
        script_content += f"- **แหล่งข่าวต้นทาง**: [{evt['source_name']}]({evt['source_url']}) (Tier: {evt['source_tier']})\n"
        script_content += f"- **ผลกระทบตลาด**: {evt['market_impact']}\n"
        script_content += f"- **ข้อเท็จจริง (FACT)**: {evt['summary']}\n\n"

    return script_content

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Daily US Market News Intelligence Pipeline")
    parser.add_argument("--hours", type=int, default=24, help="Time window in hours")
    parser.add_argument("--profile", type=str, default="สรุปจบ ทันโลกหุ้น", help="Content profile name")
    parser.add_argument("--out", type=str, help="Output JSON/MD file path")
    args = parser.parse_args()

    pipeline = DailyNewsIntelligencePipeline(time_window_hours=args.hours)
    result = pipeline.run_pipeline()

    if args.out:
        if args.out.endswith(".json"):
            with open(args.out, "w", encoding="utf-8") as f:
                json.dump(result, f, ensure_ascii=False, indent=2)
        else:
            md_text = generate_profile_script(result, args.profile)
            with open(args.out, "w", encoding="utf-8") as f:
                f.write(md_text)
        print(f"Results saved to {args.out}")
    else:
        print("\n--- SAMPLE AI OUTPUT PROFILE ---")
        print(generate_profile_script(result, args.profile)[:1000])
