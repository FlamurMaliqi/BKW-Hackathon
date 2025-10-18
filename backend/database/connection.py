"""Database helpers for the AI project management backend."""
import os
from contextlib import contextmanager
from datetime import date, datetime, timedelta
from decimal import Decimal
from typing import Any, Dict, List, Optional, Sequence

import psycopg2
from psycopg2.extras import RealDictCursor


class DatabaseManager:
    """Manages database connections and domain-specific queries."""

    def __init__(self) -> None:
        self.database_url = os.getenv('DATABASE_URL', 'postgresql://localhost/bkw_pm')

    @contextmanager
    def get_connection(self):
        """Context manager for PostgreSQL connections."""
        conn = None
        try:
            conn = psycopg2.connect(self.database_url)
            yield conn
        except Exception:
            if conn:
                conn.rollback()
            raise
        finally:
            if conn:
                conn.close()

    # ------------------------------------------------------------------
    # Low level helpers
    # ------------------------------------------------------------------
    def _normalize_value(self, value: Any) -> Any:
        if isinstance(value, Decimal):
            return float(value)
        if isinstance(value, (datetime, date)):
            return value.isoformat()
        if isinstance(value, list):
            return [self._normalize_value(item) for item in value]
        if isinstance(value, tuple):
            return [self._normalize_value(item) for item in value]
        if isinstance(value, dict):
            return {key: self._normalize_value(val) for key, val in value.items()}
        return value

    def _normalize_row(self, row: Dict[str, Any]) -> Dict[str, Any]:
        return {key: self._normalize_value(value) for key, value in row.items()}

    def execute_query(self, query: str, params: Optional[Sequence[Any]] = None) -> List[Dict[str, Any]]:
        """Execute a SELECT query and return JSON-friendly dictionaries."""
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query, params)
                if cursor.description is None:
                    return []
                rows = cursor.fetchall()
        return [self._normalize_row(dict(row)) for row in rows]

    def execute_update(self, query: str, params: Optional[Sequence[Any]] = None) -> int:
        """Execute an INSERT/UPDATE/DELETE query and return affected rows."""
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, params)
                conn.commit()
                return cursor.rowcount

    # ------------------------------------------------------------------
    # Domain-specific accessors aligned with the classic schema
    # ------------------------------------------------------------------
    def get_all_projects(self) -> List[Dict[str, Any]]:
        """Return all projects enriched with allocation metrics."""
        query = """
        SELECT
            p.id,
            p.name,
            p.description,
            p.deadline,
            p.status,
            p.priority,
            p.completion_percent,
            p.budget_total,
            p.budget_spent,
            p.created_at,
            p.updated_at,
            COUNT(DISTINCT pa.engineer_id) AS assigned_engineers,
            COALESCE(SUM(pa.hours_per_week), 0) AS total_hours,
            COALESCE(array_agg(DISTINCT e.name) FILTER (WHERE e.id IS NOT NULL), '{}') AS team_members
        FROM projects p
        LEFT JOIN project_assignments pa ON pa.project_id = p.id
        LEFT JOIN engineers e ON e.id = pa.engineer_id
        GROUP BY p.id, p.name, p.description, p.deadline, p.status, p.priority,
                 p.completion_percent, p.budget_total, p.budget_spent, p.created_at, p.updated_at
        ORDER BY p.deadline
        """
        projects = self.execute_query(query)
        for project in projects:
            budget_total = project.get('budget_total') or 0.0
            budget_spent = project.get('budget_spent') or 0.0
            project['budget_remaining'] = round(budget_total - budget_spent, 2)
            project['budget_utilisation'] = round(
                (budget_spent / budget_total), 2
            ) if budget_total else 0.0
            project['team_members'] = sorted(project.get('team_members', []))
        return projects

    def get_all_engineers(self) -> List[Dict[str, Any]]:
        """Return engineers with allocation and team context."""
        query = """
        SELECT
            e.id,
            e.name,
            e.email,
            e.phone,
            e.capacity_hours_per_week,
            e.role,
            e.team_id,
            t.name AS team_name,
            t.color AS team_color,
            t.performance_score,
            e.status,
            e.availability,
            e.workload_percent,
            e.is_overworked,
            e.skills,
            e.created_at,
            COALESCE(SUM(pa.hours_per_week), 0) AS current_hours,
            e.capacity_hours_per_week - COALESCE(SUM(pa.hours_per_week), 0) AS available_hours,
            COALESCE(array_agg(DISTINCT pr.name) FILTER (WHERE pr.id IS NOT NULL), '{}') AS project_names
        FROM engineers e
        LEFT JOIN teams t ON t.id = e.team_id
        LEFT JOIN project_assignments pa ON pa.engineer_id = e.id
        LEFT JOIN projects pr ON pr.id = pa.project_id
        GROUP BY e.id, e.name, e.email, e.phone, e.capacity_hours_per_week, e.role,
                 e.team_id, t.name, t.color, t.performance_score, e.status,
                 e.availability, e.workload_percent, e.is_overworked, e.skills, e.created_at
        ORDER BY e.name
        """
        engineers = self.execute_query(query)
        for engineer in engineers:
            engineer['project_names'] = sorted(engineer.get('project_names', []))
        return engineers

    def get_projects_without_assignments(self) -> List[Dict[str, Any]]:
        """Return projects that currently have no engineer assignments."""
        query = """
        SELECT
            p.id,
            p.name,
            p.description,
            p.deadline,
            p.status
        FROM projects p
        LEFT JOIN project_assignments pa ON pa.project_id = p.id
        WHERE pa.id IS NULL
        ORDER BY p.deadline
        """
        return self.execute_query(query)

    def get_assignments_with_details(self) -> List[Dict[str, Any]]:
        """Return project assignments with engineer and project names."""
        query = """
        SELECT
            pa.id,
            pa.engineer_id,
            pa.project_id,
            pa.hours_per_week,
            pa.start_date,
            pa.end_date,
            e.name AS engineer_name,
            p.name AS project_name,
            p.deadline AS project_deadline
        FROM project_assignments pa
        JOIN engineers e ON e.id = pa.engineer_id
        JOIN projects p ON p.id = pa.project_id
        ORDER BY e.name, p.deadline
        """
        return self.execute_query(query)

    # ------------------------------------------------------------------
    # Extended helpers for enriched API payloads
    # ------------------------------------------------------------------
    def get_recent_presence_map(self, *, days: int = 7) -> Dict[int, List[Dict[str, Any]]]:
        """Return recent presence entries keyed by engineer id."""
        days = max(days, 1)
        start_date = date.today() - timedelta(days=days - 1)
        query = """
        SELECT engineer_id, presence_date, status
        FROM engineer_presence
        WHERE presence_date >= %s
        ORDER BY engineer_id, presence_date
        """
        rows = self.execute_query(query, (start_date,))
        presence_map: Dict[int, List[Dict[str, Any]]] = {}
        for row in rows:
            engineer_id = row.get('engineer_id')
            if engineer_id is None:
                continue
            presence_map.setdefault(engineer_id, []).append({
                'date': row.get('presence_date'),
                'status': row.get('status')
            })
        return presence_map

    def get_current_absence_map(self) -> Dict[int, Dict[str, Any]]:
        """Return absences that overlap with the current day keyed by engineer."""
        query = """
        SELECT
            a.engineer_id,
            a.start_date,
            a.end_date,
            a.type,
            a.reason
        FROM absences a
        WHERE CURRENT_DATE BETWEEN a.start_date AND a.end_date
        """
        rows = self.execute_query(query)
        absence_map: Dict[int, Dict[str, Any]] = {}
        for row in rows:
            engineer_id = row.get('engineer_id')
            if engineer_id is None:
                continue
            absence_map[engineer_id] = row
        return absence_map

    def get_engineers_with_presence(self, *, presence_days: int = 7) -> List[Dict[str, Any]]:
        """Return engineers enriched with presence and current absence data."""
        engineers = self.get_all_engineers()
        presence_map = self.get_recent_presence_map(days=presence_days)
        absence_map = self.get_current_absence_map()

        for engineer in engineers:
            engineer_id = engineer.get('id')
            engineer['presence'] = presence_map.get(engineer_id, [])
            engineer['current_absence'] = absence_map.get(engineer_id)
        return engineers

    def get_team_directory(self, *, presence_days: int = 7) -> List[Dict[str, Any]]:
        """Return teams with their members and project coverage."""
        teams = self.execute_query(
            """
            SELECT id, name, description, color, performance_score, created_at
            FROM teams
            ORDER BY name
            """
        )
        team_map: Dict[int, Dict[str, Any]] = {
            team['id']: {
                **team,
                'member_count': 0,
                'projects': [],
                'members': []
            }
            for team in teams
        }

        engineers = self.get_engineers_with_presence(presence_days=presence_days)
        for engineer in engineers:
            team_id = engineer.get('team_id')
            if team_id is None or team_id not in team_map:
                continue
            team_entry = team_map[team_id]
            team_entry['members'].append(engineer)
            team_entry['member_count'] = len(team_entry['members'])
            project_names = engineer.get('project_names', []) or []
            if project_names:
                combined = set(team_entry['projects'])
                combined.update(project_names)
                team_entry['projects'] = sorted(combined)

        return list(team_map.values())

    def get_absences_between(self, start: date, end: date) -> List[Dict[str, Any]]:
        """Return absences that overlap with the provided window."""
        query = """
        SELECT
            a.id,
            a.engineer_id,
            a.start_date,
            a.end_date,
            a.reason,
            a.type,
            a.created_at,
            e.name AS engineer_name
        FROM absences a
        JOIN engineers e ON e.id = a.engineer_id
        WHERE a.start_date <= %s
          AND a.end_date >= %s
        ORDER BY a.start_date
        """
        return self.execute_query(query, (end, start))

    def get_engineer_absences(self, engineer_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """Return absences for a specific engineer or everyone."""
        if engineer_id is not None:
            query = """
            SELECT
                a.id,
                a.engineer_id,
                a.start_date,
                a.end_date,
                a.reason,
                a.type,
                a.created_at,
                e.name AS engineer_name
            FROM absences a
            JOIN engineers e ON e.id = a.engineer_id
            WHERE a.engineer_id = %s
            ORDER BY a.start_date
            """
            return self.execute_query(query, (engineer_id,))

        query = """
        SELECT
            a.id,
            a.engineer_id,
            a.start_date,
            a.end_date,
            a.reason,
            a.type,
            a.created_at,
            e.name AS engineer_name
        FROM absences a
        JOIN engineers e ON e.id = a.engineer_id
        ORDER BY a.start_date
        """
        return self.execute_query(query)

    # ------------------------------------------------------------------
    # Project and assignment mutation methods
    # ------------------------------------------------------------------
    def create_project(
        self,
        name: str,
        description: str,
        deadline: date,
        priority: str = 'medium',
        budget_total: float = 0.0,
        start_date: Optional[date] = None
    ) -> Dict[str, Any]:
        """Create a new project and return it."""
        query = """
        INSERT INTO projects (name, description, start_date, deadline, priority, budget_total, status, completion_percent, budget_spent)
        VALUES (%s, %s, %s, %s, %s, %s, 'active', 0, 0)
        RETURNING id, name, description, start_date, deadline, status, priority, completion_percent, budget_total, budget_spent, created_at, updated_at
        """
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query, (name, description, start_date, deadline, priority, budget_total))
                conn.commit()
                result = cursor.fetchone()
                if result:
                    return self._normalize_row(dict(result))
        raise ValueError('Failed to create project')

    def update_project(self, project_id: int, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Update project fields and return updated project."""
        allowed_fields = {'name', 'description', 'deadline', 'status', 'priority', 'completion_percent', 'budget_total', 'budget_spent'}
        update_fields = {k: v for k, v in updates.items() if k in allowed_fields}

        if not update_fields:
            raise ValueError('No valid fields to update')

        set_clause = ', '.join([f"{field} = %s" for field in update_fields.keys()])
        set_clause += ', updated_at = CURRENT_TIMESTAMP'
        values = list(update_fields.values()) + [project_id]

        query = f"""
        UPDATE projects
        SET {set_clause}
        WHERE id = %s
        RETURNING id, name, description, deadline, status, priority, completion_percent, budget_total, budget_spent, created_at, updated_at
        """
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query, values)
                conn.commit()
                result = cursor.fetchone()
                if result:
                    return self._normalize_row(dict(result))
        raise ValueError(f'Project with id {project_id} not found')

    def assign_engineer_to_project(
        self,
        engineer_id: int,
        project_id: int,
        hours_per_week: int,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> Dict[str, Any]:
        """Assign an engineer to a project."""
        query = """
        INSERT INTO project_assignments (engineer_id, project_id, hours_per_week, start_date, end_date)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING id, engineer_id, project_id, hours_per_week, start_date, end_date, created_at
        """
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query, (engineer_id, project_id, hours_per_week, start_date, end_date))
                conn.commit()
                result = cursor.fetchone()
                if result:
                    return self._normalize_row(dict(result))
        raise ValueError('Failed to create assignment (may already exist)')

    def unassign_engineer_from_project(self, engineer_id: int, project_id: int) -> int:
        """Remove an engineer from a project assignment."""
        query = """
        DELETE FROM project_assignments
        WHERE engineer_id = %s AND project_id = %s
        """
        return self.execute_update(query, (engineer_id, project_id))

    def get_available_engineers(self, project_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get all engineers or engineers not assigned to a specific project."""
        if project_id is None:
            return self.get_all_engineers()

        query = """
        SELECT
            e.id,
            e.name,
            e.email,
            e.phone,
            e.capacity_hours_per_week,
            e.role,
            e.team_id,
            t.name AS team_name,
            t.color AS team_color,
            e.status,
            e.availability,
            e.workload_percent,
            e.is_overworked,
            e.skills,
            COALESCE(SUM(pa.hours_per_week), 0) AS current_hours,
            e.capacity_hours_per_week - COALESCE(SUM(pa.hours_per_week), 0) AS available_hours
        FROM engineers e
        LEFT JOIN teams t ON t.id = e.team_id
        LEFT JOIN project_assignments pa ON pa.engineer_id = e.id
        WHERE e.id NOT IN (
            SELECT engineer_id FROM project_assignments WHERE project_id = %s
        )
        GROUP BY e.id, e.name, e.email, e.phone, e.capacity_hours_per_week, e.role,
                 e.team_id, t.name, t.color, e.status, e.availability, e.workload_percent,
                 e.is_overworked, e.skills
        ORDER BY e.name
        """
        return self.execute_query(query, (project_id,))

    def create_engineer(self, name: str, email: str, role: str, team_id: int, 
                       phone: str = None, capacity_hours_per_week: int = 40,
                       status: str = 'active', availability: str = 'available',
                       skills: List[str] = None) -> Dict[str, Any]:
        """Create a new engineer."""
        query = """
        INSERT INTO engineers (name, email, phone, capacity_hours_per_week, role, 
                             team_id, status, availability, skills)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id, name, email, phone, capacity_hours_per_week, role, team_id, 
                  status, availability, workload_percent, is_overworked, skills, created_at
        """
        skills_array = skills or []
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query, (name, email, phone, capacity_hours_per_week, 
                                     role, team_id, status, availability, skills_array))
                conn.commit()
                result = cursor.fetchone()
                if result:
                    return self._normalize_row(dict(result))
        raise ValueError('Failed to create engineer')


# Global database manager instance
db_manager = DatabaseManager()

