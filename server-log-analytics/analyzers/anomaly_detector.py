"""
Anomaly Detector - Identifies unusual patterns in server logs
Uses statistical methods to detect traffic spikes, latency anomalies, error rate changes
"""

import logging
import numpy as np
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta
from collections import defaultdict
import statistics

logger = logging.getLogger(__name__)


@dataclass
class Anomaly:
    """Detected anomaly"""
    anomaly_type: str  # traffic_spike, latency_spike, error_rate, status_code
    severity: str  # low, medium, high, critical
    timestamp: datetime
    metric_name: str
    expected_value: float
    actual_value: float
    deviation_score: float  # How many standard deviations from mean
    description: str
    context: Dict  # Additional context


class AnomalyDetector:
    """
    Detects anomalies using statistical methods:
    - Z-score for outlier detection
    - Moving average for trend detection
    - Threshold-based alerts
    """

    # Z-score thresholds
    ANOMALY_THRESHOLDS = {
        'low': 2.0,      # 2 standard deviations
        'medium': 3.0,   # 3 standard deviations
        'high': 4.0,     # 4 standard deviations
        'critical': 5.0  # 5 standard deviations
    }

    # Error rate thresholds (percentage)
    ERROR_RATE_THRESHOLDS = {
        'low': 1.0,      # 1% error rate
        'medium': 5.0,   # 5% error rate
        'high': 10.0,    # 10% error rate
        'critical': 20.0 # 20% error rate
    }

    def __init__(self):
        self.anomalies_detected = 0

    def detect_traffic_anomalies(
        self,
        time_series: List[Dict],
        metric: str = 'request_count',
        window_size: int = 24
    ) -> List[Anomaly]:
        """
        Detect traffic anomalies using Z-score method

        Args:
            time_series: List of dicts with 'timestamp' and metric keys
            metric: Metric to analyze (request_count, response_time, etc.)
            window_size: Number of previous points to use for baseline

        Returns:
            List of detected anomalies
        """
        anomalies = []

        if len(time_series) < window_size:
            logger.warning(f"Not enough data points ({len(time_series)} < {window_size})")
            return anomalies

        # Extract values
        values = [point.get(metric, 0) for point in time_series]

        # Calculate rolling statistics
        for i in range(window_size, len(values)):
            # Get baseline window (previous N points)
            baseline = values[i - window_size:i]

            # Calculate statistics
            mean = statistics.mean(baseline)
            std_dev = statistics.stdev(baseline) if len(baseline) > 1 else 0

            # Current value
            current_value = values[i]

            # Skip if no variation
            if std_dev == 0:
                continue

            # Calculate Z-score
            z_score = abs((current_value - mean) / std_dev)

            # Determine severity
            severity = self._get_severity_from_zscore(z_score)

            if severity:
                anomaly = Anomaly(
                    anomaly_type='traffic_spike' if current_value > mean else 'traffic_drop',
                    severity=severity,
                    timestamp=time_series[i].get('timestamp', datetime.now()),
                    metric_name=metric,
                    expected_value=mean,
                    actual_value=current_value,
                    deviation_score=z_score,
                    description=f"{metric} is {z_score:.1f}σ from baseline",
                    context={
                        'baseline_mean': mean,
                        'baseline_std': std_dev,
                        'percent_change': ((current_value - mean) / mean * 100) if mean > 0 else 0
                    }
                )
                anomalies.append(anomaly)
                self.anomalies_detected += 1

        return anomalies

    def detect_latency_anomalies(
        self,
        endpoint_metrics: List[Dict],
        latency_field: str = 'avg_response_time_ms'
    ) -> List[Anomaly]:
        """
        Detect latency spikes for endpoints

        Args:
            endpoint_metrics: List of dicts with endpoint, timestamp, and latency
            latency_field: Field containing latency metric

        Returns:
            List of latency anomalies
        """
        anomalies = []

        # Group by endpoint
        by_endpoint = defaultdict(list)
        for metric in endpoint_metrics:
            endpoint = metric.get('endpoint', 'unknown')
            by_endpoint[endpoint].append(metric)

        # Analyze each endpoint
        for endpoint, metrics in by_endpoint.items():
            if len(metrics) < 10:  # Need minimum data
                continue

            # Get latency values
            latencies = [m.get(latency_field, 0) for m in metrics]

            # Calculate baseline (excluding top 5% to avoid skew)
            sorted_latencies = sorted(latencies)
            baseline_values = sorted_latencies[:int(len(sorted_latencies) * 0.95)]

            if not baseline_values:
                continue

            baseline_mean = statistics.mean(baseline_values)
            baseline_std = statistics.stdev(baseline_values) if len(baseline_values) > 1 else 0

            # Find anomalies
            for i, metric in enumerate(metrics):
                current_latency = metric.get(latency_field, 0)

                if baseline_std == 0:
                    continue

                z_score = abs((current_latency - baseline_mean) / baseline_std)
                severity = self._get_severity_from_zscore(z_score)

                if severity and current_latency > baseline_mean:
                    anomaly = Anomaly(
                        anomaly_type='latency_spike',
                        severity=severity,
                        timestamp=metric.get('timestamp', datetime.now()),
                        metric_name=f"{endpoint} latency",
                        expected_value=baseline_mean,
                        actual_value=current_latency,
                        deviation_score=z_score,
                        description=f"{endpoint} latency is {z_score:.1f}σ above normal",
                        context={
                            'endpoint': endpoint,
                            'baseline_p50': baseline_mean,
                            'slowdown_factor': current_latency / baseline_mean if baseline_mean > 0 else 0
                        }
                    )
                    anomalies.append(anomaly)
                    self.anomalies_detected += 1

        return anomalies

    def detect_error_rate_anomalies(
        self,
        status_code_metrics: List[Dict]
    ) -> List[Anomaly]:
        """
        Detect unusual error rates

        Args:
            status_code_metrics: List with timestamp, total_requests, error_count

        Returns:
            List of error rate anomalies
        """
        anomalies = []

        for metric in status_code_metrics:
            total = metric.get('total_requests', 0)
            errors = metric.get('error_count', 0)

            if total == 0:
                continue

            error_rate = (errors / total) * 100

            # Determine severity based on error rate
            severity = None
            if error_rate >= self.ERROR_RATE_THRESHOLDS['critical']:
                severity = 'critical'
            elif error_rate >= self.ERROR_RATE_THRESHOLDS['high']:
                severity = 'high'
            elif error_rate >= self.ERROR_RATE_THRESHOLDS['medium']:
                severity = 'medium'
            elif error_rate >= self.ERROR_RATE_THRESHOLDS['low']:
                severity = 'low'

            if severity:
                anomaly = Anomaly(
                    anomaly_type='error_rate',
                    severity=severity,
                    timestamp=metric.get('timestamp', datetime.now()),
                    metric_name='error_rate',
                    expected_value=0.5,  # Expected < 0.5%
                    actual_value=error_rate,
                    deviation_score=error_rate / 0.5,  # How many times over expected
                    description=f"Error rate is {error_rate:.1f}% ({errors}/{total} requests)",
                    context={
                        'total_requests': total,
                        'error_count': errors,
                        'error_breakdown': metric.get('error_breakdown', {})
                    }
                )
                anomalies.append(anomaly)
                self.anomalies_detected += 1

        return anomalies

    def detect_status_code_anomalies(
        self,
        status_metrics: List[Dict],
        unusual_codes: List[int] = [500, 502, 503, 504]
    ) -> List[Anomaly]:
        """
        Detect unusual status codes

        Args:
            status_metrics: List with timestamp, status_code, count
            unusual_codes: Status codes to alert on

        Returns:
            List of status code anomalies
        """
        anomalies = []

        # Group by timestamp and status code
        by_time = defaultdict(lambda: defaultdict(int))

        for metric in status_metrics:
            timestamp = metric.get('timestamp', datetime.now())
            status = metric.get('status_code', 0)
            count = metric.get('count', 0)

            by_time[timestamp][status] += count

        # Analyze each time period
        for timestamp, status_counts in by_time.items():
            total = sum(status_counts.values())

            for status_code in unusual_codes:
                count = status_counts.get(status_code, 0)

                if count == 0:
                    continue

                percentage = (count / total) * 100

                # Determine severity
                severity = None
                if percentage >= 10:
                    severity = 'critical'
                elif percentage >= 5:
                    severity = 'high'
                elif percentage >= 1:
                    severity = 'medium'
                elif count >= 10:
                    severity = 'low'

                if severity:
                    anomaly = Anomaly(
                        anomaly_type='status_code',
                        severity=severity,
                        timestamp=timestamp,
                        metric_name=f'HTTP {status_code}',
                        expected_value=0,
                        actual_value=count,
                        deviation_score=percentage,
                        description=f"{count} × HTTP {status_code} ({percentage:.1f}% of traffic)",
                        context={
                            'status_code': status_code,
                            'total_requests': total,
                            'all_status_codes': dict(status_counts)
                        }
                    )
                    anomalies.append(anomaly)
                    self.anomalies_detected += 1

        return anomalies

    def detect_unusual_paths(
        self,
        path_metrics: List[Dict],
        min_requests: int = 100
    ) -> List[Anomaly]:
        """
        Detect unusual spikes in specific paths

        Args:
            path_metrics: List with timestamp, path, request_count
            min_requests: Minimum requests to flag as anomaly

        Returns:
            List of path anomalies
        """
        anomalies = []

        # Group by path
        by_path = defaultdict(list)
        for metric in path_metrics:
            path = metric.get('path', '')
            by_path[path].append(metric)

        # Analyze each path
        for path, metrics in by_path.items():
            if len(metrics) < 5:
                continue

            counts = [m.get('request_count', 0) for m in metrics]
            mean_count = statistics.mean(counts)
            std_count = statistics.stdev(counts) if len(counts) > 1 else 0

            # Find spikes
            for metric in metrics:
                count = metric.get('request_count', 0)

                if count < min_requests:
                    continue

                if std_count == 0:
                    continue

                z_score = abs((count - mean_count) / std_count)
                severity = self._get_severity_from_zscore(z_score)

                if severity and count > mean_count * 2:  # At least 2x normal
                    anomaly = Anomaly(
                        anomaly_type='path_spike',
                        severity=severity,
                        timestamp=metric.get('timestamp', datetime.now()),
                        metric_name=f"Traffic to {path}",
                        expected_value=mean_count,
                        actual_value=count,
                        deviation_score=z_score,
                        description=f"{path} received {count} requests ({z_score:.1f}σ above normal)",
                        context={
                            'path': path,
                            'multiplier': count / mean_count if mean_count > 0 else 0
                        }
                    )
                    anomalies.append(anomaly)
                    self.anomalies_detected += 1

        return anomalies

    def _get_severity_from_zscore(self, z_score: float) -> Optional[str]:
        """Convert Z-score to severity level"""
        if z_score >= self.ANOMALY_THRESHOLDS['critical']:
            return 'critical'
        elif z_score >= self.ANOMALY_THRESHOLDS['high']:
            return 'high'
        elif z_score >= self.ANOMALY_THRESHOLDS['medium']:
            return 'medium'
        elif z_score >= self.ANOMALY_THRESHOLDS['low']:
            return 'low'
        return None

    def calculate_anomaly_score(
        self,
        time_window_metrics: Dict
    ) -> float:
        """
        Calculate overall anomaly score for a time window (0.0 to 1.0)

        Args:
            time_window_metrics: Dict with various metrics

        Returns:
            Anomaly score (higher = more anomalous)
        """
        score = 0.0

        # Traffic variance (0.0 - 0.3)
        traffic_variance = time_window_metrics.get('traffic_variance', 0)
        score += min(traffic_variance / 100, 0.3)

        # Error rate (0.0 - 0.4)
        error_rate = time_window_metrics.get('error_rate', 0)
        score += min(error_rate / 10, 0.4)

        # Latency spikes (0.0 - 0.3)
        latency_anomalies = time_window_metrics.get('latency_anomalies', 0)
        score += min(latency_anomalies / 10, 0.3)

        return min(score, 1.0)

    def get_stats(self) -> Dict:
        """Get detector statistics"""
        return {
            'anomalies_detected': self.anomalies_detected
        }


