"""
Server Log Analytics Dashboard
Interactive dashboard built with Plotly Dash
"""

import sys
from pathlib import Path
from datetime import datetime, timedelta

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

import dash
from dash import dcc, html, Input, Output, callback
import dash_bootstrap_components as dbc
import plotly.graph_objs as go
import plotly.express as px
from clickhouse_driver import Client

# Initialize Dash app
app = dash.Dash(
    __name__,
    external_stylesheets=[dbc.themes.BOOTSTRAP],
    title="Server Log Analytics"
)

# ClickHouse connection
def get_client():
    return Client(host='localhost', port=9000, database='logs')


# Layout
app.layout = dbc.Container([
    dbc.Row([
        dbc.Col([
            html.H1("📊 Server Log Analytics Dashboard", className="text-primary mb-4"),
            html.P("Real-time insights from your server logs", className="lead")
        ])
    ]),

    # Date range selector
    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardBody([
                    html.Label("Time Range:", className="fw-bold"),
                    dcc.Dropdown(
                        id='time-range',
                        options=[
                            {'label': 'Last 24 Hours', 'value': 1},
                            {'label': 'Last 7 Days', 'value': 7},
                            {'label': 'Last 30 Days', 'value': 30},
                            {'label': 'Last 90 Days', 'value': 90}
                        ],
                        value=7,
                        clearable=False
                    )
                ])
            ], className="mb-4")
        ], width=3)
    ]),

    # KPI Cards
    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardBody([
                    html.H4("Total Requests", className="card-title"),
                    html.H2(id="kpi-total-requests", className="text-primary"),
                    html.P(id="kpi-requests-change", className="text-muted mb-0")
                ])
            ])
        ], width=3),

        dbc.Col([
            dbc.Card([
                dbc.CardBody([
                    html.H4("Avg Latency", className="card-title"),
                    html.H2(id="kpi-avg-latency", className="text-success"),
                    html.P(id="kpi-latency-change", className="text-muted mb-0")
                ])
            ])
        ], width=3),

        dbc.Col([
            dbc.Card([
                dbc.CardBody([
                    html.H4("Error Rate", className="card-title"),
                    html.H2(id="kpi-error-rate", className="text-danger"),
                    html.P(id="kpi-error-change", className="text-muted mb-0")
                ])
            ])
        ], width=3),

        dbc.Col([
            dbc.Card([
                dbc.CardBody([
                    html.H4("Bot Traffic", className="card-title"),
                    html.H2(id="kpi-bot-traffic", className="text-warning"),
                    html.P(id="kpi-bot-change", className="text-muted mb-0")
                ])
            ])
        ], width=3)
    ], className="mb-4"),

    # Charts Row 1
    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardHeader("Traffic Over Time"),
                dbc.CardBody([
                    dcc.Graph(id='traffic-timeline')
                ])
            ])
        ], width=8),

        dbc.Col([
            dbc.Card([
                dbc.CardHeader("Status Code Distribution"),
                dbc.CardBody([
                    dcc.Graph(id='status-pie')
                ])
            ])
        ], width=4)
    ], className="mb-4"),

    # Charts Row 2
    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardHeader("Top 10 Pages by Traffic"),
                dbc.CardBody([
                    dcc.Graph(id='top-pages-bar')
                ])
            ])
        ], width=6),

        dbc.Col([
            dbc.Card([
                dbc.CardHeader("Latency Distribution"),
                dbc.CardBody([
                    dcc.Graph(id='latency-histogram')
                ])
            ])
        ], width=6)
    ], className="mb-4"),

    # Charts Row 3
    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardHeader("Bot vs Human Traffic"),
                dbc.CardBody([
                    dcc.Graph(id='bot-timeline')
                ])
            ])
        ], width=6),

        dbc.Col([
            dbc.Card([
                dbc.CardHeader("Top Bot Types"),
                dbc.CardBody([
                    dcc.Graph(id='bot-types-bar')
                ])
            ])
        ], width=6)
    ], className="mb-4"),

    # Auto-refresh
    dcc.Interval(
        id='interval-component',
        interval=30*1000,  # Refresh every 30 seconds
        n_intervals=0
    )

], fluid=True)


