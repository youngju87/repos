"""
Attribution Modeling Dashboard - Interactive visualization with Plotly Dash
"""

import sys
from pathlib import Path
import pickle

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent))

import dash
from dash import dcc, html, Input, Output, callback
import dash_bootstrap_components as dbc
import plotly.graph_objs as go
import plotly.express as px
from models.comparison_engine import ComparisonEngine

# Initialize Dash app
app = dash.Dash(
    __name__,
    external_stylesheets=[dbc.themes.BOOTSTRAP],
    title="Attribution Modeling Lab"
)

# Load data
try:
    with open('attribution_results.pkl', 'rb') as f:
        data = pickle.load(f)

    journeys = data['journeys']
    results = data['results']
    comparison = data['comparison']

    # Create comparison engine for additional analysis
    comp_engine = ComparisonEngine()
    comp_engine.load_results(journeys, results)

    DATA_LOADED = True
except FileNotFoundError:
    DATA_LOADED = False
    print("Warning: No data found. Run 'python attribution_cli.py analyze' first.")

# Layout
app.layout = dbc.Container([
    dbc.Row([
        dbc.Col([
            html.H1("📊 Attribution Modeling Lab", className="text-primary mb-2"),
            html.P("Compare Multi-Touch Attribution Models", className="lead text-muted")
        ])
    ], className="mb-4"),

    # KPI Cards
    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardBody([
                    html.H6("Total Revenue", className="card-subtitle text-muted mb-2"),
                    html.H3(id="kpi-revenue", className="text-success mb-0")
                ])
            ])
        ], width=3),

        dbc.Col([
            dbc.Card([
                dbc.CardBody([
                    html.H6("Conversions", className="card-subtitle text-muted mb-2"),
                    html.H3(id="kpi-conversions", className="text-primary mb-0")
                ])
            ])
        ], width=3),

        dbc.Col([
            dbc.Card([
                dbc.CardBody([
                    html.H6("Avg Journey Length", className="card-subtitle text-muted mb-2"),
                    html.H3(id="kpi-journey-length", className="text-info mb-0")
                ])
            ])
        ], width=3),

        dbc.Col([
            dbc.Card([
                dbc.CardBody([
                    html.H6("Model Agreement", className="card-subtitle text-muted mb-2"),
                    html.H3(id="kpi-agreement", className="text-warning mb-0")
                ])
            ])
        ], width=3)
    ], className="mb-4"),

    # Model Selector
    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardBody([
                    html.Label("Select Attribution Models to Compare:", className="fw-bold mb-2"),
                    dcc.Dropdown(
                        id='model-selector',
                        options=[
                            {'label': 'Last-Touch', 'value': 'Last-Touch'},
                            {'label': 'First-Touch', 'value': 'First-Touch'},
                            {'label': 'Linear', 'value': 'Linear'},
                            {'label': 'Time-Decay', 'value': 'Time-Decay'},
                            {'label': 'Position-Based', 'value': 'Position-Based'},
                            {'label': 'Data-Driven', 'value': 'Data-Driven'}
                        ],
                        value=['Last-Touch', 'Data-Driven', 'Linear'],
                        multi=True
                    )
                ])
            ])
        ])
    ], className="mb-4"),

    # Charts Row 1
    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardHeader("Revenue Attribution by Channel"),
                dbc.CardBody([
                    dcc.Graph(id='attribution-comparison-bar')
                ])
            ])
        ], width=12)
    ], className="mb-4"),

    # Charts Row 2
    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardHeader("ROAS by Channel"),
                dbc.CardBody([
                    dcc.Graph(id='roas-chart')
                ])
            ])
        ], width=6),

        dbc.Col([
            dbc.Card([
                dbc.CardHeader("Model Agreement Heatmap"),
                dbc.CardBody([
                    dcc.Graph(id='agreement-heatmap')
                ])
            ])
        ], width=6)
    ], className="mb-4"),

    # Charts Row 3
    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardHeader("Channel Cost vs Revenue"),
                dbc.CardBody([
                    dcc.Graph(id='cost-revenue-scatter')
                ])
            ])
        ], width=6),

        dbc.Col([
            dbc.Card([
                dbc.CardHeader("Journey Length Distribution"),
                dbc.CardBody([
                    dcc.Graph(id='journey-histogram')
                ])
            ])
        ], width=6)
    ], className="mb-4"),

    # Budget Recommendations
    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardHeader("Budget Recommendations"),
                dbc.CardBody([
                    html.Div(id='recommendations-list')
                ])
            ])
        ])
    ], className="mb-4")

], fluid=True)


