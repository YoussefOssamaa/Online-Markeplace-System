import json
import os
from datetime import datetime
import random

from httpx import patch
from werkzeug.security import generate_password_hash
import pandas as pd
import threading
import time
from datetime import datetime, timedelta

base_dir = "logs"
os.makedirs(base_dir, exist_ok=True)

customer_log_path = os.path.join(base_dir, "customer_log.json")
product_log_path = os.path.join(base_dir, "product_log.json")

# def _write_log(path, event):
#     with open(path, "a") as f:
#         f.write(json.dumps(event) + "\n")

def _write_log(path, event):
    if not os.path.isfile(path):
        with open(path, "w") as f:
            json.dump([], f)

    with open(path, "a") as f:
        f.write(json.dumps(event) + "\n")

def log_customer(event_type, customer_id, description):
    event = {
        "timestamp": datetime.now().isoformat(),
        "event_type": event_type,
        "description": description,
        "customer_id": customer_id,
    }
    _write_log(customer_log_path, event)

def log_product(event_type, customer_id, product_id, description):
    event = {
        "timestamp": datetime.now().isoformat(),
        "event_type": event_type,
        "description": description,
        "customer_id": customer_id,
        "target": {
            "product_id": product_id,
        }
    }
    _write_log(product_log_path, event)

def read_last_logs( path , log_type ,limit=10, offset=0 ):
    if not os.path.isfile(path):
        return []

    df = pd.read_json(path, lines=True)

    df = df.sort_values(by='timestamp', ascending=False)

    filtered = df[df['event_type'] == log_type]

    count = len(filtered)

    selected = filtered.iloc[offset:offset + limit]

    return {"logs" :selected.to_dict(orient='records') , "count" :count}

def read_customer_last_logs(  log_type ,limit=10, offset=0 ):
    return read_last_logs(customer_log_path , log_type, limit, offset)

def read_product_last_logs(  log_type ,limit=10, offset=0 ):
    return read_last_logs(product_log_path , log_type, limit, offset)
#
# def cleanup_old_logs():
#     paths = [customer_log_path, product_log_path]
#     one_month_ago = datetime.now() - timedelta(days=30)
#
#     for path in paths:
#         if not os.path.isfile(path):
#             continue
#
#         df = pd.read_json(path, lines=True)
#
#         if df['timestamp'].dtype == 'O':
#             df['timestamp'] = pd.to_datetime(df['timestamp'])
#
#         df = df[df['timestamp'] >= one_month_ago]
#
#         df.to_json(path, orient='records', lines=True)
#
# def run_cleanup_every_24h():
#     def job():
#         while True:
#             cleanup_old_logs()
#             time.sleep(24 * 60 * 60)
#
#     t = threading.Thread(target=job)
#     t.daemon = True
#     t.start()
