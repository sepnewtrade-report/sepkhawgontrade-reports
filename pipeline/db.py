import os
import sqlite3
import json
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "market_data.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # 1. Scan History Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS scan_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
            mode TEXT NOT NULL,
            status TEXT NOT NULL,
            error_message TEXT
        )
    """)
    
    # 2. Stock Metrics Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS stock_metrics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            ticker TEXT NOT NULL,
            price REAL NOT NULL,
            change_percent REAL,
            volume INTEGER,
            rsi REAL,
            macd REAL,
            atr REAL,
            raw_data TEXT,
            UNIQUE(date, ticker)
        )
    """)
    
    # 3. Strategy Signals Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS signals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            ticker TEXT NOT NULL,
            strategy_name TEXT NOT NULL,
            signal_type TEXT NOT NULL,
            price REAL NOT NULL,
            confidence REAL,
            stop_loss REAL,
            take_profit REAL,
            position_size REAL,
            status TEXT DEFAULT 'active',
            closed_price REAL,
            return_percent REAL,
            UNIQUE(date, ticker, strategy_name)
        )
    """)
    
    # 4. Daily Performance Statistics Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS daily_stats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT UNIQUE NOT NULL,
            total_signals INTEGER NOT NULL,
            win_rate REAL,
            avg_return REAL,
            accuracy REAL
        )
    """)
    
    # 5. News Events Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS news_events (
            id TEXT PRIMARY KEY,
            headline TEXT NOT NULL,
            summary TEXT,
            source_name TEXT NOT NULL,
            source_url TEXT NOT NULL,
            source_type TEXT NOT NULL,
            source_tier TEXT NOT NULL,
            published_at TEXT NOT NULL,
            retrieved_at TEXT NOT NULL,
            event_time TEXT NOT NULL,
            tickers TEXT,
            company_names TEXT,
            sector TEXT,
            event_type TEXT,
            region TEXT,
            sentiment TEXT,
            market_impact TEXT,
            freshness_score REAL,
            reliability_score REAL,
            relevance_score REAL,
            confirmation_score REAL,
            overall_score REAL,
            score_category TEXT,
            verification_status TEXT NOT NULL,
            ticker_status TEXT NOT NULL,
            duplicate_group_id TEXT,
            primary_source_url TEXT,
            secondary_sources TEXT,
            evidence TEXT,
            claims TEXT,
            raw_data TEXT
        )
    """)

    # 6. Event Clusters Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS event_clusters (
            cluster_id TEXT PRIMARY KEY,
            canonical_event_id TEXT NOT NULL,
            original_source TEXT NOT NULL,
            supporting_sources TEXT,
            duplicate_articles TEXT,
            first_publication_time TEXT,
            latest_update_time TEXT
        )
    """)

    # 7. Macro Observations Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS macro_observations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            indicator TEXT NOT NULL,
            name TEXT NOT NULL,
            value REAL,
            timestamp TEXT NOT NULL,
            source TEXT NOT NULL,
            source_url TEXT,
            observation_date TEXT NOT NULL,
            retrieved_at TEXT NOT NULL
        )
    """)

    # 8. Audit Log Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
            event_id TEXT,
            action TEXT NOT NULL,
            actor TEXT NOT NULL,
            details TEXT
        )
    """)
    
    conn.commit()
    conn.close()

def log_scan(mode, status, error_message=None):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO scan_history (mode, status, error_message) VALUES (?, ?, ?)",
        (mode, status, error_message)
    )
    conn.commit()
    conn.close()

class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if hasattr(obj, "isoformat"):
            return obj.isoformat()
        try:
            import numpy as np
            if isinstance(obj, (np.integer, np.int64)):
                return int(obj)
            elif isinstance(obj, (np.floating, np.float64)):
                return float(obj)
            elif isinstance(obj, np.ndarray):
                return obj.tolist()
        except ImportError:
            pass
        return super().default(obj)

def save_stock_metrics(date_str, ticker, price, change_pct, volume, rsi, macd, atr, raw_dict):
    conn = get_connection()
    cursor = conn.cursor()
    raw_json = json.dumps(raw_dict, cls=CustomJSONEncoder, ensure_ascii=False)
    cursor.execute("""
        INSERT OR REPLACE INTO stock_metrics 
        (date, ticker, price, change_percent, volume, rsi, macd, atr, raw_data)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (date_str, ticker, price, change_pct, volume, rsi, macd, atr, raw_json))
    conn.commit()
    conn.close()

def save_signal(date_str, ticker, strategy_name, signal_type, price, confidence, stop_loss, take_profit, pos_size):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR REPLACE INTO signals 
        (date, ticker, strategy_name, signal_type, price, confidence, stop_loss, take_profit, position_size, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    """, (date_str, ticker, strategy_name, signal_type, price, confidence, stop_loss, take_profit, pos_size))
    conn.commit()
    conn.close()

