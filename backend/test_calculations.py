#!/usr/bin/env python3
"""Test script to validate calculation consistency."""

import sys
import os
sys.path.append('.')

from calculation_service import calculation_service

def test_calculation_service():
    """Test the calculation service with sample data."""
    print("=== Testing Calculation Service ===\n")
    
    # Test workload calculations
    print("1. Testing Workload Calculations:")
    capacity = 40.0
    assigned = 45.0
    workload = calculation_service.calculate_workload_percentage(capacity, assigned)
    is_overworked = calculation_service.is_overworked(capacity, assigned)
    print(f"   Capacity: {capacity}h, Assigned: {assigned}h")
    print(f"   Workload: {workload}%")
    print(f"   Is Overworked: {is_overworked}")
    print()
    
    # Test budget calculations
    print("2. Testing Budget Calculations:")
    budget_total = 100000.0
    budget_spent = 75000.0
    remaining = calculation_service.calculate_budget_remaining(budget_total, budget_spent)
    utilization = calculation_service.calculate_budget_utilization(budget_total, budget_spent)
    print(f"   Budget Total: CHF {budget_total:,.2f}")
    print(f"   Budget Spent: CHF {budget_spent:,.2f}")
    print(f"   Remaining: CHF {remaining:,.2f}")
    print(f"   Utilization: {utilization}%")
    print()
    
    # Test project completion stats
    print("3. Testing Project Completion Stats:")
    projects = [
        {'completion_percent': 75.0, 'status': 'active'},
        {'completion_percent': 100.0, 'status': 'completed'},
        {'completion_percent': 25.0, 'status': 'planning'},
        {'completion_percent': 50.0, 'status': 'active'}
    ]
    stats = calculation_service.calculate_project_completion_stats(projects)
    print(f"   Total Projects: {stats['total_projects']}")
    print(f"   Average Completion: {stats['average_completion']}%")
    print(f"   Completed Projects: {stats['completed_projects']}")
    print(f"   Active Projects: {stats['active_projects']}")
    print()
    
    # Test engineer workload stats
    print("4. Testing Engineer Workload Stats:")
    engineers = [
        {'capacity_hours_per_week': 40, 'current_hours': 35, 'name': 'Engineer A'},
        {'capacity_hours_per_week': 40, 'current_hours': 45, 'name': 'Engineer B'},
        {'capacity_hours_per_week': 40, 'current_hours': 20, 'name': 'Engineer C'}
    ]
    eng_stats = calculation_service.calculate_engineer_workload_stats(engineers)
    print(f"   Total Engineers: {eng_stats['total_engineers']}")
    print(f"   Total Capacity: {eng_stats['total_capacity']}h")
    print(f"   Total Assigned: {eng_stats['total_assigned']}h")
    print(f"   Average Workload: {eng_stats['average_workload']}%")
    print(f"   Overworked Count: {eng_stats['overworked_count']}")
    print(f"   Underloaded Count: {eng_stats['underloaded_count']}")
    print()
    
    # Test validation
    print("5. Testing Validation:")
    test_projects = [
        {'name': 'Project A', 'budget_total': 100000, 'budget_spent': 75000, 'budget_remaining': 25000, 'budget_utilisation': 75.0}
    ]
    test_engineers = [
        {'name': 'Engineer A', 'capacity_hours_per_week': 40, 'current_hours': 45, 'workload_percent': 112.5, 'is_overworked': True}
    ]
    inconsistencies = calculation_service.validate_calculation_consistency(test_projects, test_engineers)
    print(f"   Inconsistencies Found: {len(inconsistencies)}")
    for inconsistency in inconsistencies:
        print(f"   - {inconsistency}")
    print()
    
    print("=== Test Complete ===")

if __name__ == "__main__":
    test_calculation_service()
