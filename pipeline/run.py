import argparse
import sys
import os
from datetime import datetime
import yfinance as yf

# Add current directory to path just in case
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import db
import collector
import qa
import scanner
import strategy
import risk
import generator
import notifier

def run_1900(date_str):
    print(f"\n==================== STARTING 19:00 PRE-MARKET PIPELINE [{date_str}] ====================")
    db.init_db()
    
    try:
        # Stage 1: Data Collection
        raw_data = collector.collect_data()
        if not raw_data:
            raise Exception("No data collected in Stage 1")
            
        # Stage 2: QA Checker
        cleaned_data, qa_logs = qa.verify_data(raw_data)
        if not cleaned_data:
            raise Exception("No data passed QA verification in Stage 2")
            
        # Stage 3: Stock Scanner
        scanned_data = scanner.scan_stocks(cleaned_data)
        
        # Save metrics to DB
        for ticker, sdata in scanned_data.items():
            fund = sdata.get("fundamentals", {})
            tech = sdata.get("technicals", {})
            db.save_stock_metrics(
                date_str=date_str,
                ticker=ticker,
                price=fund.get("current_price", 0.0),
                change_pct=0.0, # Will be set or updated later
                volume=int(sdata.get("history", {}).get("volume", [0])[-1]),
                rsi=tech.get("rsi", 50.0),
                macd=tech.get("macd_hist", 0.0),
                atr=tech.get("atr", 0.0),
                raw_dict=sdata
            )
            
        # Stage 4: Strategy Engine
        engine = strategy.StrategyEngine()
        raw_signals = engine.run(scanned_data)
        
        # Stage 5: Risk Engine
        risk_mgr = risk.RiskEngine()
        processed_signals = risk_mgr.process_signals(raw_signals, scanned_data)
        
        # Save signals to DB
        for sig in processed_signals:
            db.save_signal(
                date_str=date_str,
                ticker=sig["ticker"],
                strategy_name=sig["strategy_name"],
                signal_type=sig["signal_type"],
                price=sig["price"],
                confidence=sig["confidence"],
                stop_loss=sig["stop_loss"],
                take_profit=sig["take_profit"],
                pos_size=sig["position_size"]
            )
            
        # Stage 6: Report Generator
        output_report_name = f"market_summary_{date_str.replace('-', '_')}.md"
        output_report_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), output_report_name)
        generator.generate_1900_report(processed_signals, scanned_data, date_str, output_report_path)
        
        # Stage 7: Notification
        notification_title = f"Top Pre-Market Trading Signals - {date_str}"
        msg = f"<b>🌌 สรุปสัญญาณเด่นก่อนเปิดตลาด ({date_str})</b>\n\n"
        if not processed_signals:
            msg += "ไม่พบสัญญาณซื้อเข้าข่ายกลยุทธ์ในวันนี้"
        else:
            for sig in processed_signals:
                msg += (
                    f"• <b>{sig['ticker']}</b> ({sig['strategy_name']}):\n"
                    f"  ราคาเข้า: ${sig['price']:.2f} | SL: ${sig['stop_loss']:.2f} | TP: ${sig['take_profit']:.2f}\n"
                    f"  จัดสรรเงินทุน: ${sig['position_size']:,.2f} (มั่นใจ {sig['confidence']*100:.0f}%)\n"
                )
        msg += f"\n👉 อ่านบทวิเคราะห์ฉบับเต็มได้บนเว็บไซต์แล้ววันนี้"
        
        plain_msg = msg.replace("<b>", "").replace("</b>", "")
        notifier.send_notifications(notification_title, msg, plain_msg)
        
        # Log success
        db.log_scan("19:00", "success")
        print("19:00 Pre-market pipeline execution completed successfully.")
        
    except Exception as e:
        error_msg = f"Error in 19:00 pipeline: {e}"
        print(error_msg, file=sys.stderr)
        db.log_scan("19:00", "failure", error_msg)
        raise

