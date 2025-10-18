"""
Workload Analyzer - Enhanced workload detection with timeline projections.

This module provides advanced workload analysis capabilities including:
- Timeline-based workload calculations
- Future overwork period detection
- Team-level workload forecasting
- Conflict identification for overlapping high-load projects
"""

from datetime import date, timedelta
from typing import Dict, List, Optional, Any
from collections import defaultdict


class WorkloadAnalyzer:
    """Analyzes engineer workload over time with future projections."""

    def __init__(self, db_manager):
        """Initialize with database manager instance."""
        self.db = db_manager

    def calculate_engineer_timeline(
        self,
        engineer_id: int,
        start_date: date,
        end_date: date
    ) -> List[Dict[str, Any]]:
        """
        Calculate daily workload for an engineer over a date range.

        Returns a list of daily workload entries with:
        - date: the date
        - hours_assigned: total hours for that day
        - projects: list of project names active on that date
        - is_overworked: boolean if hours exceed capacity
        """
        # Get engineer capacity
        engineer_query = """
        SELECT capacity_hours_per_week, name
        FROM engineers
        WHERE id = %s
        """
        engineer_result = self.db.execute_query(engineer_query, (engineer_id,))
        if not engineer_result:
            return []

        engineer = engineer_result[0]
        daily_capacity = engineer['capacity_hours_per_week'] / 5.0  # Assuming 5 work days

        # Get all assignments that overlap with the date range
        assignments_query = """
        SELECT
            pa.hours_per_week,
            pa.start_date,
            pa.end_date,
            p.name as project_name,
            p.start_date as project_start,
            p.deadline as project_deadline
        FROM project_assignments pa
        JOIN projects p ON p.id = pa.project_id
        WHERE pa.engineer_id = %s
          AND (
              (pa.start_date IS NULL AND pa.end_date IS NULL)
              OR (pa.start_date <= %s AND (pa.end_date IS NULL OR pa.end_date >= %s))
              OR (pa.start_date IS NULL AND pa.end_date >= %s)
          )
        """
        assignments = self.db.execute_query(
            assignments_query,
            (engineer_id, end_date, start_date, start_date)
        )

        # Build daily timeline
        timeline = []
        current = start_date
        while current <= end_date:
            # Skip weekends
            if current.weekday() >= 5:  # Saturday = 5, Sunday = 6
                current += timedelta(days=1)
                continue

            daily_hours = 0.0
            active_projects = []

            for assignment in assignments:
                # Check if assignment is active on this date
                # Convert string dates to date objects if necessary
                assignment_start_raw = assignment.get('start_date') or assignment.get('project_start') or start_date
                assignment_end_raw = assignment.get('end_date') or assignment.get('project_deadline') or end_date

                # Parse dates if they're strings
                if isinstance(assignment_start_raw, str):
                    from datetime import datetime
                    assignment_start = datetime.fromisoformat(assignment_start_raw).date()
                else:
                    assignment_start = assignment_start_raw

                if isinstance(assignment_end_raw, str):
                    from datetime import datetime
                    assignment_end = datetime.fromisoformat(assignment_end_raw).date()
                else:
                    assignment_end = assignment_end_raw

                if assignment_start <= current <= assignment_end:
                    # Convert weekly hours to daily
                    daily_assignment_hours = assignment['hours_per_week'] / 5.0
                    daily_hours += daily_assignment_hours
                    active_projects.append(assignment['project_name'])

            timeline.append({
                'date': current.isoformat(),
                'hours_assigned': round(daily_hours, 2),
                'capacity': round(daily_capacity, 2),
                'utilization_percent': round((daily_hours / daily_capacity) * 100, 2) if daily_capacity > 0 else 0,
                'projects': active_projects,
                'is_overworked': daily_hours > daily_capacity
            })

            current += timedelta(days=1)

        return timeline

    def detect_overwork_periods(
        self,
        engineer_id: int,
        days_ahead: int = 90
    ) -> List[Dict[str, Any]]:
        """
        Detect periods where engineer will be overworked in the future.

        Returns a list of overwork periods with:
        - start_date: when overwork period begins
        - end_date: when it ends
        - avg_hours_per_day: average daily hours during period
        - max_hours_per_day: peak daily hours
        - projects: list of conflicting projects
        """
        start = date.today()
        end = start + timedelta(days=days_ahead)

        timeline = self.calculate_engineer_timeline(engineer_id, start, end)

        # Find continuous overwork periods
        periods = []
        current_period = None

        for day in timeline:
            if day['is_overworked']:
                if current_period is None:
                    # Start new period
                    current_period = {
                        'start_date': day['date'],
                        'end_date': day['date'],
                        'hours': [day['hours_assigned']],
                        'projects': set(day['projects'])
                    }
                else:
                    # Extend current period
                    current_period['end_date'] = day['date']
                    current_period['hours'].append(day['hours_assigned'])
                    current_period['projects'].update(day['projects'])
            else:
                if current_period is not None:
                    # Close current period
                    periods.append({
                        'start_date': current_period['start_date'],
                        'end_date': current_period['end_date'],
                        'avg_hours_per_day': round(sum(current_period['hours']) / len(current_period['hours']), 2),
                        'max_hours_per_day': round(max(current_period['hours']), 2),
                        'days_count': len(current_period['hours']),
                        'projects': sorted(list(current_period['projects']))
                    })
                    current_period = None

        # Close last period if still open
        if current_period is not None:
            periods.append({
                'start_date': current_period['start_date'],
                'end_date': current_period['end_date'],
                'avg_hours_per_day': round(sum(current_period['hours']) / len(current_period['hours']), 2),
                'max_hours_per_day': round(max(current_period['hours']), 2),
                'days_count': len(current_period['hours']),
                'projects': sorted(list(current_period['projects']))
            })

        return periods

    def get_team_workload_forecast(
        self,
        team_id: int,
        days_ahead: int = 90
    ) -> Dict[str, Any]:
        """
        Get workload forecast for entire team.

        Returns team summary with member details and overwork alerts.
        """
        # Get team members
        team_query = """
        SELECT id, name, capacity_hours_per_week
        FROM engineers
        WHERE team_id = %s AND status = 'active'
        """
        members = self.db.execute_query(team_query, (team_id,))

        team_forecast = {
            'team_id': team_id,
            'members_count': len(members),
            'members': [],
            'total_overwork_days': 0,
            'engineers_at_risk': 0
        }

        for member in members:
            overwork_periods = self.detect_overwork_periods(member['id'], days_ahead)
            total_overwork_days = sum(p['days_count'] for p in overwork_periods)

            member_forecast = {
                'engineer_id': member['id'],
                'name': member['name'],
                'capacity_hours_per_week': member['capacity_hours_per_week'],
                'overwork_periods': overwork_periods,
                'total_overwork_days': total_overwork_days,
                'is_at_risk': len(overwork_periods) > 0
            }

            team_forecast['members'].append(member_forecast)
            team_forecast['total_overwork_days'] += total_overwork_days
            if member_forecast['is_at_risk']:
                team_forecast['engineers_at_risk'] += 1

        return team_forecast

    def find_workload_conflicts(self, days_ahead: int = 90) -> List[Dict[str, Any]]:
        """
        Find all engineers with workload conflicts in the specified time window.

        Returns list of conflicts with engineer details and overwork periods.
        """
        # Get all active engineers
        engineers_query = """
        SELECT id, name, email, capacity_hours_per_week, team_id
        FROM engineers
        WHERE status = 'active'
        """
        engineers = self.db.execute_query(engineers_query)

        conflicts = []
        for engineer in engineers:
            overwork_periods = self.detect_overwork_periods(engineer['id'], days_ahead)

            if overwork_periods:
                conflicts.append({
                    'engineer_id': engineer['id'],
                    'name': engineer['name'],
                    'email': engineer['email'],
                    'team_id': engineer['team_id'],
                    'capacity_hours_per_week': engineer['capacity_hours_per_week'],
                    'overwork_periods': overwork_periods,
                    'total_overwork_days': sum(p['days_count'] for p in overwork_periods),
                    'severity': 'high' if len(overwork_periods) > 2 else 'medium'
                })

        # Sort by severity and total overwork days
        conflicts.sort(key=lambda x: (x['severity'] == 'high', x['total_overwork_days']), reverse=True)

        return conflicts

    def get_company_forecast(self, days_ahead: int = 90) -> Dict[str, Any]:
        """
        Get company-wide workload forecast summary.

        Returns high-level metrics for management dashboard.
        """
        conflicts = self.find_workload_conflicts(days_ahead)

        # Get all teams
        teams_query = "SELECT id, name FROM teams"
        teams = self.db.execute_query(teams_query)

        return {
            'forecast_period_days': days_ahead,
            'total_engineers_at_risk': len(conflicts),
            'total_overwork_days': sum(c['total_overwork_days'] for c in conflicts),
            'high_severity_count': sum(1 for c in conflicts if c['severity'] == 'high'),
            'medium_severity_count': sum(1 for c in conflicts if c['severity'] == 'medium'),
            'conflicts': conflicts[:10],  # Top 10 most critical
            'teams_count': len(teams)
        }
