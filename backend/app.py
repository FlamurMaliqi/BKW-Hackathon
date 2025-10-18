"""BKW Hackathon - AI Project Management Backend."""
from datetime import datetime, timezone, date
from typing import Dict, List

from flask import Flask, request, jsonify
from flask_cors import CORS

from conflict_detection import conflict_detector
from database.connection import db_manager
from ai_service import ai_service
from workload_analyzer import WorkloadAnalyzer

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

# Initialize workload analyzer
workload_analyzer = WorkloadAnalyzer(db_manager)

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
    """AI-powered assistant using Gemini for project management insights."""
    try:
        data = request.get_json(force=True) if request.is_json else {}
        query = (data or {}).get('query', '')
        
        if not query.strip():
            return jsonify({
                'response': 'Please provide a question about your projects, team, or workload.',
                'status': 'error'
            }), 400
        
        # Use Gemini AI service
        result = ai_service.chat_with_ai(query)
        
        if result['status'] == 'error':
            return jsonify(result), 500
            
        return jsonify({
            'response': result['response'],
            'generated_at': datetime.now(timezone.utc).isoformat(),
            'model': result.get('model', 'gemini-1.5-flash'),
            'status': 'success'
        })
        
    except Exception as exc:
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
        start_date_str = data.get('start_date')
        deadline_str = data.get('deadline')
        priority = data.get('priority', 'medium')
        budget_total_raw = data.get('budget_total', 0.0)

        if not name or not deadline_str:
            return jsonify({'status': 'error', 'error': 'Name and deadline are required'}), 400

        # Parse start_date string to date object if provided
        start_date = None
        if start_date_str:
            try:
                start_date = date.fromisoformat(start_date_str)
            except (ValueError, TypeError):
                return jsonify({'status': 'error', 'error': f'Invalid start_date format. Expected YYYY-MM-DD, got: {start_date_str}'}), 400

        # Parse deadline string to date object
        try:
            deadline = date.fromisoformat(deadline_str)
        except (ValueError, TypeError):
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
            budget_total=budget_total,
            start_date=start_date
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

@app.route('/api/engineers', methods=['POST'])
def create_engineer():
    """Create a new engineer."""
    try:
        data = request.get_json(force=True) if request.is_json else {}
        name = data.get('name')
        email = data.get('email')
        role = data.get('role')
        team_id = data.get('team_id')
        phone = data.get('phone', '')
        capacity_hours_per_week = data.get('capacity_hours_per_week', 40)
        status = data.get('status', 'active')
        availability = data.get('availability', 'available')
        skills = data.get('skills', [])

        if not name or not email or not role or not team_id:
            return jsonify({'status': 'error', 'error': 'Name, email, role, and team_id are required'}), 400

        engineer = db_manager.create_engineer(
            name=name,
            email=email,
            role=role,
            team_id=int(team_id),
            phone=phone,
            capacity_hours_per_week=int(capacity_hours_per_week),
            status=status,
            availability=availability,
            skills=skills
        )
        return jsonify({'engineer': engineer, 'status': 'success'}), 201
    except Exception as exc:
        return jsonify({'status': 'error', 'error': str(exc)}), 500

@app.route('/api/engineers/<int:engineer_id>/team', methods=['PUT'])
def switch_engineer_team(engineer_id):
    """Switch an engineer to a different team."""
    try:
        data = request.get_json(force=True) if request.is_json else {}
        new_team_id = data.get('team_id')
        
        print(f"Switching engineer {engineer_id} to team {new_team_id}")  # Debug logging

        if not new_team_id:
            return jsonify({'status': 'error', 'error': 'team_id is required'}), 400

        # Validate that the team exists
        teams = db_manager.execute_query("SELECT id FROM teams WHERE id = %s", (int(new_team_id),))
        print(f"Teams found: {teams}")  # Debug logging
        if not teams:
            return jsonify({'status': 'error', 'error': f'Team with id {new_team_id} not found'}), 404

        engineer = db_manager.update_engineer_team(
            engineer_id=int(engineer_id),
            new_team_id=int(new_team_id)
        )
        print(f"Updated engineer: {engineer}")  # Debug logging
        return jsonify({'engineer': engineer, 'status': 'success'}), 200
    except ValueError as ve:
        return jsonify({'status': 'error', 'error': str(ve)}), 404
    except Exception as exc:
        print(f"Error switching engineer team: {exc}")  # Debug logging
        return jsonify({'status': 'error', 'error': str(exc)}), 500

