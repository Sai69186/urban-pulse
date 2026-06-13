"""
In-memory session store for user-uploaded datasets.
Keyed by dataset type. Falls back to seed_data when no upload exists.
Thread-safe for single-worker uvicorn dev usage.
"""

from typing import Optional
import threading

_lock = threading.Lock()

# Stores user-uploaded data per category
_store: dict = {
    "air_quality":   None,
    "crime":         None,
    "economic":      None,
    "health":        None,
    "noise":         None,
    "neighborhoods": None,
    "sentiment":     None,
}

# Upload metadata (filename, row count, columns, upload time)
_meta: dict = {}


def set_dataset(key: str, data: list, meta: dict):
    with _lock:
        _store[key] = data
        _meta[key]  = meta


def get_dataset(key: str, fallback: list) -> list:
    with _lock:
        return _store[key] if _store[key] is not None else fallback


def get_meta(key: str) -> Optional[dict]:
    with _lock:
        return _meta.get(key)


def clear_dataset(key: str):
    with _lock:
        _store[key] = None
        _meta.pop(key, None)


def get_all_status() -> dict:
    with _lock:
        return {
            k: {
                "uploaded": _store[k] is not None,
                "rows":     len(_store[k]) if _store[k] else 0,
                "meta":     _meta.get(k),
            }
            for k in _store
        }


def clear_all():
    with _lock:
        for k in _store:
            _store[k] = None
        _meta.clear()
