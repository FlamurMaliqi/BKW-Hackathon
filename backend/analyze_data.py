#!/usr/bin/env python3
"""Analyze data consistency in the BKW project management system."""

import sys
import os
sys.path.append('.')

from database.connection import db_manager
from conflict_detection import conflict_detector

def analyze_data_consistency():
    """Analyze data consistency across the system."""
    try:
        # Get all data
        projects = db_manager.get_all_projects()
        engineers = db_manager.get_all_engineers()
        conflicts = conflict_detector.get_all_conflicts()

        print("=== PROJECTS ===")
        for p in projects:
            print(f"Project: {p['name']}")
            print(f"  Budget Total: {p['budget_total']}")
            print(f"  Budget Spent: {p['budget_spent']}")
            print(f"  Budget Remaining: {p['budget_remaining']}")
            print(f"  Budget Utilisation: {p['budget_utilisation']}")
            print(f"  Completion: {p['completion_percent']}%")
            print()

        print("=== ENGINEERS ===")
        for e in engineers:
            print(f"Engineer: {e['name']}")
            print(f"  Capacity: {e['capacity_hours_per_week']} hours/week")
            print(f"  Current Hours: {e['current_hours']} hours/week")
            print(f"  Available Hours: {e['available_hours']} hours/week")
            print(f"  Workload %: {e['workload_percent']}%")
            print(f"  Is Overworked: {e['is_overworked']}")
            print()

        print("=== CONFLICTS ===")
        print(f"Overallocated Engineers: {len(conflicts['overallocated_engineers'])}")
        for oe in conflicts['overallocated_engineers']:
            print(f"  {oe['engineer_name']}: {oe['workload_percent']}% workload")

        # Check for inconsistencies
        print("\n=== INCONSISTENCY ANALYSIS ===")
        
        # Check engineer workload calculations
        for e in engineers:
            capacity = float(e.get('capacity_hours_per_week', 0))
            current_hours = float(e.get('current_hours', 0))
            workload_percent = float(e.get('workload_percent', 0))
            is_overworked = e.get('is_overworked', False)
            
            # Calculate expected workload percentage
            expected_workload = (current_hours / capacity * 100) if capacity > 0 else 0
            
            # Check if workload percentage matches calculated value
            if abs(workload_percent - expected_workload) > 0.1:
                print(f"INCONSISTENCY: {e['name']} - Stored workload: {workload_percent}%, Calculated: {expected_workload:.1f}%")
            
            # Check if overworked flag matches reality
            should_be_overworked = current_hours > capacity
            if is_overworked != should_be_overworked:
                print(f"INCONSISTENCY: {e['name']} - Overworked flag: {is_overworked}, Should be: {should_be_overworked}")

        # Check project budget calculations
        for p in projects:
            budget_total = float(p.get('budget_total', 0))
            budget_spent = float(p.get('budget_spent', 0))
            budget_remaining = float(p.get('budget_remaining', 0))
            budget_utilisation = float(p.get('budget_utilisation', 0))
            
            # Check budget remaining calculation
            expected_remaining = budget_total - budget_spent
            if abs(budget_remaining - expected_remaining) > 0.01:
                print(f"INCONSISTENCY: {p['name']} - Budget remaining: {budget_remaining}, Expected: {expected_remaining}")
            
            # Check budget utilisation calculation
            expected_utilisation = (budget_spent / budget_total) if budget_total > 0 else 0
            if abs(budget_utilisation - expected_utilisation) > 0.01:
                print(f"INCONSISTENCY: {p['name']} - Budget utilisation: {budget_utilisation}, Expected: {expected_utilisation}")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    analyze_data_consistency()
