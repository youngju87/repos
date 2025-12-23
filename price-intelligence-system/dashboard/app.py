"""
Price Intelligence Dashboard - Interactive Plotly Dash Application
Main entry point for the web dashboard
"""

import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

import dash
from dash import html, dcc
import dash_bootstrap_components as dbc
from dotenv import load_dotenv

from layouts import main_layout
from callbacks import register_callbacks

# Load environment variables
load_dotenv()

# Initialize Dash app with Bootstrap theme
app = dash.Dash(
    __name__,
    external_stylesheets=[dbc.themes.BOOTSTRAP, dbc.icons.FONT_AWESOME],
    title="Price Intelligence Dashboard",
    update_title="Loading...",
    suppress_callback_exceptions=True
)

# Set layout
app.layout = main_layout.create_layout()

# Register all callbacks
register_callbacks(app)

# Run server
if __name__ == '__main__':
    host = os.getenv('DASH_HOST', '0.0.0.0')
    port = int(os.getenv('DASH_PORT', 8050))
    debug = os.getenv('DASH_DEBUG', 'true').lower() == 'true'

    print("=" * 60)
    print("Price Intelligence Dashboard Starting...")
    print("=" * 60)
    print(f"  URL: http://localhost:{port}")
    print(f"  Debug mode: {debug}")
    print("=" * 60)

    app.run_server(host=host, port=port, debug=debug)
