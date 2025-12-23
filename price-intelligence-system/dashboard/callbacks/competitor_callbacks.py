"""
Callbacks for the Competitor Analysis tab
"""

import os
from dash import Input, Output, html
import dash_bootstrap_components as dbc
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DB_USER = os.getenv('DB_USER', 'priceuser')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'pricepass123')
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_NAME = os.getenv('DB_NAME', 'price_intelligence')
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"


def register_competitor_callbacks(app):
    """Register all callbacks for competitor analysis tab"""

    @app.callback(
        Output("chart-positioning-matrix", "figure"),
        Input("interval-component", "n_intervals")
    )
    def update_positioning_matrix(n):
        """Update competitive positioning matrix (price vs availability)"""
        try:
            engine = create_engine(DATABASE_URL)
            query = """
                SELECT
                    c.competitor_name,
                    c.market_segment,
                    AVG(fp.price_amount) as avg_price,
                    SUM(CASE WHEN fp.in_stock THEN 1 ELSE 0 END)::float /
                        COUNT(*)::float * 100 as stock_rate,
                    COUNT(DISTINCT fp.product_id) as product_count
                FROM fact_prices fp
                JOIN dim_competitors c ON fp.competitor_id = c.competitor_id
                WHERE fp.scraped_at >= NOW() - INTERVAL '7 days'
                GROUP BY c.competitor_name, c.market_segment
            """
            df = pd.read_sql(query, engine)

            if df.empty:
                return go.Figure().add_annotation(
                    text="No data available",
                    showarrow=False
                )

            # Create scatter plot
            fig = px.scatter(
                df,
                x='avg_price',
                y='stock_rate',
                size='product_count',
                color='market_segment',
                text='competitor_name',
                title='',
                labels={
                    'avg_price': 'Average Price ($)',
                    'stock_rate': 'In-Stock Rate (%)',
                    'market_segment': 'Market Segment'
                }
            )

            # Add quadrant lines
            avg_price_median = df['avg_price'].median()
            avg_stock_median = df['stock_rate'].median()

            fig.add_vline(x=avg_price_median, line_dash="dash", line_color="gray", opacity=0.5)
            fig.add_hline(y=avg_stock_median, line_dash="dash", line_color="gray", opacity=0.5)

            # Add quadrant labels
            fig.add_annotation(
                x=avg_price_median * 0.95,
                y=95,
                text="Premium & Available",
                showarrow=False,
                font=dict(color="gray", size=10),
                opacity=0.7
            )

            fig.update_traces(textposition='top center')
            fig.update_layout(
                template="plotly_white",
                hovermode='closest'
            )

            return fig
        except Exception as e:
            return go.Figure().add_annotation(text=f"Error: {str(e)}", showarrow=False)

    @app.callback(
        Output("chart-competitor-avg-price", "figure"),
        Input("interval-component", "n_intervals")
    )
    def update_competitor_avg_price(n):
        """Update average price by competitor chart"""
        try:
            engine = create_engine(DATABASE_URL)
            query = """
                SELECT
                    c.competitor_name,
                    p.category,
                    AVG(fp.price_amount) as avg_price
                FROM fact_prices fp
                JOIN dim_competitors c ON fp.competitor_id = c.competitor_id
                JOIN dim_products p ON fp.product_id = p.product_id
                WHERE fp.scraped_at >= NOW() - INTERVAL '7 days'
                  AND fp.in_stock = TRUE
                GROUP BY c.competitor_name, p.category
                ORDER BY c.competitor_name, p.category
            """
            df = pd.read_sql(query, engine)

            if df.empty:
                return go.Figure()

            fig = px.bar(
                df,
                x='competitor_name',
                y='avg_price',
                color='category',
                title='',
                barmode='group'
            )

            fig.update_layout(
                xaxis_title="Competitor",
                yaxis_title="Average Price ($)",
                template="plotly_white",
                legend_title="Category"
            )

            return fig
        except Exception as e:
            return go.Figure().add_annotation(text=f"Error: {str(e)}", showarrow=False)

    @app.callback(
        Output("chart-price-volatility", "figure"),
        Input("interval-component", "n_intervals")
    )
    def update_price_volatility(n):
        """Update price volatility chart"""
        try:
            engine = create_engine(DATABASE_URL)
            query = """
                SELECT
                    c.competitor_name,
                    STDDEV(fp.price_amount) as price_volatility,
                    COUNT(DISTINCT fp.product_id) as product_count
                FROM fact_prices fp
                JOIN dim_competitors c ON fp.competitor_id = c.competitor_id
                WHERE fp.scraped_at >= NOW() - INTERVAL '30 days'
                GROUP BY c.competitor_name
                HAVING COUNT(DISTINCT fp.product_id) > 5
                ORDER BY price_volatility DESC
            """
            df = pd.read_sql(query, engine)

            if df.empty:
                return go.Figure()

            fig = go.Figure(go.Bar(
                x=df['competitor_name'],
                y=df['price_volatility'],
                marker_color='rgb(255, 127, 14)',
                text=[f"${x:.2f}" for x in df['price_volatility']],
                textposition='auto'
            ))

            fig.update_layout(
                xaxis_title="Competitor",
                yaxis_title="Price Volatility (Std Dev)",
                template="plotly_white",
                title="Price Volatility (Last 30 Days)"
            )

            return fig
        except Exception as e:
            return go.Figure().add_annotation(text=f"Error: {str(e)}", showarrow=False)

    @app.callback(
        Output("table-map-violations", "children"),
        Input("interval-component", "n_intervals")
    )
    def update_map_violations(n):
        """Update MAP violations table"""
        try:
            engine = create_engine(DATABASE_URL)
            # This is a simplified version - in production, you'd have a MAP policy table
            query = """
                SELECT
                    p.product_name,
                    p.sku,
                    c.competitor_name,
                    fp.price_amount as current_price,
                    100.00 as map_price,  -- Placeholder
                    100.00 - fp.price_amount as violation_amount,
                    fp.scraped_at
                FROM fact_prices fp
                JOIN dim_products p ON fp.product_id = p.product_id
                JOIN dim_competitors c ON fp.competitor_id = c.competitor_id
                WHERE fp.price_amount < 100.00  -- Simplified MAP check
                  AND c.is_authorized_reseller = TRUE
                  AND fp.scraped_at >= NOW() - INTERVAL '7 days'
                  AND fp.in_stock = TRUE
                ORDER BY violation_amount DESC
                LIMIT 20
            """
            df = pd.read_sql(query, engine)

            if df.empty:
                return dbc.Alert([
                    html.I(className="fas fa-check-circle me-2"),
                    "No MAP violations detected in the last 7 days!"
                ], color="success")

            table_header = [
                html.Thead(html.Tr([
                    html.Th("Product"),
                    html.Th("SKU"),
                    html.Th("Competitor"),
                    html.Th("Current Price"),
                    html.Th("MAP Price"),
                    html.Th("Violation"),
                    html.Th("Date")
                ]))
            ]

            rows = []
            for _, row in df.iterrows():
                rows.append(html.Tr([
                    html.Td(row['product_name'][:40] + "..." if len(row['product_name']) > 40 else row['product_name']),
                    html.Td(row['sku']),
                    html.Td(row['competitor_name']),
                    html.Td(f"${row['current_price']:.2f}", className="text-danger fw-bold"),
                    html.Td(f"${row['map_price']:.2f}"),
                    html.Td(f"-${row['violation_amount']:.2f}", className="text-danger"),
                    html.Td(row['scraped_at'].strftime("%Y-%m-%d"))
                ]))

            table_body = [html.Tbody(rows)]

            return html.Div([
                dbc.Alert([
                    html.I(className="fas fa-exclamation-triangle me-2"),
                    f"Found {len(df)} potential MAP violations"
                ], color="warning", className="mb-3"),
                dbc.Table(
                    table_header + table_body,
                    striped=True,
                    bordered=True,
                    hover=True,
                    responsive=True,
                    size="sm"
                )
            ])
        except Exception as e:
            return dbc.Alert(f"Error: {str(e)}", color="danger")
