"""Database helpers tailored to the legacy projects/engineers schema."""
import os
from contextlib import contextmanager
from datetime import date, datetime
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
        """Return all projects with their assignment summary."""
        query = """
        SELECT
            p.id,
            p.name,
            p.description,
            p.deadline,
            p.status,
            p.created_at,
            p.updated_at,
            COUNT(pa.id) AS assigned_engineers,
            COALESCE(SUM(pa.hours_per_week), 0) AS total_hours
        FROM projects p
        LEFT JOIN project_assignments pa ON pa.project_id = p.id
        GROUP BY p.id, p.name, p.description, p.deadline, p.status, p.created_at, p.updated_at
        ORDER BY p.deadline
        """
        return self.execute_query(query)

    def get_all_engineers(self) -> List[Dict[str, Any]]:
        """Return engineers along with their current workload."""
        query = """
        SELECT
            e.id,
            e.name,
            e.email,
            e.capacity_hours_per_week,
            e.role,
            e.created_at,
            COALESCE(SUM(pa.hours_per_week), 0) AS current_hours,
            e.capacity_hours_per_week - COALESCE(SUM(pa.hours_per_week), 0) AS available_hours
        FROM engineers e
        LEFT JOIN project_assignments pa ON pa.engineer_id = e.id
        GROUP BY e.id, e.name, e.email, e.capacity_hours_per_week, e.role, e.created_at
        ORDER BY e.name
        """
        return self.execute_query(query)

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


# Global database manager instance
db_manager = DatabaseManager()

