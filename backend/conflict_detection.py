"""
BKW Hackathon - Conflict Detection Engine
Refactored to operate on the new resource planning and risk schema.
"""
from datetime import date, datetime, timedelta
from typing import Any, Dict, List, Optional

from database.connection import db_manager

_AVAILABLE_CODES = {'AVAILABLE', 'FLEX', 'FREE'}


class ConflictDetector:
    """Detects conflicts and insights using the modernised data model."""

    def __init__(self) -> None:
        self.db = db_manager
        self._capacity_cache: Optional[Dict[str, Any]] = None

    # ------------------------------------------------------------------
    # Capacity context helpers
    # ------------------------------------------------------------------
    def _load_capacity_context(self) -> Dict[str, Any]:
        snapshot = self.db.get_latest_capacity_snapshot()
        if not snapshot:
            return {
                'snapshot': None,
                'entries': [],
                'member_load': {},
            }

        entries = self.db.get_capacity_entries(snapshot_id=int(snapshot['id']))
        member_load: Dict[int, Dict[str, Any]] = {}

        for entry in entries:
            member_id = entry.get('team_member_id')
            if member_id is None:
                continue

            current_load = float(entry.get('current_week_load') or 0.0)
            four_week_load = float(entry.get('four_week_load') or 0.0)

            member_data = member_load.setdefault(
                member_id,
                {
                    'team_member_id': member_id,
                    'full_name': entry.get('full_name'),
                    'team_name': entry.get('team_name'),
                    'capacity_percent': float(entry.get('capacity_percent') or 100.0),
                    'current_load': 0.0,
                    'four_week_load': 0.0,
                    'assignments': [],
                },
            )

            member_data['current_load'] += current_load
            member_data['four_week_load'] += four_week_load
            member_data['assignments'].append({
                'project_code': entry.get('project_code'),
                'project_name': entry.get('project_name'),
                'workstream': entry.get('workstream'),
                'current_week_load': round(current_load, 2),
                'four_week_load': round(four_week_load, 2),
                'risk_flag': entry.get('risk_flag'),
            })

        return {
            'snapshot': snapshot,
            'entries': entries,
            'member_load': member_load,
        }

    def _capacity_context(self) -> Dict[str, Any]:
        if self._capacity_cache is None:
            self._capacity_cache = self._load_capacity_context()
        return self._capacity_cache

    def _reset_capacity_cache(self) -> None:
        self._capacity_cache = None

    @staticmethod
    def _member_capacity_fte(member_data: Dict[str, Any]) -> float:
        capacity_percent = float(member_data.get('capacity_percent') or 100.0)
        fte = capacity_percent / 100.0
        return fte if fte > 0 else 1.0

    # ------------------------------------------------------------------
    # Detection routines
    # ------------------------------------------------------------------
    def detect_capacity_pressure(
        self,
        current_threshold: float = 1.0,
        future_threshold: float = 1.0,
    ) -> List[Dict[str, Any]]:
        context = self._capacity_context()
        member_load: Dict[int, Dict[str, Any]] = context['member_load']
        if not member_load:
            return []

        overloads: List[Dict[str, Any]] = []
        for member_id, data in member_load.items():
            capacity_fte = self._member_capacity_fte(data)
            current_ratio = data['current_load'] / capacity_fte if capacity_fte else 0.0
            future_ratio = data['four_week_load'] / capacity_fte if capacity_fte else 0.0

            if current_ratio <= current_threshold and future_ratio <= future_threshold:
                continue

            overloads.append({
                'team_member_id': member_id,
                'full_name': data.get('full_name'),
                'team_name': data.get('team_name'),
                'capacity_fte': round(capacity_fte, 2),
                'current_load_fte': round(data['current_load'], 2),
                'four_week_load_fte': round(data['four_week_load'], 2),
                'current_load_ratio': round(current_ratio, 2),
                'four_week_load_ratio': round(future_ratio, 2),
                'assignments': data['assignments'],
            })

        overloads.sort(key=lambda item: item['current_load_ratio'], reverse=True)
        return overloads

    def detect_unassigned_projects(self) -> List[Dict[str, Any]]:
        context = self._capacity_context()
        snapshot = context['snapshot']
        if not snapshot:
            return []
        return self.db.get_projects_without_allocations(snapshot_id=int(snapshot['id']))

    def detect_availability_conflicts(self, days_ahead: int = 28) -> List[Dict[str, Any]]:
        context = self._capacity_context()
        member_load: Dict[int, Dict[str, Any]] = context['member_load']
        if not member_load:
            return []

        start = date.today()
        end = start + timedelta(days=days_ahead)
        availability = self.db.get_member_availability_window(start, end)
        if not availability:
            return []

        conflicts: List[Dict[str, Any]] = []
        for record in availability:
            status_code = (record.get('status_code') or '').upper()
            if status_code in _AVAILABLE_CODES:
                continue

            member_id = record.get('team_member_id')
            if member_id not in member_load:
                continue

            load = member_load[member_id]
            conflicts.append({
                'team_member_id': member_id,
                'full_name': load.get('full_name'),
                'team_name': load.get('team_name'),
                'day': record.get('day'),
                'status_code': record.get('status_code'),
                'status_description': record.get('status_description'),
                'comment': record.get('comment'),
                'current_load_fte': round(load['current_load'], 2),
                'four_week_load_fte': round(load['four_week_load'], 2),
            })

        conflicts.sort(key=lambda item: (item['day'], item['full_name']))
        return conflicts

    def detect_high_risk_projects(self, risk_threshold: float = 9.0) -> List[Dict[str, Any]]:
        portfolio = self.db.get_project_portfolio()
        high_risk: List[Dict[str, Any]] = []
        for project in portfolio:
            score = float(project.get('computed_risk_score') or 0.0)
            if score < risk_threshold:
                continue

            high_risk.append({
                'project_id': project.get('id'),
                'project_code': project.get('project_code'),
                'project_name': project.get('project_name'),
                'delivery_team': project.get('delivery_team'),
                'status': project.get('status'),
                'computed_risk_score': round(score, 2),
                'recorded_risk_score': project.get('recorded_risk_score'),
                'risk_probability': project.get('risk_probability'),
                'risk_impact': project.get('risk_impact'),
                'risk_description': project.get('risk_description'),
                'mitigation_plan': project.get('mitigation_plan'),
                'reporting_year': project.get('reporting_year'),
                'reporting_quarter': project.get('reporting_quarter'),
            })

        high_risk.sort(key=lambda item: item['computed_risk_score'], reverse=True)
        return high_risk

    def get_workload_summary(self) -> Dict[str, Any]:
        context = self._capacity_context()
        snapshot = context['snapshot']
        member_load: Dict[int, Dict[str, Any]] = context['member_load']

        team_members = self.db.get_team_members()
        total_members = len(team_members)
        total_capacity = sum(self._member_capacity_fte(member) for member in team_members)

        current_total = sum(data['current_load'] for data in member_load.values())
        four_week_total = sum(data['four_week_load'] for data in member_load.values())

        overloaded = 0
        peak_member: Optional[Dict[str, Any]] = None
        for data in member_load.values():
            capacity_fte = self._member_capacity_fte(data)
            current_ratio = data['current_load'] / capacity_fte if capacity_fte else 0.0
            future_ratio = data['four_week_load'] / capacity_fte if capacity_fte else 0.0

            if current_ratio > 1.0 or future_ratio > 1.0:
                overloaded += 1

            if not peak_member or current_ratio > peak_member['current_load_ratio']:
                peak_member = {
                    'team_member_id': data['team_member_id'],
                    'full_name': data.get('full_name'),
                    'team_name': data.get('team_name'),
                    'capacity_fte': round(capacity_fte, 2),
                    'current_load_fte': round(data['current_load'], 2),
                    'four_week_load_fte': round(data['four_week_load'], 2),
                    'current_load_ratio': round(current_ratio, 2),
                }

        summary = {
            'snapshot': snapshot,
            'total_team_members': total_members,
            'total_capacity_fte': round(total_capacity, 2),
            'current_committed_fte': round(current_total, 2),
            'four_week_committed_fte': round(four_week_total, 2),
            'overloaded_member_count': overloaded,
            'overloaded_member_ratio': round((overloaded / total_members * 100.0), 1) if total_members else 0.0,
            'peak_member': peak_member,
            'generated_at': datetime.utcnow().isoformat() + 'Z',
        }
        return summary

    # ------------------------------------------------------------------
    # Public aggregation
    # ------------------------------------------------------------------
    def get_all_conflicts(
        self,
        days_ahead: int = 28,
        risk_threshold: float = 9.0,
        current_threshold: float = 1.0,
        future_threshold: float = 1.0,
    ) -> Dict[str, Any]:
        self._reset_capacity_cache()
        try:
            return {
                'capacity_pressure': self.detect_capacity_pressure(current_threshold, future_threshold),
                'unassigned_projects': self.detect_unassigned_projects(),
                'upcoming_availability_conflicts': self.detect_availability_conflicts(days_ahead=days_ahead),
                'high_risk_projects': self.detect_high_risk_projects(risk_threshold=risk_threshold),
                'workload_summary': self.get_workload_summary(),
            }
        finally:
            self._reset_capacity_cache()


# Global conflict detector instance
conflict_detector = ConflictDetector()