# ---------------------------------------------------------------------
# Workload Analysis Endpoints
# ---------------------------------------------------------------------

@app.route('/api/workload/engineer/<int:engineer_id>', methods=['GET'])
def get_engineer_workload(engineer_id):
    """Get workload timeline and overwork periods for an engineer."""
    try:
        days_ahead = request.args.get('days_ahead', default=90, type=int)
        days_ahead = min(max(days_ahead, 7), 365)  # Clamp between 7 and 365 days

        overwork_periods = workload_analyzer.detect_overwork_periods(engineer_id, days_ahead)

        return jsonify({
            'engineer_id': engineer_id,
            'days_ahead': days_ahead,
            'overwork_periods': overwork_periods,
            'total_overwork_days': sum(p['days_count'] for p in overwork_periods),
            'is_at_risk': len(overwork_periods) > 0,
            'status': 'success'
        })
    except Exception as exc:
        return jsonify({'status': 'error', 'error': str(exc)}), 500

@app.route('/api/workload/engineer/<int:engineer_id>/timeline', methods=['GET'])
def get_engineer_timeline(engineer_id):
    """Get detailed daily workload timeline for an engineer."""
    try:
        days_ahead = request.args.get('days_ahead', default=90, type=int)
        days_ahead = min(max(days_ahead, 7), 365)

        start_date = date.today()
        end_date = start_date + __import__('datetime').timedelta(days=days_ahead)

        timeline = workload_analyzer.calculate_engineer_timeline(engineer_id, start_date, end_date)

        return jsonify({
            'engineer_id': engineer_id,
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat(),
            'timeline': timeline,
            'status': 'success'
        })
    except Exception as exc:
        return jsonify({'status': 'error', 'error': str(exc)}), 500

@app.route('/api/workload/team/<int:team_id>', methods=['GET'])
def get_team_workload(team_id):
    """Get workload forecast for entire team."""
    try:
        days_ahead = request.args.get('days_ahead', default=90, type=int)
        days_ahead = min(max(days_ahead, 7), 365)

        forecast = workload_analyzer.get_team_workload_forecast(team_id, days_ahead)

        return jsonify({
            'forecast': forecast,
            'status': 'success'
        })
    except Exception as exc:
        return jsonify({'status': 'error', 'error': str(exc)}), 500

@app.route('/api/workload/conflicts', methods=['GET'])
def get_workload_conflicts():
    """Get all engineers with workload conflicts."""
    try:
        days_ahead = request.args.get('days_ahead', default=90, type=int)
        days_ahead = min(max(days_ahead, 7), 365)

        conflicts = workload_analyzer.find_workload_conflicts(days_ahead)

        return jsonify({
            'conflicts': conflicts,
            'total_engineers_at_risk': len(conflicts),
            'days_ahead': days_ahead,
            'status': 'success'
        })
    except Exception as exc:
        return jsonify({'status': 'error', 'error': str(exc)}), 500

@app.route('/api/workload/forecast', methods=['GET'])
def get_company_forecast():
    """Get company-wide workload forecast summary."""
    try:
        days_ahead = request.args.get('days_ahead', default=90, type=int)
        days_ahead = min(max(days_ahead, 7), 365)

        forecast = workload_analyzer.get_company_forecast(days_ahead)

        return jsonify({
            'forecast': forecast,
            'status': 'success'
        })
    except Exception as exc:
        return jsonify({'status': 'error', 'error': str(exc)}), 500

if __name__ == '__main__':
    # Development server
    app.run(debug=True, host='0.0.0.0', port=5000)

