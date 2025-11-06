from cachetools import TTLCache
import hashlib

cache = TTLCache(maxsize=1000, ttl=600)

def get_from_cache(key):
    return cache.get(key)

def save_to_cache(key, value):
    cache[key] = value

def get_hash(data):
    return hashlib.sha256(data.encode("utf-8") if isinstance(data, str) else data).hexdigest()[:10]
