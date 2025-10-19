"""AI service for integrating with Gemini AI."""
import os
from typing import Dict, List, Any
import google.generativeai as genai
from database.connection import db_manager
from conflict_detection import conflict_detector


class AIService:
    """Service for AI-powered project management insights using Gemini."""
    
    def __init__(self):
        """Initialize the AI service with Gemini API key."""
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash')
    
    def get_project_context(self) -> str:
        """Get comprehensive project management context for AI."""
        projects = db_manager.get_all_projects()
        engineers = db_manager.get_engineers_with_presence(presence_days=7)
        teams = db_manager.get_team_directory(presence_days=7)
        conflicts = conflict_detector.get_all_conflicts(days_ahead=28)
        
        context = f"""
PROJECT MANAGEMENT DATA:

PROJECTS ({len(projects)} total):
"""
        for project in projects:
            context += f"- {project['name']}: Due {project['deadline']}, {project['status']} status, {project['priority']} priority, {project['completion_percent']}% complete, Budget: CHF {project['budget_total']} (spent: CHF {project['budget_spent']})\n"
            if project['team_members']:
                context += f"  Team: {', '.join(project['team_members'])}\n"

        context += f"\nENGINEERS ({len(engineers)} total):\n"
        for engineer in engineers:
            workload = engineer.get('workload_percent', 0)
            status = "OVERWORKED" if engineer.get('is_overworked') else "OK"
            context += f"- {engineer['name']}: {workload}% workload, {engineer['availability']} availability, {status}\n"
            project_names = engineer.get('project_names', [])
            if project_names and isinstance(project_names, list):
                context += f"  Projects: {', '.join(project_names)}\n"

        context += f"\nTEAMS ({len(teams)} total):\n"
        for team in teams:
            context += f"- {team['name']}: {team['member_count']} members, Performance: {team.get('performance_score', 0)}%\n"

        if conflicts and isinstance(conflicts, list):
            context += f"\nCONFLICTS DETECTED ({len(conflicts)} total):\n"
            for conflict in conflicts[:5]:  # Show top 5 conflicts
                context += f"- {conflict.get('type', 'Unknown')}: {conflict.get('description', 'No description')}\n"
        else:
            context += "\nNo conflicts detected.\n"

        return context

    def chat_with_ai(self, user_query: str) -> Dict[str, Any]:
        """Process user query with Gemini AI using project context."""
        try:
            context = self.get_project_context()
            
            prompt = f"""
You are an AI project management assistant for BKW. You help project managers, engineers, and executives understand project status, identify risks, and make data-driven decisions.

CONTEXT DATA:
{context}

USER QUERY: {user_query}

Please provide a helpful, concise response based on the project data above. Focus on:
1. Direct answers to the user's question
2. Relevant insights from the data
3. Actionable recommendations when appropriate
4. Specific numbers, names, and dates when available

Keep responses professional but conversational. If the query is unclear, ask for clarification.
"""

            response = self.model.generate_content(prompt)
            
            return {
                'response': response.text,
                'status': 'success',
                'model': 'gemini-2.0-flash'
            }
            
        except Exception as e:
            return {
                'response': f"I'm sorry, I encountered an error processing your request: {str(e)}",
                'status': 'error',
                'error': str(e)
            }

    def generate_proactive_alerts(self) -> Dict[str, Any]:
        """Generate AI-powered proactive alerts about project risks and opportunities."""
        try:
            context = self.get_project_context()
            conflicts = conflict_detector.get_all_conflicts(days_ahead=28)

            # Build conflict summary
            conflict_summary = ""
            if conflicts.get('overallocated_engineers'):
                conflict_summary += f"- {len(conflicts['overallocated_engineers'])} engineers overallocated\n"
            if conflicts.get('deadline_overlaps'):
                conflict_summary += f"- {len(conflicts['deadline_overlaps'])} deadline overlaps detected\n"
            if conflicts.get('budget_risks'):
                conflict_summary += f"- {len(conflicts['budget_risks'])} projects at budget risk\n"
            if conflicts.get('upcoming_absences'):
                conflict_summary += f"- {len(conflicts['upcoming_absences'])} upcoming absences with conflicts\n"

            prompt = f"""
You are an AI project management analyst for BKW. Analyze the following project data and generate 3-5 concise, actionable proactive alerts.

PROJECT DATA:
{context}

DETECTED CONFLICTS:
{conflict_summary}

Generate alerts following these guidelines:
1. Focus on the most critical issues that require immediate attention
2. Each alert should be 1-2 sentences maximum
3. Use natural language like "3 projects overlap in June - resource conflict likely"
4. Prioritize critical issues (overallocation, deadline risks, budget overruns)
5. Include specific names, numbers, and dates
6. Format as a JSON array of alert objects with: "message", "severity" (critical/warning/info), "type" (workload/deadline/budget/absence)

Example format:
[
    {{"message": "Engineer Alice Johnson at 125% capacity next week - immediate reallocation needed", "severity": "critical", "type": "workload"}},
    {{"message": "3 projects overlap in June - resource conflict likely", "severity": "warning", "type": "deadline"}}
]

Generate the alerts now (return ONLY valid JSON, no markdown or explanations):
"""

            response = self.model.generate_content(prompt)
            response_text = response.text.strip()

            # Clean up response (remove markdown code blocks if present)
            if response_text.startswith('```'):
                lines = response_text.split('\n')
                response_text = '\n'.join([line for line in lines if not line.strip().startswith('```')])

            # Try to parse as JSON
            import json
            try:
                alerts = json.loads(response_text)
                if not isinstance(alerts, list):
                    alerts = []
            except json.JSONDecodeError:
                # Fallback to basic alerts if AI response isn't valid JSON
                alerts = self._generate_fallback_alerts(conflicts)

            return {
                'alerts': alerts,
                'status': 'success',
                'model': 'gemini-2.0-flash'
            }

        except Exception as e:
            # Return fallback alerts on error
            conflicts = conflict_detector.get_all_conflicts(days_ahead=28)
            return {
                'alerts': self._generate_fallback_alerts(conflicts),
                'status': 'error',
                'error': str(e)
            }

    def _generate_fallback_alerts(self, conflicts: Dict[str, Any]) -> List[Dict[str, str]]:
        """Generate simple rule-based alerts as fallback."""
        alerts = []

        # Overallocated engineers
        if conflicts.get('overallocated_engineers'):
            critical_overloads = [e for e in conflicts['overallocated_engineers'] if e.get('workload_percent', 0) >= 120]
            if critical_overloads:
                engineer = critical_overloads[0]
                alerts.append({
                    'message': f"{engineer['engineer_name']} at {engineer['workload_percent']}% capacity - immediate reallocation needed",
                    'severity': 'critical',
                    'type': 'workload'
                })

        # Deadline overlaps
        if conflicts.get('deadline_overlaps'):
            overlaps = conflicts['deadline_overlaps']
            if len(overlaps) >= 2:
                alerts.append({
                    'message': f"{len(overlaps)} projects have overlapping deadlines - resource conflict likely",
                    'severity': 'warning',
                    'type': 'deadline'
                })

        # Budget risks
        if conflicts.get('budget_risks'):
            critical_risks = [r for r in conflicts['budget_risks'] if r.get('risk_level') == 'critical']
            if critical_risks:
                risk = critical_risks[0]
                alerts.append({
                    'message': f"{risk['project_name']}: {risk['spend_percent']}% spent but only {risk['completion_percent']}% complete",
                    'severity': 'critical',
                    'type': 'budget'
                })

        # Absence conflicts
        if conflicts.get('upcoming_absences'):
            absences_with_conflicts = [a for a in conflicts['upcoming_absences'] if a.get('overlapping_assignments')]
            if len(absences_with_conflicts) >= 2:
                alerts.append({
                    'message': f"{len(absences_with_conflicts)} engineers have upcoming absences conflicting with project deadlines",
                    'severity': 'warning',
                    'type': 'absence'
                })

        return alerts


# Global AI service instance
ai_service = AIService()
