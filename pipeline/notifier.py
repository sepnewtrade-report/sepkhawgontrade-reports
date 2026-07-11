import os
import urllib.request
import urllib.parse
from datetime import datetime

# Path to the notification log file for the local fallback
NOTIFICATIONS_LOG_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "notifications_log.txt")

def get_env_var(name):
    # Try direct env first, then load from .env file manually
    val = os.environ.get(name)
    if val:
        return val
    
    # Simple manual env parser
    env_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
    if os.path.exists(env_file):
        with open(env_file, "r") as f:
            for line in f:
                if line.strip() and not line.startswith("#"):
                    parts = line.strip().split("=", 1)
                    if len(parts) == 2 and parts[0].strip() == name:
                        return parts[1].strip()
    return None

def send_telegram_notification(message):
    token = get_env_var("TELEGRAM_TOKEN")
    chat_id = get_env_var("TELEGRAM_CHAT_ID")
    
    if not token or not chat_id:
        print("Telegram configuration missing in environment/.env.")
        return False
        
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    data = urllib.parse.urlencode({
        "chat_id": chat_id,
        "text": message,
        "parse_mode": "HTML"
    }).encode("utf-8")
    
    try:
        req = urllib.request.Request(url, data=data)
        with urllib.request.urlopen(req, timeout=10) as response:
            res_data = response.read()
            return True
    except Exception as e:
        print(f"Telegram notification failed: {e}")
        return False

def send_line_notification(message):
    token = get_env_var("LINE_NOTIFY_TOKEN")
    
    if not token:
        print("LINE Notify token missing in environment/.env.")
        return False
        
    url = "https://notify-api.line.me/api/notify"
    data = urllib.parse.urlencode({
        "message": message
    }).encode("utf-8")
    
    req = urllib.request.Request(url, data=data)
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("Content-Type", "application/x-www-form-urlencoded")
    
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            res_data = response.read()
            return True
    except Exception as e:
        print(f"LINE Notify failed: {e}")
        return False

def log_notification_locally(title, message):
    """
    Appends the message to a local file in the pipeline directory as a fallback.
    """
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_content = (
        f"=========================================\n"
        f"NOTIFICATION LOG: {timestamp}\n"
        f"TITLE: {title}\n"
        f"-----------------------------------------\n"
        f"{message}\n"
        f"=========================================\n\n"
    )
    
    try:
        with open(NOTIFICATIONS_LOG_PATH, "a", encoding="utf-8") as f:
            f.write(log_content)
        print(f"Notification fallback saved to: {NOTIFICATIONS_LOG_PATH}")
        return True
    except Exception as e:
        print(f"Failed to log notification locally: {e}")
        return False

def send_notifications(title, html_message, plain_message=None):
    """
    Orchestrates sending notifications to all enabled channels.
    Falls back to saving to a local text file if API channels are unconfigured or fail.
    """
    if not plain_message:
        plain_message = html_message
        
    telegram_ok = send_telegram_notification(html_message)
    line_ok = send_line_notification(plain_message)
    
    # Always log locally as a history and fallback
    log_notification_locally(title, plain_message)
    
    if telegram_ok or line_ok:
        print("Notifications sent successfully via APIs.")
    else:
        print("No API notifications sent. Local log fallback was created.")

if __name__ == "__main__":
    # Test notification logic
    send_notifications(
        "Test Signal Notification",
        "<b>📢 Test Notification</b>\nThis is a test from the modular stock scanner pipeline.",
        "📢 Test Notification\nThis is a test from the modular stock scanner pipeline."
    )
