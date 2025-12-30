"""
Content Cache - Caches extracted web content to avoid re-scraping
Uses SQLite for simple, file-based caching
"""

import sqlite3
import logging
import hashlib
import json
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from pathlib import Path

logger = logging.getLogger(__name__)


class ContentCache:
    """
    Simple file-based cache for extracted web content
    """

    def __init__(self, cache_file: str = ".content_cache.db", ttl_hours: int = 24):
        """
        Initialize content cache

        Args:
            cache_file: Path to SQLite cache database
            ttl_hours: Time-to-live in hours (default 24)
        """
        self.cache_file = cache_file
        self.ttl = timedelta(hours=ttl_hours)
        self._init_db()

    def _init_db(self):
        """Initialize cache database"""
        try:
            conn = sqlite3.connect(self.cache_file)
            cursor = conn.cursor()

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS content_cache (
                    url_hash TEXT PRIMARY KEY,
                    url TEXT NOT NULL,
                    content_json TEXT NOT NULL,
                    cached_at TEXT NOT NULL,
                    expires_at TEXT NOT NULL
                )
            """)

            # Create index on expiration
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_expires_at ON content_cache(expires_at)
            """)

            conn.commit()
            conn.close()

            logger.info(f"Content cache initialized: {self.cache_file}")

        except Exception as e:
            logger.error(f"Failed to initialize cache: {e}")

    def _hash_url(self, url: str) -> str:
        """Generate hash for URL"""
        return hashlib.md5(url.encode()).hexdigest()

    def get(self, url: str) -> Optional[Dict[str, Any]]:
        """
        Get cached content for URL

        Args:
            url: URL to retrieve

        Returns:
            Cached content dict or None if not found/expired
        """
        try:
            url_hash = self._hash_url(url)
            conn = sqlite3.connect(self.cache_file)
            cursor = conn.cursor()

            cursor.execute("""
                SELECT content_json, expires_at
                FROM content_cache
                WHERE url_hash = ?
            """, (url_hash,))

            row = cursor.fetchone()
            conn.close()

            if not row:
                logger.debug(f"Cache miss: {url}")
                return None

            content_json, expires_at = row

            # Check if expired
            expires = datetime.fromisoformat(expires_at)
            if datetime.utcnow() > expires:
                logger.debug(f"Cache expired: {url}")
                self.delete(url)  # Clean up expired entry
                return None

            # Parse and return
            content = json.loads(content_json)
            logger.debug(f"Cache hit: {url}")
            return content

        except Exception as e:
            logger.error(f"Error retrieving from cache: {e}")
            return None

    def set(self, url: str, content: Dict[str, Any]):
        """
        Cache content for URL

        Args:
            url: URL to cache
            content: Content dict to cache
        """
        try:
            url_hash = self._hash_url(url)
            cached_at = datetime.utcnow()
            expires_at = cached_at + self.ttl

            content_json = json.dumps(content)

            conn = sqlite3.connect(self.cache_file)
            cursor = conn.cursor()

            cursor.execute("""
                INSERT OR REPLACE INTO content_cache
                (url_hash, url, content_json, cached_at, expires_at)
                VALUES (?, ?, ?, ?, ?)
            """, (
                url_hash,
                url,
                content_json,
                cached_at.isoformat(),
                expires_at.isoformat()
            ))

            conn.commit()
            conn.close()

            logger.debug(f"Cached: {url}")

        except Exception as e:
            logger.error(f"Error caching content: {e}")

    def delete(self, url: str):
        """
        Delete cached entry for URL

        Args:
            url: URL to delete
        """
        try:
            url_hash = self._hash_url(url)
            conn = sqlite3.connect(self.cache_file)
            cursor = conn.cursor()

            cursor.execute("DELETE FROM content_cache WHERE url_hash = ?", (url_hash,))

            conn.commit()
            conn.close()

        except Exception as e:
            logger.error(f"Error deleting from cache: {e}")

    def clear_expired(self):
        """Remove all expired cache entries"""
        try:
            now = datetime.utcnow().isoformat()

            conn = sqlite3.connect(self.cache_file)
            cursor = conn.cursor()

            cursor.execute("DELETE FROM content_cache WHERE expires_at < ?", (now,))
            deleted = cursor.rowcount

            conn.commit()
            conn.close()

            logger.info(f"Cleared {deleted} expired cache entries")
            return deleted

        except Exception as e:
            logger.error(f"Error clearing expired cache: {e}")
            return 0

    def clear_all(self):
        """Clear entire cache"""
        try:
            conn = sqlite3.connect(self.cache_file)
            cursor = conn.cursor()

            cursor.execute("DELETE FROM content_cache")
            deleted = cursor.rowcount

            conn.commit()
            conn.close()

            logger.info(f"Cleared all {deleted} cache entries")
            return deleted

        except Exception as e:
            logger.error(f"Error clearing cache: {e}")
            return 0

    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        try:
            conn = sqlite3.connect(self.cache_file)
            cursor = conn.cursor()

            # Total entries
            cursor.execute("SELECT COUNT(*) FROM content_cache")
            total = cursor.fetchone()[0]

            # Expired entries
            now = datetime.utcnow().isoformat()
            cursor.execute("SELECT COUNT(*) FROM content_cache WHERE expires_at < ?", (now,))
            expired = cursor.fetchone()[0]

            # Cache file size
            cache_size = Path(self.cache_file).stat().st_size if Path(self.cache_file).exists() else 0

            conn.close()

            return {
                'total_entries': total,
                'expired_entries': expired,
                'valid_entries': total - expired,
                'cache_size_bytes': cache_size,
                'cache_size_mb': round(cache_size / (1024 * 1024), 2)
            }

        except Exception as e:
            logger.error(f"Error getting cache stats: {e}")
            return {}


if __name__ == "__main__":
    # Test the cache
    cache = ContentCache()

    # Test data
    test_url = "https://example.com/test"
    test_content = {
        'title': 'Test Page',
        'text': 'This is test content',
        'word_count': 100
    }

    # Test set
    cache.set(test_url, test_content)
    print("Cached test content")

    # Test get
    retrieved = cache.get(test_url)
    print(f"Retrieved: {retrieved}")

    # Test stats
    stats = cache.get_stats()
    print(f"Cache stats: {stats}")

    # Test clear
    cache.clear_all()
    print("Cache cleared")