# Callbacks
@callback(
    [
        Output('kpi-total-requests', 'children'),
        Output('kpi-requests-change', 'children'),
        Output('kpi-avg-latency', 'children'),
        Output('kpi-latency-change', 'children'),
        Output('kpi-error-rate', 'children'),
        Output('kpi-error-change', 'children'),
        Output('kpi-bot-traffic', 'children'),
        Output('kpi-bot-change', 'children')
    ],
    [Input('time-range', 'value'), Input('interval-component', 'n_intervals')]
)
def update_kpis(days, n):
    """Update KPI cards"""
    try:
        client = get_client()

        query = f"""
        SELECT
            count() as total_requests,
            avg(response_time_ms) as avg_latency,
            countIf(status_code >= 400) as errors,
            countIf(is_bot = 1) as bot_requests
        FROM fact_requests
        WHERE date >= today() - {days}
        """

        result = client.execute(query)

        if result:
            row = result[0]
            total = row[0]
            avg_lat = row[1]
            errors = row[2]
            bots = row[3]

            error_rate = (errors / total * 100) if total > 0 else 0
            bot_pct = (bots / total * 100) if total > 0 else 0

            return (
                f"{total:,}",
                f"Last {days} days",
                f"{avg_lat:.0f}ms",
                "Average response time",
                f"{error_rate:.2f}%",
                f"{errors:,} errors",
                f"{bot_pct:.1f}%",
                f"{bots:,} bot requests"
            )
        else:
            return "0", "No data", "0ms", "", "0%", "", "0%", ""

    except Exception as e:
        return "Error", str(e), "Error", "", "Error", "", "Error", ""


@callback(
    Output('traffic-timeline', 'figure'),
    [Input('time-range', 'value'), Input('interval-component', 'n_intervals')]
)
def update_traffic_timeline(days, n):
    """Update traffic timeline chart"""
    try:
        client = get_client()

        query = f"""
        SELECT
            toStartOfHour(timestamp) as hour,
            count() as requests,
            avg(response_time_ms) as avg_latency
        FROM fact_requests
        WHERE date >= today() - {days}
        GROUP BY hour
        ORDER BY hour
        """

        result = client.execute(query)

        if not result:
            return go.Figure()

        hours = [row[0] for row in result]
        requests = [row[1] for row in result]
        latencies = [row[2] for row in result]

        fig = go.Figure()

        fig.add_trace(go.Scatter(
            x=hours,
            y=requests,
            name='Requests',
            line=dict(color='#2E86AB', width=2),
            yaxis='y'
        ))

        fig.add_trace(go.Scatter(
            x=hours,
            y=latencies,
            name='Avg Latency (ms)',
            line=dict(color='#F24236', width=2),
            yaxis='y2'
        ))

        fig.update_layout(
            xaxis=dict(title='Time'),
            yaxis=dict(title='Requests', side='left'),
            yaxis2=dict(title='Latency (ms)', side='right', overlaying='y'),
            hovermode='x unified',
            height=350
        )

        return fig

    except Exception as e:
        return go.Figure().add_annotation(text=f"Error: {e}", showarrow=False)


@callback(
    Output('status-pie', 'figure'),
    [Input('time-range', 'value'), Input('interval-component', 'n_intervals')]
)
def update_status_pie(days, n):
    """Update status code pie chart"""
    try:
        client = get_client()

        query = f"""
        SELECT
            status_code,
            count() as count
        FROM fact_requests
        WHERE date >= today() - {days}
        GROUP BY status_code
        ORDER BY count DESC
        """

        result = client.execute(query)

        if not result:
            return go.Figure()

        status_codes = [str(row[0]) for row in result]
        counts = [row[1] for row in result]

        # Color mapping
        colors = {
            '200': '#28a745',
            '304': '#17a2b8',
            '404': '#ffc107',
            '500': '#dc3545',
            '502': '#dc3545',
            '503': '#dc3545'
        }

        fig = px.pie(
            values=counts,
            names=status_codes,
            color=status_codes,
            color_discrete_map=colors,
            hole=0.3
        )

        fig.update_layout(height=350)

        return fig

    except Exception as e:
        return go.Figure().add_annotation(text=f"Error: {e}", showarrow=False)


