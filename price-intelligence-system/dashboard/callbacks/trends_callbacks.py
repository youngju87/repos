"""
Callbacks for the Price Trends tab
"""

import os
from dash import Input, Output, html
import dash_bootstrap_components as dbc
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
from datetime import datetime, timedelta
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DB_USER = os.getenv('DB_USER', 'priceuser')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'pricepass123')
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_NAME = os.getenv('DB_NAME', 'price_intelligence')
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"


def register_trends_callbacks(app):
    """Register all callbacks for trends tab"""

    @app.callback(
        Output("dropdown-product-trends", "options"),
        Input("interval-component", "n_intervals")
    )
    def update_product_dropdown(n):
        """Populate product dropdown"""
        try:
            engine = create_engine(DATABASE_URL)
            query = """
                SELECT product_id, product_name, sku
                FROM dim_products
                WHERE is_active = TRUE
                ORDER BY product_name
            """
            df = pd.read_sql(query, engine)

            return [
                {
                    "label": f"{row['product_name']} ({row['sku']})",
                    "value": row['product_id']
                }
                for _, row in df.iterrows()
            ]
        except:
            return []

    @app.callback(
        [Output("dropdown-product-trends", "value"),
         Output("date-range-trends", "start_date"),
         Output("date-range-trends", "end_date")],
        Input("dropdown-product-trends", "options")
    )
    def set_default_values(options):
        """Set default product and date range"""
        default_product = options[0]["value"] if options else None
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=30)
        return default_product, start_date, end_date

    @app.callback(
        Output("chart-price-trends", "figure"),
        [Input("dropdown-product-trends", "value"),
         Input("date-range-trends", "start_date"),
         Input("date-range-trends", "end_date")]
    )
    def update_price_trends(product_id, start_date, end_date):
        """Update price trends chart"""
        if not product_id:
            return go.Figure().add_annotation(
                text="Please select a product",
                showarrow=False
            )

        try:
            engine = create_engine(DATABASE_URL)
            query = """
                SELECT
                    fp.scraped_at::date as date,
                    c.competitor_name,
                    AVG(fp.price_amount) as avg_price
                FROM fact_prices fp
                JOIN dim_competitors c ON fp.competitor_id = c.competitor_id
                WHERE fp.product_id = :product_id
                  AND fp.scraped_at::date BETWEEN :start_date AND :end_date
                  AND fp.in_stock = TRUE
                GROUP BY fp.scraped_at::date, c.competitor_name
                ORDER BY date, c.competitor_name
            """
            df = pd.read_sql(
                query,
                engine,
                params={
                    "product_id": product_id,
                    "start_date": start_date,
                    "end_date": end_date
                }
            )

            if df.empty:
                return go.Figure().add_annotation(
                    text="No data available for selected period",
                    showarrow=False
                )

            fig = px.line(
                df,
                x='date',
                y='avg_price',
                color='competitor_name',
                title='',
                markers=True
            )

            fig.update_layout(
                xaxis_title="Date",
                yaxis_title="Price ($)",
                hovermode='x unified',
                template="plotly_white",
                legend_title="Competitor"
            )

            return fig
        except Exception as e:
            return go.Figure().add_annotation(
                text=f"Error: {str(e)}",
                showarrow=False
            )

    @app.callback(
        Output("price-statistics-table", "children"),
        [Input("dropdown-product-trends", "value"),
         Input("date-range-trends", "start_date"),
         Input("date-range-trends", "end_date")]
    )
    def update_price_statistics(product_id, start_date, end_date):
        """Update price statistics table"""
        if not product_id:
            return html.P("Select a product to view statistics", className="text-muted")

        try:
            engine = create_engine(DATABASE_URL)
            query = """
                SELECT
                    c.competitor_name,
                    MIN(fp.price_amount) as min_price,
                    AVG(fp.price_amount) as avg_price,
                    MAX(fp.price_amount) as max_price,
                    STDDEV(fp.price_amount) as price_stddev
                FROM fact_prices fp
                JOIN dim_competitors c ON fp.competitor_id = c.competitor_id
                WHERE fp.product_id = :product_id
                  AND fp.scraped_at::date BETWEEN :start_date AND :end_date
                GROUP BY c.competitor_name
                ORDER BY avg_price
            """
            df = pd.read_sql(
                query,
                engine,
                params={
                    "product_id": product_id,
                    "start_date": start_date,
                    "end_date": end_date
                }
            )

            if df.empty:
                return html.P("No data available", className="text-muted")

            table_header = [
                html.Thead(html.Tr([
                    html.Th("Competitor"),
                    html.Th("Min"),
                    html.Th("Avg"),
                    html.Th("Max"),
                    html.Th("Volatility")
                ]))
            ]

            rows = []
            for _, row in df.iterrows():
                rows.append(html.Tr([
                    html.Td(row['competitor_name']),
                    html.Td(f"${row['min_price']:.2f}"),
                    html.Td(f"${row['avg_price']:.2f}", className="fw-bold"),
                    html.Td(f"${row['max_price']:.2f}"),
                    html.Td(f"${row['price_stddev']:.2f}" if row['price_stddev'] else "N/A")
                ]))

            table_body = [html.Tbody(rows)]

            return dbc.Table(
                table_header + table_body,
                striped=True,
                bordered=True,
                hover=True,
                size="sm"
            )
        except Exception as e:
            return dbc.Alert(f"Error: {str(e)}", color="danger")

    @app.callback(
        Output("chart-stock-availability", "figure"),
        [Input("dropdown-product-trends", "value"),
         Input("date-range-trends", "start_date"),
         Input("date-range-trends", "end_date")]
    )
    def update_stock_availability(product_id, start_date, end_date):
        """Update stock availability chart"""
        if not product_id:
            return go.Figure()

        try:
            engine = create_engine(DATABASE_URL)
            query = """
                SELECT
                    c.competitor_name,
                    SUM(CASE WHEN fp.in_stock THEN 1 ELSE 0 END)::float /
                        COUNT(*)::float * 100 as stock_rate
                FROM fact_prices fp
                JOIN dim_competitors c ON fp.competitor_id = c.competitor_id
                WHERE fp.product_id = :product_id
                  AND fp.scraped_at::date BETWEEN :start_date AND :end_date
                GROUP BY c.competitor_name
                ORDER BY stock_rate DESC
            """
            df = pd.read_sql(
                query,
                engine,
                params={
                    "product_id": product_id,
                    "start_date": start_date,
                    "end_date": end_date
                }
            )

            if df.empty:
                return go.Figure()

            fig = go.Figure(go.Bar(
                x=df['competitor_name'],
                y=df['stock_rate'],
                marker_color=['green' if x >= 95 else 'orange' if x >= 80 else 'red'
                             for x in df['stock_rate']],
                text=[f"{x:.1f}%" for x in df['stock_rate']],
                textposition='auto'
            ))

            fig.update_layout(
                xaxis_title="Competitor",
                yaxis_title="In-Stock Rate (%)",
                yaxis_range=[0, 100],
                template="plotly_white",
                showlegend=False
            )

            return fig
        except Exception as e:
            return go.Figure().add_annotation(text=f"Error: {str(e)}", showarrow=False)
