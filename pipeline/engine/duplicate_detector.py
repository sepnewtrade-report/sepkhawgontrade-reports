from typing import List, Dict, Any, Tuple
from collections import defaultdict
from .models import NewsEvent, EventCluster

class DuplicateDetector:
    @staticmethod
    def _jaccard_similarity(str1: str, str2: str) -> float:
        set1 = set(str1.lower().split())
        set2 = set(str2.lower().split())
        if not set1 or not set2:
            return 0.0
        return len(set1.intersection(set2)) / float(len(set1.union(set2)))

    @classmethod
    def cluster_events(cls, events: List[NewsEvent], similarity_threshold: float = 0.45) -> Tuple[List[NewsEvent], List[EventCluster]]:
        """
        Groups duplicate / recycled articles into Event Clusters, selecting a canonical event.
        Returns deduplicated canonical events and event clusters list.
        """
        clusters: List[EventCluster] = []
        canonical_events: List[NewsEvent] = []
        visited = set()

        for i, event in enumerate(events):
            if event.id in visited:
                continue

            cluster_members = [event]
            visited.add(event.id)

            for j in range(i + 1, len(events)):
                other = events[j]
                if other.id in visited:
                    continue

                # Check ticker overlap or headline similarity
                common_tickers = set(event.tickers).intersection(set(other.tickers)) if event.tickers else True
                sim = cls._jaccard_similarity(event.headline, other.headline)

                if common_tickers and sim >= similarity_threshold:
                    cluster_members.append(other)
                    visited.add(other.id)

            # Sort cluster members by Source Tier priority (TIER_1_PRIMARY first) then published_at
            tier_weights = {"TIER_1_PRIMARY": 4, "TIER_2_PROFESSIONAL": 3, "TIER_3_AGGREGATOR": 2, "TIER_4_UNVERIFIED": 1}
            cluster_members.sort(key=lambda e: (tier_weights.get(e.source_tier, 0), e.published_at), reverse=True)

            canonical = cluster_members[0]
            canonical.duplicate_group_id = f"cluster_{hash(canonical.id)}"

            duplicates_data = [
                {"id": m.id, "headline": m.headline, "source_name": m.source_name, "published_at": m.published_at}
                for m in cluster_members[1:]
            ]

            cluster = EventCluster(
                cluster_id=canonical.duplicate_group_id,
                canonical_event=canonical,
                original_source=canonical.source_name,
                supporting_sources=[m.source_name for m in cluster_members[1:]],
                duplicate_articles=duplicates_data,
                first_publication_time=min(m.published_at for m in cluster_members),
                latest_update_time=max(m.published_at for m in cluster_members)
            )

            clusters.append(cluster)
            canonical_events.append(canonical)

        return canonical_events, clusters
