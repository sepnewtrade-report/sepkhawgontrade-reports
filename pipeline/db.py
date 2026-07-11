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

def save_stock_metrics(date_str, ticker, price, change_pct, volume, rsi, macd, atr, raw_dict):
    conn = get_connection()
    cursor = conn.cursor()
    raw_json = json.dumps(raw_dict, ensure_ascii=False)
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

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully at:", DB_PATH)
