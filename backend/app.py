"""BKW Hackathon - AI Project Management Backend."""
from datetime import datetime, timezone, date
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

@app.route('/api/projects', methods=['POST'])
def create_project():
    """Create a new project."""
    try:
        data = request.get_json(force=True) if request.is_json else {}
        name = data.get('name')
        description = data.get('description', '')
        deadline_str = data.get('deadline')
        priority = data.get('priority', 'medium')
        budget_total_raw = data.get('budget_total', 0.0)

        if not name or not deadline_str:
            return jsonify({'status': 'error', 'error': 'Name and deadline are required'}), 400

        # Parse deadline string to date object
        try:
            deadline = date.fromisoformat(deadline_str)
        except (ValueError, TypeError) as e:
            return jsonify({'status': 'error', 'error': f'Invalid deadline format. Expected YYYY-MM-DD, got: {deadline_str}'}), 400

        # Parse budget_total, handling empty strings
        try:
            budget_total = float(budget_total_raw) if budget_total_raw != '' else 0.0
        except (ValueError, TypeError):
            budget_total = 0.0

        project = db_manager.create_project(
            name=name,
            description=description,
            deadline=deadline,
            priority=priority,
            budget_total=budget_total
        )
        return jsonify({'project': project, 'status': 'success'}), 201
    except Exception as exc:
        return jsonify({'status': 'error', 'error': str(exc)}), 500

@app.route('/api/projects/<int:project_id>/assign', methods=['POST'])
def assign_engineer(project_id):
    """Assign an engineer to a project."""
    try:
        data = request.get_json(force=True) if request.is_json else {}
        engineer_id = data.get('engineer_id')
        hours_per_week = data.get('hours_per_week')
        start_date_str = data.get('start_date')
        end_date_str = data.get('end_date')

        if not engineer_id or not hours_per_week:
            return jsonify({'status': 'error', 'error': 'engineer_id and hours_per_week are required'}), 400

        # Parse date strings to date objects if provided
        start_date = None
        end_date = None
        try:
            if start_date_str:
                start_date = date.fromisoformat(start_date_str)
            if end_date_str:
                end_date = date.fromisoformat(end_date_str)
        except (ValueError, TypeError) as e:
            return jsonify({'status': 'error', 'error': f'Invalid date format. Expected YYYY-MM-DD'}), 400

        assignment = db_manager.assign_engineer_to_project(
            engineer_id=int(engineer_id),
            project_id=project_id,
            hours_per_week=int(hours_per_week),
            start_date=start_date,
            end_date=end_date
        )
        return jsonify({'assignment': assignment, 'status': 'success'}), 201
    except Exception as exc:
        return jsonify({'status': 'error', 'error': str(exc)}), 500

@app.route('/api/projects/<int:project_id>/assign/<int:engineer_id>', methods=['DELETE'])
def unassign_engineer(project_id, engineer_id):
    """Remove an engineer from a project."""
    try:
        rows_affected = db_manager.unassign_engineer_from_project(engineer_id, project_id)
        if rows_affected == 0:
            return jsonify({'status': 'error', 'error': 'Assignment not found'}), 404
        return jsonify({'status': 'success'}), 200
    except Exception as exc:
        return jsonify({'status': 'error', 'error': str(exc)}), 500

@app.route('/api/projects/<int:project_id>/available-engineers', methods=['GET'])
def get_available_engineers_for_project(project_id):
    """Get engineers not assigned to this project."""
    try:
        engineers = db_manager.get_available_engineers(project_id=project_id)
        return jsonify({'engineers': engineers, 'status': 'success'})
    except Exception as exc:
        return jsonify({'status': 'error', 'error': str(exc)}), 500

if __name__ == '__main__':
    # Development server
    app.run(debug=True, host='0.0.0.0', port=5000)

