"""
SERP Cache - Caches Google search results
Uses SQLite for simple caching with keyword-based lookup
"""

import sqlite3
import logging
import hashlib
import json
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from pathlib import Path

logger = logging.getLogger(__name__)


class SerpCache:
    """
    Cache for Google SERP results
    """

    def __init__(self, cache_file: str = ".serp_cache.db", ttl_hours: int = 72):
        """
        Initialize SERP cache

        Args:
            cache_file: Path to SQLite cache database
            ttl_hours: Time-to-live in hours (default 72 - SERPs change less frequently)
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
                CREATE TABLE IF NOT EXISTS serp_cache (
                    keyword_hash TEXT PRIMARY KEY,
                    keyword TEXT NOT NULL,
                    serp_data_json TEXT NOT NULL,
                    num_results INTEGER NOT NULL,
                    cached_at TEXT NOT NULL,
                    expires_at TEXT NOT NULL
                )
            """)

            # Create index on expiration
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_serp_expires_at ON serp_cache(expires_at)
            """)

            # Create index on keyword for lookups
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_keyword ON serp_cache(keyword)
            """)

            conn.commit()
            conn.close()

            logger.info(f"SERP cache initialized: {self.cache_file}")

        except Exception as e:
            logger.error(f"Failed to initialize SERP cache: {e}")

    def _hash_keyword(self, keyword: str, num_results: int = 10) -> str:
        """Generate hash for keyword + num_results"""
        key = f"{keyword.lower()}:{num_results}"
        return hashlib.md5(key.encode()).hexdigest()

    def get(self, keyword: str, num_results: int = 10) -> Optional[Dict[str, Any]]:
        """
        Get cached SERP data for keyword

        Args:
            keyword: Search keyword
            num_results: Number of results (must match cached value)

        Returns:
            Cached SERP data or None if not found/expired
        """
        try:
            keyword_hash = self._hash_keyword(keyword, num_results)
            conn = sqlite3.connect(self.cache_file)
            cursor = conn.cursor()

            cursor.execute("""
                SELECT serp_data_json, expires_at
                FROM serp_cache
                WHERE keyword_hash = ?
            """, (keyword_hash,))

            row = cursor.fetchone()
            conn.close()

            if not row:
                logger.debug(f"SERP cache miss: {keyword}")
                return None

            serp_data_json, expires_at = row

            # Check if expired
            expires = datetime.fromisoformat(expires_at)
            if datetime.utcnow() > expires:
                logger.debug(f"SERP cache expired: {keyword}")
                self.delete(keyword, num_results)
                return None

            # Parse and return
            serp_data = json.loads(serp_data_json)
            logger.debug(f"SERP cache hit: {keyword}")
            return serp_data

        except Exception as e:
            logger.error(f"Error retrieving from SERP cache: {e}")
            return None

    def set(self, keyword: str, serp_data: Dict[str, Any], num_results: int = 10):
        """
        Cache SERP data for keyword

        Args:
            keyword: Search keyword
            serp_data: SERP data to cache
            num_results: Number of results in this cache entry
        """
        try:
            keyword_hash = self._hash_keyword(keyword, num_results)
            cached_at = datetime.utcnow()
            expires_at = cached_at + self.ttl

            serp_data_json = json.dumps(serp_data)

            conn = sqlite3.connect(self.cache_file)
            cursor = conn.cursor()

            cursor.execute("""
                INSERT OR REPLACE INTO serp_cache
                (keyword_hash, keyword, serp_data_json, num_results, cached_at, expires_at)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                keyword_hash,
                keyword,
                serp_data_json,
                num_results,
                cached_at.isoformat(),
                expires_at.isoformat()
            ))

            conn.commit()
            conn.close()

            logger.debug(f"SERP cached: {keyword} ({num_results} results)")

        except Exception as e:
            logger.error(f"Error caching SERP data: {e}")

    def delete(self, keyword: str, num_results: int = 10):
        """
        Delete cached SERP entry

        Args:
            keyword: Keyword to delete
            num_results: Number of results
        """
        try:
            keyword_hash = self._hash_keyword(keyword, num_results)
            conn = sqlite3.connect(self.cache_file)
            cursor = conn.cursor()

            cursor.execute("DELETE FROM serp_cache WHERE keyword_hash = ?", (keyword_hash,))

            conn.commit()
            conn.close()

        except Exception as e:
            logger.error(f"Error deleting from SERP cache: {e}")

    def clear_expired(self):
        """Remove all expired SERP cache entries"""
        try:
            now = datetime.utcnow().isoformat()

            conn = sqlite3.connect(self.cache_file)
            cursor = conn.cursor()

            cursor.execute("DELETE FROM serp_cache WHERE expires_at < ?", (now,))
            deleted = cursor.rowcount

            conn.commit()
            conn.close()

            logger.info(f"Cleared {deleted} expired SERP cache entries")
            return deleted

        except Exception as e:
            logger.error(f"Error clearing expired SERP cache: {e}")
            return 0

    def clear_all(self):
        """Clear entire SERP cache"""
        try:
            conn = sqlite3.connect(self.cache_file)
            cursor = conn.cursor()

            cursor.execute("DELETE FROM serp_cache")
            deleted = cursor.rowcount

            conn.commit()
            conn.close()

            logger.info(f"Cleared all {deleted} SERP cache entries")
            return deleted

        except Exception as e:
            logger.error(f"Error clearing SERP cache: {e}")
            return 0

    def get_stats(self) -> Dict[str, Any]:
        """Get SERP cache statistics"""
        try:
            conn = sqlite3.connect(self.cache_file)
            cursor = conn.cursor()

            # Total entries
            cursor.execute("SELECT COUNT(*) FROM serp_cache")
            total = cursor.fetchone()[0]

            # Expired entries
            now = datetime.utcnow().isoformat()
            cursor.execute("SELECT COUNT(*) FROM serp_cache WHERE expires_at < ?", (now,))
            expired = cursor.fetchone()[0]

            # Cache file size
            cache_size = Path(self.cache_file).stat().st_size if Path(self.cache_file).exists() else 0

            # Recent keywords
            cursor.execute("""
                SELECT keyword, cached_at
                FROM serp_cache
                WHERE expires_at >= ?
                ORDER BY cached_at DESC
                LIMIT 10
            """, (now,))

            recent_keywords = [
                {'keyword': row[0], 'cached_at': row[1]}
                for row in cursor.fetchall()
            ]

            conn.close()

            return {
                'total_entries': total,
                'expired_entries': expired,
                'valid_entries': total - expired,
                'cache_size_bytes': cache_size,
                'cache_size_mb': round(cache_size / (1024 * 1024), 2),
                'recent_keywords': recent_keywords
            }

        except Exception as e:
            logger.error(f"Error getting SERP cache stats: {e}")
            return {}


if __name__ == "__main__":
    # Test the SERP cache
    cache = SerpCache()

    # Test data
    test_keyword = "project management software"
    test_serp_data = {
        'keyword': test_keyword,
        'total_results': 1000000,
        'results': [
            {'position': 1, 'title': 'Best PM Software', 'url': 'https://example.com'},
            {'position': 2, 'title': 'PM Tools 2024', 'url': 'https://example2.com'},
        ]
    }

    # Test set
    cache.set(test_keyword, test_serp_data, num_results=10)
    print("Cached SERP data")

    # Test get
    retrieved = cache.get(test_keyword, num_results=10)
    print(f"Retrieved: {retrieved['keyword']} with {len(retrieved['results'])} results")

    # Test stats
    stats = cache.get_stats()
    print(f"Cache stats: {stats}")

    # Test clear
    cache.clear_all()
    print("Cache cleared")
