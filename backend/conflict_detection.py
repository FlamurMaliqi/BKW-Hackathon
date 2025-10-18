"""
BKW Hackathon - Conflict Detection Engine
Core logic for detecting project conflicts, overcapacity, and risks
"""
from datetime import datetime, date, timedelta
from typing import List, Dict, Any, Tuple
from database.connection import db_manager

class ConflictDetector:
    """Detects various types of conflicts in project management"""
    
    def __init__(self):
        self.db = db_manager
    
    def detect_deadline_overlaps(self) -> List[Dict[str, Any]]:
        """
        Detect projects with overlapping deadlines that might cause conflicts
        Returns list of overlapping project pairs
        """
        query = """
        WITH project_pairs AS (
            SELECT 
                p1.id as project1_id,
                p1.name as project1_name,
                p1.deadline as project1_deadline,
                p2.id as project2_id,
                p2.name as project2_name,
                p2.deadline as project2_deadline,
                ABS(p1.deadline - p2.deadline) as days_apart
            FROM projects p1
            CROSS JOIN projects p2
            WHERE p1.id < p2.id  -- Avoid duplicates and self-comparison
            AND p1.status = 'active' 
            AND p2.status = 'active'
        )
        SELECT *
        FROM project_pairs
        WHERE days_apart <= 7  -- Projects within 7 days are considered overlapping
        ORDER BY days_apart
        """
        return self.db.execute_query(query)
    
    def detect_overcapacity(self) -> List[Dict[str, Any]]:
        """
        Detect engineers who are overbooked (assigned hours > capacity)
        Returns list of overbooked engineers
        """
        query = """
        SELECT 
            e.id,
            e.name,
            e.capacity_hours_per_week,
            COALESCE(SUM(pa.hours_per_week), 0) as assigned_hours,
            COALESCE(SUM(pa.hours_per_week), 0) - e.capacity_hours_per_week as overage_hours
        FROM engineers e
        LEFT JOIN project_assignments pa ON e.id = pa.engineer_id
        GROUP BY e.id, e.name, e.capacity_hours_per_week
        HAVING COALESCE(SUM(pa.hours_per_week), 0) > e.capacity_hours_per_week
        ORDER BY overage_hours DESC
        """
        return self.db.execute_query(query)
    
    def detect_holiday_conflicts(self) -> List[Dict[str, Any]]:
        """
        Detect project assignments that conflict with engineer absences
        Returns list of holiday conflicts
        """
        query = """
        SELECT 
            a.engineer_id,
            e.name as engineer_name,
            a.start_date as absence_start,
            a.end_date as absence_end,
            a.reason,
            pa.project_id,
            p.name as project_name,
            pa.hours_per_week as assigned_hours
        FROM absences a
        JOIN engineers e ON a.engineer_id = e.id
        JOIN project_assignments pa ON a.engineer_id = pa.engineer_id
        JOIN projects p ON pa.project_id = p.id
        WHERE a.start_date <= p.deadline 
        AND a.end_date >= pa.start_date
        ORDER BY a.start_date
        """
        return self.db.execute_query(query)
    
    def detect_upcoming_risks(self, days_ahead: int = 30) -> List[Dict[str, Any]]:
        """
        Detect upcoming risks based on deadlines and workload
        Returns list of potential risks
        """
        future_date = date.today() + timedelta(days=days_ahead)
        
        query = """
        SELECT 
            p.id,
            p.name,
            p.deadline,
            p.deadline - CURRENT_DATE as days_until_deadline,
            COUNT(pa.engineer_id) as assigned_engineers,
            SUM(pa.hours_per_week) as total_hours,
            CASE 
                WHEN p.deadline - CURRENT_DATE <= 7 THEN 'CRITICAL'
                WHEN p.deadline - CURRENT_DATE <= 14 THEN 'HIGH'
                WHEN p.deadline - CURRENT_DATE <= 30 THEN 'MEDIUM'
                ELSE 'LOW'
            END as risk_level
        FROM projects p
        LEFT JOIN project_assignments pa ON p.id = pa.project_id
        WHERE p.status = 'active'
        AND p.deadline <= %s
        GROUP BY p.id, p.name, p.deadline
        HAVING COUNT(pa.engineer_id) = 0 OR SUM(pa.hours_per_week) = 0
        ORDER BY p.deadline
        """
        return self.db.execute_query(query, (future_date,))
    
    def get_workload_summary(self) -> Dict[str, Any]:
        """
        Get overall workload summary for all engineers
        Returns summary statistics
        """
        query = """
        SELECT 
            COUNT(DISTINCT e.id) as total_engineers,
            COUNT(DISTINCT p.id) as total_projects,
            AVG(e.capacity_hours_per_week) as avg_capacity,
            SUM(COALESCE(pa.hours_per_week, 0)) as total_assigned_hours,
            COUNT(CASE WHEN COALESCE(SUM(pa.hours_per_week), 0) > e.capacity_hours_per_week THEN 1 END) as overbooked_count
        FROM engineers e
        LEFT JOIN project_assignments pa ON e.id = pa.engineer_id
        LEFT JOIN projects p ON pa.project_id = p.id AND p.status = 'active'
        GROUP BY e.id, e.capacity_hours_per_week
        """
        
        # This query needs to be restructured for proper aggregation
        engineers = self.db.execute_query("SELECT * FROM engineers")
        projects = self.db.execute_query("SELECT * FROM projects WHERE status = 'active'")
        assignments = self.db.execute_query("SELECT * FROM project_assignments")
        
        # Calculate summary statistics
        total_engineers = len(engineers)
        total_projects = len(projects)
        avg_capacity = sum(e['capacity_hours_per_week'] for e in engineers) / total_engineers if engineers else 0
        
        # Calculate overbooked engineers
        overbooked_count = 0
        total_assigned_hours = 0
        
        for engineer in engineers:
            engineer_assignments = [a for a in assignments if a['engineer_id'] == engineer['id']]
            assigned_hours = sum(a['hours_per_week'] for a in engineer_assignments)
            total_assigned_hours += assigned_hours
            
            if assigned_hours > engineer['capacity_hours_per_week']:
                overbooked_count += 1
        
        return {
            'total_engineers': total_engineers,
            'total_projects': total_projects,
            'avg_capacity': round(avg_capacity, 1),
            'total_assigned_hours': total_assigned_hours,
            'overbooked_count': overbooked_count,
            'overbooked_percentage': round((overbooked_count / total_engineers * 100), 1) if total_engineers > 0 else 0
        }
    
    def get_all_conflicts(self) -> Dict[str, List[Dict[str, Any]]]:
        """
        Get all types of conflicts in one comprehensive report
        Returns dictionary with different conflict types
        """
        return {
            'deadline_overlaps': self.detect_deadline_overlaps(),
            'overcapacity': self.detect_overcapacity(),
            'holiday_conflicts': self.detect_holiday_conflicts(),
            'upcoming_risks': self.detect_upcoming_risks(),
            'workload_summary': self.get_workload_summary()
        }

# Global conflict detector instance
conflict_detector = ConflictDetector()

