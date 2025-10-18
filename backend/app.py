"""BKW Hackathon - AI Project Management Backend (refactored schema)"""
from flask import Flask, request, jsonify
from flask_cors import CORS

from conflict_detection import conflict_detector
from database.connection import db_manager

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

@app.route('/')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'BKW AI Project Management API is running',
        'version': '1.0.0'
    })

@app.route('/api/ai/chat', methods=['POST'])
def ai_chat():
    """
    Main AI assistant endpoint
    Handles natural language queries about project status, conflicts, etc.
    """
    try:
        data = request.get_json()
        query = data.get('query', '')
        
        # TODO: Implement AI processing logic
        # This will be the core AI assistant functionality
        
        return jsonify({
            'response': f"AI Assistant received: '{query}' - Processing...",
            'status': 'success'
        })
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

@app.route('/api/projects', methods=['GET'])
def get_projects():
    """Return the current project portfolio enriched with risk metrics."""
    try:
        projects = db_manager.get_project_portfolio()
        return jsonify({'projects': projects, 'status': 'success'})
    except Exception as exc:  # pragma: no cover - defensive API layer
        return jsonify({'status': 'error', 'error': str(exc)}), 500

@app.route('/api/conflicts', methods=['GET'])
def get_conflicts():
    """Run the conflict detection engine using the new schema."""
    try:
        days_ahead = request.args.get('daysAhead', default=28, type=int)
        risk_threshold = request.args.get('riskThreshold', default=9.0, type=float)
        current_threshold = request.args.get('currentThreshold', default=1.0, type=float)
        future_threshold = request.args.get('futureThreshold', default=1.0, type=float)

        conflicts = conflict_detector.get_all_conflicts(
            days_ahead=days_ahead,
            risk_threshold=risk_threshold,
            current_threshold=current_threshold,
            future_threshold=future_threshold,
        )
        return jsonify({'conflicts': conflicts, 'status': 'success'})
    except Exception as exc:  # pragma: no cover - defensive API layer
        return jsonify({'status': 'error', 'error': str(exc)}), 500

if __name__ == '__main__':
    # Development server
    app.run(debug=True, host='0.0.0.0', port=5000)

