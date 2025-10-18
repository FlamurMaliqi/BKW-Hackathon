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


# Global AI service instance
ai_service = AIService()
