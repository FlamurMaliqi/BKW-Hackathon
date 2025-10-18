"""Conflict detection tailored to the classic projects/engineers schema."""
from collections import defaultdict
from datetime import date, datetime, timedelta, timezone
from typing import Any, Dict, List

from database.connection import db_manager


class ConflictDetector:
    """Derives simple insights from projects, assignments, and absences."""

    def __init__(self) -> None:
        self.db = db_manager

    # ------------------------------------------------------------------
    # Detection routines
    # ------------------------------------------------------------------
    def detect_overallocated_engineers(self) -> List[Dict[str, Any]]:
        engineers = self.db.get_all_engineers()
        overloaded: List[Dict[str, Any]] = []
        for engineer in engineers:
            capacity = float(engineer.get('capacity_hours_per_week') or 0)
            current_hours = float(engineer.get('current_hours') or 0)
            workload_percent = float(engineer.get('workload_percent') or 0)
            flagged = engineer.get('is_overworked')
            if capacity and current_hours > capacity:
                overloaded.append({
                    'engineer_id': engineer.get('id'),
                    'engineer_name': engineer.get('name'),
                    'capacity_hours_per_week': capacity,
                    'assigned_hours_per_week': current_hours,
                    'overload_hours': round(current_hours - capacity, 2),
                    'workload_percent': round((current_hours / capacity) * 100, 1)
                })
            elif flagged or workload_percent >= 95:
                overloaded.append({
                    'engineer_id': engineer.get('id'),
                    'engineer_name': engineer.get('name'),
                    'capacity_hours_per_week': capacity,
                    'assigned_hours_per_week': current_hours,
                    'overload_hours': round(max(current_hours - capacity, 0), 2),
                    'workload_percent': workload_percent
                })

        overloaded.sort(key=lambda item: item['overload_hours'], reverse=True)
        return overloaded

    def detect_projects_without_assignments(self) -> List[Dict[str, Any]]:
        return self.db.get_projects_without_assignments()

    def detect_absence_conflicts(self, days_ahead: int = 28) -> List[Dict[str, Any]]:
        start = date.today()
        end = start + timedelta(days=days_ahead)
        absences = self.db.get_absences_between(start=start, end=end)
        if not absences:
            return []

        assignments = self.db.get_assignments_with_details()
        assignments_by_engineer: Dict[int, List[Dict[str, Any]]] = defaultdict(list)
        for assignment in assignments:
            engineer_id = assignment.get('engineer_id')
            if engineer_id is not None:
                assignments_by_engineer[engineer_id].append(assignment)

        conflicts: List[Dict[str, Any]] = []
        for absence in absences:
            engineer_id = absence.get('engineer_id')
            overlapping_assignments: List[Dict[str, Any]] = []
            for assignment in assignments_by_engineer.get(engineer_id, []):
                assign_start = self._parse_date(assignment.get('start_date'), default_min=True)
                assign_end = self._parse_date(assignment.get('end_date'), default_max=True)
                absence_start = self._parse_date(absence.get('start_date'), default_min=True)
                absence_end = self._parse_date(absence.get('end_date'), default_max=True)

                if assign_start <= absence_end and assign_end >= absence_start:
                    overlapping_assignments.append({
                        'project_id': assignment.get('project_id'),
                        'project_name': assignment.get('project_name'),
                        'hours_per_week': assignment.get('hours_per_week'),
                        'assignment_start': assignment.get('start_date'),
                        'assignment_end': assignment.get('end_date'),
                    })

            conflicts.append({
                'absence_id': absence.get('id'),
                'engineer_id': engineer_id,
                'engineer_name': absence.get('engineer_name'),
                'start_date': absence.get('start_date'),
                'end_date': absence.get('end_date'),
                'reason': absence.get('reason'),
                'type': absence.get('type'),
                'overlapping_assignments': overlapping_assignments,
            })

        return conflicts

    # ------------------------------------------------------------------
    # Summary helpers
    # ------------------------------------------------------------------
    def get_workload_summary(self) -> Dict[str, Any]:
        engineers = self.db.get_all_engineers()
        projects = self.db.get_all_projects()

        total_engineers = len(engineers)
        total_projects = len(projects)
        total_capacity = sum(float(e.get('capacity_hours_per_week') or 0) for e in engineers)
        assigned_hours = sum(float(e.get('current_hours') or 0) for e in engineers)

        peak_engineer: Dict[str, Any] | None = None
        for engineer in engineers:
            capacity = float(engineer.get('capacity_hours_per_week') or 0)
            current = float(engineer.get('current_hours') or 0)
            ratio = current / capacity if capacity else 0.0
            if peak_engineer is None or ratio > peak_engineer['utilisation']:
                peak_engineer = {
                    'engineer_id': engineer.get('id'),
                    'engineer_name': engineer.get('name'),
                    'capacity_hours_per_week': capacity,
                    'assigned_hours_per_week': current,
                    'utilisation': round(ratio, 2),
                    'availability': engineer.get('availability'),
                    'team_name': engineer.get('team_name'),
                }

        return {
            'generated_at': datetime.now(timezone.utc).isoformat(),
            'total_engineers': total_engineers,
            'total_projects': total_projects,
            'total_capacity_hours': round(total_capacity, 2),
            'assigned_hours': round(assigned_hours, 2),
            'average_utilisation': round((assigned_hours / total_capacity), 2) if total_capacity else 0.0,
            'peak_engineer': peak_engineer,
        }

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------
    def get_all_conflicts(self, days_ahead: int = 28) -> Dict[str, Any]:
        return {
            'overallocated_engineers': self.detect_overallocated_engineers(),
            'projects_without_assignments': self.detect_projects_without_assignments(),
            'upcoming_absences': self.detect_absence_conflicts(days_ahead=days_ahead),
            'workload_summary': self.get_workload_summary(),
        }

    # ------------------------------------------------------------------
    # Internal utilities
    # ------------------------------------------------------------------
    @staticmethod
    def _parse_date(value: Any, *, default_min: bool = False, default_max: bool = False) -> date:
        if not value:
            if default_min:
                return date(1970, 1, 1)
            if default_max:
                return date(2099, 12, 31)
            raise ValueError('Date value required')

        if isinstance(value, date):
            return value

        return date.fromisoformat(str(value))


# Global conflict detector instance
conflict_detector = ConflictDetector()