@callback(
    Output('top-pages-bar', 'figure'),
    [Input('time-range', 'value'), Input('interval-component', 'n_intervals')]
)
def update_top_pages(days, n):
    """Update top pages bar chart"""
    try:
        client = get_client()

        query = f"""
        SELECT
            path,
            count() as requests
        FROM fact_requests
        WHERE date >= today() - {days}
        GROUP BY path
        ORDER BY requests DESC
        LIMIT 10
        """

        result = client.execute(query)

        if not result:
            return go.Figure()

        paths = [row[0] for row in result]
        requests = [row[1] for row in result]

        fig = px.bar(
            x=requests,
            y=paths,
            orientation='h',
            labels={'x': 'Requests', 'y': 'Path'}
        )

        fig.update_layout(
            yaxis={'categoryorder': 'total ascending'},
            height=350
        )

        return fig

    except Exception as e:
        return go.Figure().add_annotation(text=f"Error: {e}", showarrow=False)


@callback(
    Output('latency-histogram', 'figure'),
    [Input('time-range', 'value'), Input('interval-component', 'n_intervals')]
)
def update_latency_histogram(days, n):
    """Update latency histogram"""
    try:
        client = get_client()

        query = f"""
        SELECT response_time_ms
        FROM fact_requests
        WHERE date >= today() - {days}
          AND response_time_ms > 0
          AND response_time_ms < 5000
        LIMIT 10000
        """

        result = client.execute(query)

        if not result:
            return go.Figure()

        latencies = [row[0] for row in result]

        fig = px.histogram(
            x=latencies,
            nbins=50,
            labels={'x': 'Response Time (ms)', 'y': 'Count'}
        )

        fig.update_layout(height=350)

        return fig

    except Exception as e:
        return go.Figure().add_annotation(text=f"Error: {e}", showarrow=False)


@callback(
    Output('bot-timeline', 'figure'),
    [Input('time-range', 'value'), Input('interval-component', 'n_intervals')]
)
def update_bot_timeline(days, n):
    """Update bot vs human timeline"""
    try:
        client = get_client()

        query = f"""
        SELECT
            toStartOfHour(timestamp) as hour,
            countIf(is_bot = 0) as human,
            countIf(is_bot = 1) as bot
        FROM fact_requests
        WHERE date >= today() - {days}
        GROUP BY hour
        ORDER BY hour
        """

        result = client.execute(query)

        if not result:
            return go.Figure()

        hours = [row[0] for row in result]
        human = [row[1] for row in result]
        bot = [row[2] for row in result]

        fig = go.Figure()

        fig.add_trace(go.Scatter(
            x=hours,
            y=human,
            name='Human',
            fill='tonexty',
            line=dict(color='#2E86AB')
        ))

        fig.add_trace(go.Scatter(
            x=hours,
            y=bot,
            name='Bot',
            fill='tonexty',
            line=dict(color='#F24236')
        ))

        fig.update_layout(
            xaxis=dict(title='Time'),
            yaxis=dict(title='Requests'),
            hovermode='x unified',
            height=350
        )

        return fig

    except Exception as e:
        return go.Figure().add_annotation(text=f"Error: {e}", showarrow=False)


@callback(
    Output('bot-types-bar', 'figure'),
    [Input('time-range', 'value'), Input('interval-component', 'n_intervals')]
)
def update_bot_types(days, n):
    """Update bot types bar chart"""
    try:
        client = get_client()

        query = f"""
        SELECT
            bot_type,
            count() as requests
        FROM fact_requests
        WHERE date >= today() - {days}
          AND is_bot = 1
          AND bot_type != ''
        GROUP BY bot_type
        ORDER BY requests DESC
        LIMIT 10
        """

        result = client.execute(query)

        if not result:
            return go.Figure()

        bot_types = [row[0] for row in result]
        requests = [row[1] for row in result]

        fig = px.bar(
            x=requests,
            y=bot_types,
            orientation='h',
            labels={'x': 'Requests', 'y': 'Bot Type'}
        )

        fig.update_layout(
            yaxis={'categoryorder': 'total ascending'},
            height=350
        )

        return fig

    except Exception as e:
        return go.Figure().add_annotation(text=f"Error: {e}", showarrow=False)


if __name__ == '__main__':
    print("\n" + "="*60)
    print("Server Log Analytics Dashboard")
    print("="*60)
    print("\nStarting dashboard on http://localhost:8050")
    print("\nMake sure ClickHouse is running and data is ingested!")
    print("\nPress Ctrl+C to stop\n")

    app.run_server(debug=True, host='0.0.0.0', port=8050)
