"""
BKW Hackathon - Database Connection Module
Handles PostgreSQL database connections and basic operations
"""
import psycopg2
import os
from contextlib import contextmanager
from typing import List, Dict, Any, Optional

class DatabaseManager:
    """Manages database connections and operations"""
    
    def __init__(self):
        self.database_url = os.getenv('DATABASE_URL', 'postgresql://localhost/bkw_pm')
    
    @contextmanager
    def get_connection(self):
        """Context manager for database connections"""
        conn = None
        try:
            conn = psycopg2.connect(self.database_url)
            yield conn
        except Exception as e:
            if conn:
                conn.rollback()
            raise e
        finally:
            if conn:
                conn.close()
    
    def execute_query(self, query: str, params: tuple = None) -> List[Dict[str, Any]]:
        """Execute a SELECT query and return results as list of dictionaries"""
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, params)
                
                # Get column names
                columns = [desc[0] for desc in cursor.description] if cursor.description else []
                
                # Fetch all results and convert to dictionaries
                rows = cursor.fetchall()
                return [dict(zip(columns, row)) for row in rows]
    
    def execute_update(self, query: str, params: tuple = None) -> int:
        """Execute an INSERT/UPDATE/DELETE query and return affected rows"""
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, params)
                conn.commit()
                return cursor.rowcount
    
    def get_all_projects(self) -> List[Dict[str, Any]]:
        """Get all projects with their details"""
        query = """
        SELECT p.*, 
               COUNT(pa.engineer_id) as assigned_engineers,
               SUM(pa.hours_per_week) as total_hours
        FROM projects p
        LEFT JOIN project_assignments pa ON p.id = pa.project_id
        GROUP BY p.id, p.name, p.description, p.deadline, p.status, p.created_at, p.updated_at
        ORDER BY p.deadline
        """
        return self.execute_query(query)
    
    def get_all_engineers(self) -> List[Dict[str, Any]]:
        """Get all engineers with their current workload"""
        query = """
        SELECT e.*,
               COALESCE(SUM(pa.hours_per_week), 0) as current_hours,
               e.capacity_hours_per_week - COALESCE(SUM(pa.hours_per_week), 0) as available_hours
        FROM engineers e
        LEFT JOIN project_assignments pa ON e.id = pa.engineer_id
        GROUP BY e.id, e.name, e.email, e.capacity_hours_per_week, e.role, e.created_at
        ORDER BY e.name
        """
        return self.execute_query(query)
    
    def get_engineer_absences(self, engineer_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get absences for a specific engineer or all engineers"""
        if engineer_id:
            query = """
            SELECT a.*, e.name as engineer_name
            FROM absences a
            JOIN engineers e ON a.engineer_id = e.id
            WHERE a.engineer_id = %s
            ORDER BY a.start_date
            """
            return self.execute_query(query, (engineer_id,))
        else:
            query = """
            SELECT a.*, e.name as engineer_name
            FROM absences a
            JOIN engineers e ON a.engineer_id = e.id
            ORDER BY a.start_date
            """
            return self.execute_query(query)

# Global database manager instance
db_manager = DatabaseManager()

