"""BKW Hackathon - AI Project Management Backend."""
from datetime import datetime, timezone
from typing import Dict, List

from flask import Flask, request, jsonify
from flask_cors import CORS

from conflict_detection import conflict_detector
from database.connection import db_manager

# Initialize Flask app
app = Flask(__name__)
# Enable CORS for frontend communication with explicit configuration
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

@app.route('/')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'BKW AI Project Management API is running',
        'version': '1.0.0'
    })

def _format_currency(value: float) -> str:
    return f"CHF {value:,.0f}"


def _summarise_deadlines(projects: List[Dict]) -> str:
    upcoming = sorted(projects, key=lambda p: p.get('deadline') or '')[:4]
    if not upcoming:
        return "No active project deadlines on record."
    lines = []
    for project in upcoming:
        lines.append(
            f"• {project.get('name')} — due {project.get('deadline')} ({project.get('priority')} priority, {project.get('completion_percent')}% complete)"
        )
    return "Upcoming deadlines:\n" + "\n".join(lines)


def _summarise_budget(projects: List[Dict]) -> str:
    total_budget = sum(float(p.get('budget_total') or 0) for p in projects)
    total_spent = sum(float(p.get('budget_spent') or 0) for p in projects)
    remaining = total_budget - total_spent
    hottest = max(projects, key=lambda p: p.get('budget_utilisation') or 0.0, default=None)
    summary = [
        f"Portfolio spend: {_format_currency(total_spent)} of {_format_currency(total_budget)} (remaining {_format_currency(remaining)})"
    ]
    if hottest:
        summary.append(
            f"Highest utilisation: {hottest.get('name')} at {hottest.get('budget_utilisation')*100:.1f}%"
        )
    return "\n".join(summary)


def _summarise_workload(engineers: List[Dict]) -> str:
    overworked = [e for e in engineers if e.get('is_overworked') or (e.get('workload_percent') or 0) > 90]
    if not overworked:
        return "No engineers flagged as overworked right now."
    lines = []
    for engineer in sorted(overworked, key=lambda e: e.get('workload_percent') or 0, reverse=True)[:5]:
        lines.append(
            f"• {engineer.get('name')} — {engineer.get('workload_percent')}% workload ({engineer.get('availability')})"
        )
    return "Engineers needing attention:\n" + "\n".join(lines)


def _build_insight(query: str) -> Dict[str, str]:
    projects = db_manager.get_all_projects()
    engineers = db_manager.get_engineers_with_presence(presence_days=7)
    workload = conflict_detector.get_workload_summary()
    lower_query = query.lower()

    if any(word in lower_query for word in ('deadline', 'due', 'timeline')):
        primary = _summarise_deadlines(projects)
    elif any(word in lower_query for word in ('budget', 'cost', 'finance', 'money')):
        primary = _summarise_budget(projects)
    elif any(word in lower_query for word in ('overwork', 'workload', 'capacity', 'busy')):
        primary = _summarise_workload(engineers)
    elif any(word in lower_query for word in ('status', 'overview', 'summary')):
        primary = (
            f"Projects: {workload.get('total_projects')} active, average utilisation {workload.get('average_utilisation')*100:.1f}%\n"
            f"Engineers: {workload.get('total_engineers')} total with {workload.get('assigned_hours')} of {workload.get('total_capacity_hours')} hours assigned"
        )
    else:
        primary = (
            "Ask me about deadlines, budgets, or workload. "
            "For example: 'Who is overworked?', 'Show project budgets', or 'Timeline overview'."
        )

    return {
        'primary': primary,
        'generated_at': datetime.now(timezone.utc).isoformat(),
    }


@app.route('/api/ai/chat', methods=['POST'])
def ai_chat():
    """Simple rule-based AI assistant for the hackathon demo."""
    try:
        data = request.get_json(force=True) if request.is_json else {}
        query = (data or {}).get('query', '')
        insight = _build_insight(query or '')
        return jsonify({
            'response': insight['primary'],
            'generated_at': insight['generated_at'],
            'status': 'success'
        })
    except Exception as exc:  # pragma: no cover
        return jsonify({
            'error': str(exc),
            'status': 'error'
        }), 500

@app.route('/api/projects', methods=['GET'])
def get_projects():
    """Return all projects with assignment summaries."""
    try:
        projects = db_manager.get_all_projects()
        return jsonify({'projects': projects, 'status': 'success'})
    except Exception as exc:  # pragma: no cover - defensive API layer
        return jsonify({'status': 'error', 'error': str(exc)}), 500


@app.route('/api/engineers', methods=['GET'])
def get_engineers():
    """Return engineers enriched with presence data."""
    try:
        days = request.args.get('presenceDays', default=7, type=int)
        engineers = db_manager.get_engineers_with_presence(presence_days=days)
        return jsonify({'engineers': engineers, 'status': 'success'})
    except Exception as exc:  # pragma: no cover
        return jsonify({'status': 'error', 'error': str(exc)}), 500


@app.route('/api/teams', methods=['GET'])
def get_teams():
    """Return teams with member details and projects."""
    try:
        days = request.args.get('presenceDays', default=7, type=int)
        teams = db_manager.get_team_directory(presence_days=days)
        return jsonify({'teams': teams, 'status': 'success'})
    except Exception as exc:  # pragma: no cover
        return jsonify({'status': 'error', 'error': str(exc)}), 500

@app.route('/api/conflicts', methods=['GET'])
def get_conflicts():
    """Run the conflict detection engine using the classic schema."""
    try:
        days_ahead = request.args.get('daysAhead', default=28, type=int)

        conflicts = conflict_detector.get_all_conflicts(
            days_ahead=days_ahead,
        )
        return jsonify({'conflicts': conflicts, 'status': 'success'})
    except Exception as exc:  # pragma: no cover - defensive API layer
        return jsonify({'status': 'error', 'error': str(exc)}), 500

if __name__ == '__main__':
    # Development server
    app.run(debug=True, host='0.0.0.0', port=5000)