def run_0530(date_str):
    print(f"\n==================== STARTING 05:30 POST-MARKET RECAP PIPELINE [{date_str}] ====================")
    db.init_db()
    
    try:
        # Load active signals
        active_signals = db.get_active_signals()
        if not active_signals:
            print("No active signals to close or review in the database.")
            stats = {
                "total_signals": 0,
                "win_rate": 0.0,
                "avg_return": 0.0,
                "accuracy": 0.0
            }
            db.save_daily_stats(date_str, 0, 0.0, 0.0, 0.0)
            
            output_report_name = f"global_market_recap_{date_str.replace('-', '_')}.md"
            output_report_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), output_report_name)
            generator.generate_0530_report([], stats, date_str, output_report_path)
            
            db.log_scan("05:30", "success")
            return
            
        print(f"Found {len(active_signals)} active signals to check.")
        closed_signals = []
        win_count = 0
        total_return = 0.0
        
        # Fetch current closing prices for these active tickers
        for sig in active_signals:
            ticker = sig["ticker"]
            try:
                t = yf.Ticker(ticker)
                hist = t.history(period="1d")
                if not hist.empty:
                    closed_price = hist["Close"].iloc[-1]
                else:
                    # Fallback to standard price lookup
                    closed_price = t.info.get("currentPrice") or t.info.get("regularMarketPrice") or sig["price"]
                
                # Calculate performance metrics
                return_pct = ((closed_price - sig["price"]) / sig["price"]) * 100.0
                db.update_signal_outcome(sig["id"], closed_price, return_pct)
                
                sig_closed = sig.copy()
                sig_closed["closed_price"] = closed_price
                sig_closed["return_percent"] = return_pct
                closed_signals.append(sig_closed)
                
                if return_pct > 0:
                    win_count += 1
                total_return += return_pct
                
                print(f"  Closed {ticker}: Entry ${sig['price']:.2f} -> Closed ${closed_price:.2f} ({return_pct:+.2f}%)")
            except Exception as e:
                print(f"Error closing signal for {ticker}: {e}")
                
        # Calculate statistics
        total = len(closed_signals)
        win_rate = (win_count / total) if total > 0 else 0.0
        avg_return = (total_return / total) if total > 0 else 0.0
        accuracy = win_rate # Simple mapping for this logic
        
        stats = {
            "total_signals": total,
            "win_rate": win_rate,
            "avg_return": avg_return,
            "accuracy": accuracy
        }
        
        # Save daily statistics
        db.save_daily_stats(date_str, total, win_rate, avg_return, accuracy)
        
        # Generate report
        output_report_name = f"global_market_recap_{date_str.replace('-', '_')}.md"
        output_report_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), output_report_name)
        generator.generate_0530_report(closed_signals, stats, date_str, output_report_path)
        
        # Send Notification
        notification_title = f"Post-Market Performance Statistics - {date_str}"
        msg = (
            f"<b>📈 ผลการดำเนินงานรอบปิดตลาด ({date_str})</b>\n\n"
            f"• จำนวนสัญญาณรวม: {total} รายการ\n"
            f"• Win Rate: {win_rate:.1%}\n"
            f"• ผลตอบแทนเฉลี่ย: {avg_return:+.2f}%\n"
            f"• ความแม่นยำรวม: {accuracy:.1%}\n\n"
        )
        if closed_signals:
            msg += "<b>สรุปรายตัว:</b>\n"
            for sig in closed_signals:
                outcome = "✅ Win" if sig["return_percent"] > 0 else "❌ Loss"
                msg += f"• {sig['ticker']}: {sig['return_percent']:+.2f}% ({outcome})\n"
                
        msg += f"\n👉 สถิติตลอดทั้งโครงการอัปเดตและเผยแพร่แล้ววันนี้"
        plain_msg = msg.replace("<b>", "").replace("</b>", "")
        notifier.send_notifications(notification_title, msg, plain_msg)
        
        db.log_scan("05:30", "success")
        print("05:30 Post-market recap pipeline completed successfully.")
        
    except Exception as e:
        error_msg = f"Error in 05:30 pipeline: {e}"
        print(error_msg, file=sys.stderr)
        db.log_scan("05:30", "failure", error_msg)
        raise

def run_dryrun():
    print("\n==================== RUNNING PIPELINE IN DRY RUN MODE ====================")
    try:
        raw_data = collector.collect_data(tickers=["AAPL", "NVDA", "TSLA"])
        cleaned_data, qa_logs = qa.verify_data(raw_data)
        scanned_data = scanner.scan_stocks(cleaned_data)
        
        engine = strategy.StrategyEngine()
        raw_signals = engine.run(scanned_data)
        
        risk_mgr = risk.RiskEngine()
        processed_signals = risk_mgr.process_signals(raw_signals, scanned_data)
        
        print("\nDryrun successfully completed! Ready for production deployment.")
    except Exception as e:
        print(f"Dryrun failed: {e}", file=sys.stderr)
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="SepKhawGonTrade Automated Trading Pipeline")
    parser.add_argument("--mode", required=True, choices=["1900", "0530", "dryrun"], help="Pipeline run mode")
    parser.add_argument("--date", default=datetime.today().strftime("%Y-%m-%d"), help="Target run date (YYYY-MM-DD)")
    args = parser.parse_args()
    
    if args.mode == "1900":
        run_1900(args.date)
    elif args.mode == "0530":
        run_0530(args.date)
    elif args.mode == "dryrun":
        run_dryrun()

if __name__ == "__main__":
    main()