# Callbacks
if DATA_LOADED:

    @callback(
        [
            Output('kpi-revenue', 'children'),
            Output('kpi-conversions', 'children'),
            Output('kpi-journey-length', 'children'),
            Output('kpi-agreement', 'children')
        ],
        [Input('model-selector', 'value')]
    )
    def update_kpis(selected_models):
        """Update KPI cards"""
        converted = [j for j in journeys if j.converted]
        total_revenue = sum(j.revenue for j in converted)
        avg_length = sum(j.touchpoint_count for j in journeys) / len(journeys)
        agreement = comparison.get_model_agreement_score()

        return (
            f"${total_revenue:,.0f}",
            f"{len(converted):,}",
            f"{avg_length:.1f} touches",
            f"{agreement:.0%}"
        )


    @callback(
        Output('attribution-comparison-bar', 'figure'),
        [Input('model-selector', 'value')]
    )
    def update_attribution_bar(selected_models):
        """Update attribution comparison bar chart"""
        if not selected_models:
            return go.Figure()

        # Get all channels
        all_channels = set()
        for model in selected_models:
            if model in comparison.channel_performance:
                all_channels.update(comparison.channel_performance[model].keys())

        # Prepare data
        data = []

        for model in selected_models:
            perf_dict = comparison.channel_performance[model]

            revenues = []
            channel_names = []

            for channel in sorted(all_channels, key=lambda c: c.value):
                if channel in perf_dict:
                    revenues.append(perf_dict[channel].attributed_revenue)
                    channel_names.append(channel.value)

            data.append(go.Bar(
                x=channel_names,
                y=revenues,
                name=model
            ))

        fig = go.Figure(data=data)

        fig.update_layout(
            barmode='group',
            xaxis={'title': 'Channel'},
            yaxis={'title': 'Attributed Revenue ($)'},
            hovermode='x unified',
            height=400
        )

        return fig


    @callback(
        Output('roas-chart', 'figure'),
        [Input('model-selector', 'value')]
    )
    def update_roas_chart(selected_models):
        """Update ROAS chart"""
        if not selected_models or len(selected_models) == 0:
            return go.Figure()

        # Use first selected model
        model = selected_models[0]
        perf_dict = comparison.channel_performance[model]

        # Prepare data
        channels = []
        roas_values = []

        for channel, perf in sorted(perf_dict.items(), key=lambda x: x[1].roas, reverse=True):
            channels.append(channel.value)
            roas_values.append(perf.roas)

        fig = go.Figure([
            go.Bar(
                x=channels,
                y=roas_values,
                marker=dict(
                    color=roas_values,
                    colorscale='RdYlGn',
                    showscale=True,
                    colorbar=dict(title="ROAS")
                )
            )
        ])

        fig.update_layout(
            xaxis={'title': 'Channel'},
            yaxis={'title': 'ROAS (Return on Ad Spend)'},
            height=400
        )

        # Add reference line at 1.0 (break-even)
        fig.add_hline(y=1.0, line_dash="dash", line_color="red", annotation_text="Break-even")

        return fig


    @callback(
        Output('agreement-heatmap', 'figure'),
        [Input('model-selector', 'value')]
    )
    def update_agreement_heatmap(selected_models):
        """Update model agreement heatmap"""
        # Get agreement matrix
        agreement_matrix = comp_engine.get_model_agreement_matrix()

        # Filter to selected models
        if selected_models:
            models = selected_models
        else:
            models = comparison.models

        # Build matrix
        matrix = []
        for model1 in models:
            row = []
            for model2 in models:
                row.append(agreement_matrix[model1][model2])
            matrix.append(row)

        fig = go.Figure(data=go.Heatmap(
            z=matrix,
            x=models,
            y=models,
            colorscale='RdYlGn',
            text=[[f"{val:.2f}" for val in row] for row in matrix],
            texttemplate="%{text}",
            textfont={"size": 10},
            colorbar=dict(title="Agreement")
        ))

        fig.update_layout(
            xaxis={'title': ''},
            yaxis={'title': ''},
            height=400
        )

        return fig


    @callback(
        Output('cost-revenue-scatter', 'figure'),
        [Input('model-selector', 'value')]
    )
    def update_cost_revenue_scatter(selected_models):
        """Update cost vs revenue scatter plot"""
        if not selected_models or len(selected_models) == 0:
            return go.Figure()

        # Use first selected model
        model = selected_models[0]
        perf_dict = comparison.channel_performance[model]

        # Prepare data
        channels = []
        costs = []
        revenues = []
        sizes = []

        for channel, perf in perf_dict.items():
            channels.append(channel.value)
            costs.append(perf.total_cost)
            revenues.append(perf.attributed_revenue)
            sizes.append(perf.touchpoint_count / 10)  # Scale for visibility

        fig = go.Figure([
            go.Scatter(
                x=costs,
                y=revenues,
                mode='markers+text',
                marker=dict(
                    size=sizes,
                    color=revenues,
                    colorscale='Viridis',
                    showscale=True,
                    colorbar=dict(title="Revenue")
                ),
                text=channels,
                textposition="top center"
            )
        ])

        # Add diagonal line (break-even)
        max_val = max(max(costs) if costs else 0, max(revenues) if revenues else 0)
        fig.add_trace(go.Scatter(
            x=[0, max_val],
            y=[0, max_val],
            mode='lines',
            line=dict(dash='dash', color='red'),
            name='Break-even',
            showlegend=True
        ))

        fig.update_layout(
            xaxis={'title': 'Cost ($)'},
            yaxis={'title': 'Attributed Revenue ($)'},
            height=400
        )

        return fig


    @callback(
        Output('journey-histogram', 'figure'),
        [Input('model-selector', 'value')]
    )
    def update_journey_histogram(selected_models):
        """Update journey length histogram"""
        # Get journey lengths
        lengths = [j.touchpoint_count for j in journeys if j.converted]

        fig = px.histogram(
            x=lengths,
            nbins=20,
            labels={'x': 'Number of Touchpoints', 'y': 'Count'},
            title="Distribution of Journey Lengths (Converted Only)"
        )

        fig.update_layout(height=400)

        return fig


    @callback(
        Output('recommendations-list', 'children'),
        [Input('model-selector', 'value')]
    )
    def update_recommendations(selected_models):
        """Update budget recommendations"""
        recs = comp_engine.get_budget_recommendations()

        if not recs:
            return html.P("No significant budget changes recommended.", className="text-muted")

        # Create recommendation cards
        cards = []

        for i, rec in enumerate(recs[:5], 1):
            color = "success" if rec['action'] == "INCREASE" else "danger"
            symbol = "📈" if rec['action'] == "INCREASE" else "📉"

            card = dbc.Card([
                dbc.CardBody([
                    html.H5(f"{symbol} {rec['channel'].value}", className="card-title"),
                    html.P(f"{rec['action']} Budget", className=f"text-{color} fw-bold"),
                    html.Hr(),
                    html.P([
                        html.Strong("Last-Touch: "),
                        f"${rec['last_touch_revenue']:,.2f}",
                        html.Br(),
                        html.Strong("Data-Driven: "),
                        f"${rec['data_driven_revenue']:,.2f}",
                        html.Br(),
                        html.Strong("Difference: "),
                        html.Span(
                            f"${rec['difference']:+,.2f} ({rec['difference_pct']:+.0f}%)",
                            className=f"text-{color}"
                        ),
                        html.Br(),
                        html.Strong("Current ROAS: "),
                        f"{rec['current_roas']:.2f}x"
                    ], className="mb-2"),
                    html.P(rec['reason'], className="text-muted small mb-0")
                ])
            ], className="mb-3", color=color, outline=True)

            cards.append(card)

        return html.Div(cards)


if __name__ == '__main__':
    if not DATA_LOADED:
        print("\n" + "="*60)
        print("⚠ No data found!")
        print("="*60)
        print("\nPlease generate and analyze data first:\n")
        print("  1. python attribution_cli.py generate")
        print("  2. python attribution_cli.py analyze")
        print("  3. python dashboard_app.py\n")
        print("="*60 + "\n")
    else:
        print("\n" + "="*60)
        print("Attribution Modeling Dashboard")
        print("="*60)
        print("\nStarting dashboard on http://localhost:8050")
        print(f"\nDataset loaded:")
        print(f"  Journeys: {len(journeys):,}")
        print(f"  Conversions: {sum(1 for j in journeys if j.converted):,}")
        print(f"  Models: {len(comparison.models)}")
        print("\nPress Ctrl+C to stop\n")

        app.run_server(debug=True, host='0.0.0.0', port=8050)
