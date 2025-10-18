"""
BKW Hackathon - Database Connection Module
Reworked to serve the new resource and risk management schema
"""
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
    # Domain-specific accessors
    # ------------------------------------------------------------------
    def get_latest_capacity_snapshot(self) -> Optional[Dict[str, Any]]:
        query = """
        SELECT cs.*
        FROM capacity_snapshots cs
        ORDER BY cs.stand_date DESC NULLS LAST, cs.created_at DESC
        LIMIT 1
        """
        rows = self.execute_query(query)
        return rows[0] if rows else None

    def get_capacity_entries(self, snapshot_id: int) -> List[Dict[str, Any]]:
        query = """
        SELECT
            ce.id,
            ce.capacity_snapshot_id,
            ce.team_member_id,
            ce.workstream,
            ce.current_week_load,
            ce.four_week_load,
            ce.project_code,
            ce.project_name,
            ce.risk_flag,
            tm.full_name,
            tm.capacity_percent,
            tm.role,
            dt.name AS team_name
        FROM capacity_entries ce
        LEFT JOIN team_members tm ON tm.id = ce.team_member_id
        LEFT JOIN delivery_teams dt ON dt.id = tm.delivery_team_id
        WHERE ce.capacity_snapshot_id = %s
        ORDER BY tm.full_name NULLS LAST, ce.project_code
        """
        return self.execute_query(query, (snapshot_id,))

    def get_member_availability_window(self, start: date, end: date) -> List[Dict[str, Any]]:
        query = """
        SELECT
            mac.id,
            mac.team_member_id,
            mac.day,
            mac.comment,
            asc.code AS status_code,
            asc.description AS status_description,
            tm.full_name,
            tm.capacity_percent,
            tm.base_location,
            tm.role,
            dt.name AS team_name
        FROM member_availability_calendar mac
        JOIN team_members tm ON tm.id = mac.team_member_id
        LEFT JOIN availability_status_codes asc ON asc.id = mac.status_code_id
        LEFT JOIN delivery_teams dt ON dt.id = tm.delivery_team_id
        WHERE mac.day BETWEEN %s AND %s
        ORDER BY mac.day, tm.full_name
        """
        return self.execute_query(query, (start, end))

    def get_project_portfolio(self) -> List[Dict[str, Any]]:
        query = """
        SELECT
            pc.id,
            pc.project_code,
            pc.name AS project_name,
            pc.customer,
            pc.status,
            dt.name AS delivery_team,
            risk.reporting_year,
            risk.reporting_quarter,
            risk.risk_description,
            risk.risk_probability,
            risk.risk_impact,
            risk.risk_score AS recorded_risk_score,
            COALESCE(risk.risk_score, risk.risk_probability * risk.risk_impact) AS computed_risk_score,
            risk.mitigation_plan
        FROM project_catalog pc
        LEFT JOIN delivery_teams dt ON dt.id = pc.delivery_team_id
        LEFT JOIN LATERAL (
            SELECT pra.*
            FROM project_risk_assessments pra
            WHERE pra.project_catalog_id = pc.id
            ORDER BY pra.reporting_year DESC, pra.reporting_quarter DESC
            LIMIT 1
        ) AS risk ON TRUE
        ORDER BY pc.name
        """
        return self.execute_query(query)

    def get_team_members(self) -> List[Dict[str, Any]]:
        query = """
        SELECT
            tm.id,
            tm.full_name,
            tm.capacity_percent,
            tm.role,
            dt.name AS team_name
        FROM team_members tm
        LEFT JOIN delivery_teams dt ON dt.id = tm.delivery_team_id
        ORDER BY tm.full_name
        """
        return self.execute_query(query)

    def get_projects_without_allocations(self, snapshot_id: int) -> List[Dict[str, Any]]:
        query = """
        SELECT
            pc.id,
            pc.project_code,
            pc.name AS project_name,
            pc.status,
            pc.customer,
            dt.name AS delivery_team
        FROM project_catalog pc
        LEFT JOIN delivery_teams dt ON dt.id = pc.delivery_team_id
        LEFT JOIN capacity_entries ce
            ON ce.project_code = pc.project_code
            AND ce.capacity_snapshot_id = %s
        WHERE ce.id IS NULL
        ORDER BY pc.name
        """
        return self.execute_query(query, (snapshot_id,))


# Global database manager instance
db_manager = DatabaseManager()