if __name__ == "__main__":
    # Test the anomaly detector
    from datetime import datetime, timedelta

    detector = AnomalyDetector()

    # Generate sample time series data with anomaly
    base_time = datetime.now() - timedelta(hours=48)
    time_series = []

    for i in range(48):
        # Normal traffic: ~1000 requests/hour with small variance
        if i == 35:  # Insert spike
            request_count = 5000
        else:
            request_count = 1000 + np.random.randint(-100, 100)

        time_series.append({
            'timestamp': base_time + timedelta(hours=i),
            'request_count': request_count,
            'avg_response_time_ms': 120 + np.random.randint(-20, 20)
        })

    print("Anomaly Detection Test:\n")

    # Test 1: Traffic anomalies
    print("1. Traffic Anomaly Detection")
    traffic_anomalies = detector.detect_traffic_anomalies(
        time_series,
        metric='request_count',
        window_size=24
    )

    print(f"   Found {len(traffic_anomalies)} traffic anomalies")
    for anomaly in traffic_anomalies:
        print(f"   - [{anomaly.severity.upper()}] {anomaly.description}")
        print(f"     Expected: {anomaly.expected_value:.0f}, Actual: {anomaly.actual_value:.0f}")
        print(f"     Change: {anomaly.context['percent_change']:.1f}%")

    print()

    # Test 2: Error rate anomalies
    print("2. Error Rate Detection")
    error_metrics = [
        {
            'timestamp': datetime.now(),
            'total_requests': 10000,
            'error_count': 50  # 0.5% - normal
        },
        {
            'timestamp': datetime.now(),
            'total_requests': 10000,
            'error_count': 800  # 8% - high
        }
    ]

    error_anomalies = detector.detect_error_rate_anomalies(error_metrics)
    print(f"   Found {len(error_anomalies)} error rate anomalies")
    for anomaly in error_anomalies:
        print(f"   - [{anomaly.severity.upper()}] {anomaly.description}")

    print()

    # Test 3: Status code anomalies
    print("3. Status Code Detection")
    status_metrics = [
        {
            'timestamp': datetime.now(),
            'status_code': 500,
            'count': 150
        },
        {
            'timestamp': datetime.now(),
            'status_code': 200,
            'count': 9850
        }
    ]

    status_anomalies = detector.detect_status_code_anomalies(status_metrics)
    print(f"   Found {len(status_anomalies)} status code anomalies")
    for anomaly in status_anomalies:
        print(f"   - [{anomaly.severity.upper()}] {anomaly.description}")

    print()
    print(f"Total Stats: {detector.get_stats()}")