def get_active_signals():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM signals WHERE status = 'active'")
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return rows

def update_signal_outcome(signal_id, closed_price, return_pct, status='closed'):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE signals 
        SET closed_price = ?, return_percent = ?, status = ?
        WHERE id = ?
    """, (closed_price, return_pct, status, signal_id))
    conn.commit()
    conn.close()

def save_daily_stats(date_str, total_signals, win_rate, avg_return, accuracy):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR REPLACE INTO daily_stats 
        (date, total_signals, win_rate, avg_return, accuracy)
        VALUES (?, ?, ?, ?, ?)
    """, (date_str, total_signals, win_rate, avg_return, accuracy))
    conn.commit()
    conn.close()

def get_signals_by_date(date_str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT ticker FROM signals WHERE date = ?", (date_str,))
    rows = [row["ticker"] for row in cursor.fetchall()]
    conn.close()
    return rows

def save_news_event(event_dict):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR REPLACE INTO news_events 
        (id, headline, summary, source_name, source_url, source_type, source_tier, published_at, retrieved_at, event_time,
         tickers, company_names, sector, event_type, region, sentiment, market_impact, freshness_score, reliability_score,
         relevance_score, confirmation_score, overall_score, score_category, verification_status, ticker_status,
         duplicate_group_id, primary_source_url, secondary_sources, evidence, claims, raw_data)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        event_dict.get("id"), event_dict.get("headline"), event_dict.get("summary"), event_dict.get("source_name"),
        event_dict.get("source_url"), event_dict.get("source_type"), event_dict.get("source_tier"),
        event_dict.get("published_at"), event_dict.get("retrieved_at"), event_dict.get("event_time"),
        json.dumps(event_dict.get("tickers", [])), json.dumps(event_dict.get("company_names", [])),
        event_dict.get("sector"), event_dict.get("event_type"), event_dict.get("region"), event_dict.get("sentiment"),
        event_dict.get("market_impact"), event_dict.get("freshness_score"), event_dict.get("reliability_score"),
        event_dict.get("relevance_score"), event_dict.get("confirmation_score"), event_dict.get("overall_score"),
        event_dict.get("score_category"), event_dict.get("verification_status"), event_dict.get("ticker_status"),
        event_dict.get("duplicate_group_id"), event_dict.get("primary_source_url"),
        json.dumps(event_dict.get("secondary_sources", [])), json.dumps(event_dict.get("evidence", [])),
        json.dumps(event_dict.get("claims", [])), json.dumps(event_dict.get("raw_payload", {}), cls=CustomJSONEncoder)
    ))
    conn.commit()
    conn.close()

def save_event_cluster(cluster_dict):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR REPLACE INTO event_clusters
        (cluster_id, canonical_event_id, original_source, supporting_sources, duplicate_articles, first_publication_time, latest_update_time)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        cluster_dict.get("cluster_id"),
        cluster_dict["canonical_event"].id if hasattr(cluster_dict.get("canonical_event"), "id") else cluster_dict.get("canonical_event_id"),
        cluster_dict.get("original_source"),
        json.dumps(cluster_dict.get("supporting_sources", [])),
        json.dumps(cluster_dict.get("duplicate_articles", [])),
        cluster_dict.get("first_publication_time"),
        cluster_dict.get("latest_update_time")
    ))
    conn.commit()
    conn.close()

def save_macro_observation(macro_dict):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO macro_observations 
        (indicator, name, value, timestamp, source, source_url, observation_date, retrieved_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        macro_dict.get("indicator"), macro_dict.get("name"), macro_dict.get("value"),
        macro_dict.get("timestamp"), macro_dict.get("source"), macro_dict.get("source_url"),
        macro_dict.get("observation_date"), macro_dict.get("retrieved_at")
    ))
    conn.commit()
    conn.close()

def log_audit(event_id, action, actor, details=None):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO audit_logs (event_id, action, actor, details) VALUES (?, ?, ?, ?)",
        (event_id, action, actor, details)
    )
    conn.commit()
    conn.close()

def get_recent_news_events(limit=100):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM news_events ORDER BY published_at DESC LIMIT ?", (limit,))
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return rows

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully at:", DB_PATH)
