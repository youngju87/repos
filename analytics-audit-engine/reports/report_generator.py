"""
Report Generator - Creates HTML and PDF audit reports
"""

import os
import logging
from datetime import datetime
from jinja2 import Environment, FileSystemLoader
from typing import Dict

logger = logging.getLogger(__name__)


class ReportGenerator:
    """
    Generates professional audit reports in HTML and PDF formats
    """

    def __init__(self, template_dir: str = None):
        if template_dir is None:
            template_dir = os.path.join(os.path.dirname(__file__), 'templates')

        self.env = Environment(loader=FileSystemLoader(template_dir))
        self.env.filters['format_score'] = self._format_score
        self.env.filters['severity_badge'] = self._severity_badge

    def generate_html_report(self, audit_data: Dict, output_path: str):
        """Generate HTML report"""

        template = self.env.get_template('audit_report.html')

        html_content = template.render(
            audit=audit_data,
            generated_at=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        )

        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html_content)

        logger.info(f"HTML report generated: {output_path}")
        return output_path

    def generate_pdf_report(self, audit_data: Dict, output_path: str):
        """Generate PDF report from HTML"""

        try:
            from weasyprint import HTML, CSS

            # First generate HTML
            html_path = output_path.replace('.pdf', '.html')
            self.generate_html_report(audit_data, html_path)

            # Convert to PDF
            HTML(html_path).write_pdf(output_path)

            logger.info(f"PDF report generated: {output_path}")
            return output_path

        except ImportError:
            logger.error("WeasyPrint not installed. Install with: pip install weasyprint")
            raise

    @staticmethod
    def _format_score(score):
        """Format score with color coding"""
        if score is None:
            return "N/A"

        score = float(score)
        if score >= 80:
            color = "success"
        elif score >= 60:
            color = "warning"
        else:
            color = "danger"

        return f'<span class="badge bg-{color}">{score:.0f}</span>'

    @staticmethod
    def _severity_badge(severity):
        """Format severity as badge"""
        colors = {
            'critical': 'danger',
            'warning': 'warning',
            'info': 'info'
        }
        color = colors.get(severity, 'secondary')
        return f'<span class="badge bg-{color}">{severity.upper()}</span>'
