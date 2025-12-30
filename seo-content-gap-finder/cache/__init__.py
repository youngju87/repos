"""
Cache module for SEO Content Gap Finder
Provides caching for SERP results and extracted content
"""

from .content_cache import ContentCache
from .serp_cache import SerpCache

__all__ = ['ContentCache', 'SerpCache']
