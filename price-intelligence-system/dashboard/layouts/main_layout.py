"""
Main dashboard layout with navigation and page structure
"""

from dash import html, dcc
import dash_bootstrap_components as dbc


def create_navbar():
    """Create navigation bar"""
    return dbc.Navbar(
        dbc.Container([
            dbc.Row([
                dbc.Col([
                    html.I(className="fas fa-chart-line me-2"),
                    dbc.NavbarBrand("Price Intelligence System", className="ms-2")
                ], width="auto"),
            ], align="center", className="g-0"),
            dbc.NavbarToggler(id="navbar-toggler"),
            dbc.Collapse(
                dbc.Nav([
                    dbc.NavItem(dbc.NavLink("Overview", href="/", active="exact")),
                    dbc.NavItem(dbc.NavLink("Price Trends", href="/trends")),
                    dbc.NavItem(dbc.NavLink("Competitor Analysis", href="/competitors")),
                    dbc.NavItem(dbc.NavLink("MAP Violations", href="/violations")),
                ], className="ms-auto", navbar=True),
                id="navbar-collapse",
                navbar=True,
            ),
        ], fluid=True),
        color="dark",
        dark=True,
        className="mb-4"
    )


def create_stats_card(title, value, icon, color="primary", subtitle=None):
    """Create a statistics card component"""
    return dbc.Card([
        dbc.CardBody([
            html.Div([
                html.Div([
                    html.I(className=f"fas fa-{icon} fa-2x text-{color}"),
                ], className="me-3"),
                html.Div([
                    html.H6(title, className="text-muted mb-1"),
                    html.H3(value, className="mb-0"),
                    html.Small(subtitle, className="text-muted") if subtitle else None
                ])
            ], className="d-flex align-items-center")
        ])
    ], className="mb-3")


def create_overview_tab():
    """Create overview tab content"""
    return dbc.Container([
        # Statistics Row
        dbc.Row([
            dbc.Col([
                html.Div(id="stats-total-products")
            ], md=3),
            dbc.Col([
                html.Div(id="stats-active-competitors")
            ], md=3),
            dbc.Col([
                html.Div(id="stats-price-changes")
            ], md=3),
            dbc.Col([
                html.Div(id="stats-avg-price")
            ], md=3),
        ], className="mb-4"),

        # Charts Row
        dbc.Row([
            dbc.Col([
                dbc.Card([
                    dbc.CardHeader([
                        html.I(className="fas fa-chart-area me-2"),
                        "Price Distribution by Competitor"
                    ]),
                    dbc.CardBody([
                        dcc.Loading(
                            dcc.Graph(id="chart-price-distribution"),
                            type="default"
                        )
                    ])
                ])
            ], md=6),
            dbc.Col([
                dbc.Card([
                    dbc.CardHeader([
                        html.I(className="fas fa-chart-pie me-2"),
                        "Product Categories"
                    ]),
                    dbc.CardBody([
                        dcc.Loading(
                            dcc.Graph(id="chart-category-breakdown"),
                            type="default"
                        )
                    ])
                ])
            ], md=6),
        ], className="mb-4"),

        # Recent Activity
        dbc.Row([
            dbc.Col([
                dbc.Card([
                    dbc.CardHeader([
                        html.I(className="fas fa-clock me-2"),
                        "Recent Price Changes (Last 7 Days)"
                    ]),
                    dbc.CardBody([
                        html.Div(id="table-recent-changes")
                    ])
                ])
            ])
        ])
    ], fluid=True)


def create_trends_tab():
    """Create price trends tab content"""
    return dbc.Container([
        dbc.Row([
            dbc.Col([
                dbc.Card([
                    dbc.CardBody([
                        html.Label("Select Product:"),
                        dcc.Dropdown(
                            id="dropdown-product-trends",
                            placeholder="Select a product...",
                            className="mb-3"
                        ),
                        html.Label("Date Range:"),
                        dcc.DatePickerRange(
                            id="date-range-trends",
                            className="mb-3"
                        ),
                    ])
                ])
            ], md=12, className="mb-4"),
        ]),
        dbc.Row([
            dbc.Col([
                dbc.Card([
                    dbc.CardHeader("Price Trends Over Time"),
                    dbc.CardBody([
                        dcc.Loading(
                            dcc.Graph(id="chart-price-trends", style={"height": "500px"}),
                            type="default"
                        )
                    ])
                ])
            ])
        ], className="mb-4"),
        dbc.Row([
            dbc.Col([
                dbc.Card([
                    dbc.CardHeader("Price Statistics"),
                    dbc.CardBody([
                        html.Div(id="price-statistics-table")
                    ])
                ])
            ], md=6),
            dbc.Col([
                dbc.Card([
                    dbc.CardHeader("Stock Availability"),
                    dbc.CardBody([
                        dcc.Loading(
                            dcc.Graph(id="chart-stock-availability"),
                            type="default"
                        )
                    ])
                ])
            ], md=6),
        ])
    ], fluid=True)


def create_competitors_tab():
    """Create competitor analysis tab content"""
    return dbc.Container([
        dbc.Row([
            dbc.Col([
                dbc.Card([
                    dbc.CardHeader("Competitive Positioning Matrix"),
                    dbc.CardBody([
                        dcc.Loading(
                            dcc.Graph(id="chart-positioning-matrix", style={"height": "600px"}),
                            type="default"
                        )
                    ])
                ])
            ])
        ], className="mb-4"),
        dbc.Row([
            dbc.Col([
                dbc.Card([
                    dbc.CardHeader("Average Price by Competitor"),
                    dbc.CardBody([
                        dcc.Loading(
                            dcc.Graph(id="chart-competitor-avg-price"),
                            type="default"
                        )
                    ])
                ])
            ], md=6),
            dbc.Col([
                dbc.Card([
                    dbc.CardHeader("Price Volatility"),
                    dbc.CardBody([
                        dcc.Loading(
                            dcc.Graph(id="chart-price-volatility"),
                            type="default"
                        )
                    ])
                ])
            ], md=6),
        ])
    ], fluid=True)


def create_violations_tab():
    """Create MAP violations tab content"""
    return dbc.Container([
        dbc.Row([
            dbc.Col([
                dbc.Alert([
                    html.I(className="fas fa-exclamation-triangle me-2"),
                    "MAP (Minimum Advertised Price) violation monitoring helps enforce pricing policies."
                ], color="info", className="mb-4")
            ])
        ]),
        dbc.Row([
            dbc.Col([
                dbc.Card([
                    dbc.CardHeader("MAP Violation Alerts"),
                    dbc.CardBody([
                        html.Div(id="table-map-violations")
                    ])
                ])
            ])
        ])
    ], fluid=True)


def create_layout():
    """Create main application layout"""
    return html.Div([
        dcc.Location(id='url', refresh=False),
        create_navbar(),

        # Main content container
        dbc.Container([
            # Tabs for different views
            dbc.Tabs([
                dbc.Tab(create_overview_tab(), label="Overview", tab_id="overview"),
                dbc.Tab(create_trends_tab(), label="Price Trends", tab_id="trends"),
                dbc.Tab(create_competitors_tab(), label="Competitors", tab_id="competitors"),
                dbc.Tab(create_violations_tab(), label="MAP Violations", tab_id="violations"),
            ], id="tabs", active_tab="overview")
        ], fluid=True),

        # Interval component for auto-refresh (every 5 minutes)
        dcc.Interval(
            id='interval-component',
            interval=5*60*1000,  # 5 minutes in milliseconds
            n_intervals=0
        )
    ])
