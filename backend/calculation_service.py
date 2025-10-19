"""
Centralized Calculation Service for BKW Project Management System

This service provides a single source of truth for all mathematical calculations
in the system, ensuring consistency across frontend, backend, and database.
"""

from typing import Dict, List, Any, Optional
from datetime import date, datetime
from decimal import Decimal


class CalculationService:
    """Centralized service for all project management calculations."""
    
    @staticmethod
    def calculate_workload_percentage(capacity_hours: float, assigned_hours: float) -> float:
        """
        Calculate workload percentage for an engineer.
        
        Args:
            capacity_hours: Engineer's weekly capacity in hours
            assigned_hours: Currently assigned hours per week
            
        Returns:
            Workload percentage (0-100+)
        """
        if capacity_hours <= 0:
            return 0.0
        
        return round((assigned_hours / capacity_hours) * 100, 2)
    
    @staticmethod
    def is_overworked(capacity_hours: float, assigned_hours: float, threshold: float = 100.0) -> bool:
        """
        Determine if an engineer is overworked.
        
        Args:
            capacity_hours: Engineer's weekly capacity
            assigned_hours: Currently assigned hours
            threshold: Overwork threshold percentage (default 100%)
            
        Returns:
            True if overworked, False otherwise
        """
        workload_percent = CalculationService.calculate_workload_percentage(capacity_hours, assigned_hours)
        return workload_percent > threshold
    
    @staticmethod
    def calculate_budget_utilization(budget_total: float, budget_spent: float) -> float:
        """
        Calculate budget utilization percentage.
        
        Args:
            budget_total: Total project budget
            budget_spent: Amount spent so far
            
        Returns:
            Budget utilization percentage (0-100+)
        """
        if budget_total <= 0:
            return 0.0
        
        return round((budget_spent / budget_total) * 100, 2)
    
    @staticmethod
    def calculate_budget_remaining(budget_total: float, budget_spent: float) -> float:
        """
        Calculate remaining budget.
        
        Args:
            budget_total: Total project budget
            budget_spent: Amount spent so far
            
        Returns:
            Remaining budget amount
        """
        return round(budget_total - budget_spent, 2)
    
    @staticmethod
    def calculate_project_completion_stats(projects: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculate overall project completion statistics.
        
        Args:
            projects: List of project dictionaries
            
        Returns:
            Dictionary with completion statistics
        """
        if not projects:
            return {
                'total_projects': 0,
                'average_completion': 0.0,
                'completed_projects': 0,
                'active_projects': 0,
                'planning_projects': 0
            }
        
        total_projects = len(projects)
        total_completion = sum(float(p.get('completion_percent', 0)) for p in projects)
        average_completion = round(total_completion / total_projects, 2)
        
        completed_projects = len([p for p in projects if float(p.get('completion_percent', 0)) >= 100])
        active_projects = len([p for p in projects if p.get('status', '').lower() == 'active'])
        planning_projects = len([p for p in projects if p.get('status', '').lower() == 'planning'])
        
        return {
            'total_projects': total_projects,
            'average_completion': average_completion,
            'completed_projects': completed_projects,
            'active_projects': active_projects,
            'planning_projects': planning_projects
        }
    
    @staticmethod
    def calculate_budget_stats(projects: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculate overall budget statistics.
        
        Args:
            projects: List of project dictionaries
            
        Returns:
            Dictionary with budget statistics
        """
        if not projects:
            return {
                'total_budget': 0.0,
                'total_spent': 0.0,
                'total_remaining': 0.0,
                'average_utilization': 0.0
            }
        
        total_budget = sum(float(p.get('budget_total', 0)) for p in projects)
        total_spent = sum(float(p.get('budget_spent', 0)) for p in projects)
        total_remaining = total_budget - total_spent
        
        # Calculate average utilization across all projects
        utilizations = []
        for project in projects:
            budget_total = float(project.get('budget_total', 0))
            budget_spent = float(project.get('budget_spent', 0))
            if budget_total > 0:
                util = CalculationService.calculate_budget_utilization(budget_total, budget_spent)
                utilizations.append(util)
        
        average_utilization = round(sum(utilizations) / len(utilizations), 2) if utilizations else 0.0
        
        return {
            'total_budget': round(total_budget, 2),
            'total_spent': round(total_spent, 2),
            'total_remaining': round(total_remaining, 2),
            'average_utilization': average_utilization
        }
    
    @staticmethod
    def calculate_engineer_workload_stats(engineers: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculate engineer workload statistics.
        
        Args:
            engineers: List of engineer dictionaries
            
        Returns:
            Dictionary with workload statistics
        """
        if not engineers:
            return {
                'total_engineers': 0,
                'total_capacity': 0.0,
                'total_assigned': 0.0,
                'average_workload': 0.0,
                'overworked_count': 0,
                'underloaded_count': 0
            }
        
        total_engineers = len(engineers)
        total_capacity = sum(float(e.get('capacity_hours_per_week', 0)) for e in engineers)
        total_assigned = sum(float(e.get('current_hours', 0)) for e in engineers)
        
        # Calculate workload percentages
        workloads = []
        overworked_count = 0
        underloaded_count = 0
        
        for engineer in engineers:
            capacity = float(engineer.get('capacity_hours_per_week', 0))
            assigned = float(engineer.get('current_hours', 0))
            
            if capacity > 0:
                workload = CalculationService.calculate_workload_percentage(capacity, assigned)
                workloads.append(workload)
                
                if workload > 100:
                    overworked_count += 1
                elif workload < 50:
                    underloaded_count += 1
        
        average_workload = round(sum(workloads) / len(workloads), 2) if workloads else 0.0
        
        return {
            'total_engineers': total_engineers,
            'total_capacity': round(total_capacity, 2),
            'total_assigned': round(total_assigned, 2),
            'average_workload': average_workload,
            'overworked_count': overworked_count,
            'underloaded_count': underloaded_count
        }
    
    @staticmethod
    def calculate_team_workload_stats(teams: List[Dict[str, Any]], engineers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Calculate workload statistics for each team.
        
        Args:
            teams: List of team dictionaries
            engineers: List of engineer dictionaries
            
        Returns:
            List of team workload statistics
        """
        team_stats = []
        
        for team in teams:
            team_id = team.get('id')
            team_engineers = [e for e in engineers if e.get('team_id') == team_id]
            
            if not team_engineers:
                team_stats.append({
                    'team_id': team_id,
                    'team_name': team.get('name', 'Unknown'),
                    'member_count': 0,
                    'total_capacity': 0.0,
                    'total_assigned': 0.0,
                    'average_workload': 0.0,
                    'overworked_count': 0
                })
                continue
            
            total_capacity = sum(float(e.get('capacity_hours_per_week', 0)) for e in team_engineers)
            total_assigned = sum(float(e.get('current_hours', 0)) for e in team_engineers)
            
            # Calculate individual workloads
            workloads = []
            overworked_count = 0
            
            for engineer in team_engineers:
                capacity = float(engineer.get('capacity_hours_per_week', 0))
                assigned = float(engineer.get('current_hours', 0))
                
                if capacity > 0:
                    workload = CalculationService.calculate_workload_percentage(capacity, assigned)
                    workloads.append(workload)
                    
                    if workload > 100:
                        overworked_count += 1
            
            average_workload = round(sum(workloads) / len(workloads), 2) if workloads else 0.0
            
            team_stats.append({
                'team_id': team_id,
                'team_name': team.get('name', 'Unknown'),
                'member_count': len(team_engineers),
                'total_capacity': round(total_capacity, 2),
                'total_assigned': round(total_assigned, 2),
                'average_workload': average_workload,
                'overworked_count': overworked_count
            })
        
        return sorted(team_stats, key=lambda x: x['average_workload'], reverse=True)
    
    @staticmethod
    def validate_calculation_consistency(projects: List[Dict[str, Any]], engineers: List[Dict[str, Any]]) -> List[str]:
        """
        Validate calculation consistency across the system.
        
        Args:
            projects: List of project dictionaries
            engineers: List of engineer dictionaries
            
        Returns:
            List of inconsistency messages
        """
        inconsistencies = []
        
        # Validate project budget calculations
        for project in projects:
            budget_total = float(project.get('budget_total', 0))
            budget_spent = float(project.get('budget_spent', 0))
            budget_remaining = float(project.get('budget_remaining', 0))
            budget_utilisation = float(project.get('budget_utilisation', 0))
            
            # Check budget remaining
            expected_remaining = CalculationService.calculate_budget_remaining(budget_total, budget_spent)
            if abs(budget_remaining - expected_remaining) > 0.01:
                inconsistencies.append(
                    f"Project '{project.get('name')}': Budget remaining mismatch - "
                    f"stored: {budget_remaining}, calculated: {expected_remaining}"
                )
            
            # Check budget utilization
            expected_utilisation = CalculationService.calculate_budget_utilization(budget_total, budget_spent)
            if abs(budget_utilisation - expected_utilisation) > 0.01:
                inconsistencies.append(
                    f"Project '{project.get('name')}': Budget utilization mismatch - "
                    f"stored: {budget_utilisation}%, calculated: {expected_utilisation}%"
                )
        
        # Validate engineer workload calculations
        for engineer in engineers:
            capacity = float(engineer.get('capacity_hours_per_week', 0))
            assigned = float(engineer.get('current_hours', 0))
            workload_percent = float(engineer.get('workload_percent', 0))
            is_overworked = engineer.get('is_overworked', False)
            
            # Check workload percentage
            expected_workload = CalculationService.calculate_workload_percentage(capacity, assigned)
            if abs(workload_percent - expected_workload) > 0.1:
                inconsistencies.append(
                    f"Engineer '{engineer.get('name')}': Workload percentage mismatch - "
                    f"stored: {workload_percent}%, calculated: {expected_workload}%"
                )
            
            # Check overworked flag
            expected_overworked = CalculationService.is_overworked(capacity, assigned)
            if is_overworked != expected_overworked:
                inconsistencies.append(
                    f"Engineer '{engineer.get('name')}': Overworked flag mismatch - "
                    f"stored: {is_overworked}, calculated: {expected_overworked}"
                )
        
        return inconsistencies


# Global calculation service instance
calculation_service = CalculationService()
