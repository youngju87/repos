"""
Pipeline module for SEO Content Gap Finder
Orchestrates the analysis workflow
"""

from .orchestrator import ContentGapPipeline
from .result_formatter import ResultFormatter

__all__ = ['ContentGapPipeline', 'ResultFormatter']
