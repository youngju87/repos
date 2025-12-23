"""
Dashboard callbacks module
"""

from .overview_callbacks import register_overview_callbacks
from .trends_callbacks import register_trends_callbacks
from .competitor_callbacks import register_competitor_callbacks


def register_callbacks(app):
    """Register all dashboard callbacks"""
    register_overview_callbacks(app)
    register_trends_callbacks(app)
    register_competitor_callbacks(app)
