"""
Generate sample server logs for testing
Creates realistic-looking Nginx access logs with various scenarios
"""

import random
from datetime import datetime, timedelta
from pathlib import Path

# Sample data pools
PATHS = [
    '/',
    '/api/users',
    '/api/products',
    '/api/orders',
    '/search',
    '/product/123',
    '/product/456',
    '/cart',
    '/checkout',
    '/checkout/complete',
    '/admin',
    '/api/reports',
    '/static/css/style.css',
    '/static/js/app.js',
    '/images/logo.png'
]

# User agents
USER_AGENTS = [
    # Browsers
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',

    # Bots
    'Googlebot/2.1 (+http://www.google.com/bot.html)',
    'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
    'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
    'Twitterbot/1.0',

    # Malicious/Suspicious
    'python-requests/2.31.0',
    'curl/7.88.1',
    'Go-http-client/1.1'
]

# IP addresses (mix of normal and suspicious)
IP_ADDRESSES = [
    '192.168.1.100',
    '192.168.1.101',
    '192.168.1.102',
    '10.0.0.50',
    '10.0.0.51',
    '172.16.0.100',
    '203.0.113.10',  # Normal public IP
    '198.51.100.20',  # Normal public IP
    '45.33.32.156',  # Suspicious IP
    '104.28.14.15',  # Suspicious IP
]

REFERERS = [
    'https://www.google.com/',
    'https://www.facebook.com/',
    'https://twitter.com/',
    'https://example.com/',
    '-'
]

STATUS_CODES = [
    (200, 0.85),  # 85% success
    (304, 0.05),  # 5% not modified
    (404, 0.05),  # 5% not found
    (500, 0.02),  # 2% server error
    (403, 0.02),  # 2% forbidden
    (502, 0.01),  # 1% bad gateway
]


def weighted_choice(choices):
    """Make weighted random choice"""
    total = sum(weight for choice, weight in choices)
    r = random.uniform(0, total)
    upto = 0
    for choice, weight in choices:
        if upto + weight >= r:
            return choice
        upto += weight
    return choices[0][0]


def generate_log_line(timestamp, scenario='normal'):
    """Generate a single log line"""

    if scenario == 'normal':
        ip = random.choice(IP_ADDRESSES[:8])  # Normal IPs
        user_agent = random.choice(USER_AGENTS[:5])  # Browsers
        path = random.choice(PATHS[:10])  # Normal paths
        status = weighted_choice(STATUS_CODES)
        response_time = random.randint(50, 300)

    elif scenario == 'bot':
        ip = random.choice(IP_ADDRESSES[:8])
        user_agent = random.choice(USER_AGENTS[5:9])  # Bot UAs
        path = random.choice(PATHS)
        status = 200
        response_time = random.randint(30, 100)

    elif scenario == 'attack':
        ip = random.choice(IP_ADDRESSES[-2:])  # Suspicious IPs
        user_agent = random.choice(USER_AGENTS[-3:])  # Suspicious UAs

        # Malicious paths
        attack_paths = [
            "/admin' OR '1'='1",
            "/search?q=<script>alert('XSS')</script>",
            "/api?file=../../../../etc/passwd",
            "/login?redirect=$(whoami)",
            "/api/users?id=1 UNION SELECT * FROM passwords--"
        ]
        path = random.choice(attack_paths)
        status = random.choice([400, 403, 500])
        response_time = random.randint(10, 50)

    elif scenario == 'slow':
        ip = random.choice(IP_ADDRESSES[:8])
        user_agent = random.choice(USER_AGENTS[:5])
        path = random.choice(['/api/reports', '/api/search', '/admin'])
        status = 200
        response_time = random.randint(2000, 5000)  # Slow!

    elif scenario == 'error':
        ip = random.choice(IP_ADDRESSES[:8])
        user_agent = random.choice(USER_AGENTS[:5])
        path = random.choice(PATHS)
        status = random.choice([500, 502, 503, 504])
        response_time = random.randint(100, 1000)

    else:
        # Default to normal
        return generate_log_line(timestamp, 'normal')

    # Generate log line in Nginx format
    timestamp_str = timestamp.strftime('%d/%b/%Y:%H:%M:%S +0000')
    bytes_sent = random.randint(500, 50000)
    referer = random.choice(REFERERS)

    log_line = (
        f'{ip} - - [{timestamp_str}] '
        f'"GET {path} HTTP/1.1" {status} {bytes_sent} '
        f'"{referer}" "{user_agent}"'
    )

    return log_line


def generate_sample_logs(num_lines=10000, output_file='nginx_access.log'):
    """Generate sample log file"""

    print(f"Generating {num_lines:,} sample log lines...")

    # Start time (1 day ago)
    start_time = datetime.now() - timedelta(days=1)

    lines = []

    for i in range(num_lines):
        # Increment time by random interval (1-60 seconds)
        timestamp = start_time + timedelta(seconds=random.randint(1, 60))
        start_time = timestamp

        # Determine scenario based on probability
        rand = random.random()

        if rand < 0.70:  # 70% normal traffic
            scenario = 'normal'
        elif rand < 0.85:  # 15% bot traffic
            scenario = 'bot'
        elif rand < 0.90:  # 5% slow requests
            scenario = 'slow'
        elif rand < 0.98:  # 8% errors
            scenario = 'error'
        else:  # 2% attacks
            scenario = 'attack'

        line = generate_log_line(timestamp, scenario)
        lines.append(line)

    # Write to file
    output_path = Path(__file__).parent / output_file

    with open(output_path, 'w') as f:
        f.write('\n'.join(lines))

    print(f"✓ Generated {len(lines):,} lines")
    print(f"✓ Saved to: {output_path}")

    # Print statistics
    print("\nScenario breakdown:")
    print("  70% Normal traffic")
    print("  15% Bot traffic")
    print("   5% Slow requests")
    print("   8% Error responses")
    print("   2% Attack attempts")


if __name__ == '__main__':
    # Generate sample logs
    generate_sample_logs(num_lines=10000, output_file='nginx_access.log')

    print("\nTo ingest these logs:")
    print("  python ingest_logs.py --file sample_data/nginx_access.log --format nginx")
