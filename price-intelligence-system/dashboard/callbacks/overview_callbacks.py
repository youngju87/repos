"""
Callbacks for the Overview tab
"""

import os
from dash import Input, Output, html
import dash_bootstrap_components as dbc
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
from datetime import datetime, timedelta
from sqlalchemy import create_engine, func, text
from dotenv import load_dotenv

from warehouse.models import FactPrice, DimProduct, DimCompetitor

load_dotenv()

# Database connection
DB_USER = os.getenv('DB_USER', 'priceuser')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'pricepass123')
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_NAME = os.getenv('DB_NAME', 'price_intelligence')
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"


def get_db_connection():
    """Create database connection"""
    return create_engine(DATABASE_URL)


def register_overview_callbacks(app):
    """Register all callbacks for overview tab"""

    @app.callback(
        Output("stats-total-products", "children"),
        Input("interval-component", "n_intervals")
    )
    def update_total_products(n):
        """Update total products statistic"""
        try:
            engine = get_db_connection()
            with engine.connect() as conn:
                result = conn.execute(text("""
                    SELECT COUNT(DISTINCT product_id) FROM dim_products WHERE is_active = TRUE
                """))
                count = result.scalar()

            return dbc.Card([
                dbc.CardBody([
                    html.Div([
                        html.Div([
                            html.I(className="fas fa-box fa-2x text-primary"),
                        ], className="me-3"),
                        html.Div([
                            html.H6("Total Products", className="text-muted mb-1"),
                            html.H3(f"{count:,}", className="mb-0"),
                            html.Small("Active products", className="text-muted")
                        ])
                    ], className="d-flex align-items-center")
                ])
            ])
        except Exception as e:
            return dbc.Alert(f"Error: {str(e)}", color="danger")

    @app.callback(
        Output("stats-active-competitors", "children"),
        Input("interval-component", "n_intervals")
    )
    def update_active_competitors(n):
        """Update active competitors statistic"""
        try:
            engine = get_db_connection()
            with engine.connect() as conn:
                result = conn.execute(text("""
                    SELECT COUNT(*) FROM dim_competitors WHERE scraper_enabled = TRUE
                """))
                count = result.scalar()

            return dbc.Card([
                dbc.CardBody([
                    html.Div([
                        html.Div([
                            html.I(className="fas fa-store fa-2x text-success"),
                        ], className="me-3"),
                        html.Div([
                            html.H6("Active Competitors", className="text-muted mb-1"),
                            html.H3(f"{count}", className="mb-0"),
                            html.Small("Being monitored", className="text-muted")
                        ])
                    ], className="d-flex align-items-center")
                ])
            ])
        except Exception as e:
            return dbc.Alert(f"Error: {str(e)}", color="danger")

    @app.callback(
        Output("stats-price-changes", "children"),
        Input("interval-component", "n_intervals")
    )
    def update_price_changes(n):
        """Update price changes statistic"""
        try:
            engine = get_db_connection()
            with engine.connect() as conn:
                result = conn.execute(text("""
                    SELECT COUNT(*) FROM vw_price_changes
                    WHERE current_date >= NOW() - INTERVAL '7 days'
                """))
                count = result.scalar() or 0

            return dbc.Card([
                dbc.CardBody([
                    html.Div([
                        html.Div([
                            html.I(className="fas fa-exchange-alt fa-2x text-warning"),
                        ], className="me-3"),
                        html.Div([
                            html.H6("Price Changes", className="text-muted mb-1"),
                            html.H3(f"{count:,}", className="mb-0"),
                            html.Small("Last 7 days", className="text-muted")
                        ])
                    ], className="d-flex align-items-center")
                ])
            ])
        except Exception as e:
            return dbc.Alert(f"Error: {str(e)}", color="danger")

    @app.callback(
        Output("stats-avg-price", "children"),
        Input("interval-component", "n_intervals")
    )
    def update_avg_price(n):
        """Update average price statistic"""
        try:
            engine = get_db_connection()
            with engine.connect() as conn:
                result = conn.execute(text("""
                    SELECT AVG(price_amount)
                    FROM vw_latest_prices
                    WHERE in_stock = TRUE
                """))
                avg_price = result.scalar()

            return dbc.Card([
                dbc.CardBody([
                    html.Div([
                        html.Div([
                            html.I(className="fas fa-dollar-sign fa-2x text-info"),
                        ], className="me-3"),
                        html.Div([
                            html.H6("Avg Market Price", className="text-muted mb-1"),
                            html.H3(f"${avg_price:.2f}", className="mb-0"),
                            html.Small("Across all products", className="text-muted")
                        ])
                    ], className="d-flex align-items-center")
                ])
            ])
        except Exception as e:
            return dbc.Alert(f"Error: {str(e)}", color="danger")

    @app.callback(
        Output("chart-price-distribution", "figure"),
        Input("interval-component", "n_intervals")
    )
    def update_price_distribution(n):
        """Update price distribution chart"""
        try:
            engine = get_db_connection()
            query = """
                SELECT
                    c.competitor_name,
                    AVG(fp.price_amount) as avg_price,
                    MIN(fp.price_amount) as min_price,
                    MAX(fp.price_amount) as max_price
                FROM fact_prices fp
                JOIN dim_competitors c ON fp.competitor_id = c.competitor_id
                WHERE fp.scraped_at >= NOW() - INTERVAL '7 days'
                  AND fp.in_stock = TRUE
                GROUP BY c.competitor_name
                ORDER BY avg_price
            """
            df = pd.read_sql(query, engine)

            fig = go.Figure()

            # Add bars
            fig.add_trace(go.Bar(
                x=df['competitor_name'],
                y=df['avg_price'],
                name='Average Price',
                marker_color='rgb(26, 118, 255)',
                error_y=dict(
                    type='data',
                    symmetric=False,
                    array=df['max_price'] - df['avg_price'],
                    arrayminus=df['avg_price'] - df['min_price']
                )
            ))

            fig.update_layout(
                xaxis_title="Competitor",
                yaxis_title="Price ($)",
                hovermode='x unified',
                template="plotly_white",
                height=400
            )

            return fig
        except Exception as e:
            return go.Figure().add_annotation(text=f"Error: {str(e)}", showarrow=False)

    @app.callback(
        Output("chart-category-breakdown", "figure"),
        Input("interval-component", "n_intervals")
    )
    def update_category_breakdown(n):
        """Update category breakdown chart"""
        try:
            engine = get_db_connection()
            query = """
                SELECT
                    p.category,
                    COUNT(DISTINCT p.product_id) as product_count
                FROM dim_products p
                WHERE p.is_active = TRUE
                GROUP BY p.category
                ORDER BY product_count DESC
            """
            df = pd.read_sql(query, engine)

            fig = px.pie(
                df,
                values='product_count',
                names='category',
                title='',
                hole=0.4
            )

            fig.update_layout(
                template="plotly_white",
                height=400
            )

            return fig
        except Exception as e:
            return go.Figure().add_annotation(text=f"Error: {str(e)}", showarrow=False)

    @app.callback(
        Output("table-recent-changes", "children"),
        Input("interval-component", "n_intervals")
    )
    def update_recent_changes(n):
        """Update recent price changes table"""
        try:
            engine = get_db_connection()
            query = """
                SELECT
                    p.product_name,
                    c.competitor_name,
                    pc.previous_price,
                    pc.current_price,
                    pc.price_change,
                    pc.price_change_pct,
                    pc.current_date
                FROM vw_price_changes pc
                JOIN dim_products p ON pc.product_id = p.product_id
                JOIN dim_competitors c ON pc.competitor_id = c.competitor_id
                WHERE pc.current_date >= NOW() - INTERVAL '7 days'
                ORDER BY ABS(pc.price_change_pct) DESC
                LIMIT 10
            """
            df = pd.read_sql(query, engine)

            if df.empty:
                return html.P("No price changes in the last 7 days", className="text-muted")

            # Format the table
            table_header = [
                html.Thead(html.Tr([
                    html.Th("Product"),
                    html.Th("Competitor"),
                    html.Th("Previous"),
                    html.Th("Current"),
                    html.Th("Change"),
                    html.Th("Date")
                ]))
            ]

            rows = []
            for _, row in df.iterrows():
                change_color = "success" if row['price_change'] < 0 else "danger"
                change_icon = "arrow-down" if row['price_change'] < 0 else "arrow-up"

                rows.append(html.Tr([
                    html.Td(row['product_name'][:40] + "..." if len(row['product_name']) > 40 else row['product_name']),
                    html.Td(row['competitor_name']),
                    html.Td(f"${row['previous_price']:.2f}"),
                    html.Td(f"${row['current_price']:.2f}"),
                    html.Td([
                        html.I(className=f"fas fa-{change_icon} me-1"),
                        f"{row['price_change_pct']:.1f}%"
                    ], className=f"text-{change_color}"),
                    html.Td(row['current_date'].strftime("%Y-%m-%d"))
                ]))

            table_body = [html.Tbody(rows)]

            return dbc.Table(
                table_header + table_body,
                striped=True,
                bordered=True,
                hover=True,
                responsive=True,
                size="sm"
            )
        except Exception as e:
            return dbc.Alert(f"Error: {str(e)}", color="danger")
