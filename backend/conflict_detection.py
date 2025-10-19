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

    def detect_deadline_overlaps(self, days_window: int = 7) -> List[Dict[str, Any]]:
        """Detect projects with overlapping deadlines (within N days of each other)."""
        projects = self.db.get_all_projects()
        overlaps: List[Dict[str, Any]] = []

        # Sort projects by deadline
        sorted_projects = sorted(
            [p for p in projects if p.get('deadline')],
            key=lambda p: self._parse_date(p.get('deadline'))
        )

        # Check for projects with deadlines within the time window
        for i, project1 in enumerate(sorted_projects):
            deadline1 = self._parse_date(project1.get('deadline'))
            overlapping_projects = []

            for project2 in sorted_projects[i+1:]:
                deadline2 = self._parse_date(project2.get('deadline'))
                days_diff = abs((deadline2 - deadline1).days)

                if days_diff <= days_window:
                    overlapping_projects.append({
                        'project_id': project2.get('id'),
                        'project_name': project2.get('name'),
                        'deadline': str(deadline2),
                        'priority': project2.get('priority'),
                        'completion_percent': project2.get('completion_percent', 0),
                        'days_apart': days_diff
                    })
                else:
                    break  # Projects are sorted, so we can stop checking

            if overlapping_projects:
                overlaps.append({
                    'project_id': project1.get('id'),
                    'project_name': project1.get('name'),
                    'deadline': str(deadline1),
                    'priority': project1.get('priority'),
                    'completion_percent': project1.get('completion_percent', 0),
                    'overlapping_projects': overlapping_projects,
                    'total_overlaps': len(overlapping_projects)
                })

        return overlaps

    def detect_budget_risks(self) -> List[Dict[str, Any]]:
        """Detect projects at budget risk (high spend with low completion)."""
        projects = self.db.get_all_projects()
        risks: List[Dict[str, Any]] = []

        for project in projects:
            budget_total = float(project.get('budget_total') or 0)
            budget_spent = float(project.get('budget_spent') or 0)
            completion = float(project.get('completion_percent') or 0)

            if budget_total == 0:
                continue

            spend_percent = (budget_spent / budget_total) * 100

            # Risk criteria: spent >80% but completion <80%
            # Or spent >90% but completion <90%
            risk_level = None
            if spend_percent >= 90 and completion < 90:
                risk_level = 'critical'
            elif spend_percent >= 80 and completion < 80:
                risk_level = 'warning'

            if risk_level:
                risks.append({
                    'project_id': project.get('id'),
                    'project_name': project.get('name'),
                    'budget_total': budget_total,
                    'budget_spent': budget_spent,
                    'budget_remaining': budget_total - budget_spent,
                    'spend_percent': round(spend_percent, 1),
                    'completion_percent': completion,
                    'risk_level': risk_level,
                    'priority': project.get('priority'),
                    'deadline': project.get('deadline')
                })

        # Sort by risk level (critical first) then by spend percentage
        risks.sort(key=lambda r: (0 if r['risk_level'] == 'critical' else 1, -r['spend_percent']))
        return risks

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
            'deadline_overlaps': self.detect_deadline_overlaps(days_window=7),
            'budget_risks': self.detect_budget_risks(),
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

