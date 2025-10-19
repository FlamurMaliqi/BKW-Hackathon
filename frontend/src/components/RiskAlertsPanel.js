/**
 * Risk Alerts Panel Component
 *
 * Displays risk alerts and conflicts across projects, including:
 * - Overallocated engineers
 * - Deadline overlaps
 * - Budget risks
 * - Absence conflicts
 * - Projects without assignments
 *
 * Alerts are color-coded by severity and can be expanded for details.
 */

import React, { useState, useEffect } from 'react';
import './RiskAlertsPanel.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const RiskAlertsPanel = ({ refreshTrigger = 0 }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedAlerts, setExpandedAlerts] = useState(new Set());
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());

  // Fetch conflicts data from backend
  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/conflicts`);
      const data = await response.json();

      if (data.status === 'success') {
        const generatedAlerts = generateAlerts(data.conflicts);
        setAlerts(generatedAlerts);
      } else {
        throw new Error(data.error || 'Failed to fetch conflicts');
      }
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch alerts on component mount and when refreshTrigger changes
  useEffect(() => {
    fetchAlerts();

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  // Generate alert objects from conflicts data
  const generateAlerts = (conflicts) => {
    const alertsList = [];

    // Overallocated engineers
    if (conflicts.overallocated_engineers && conflicts.overallocated_engineers.length > 0) {
      conflicts.overallocated_engineers.forEach((engineer, index) => {
        const severity = engineer.workload_percent >= 120 ? 'critical' : 'warning';
        alertsList.push({
          id: `overalloc-${engineer.engineer_id}-${index}`,
          type: 'overallocation',
          severity,
          title: `${engineer.engineer_name} is overallocated`,
          message: `Assigned ${engineer.assigned_hours_per_week}h/week but capacity is ${engineer.capacity_hours_per_week}h/week (${engineer.workload_percent}% workload)`,
          details: {
            engineerName: engineer.engineer_name,
            capacity: engineer.capacity_hours_per_week,
            assigned: engineer.assigned_hours_per_week,
            overload: engineer.overload_hours,
            workloadPercent: engineer.workload_percent
          },
          icon: '⚠️',
          timestamp: new Date().toISOString()
        });
      });
    }

    // Underutilized engineers
    if (conflicts.underutilized_engineers && conflicts.underutilized_engineers.length > 0) {
      conflicts.underutilized_engineers.forEach((engineer, index) => {
        alertsList.push({
          id: `underutil-${engineer.engineer_id}-${index}`,
          type: 'underutilization',
          severity: 'info',
          title: `${engineer.engineer_name} is underutilized`,
          message: `Only ${engineer.assigned_hours_per_week}h/week assigned (${engineer.workload_percent}% capacity), ${engineer.available_hours}h/week available`,
          details: {
            engineerName: engineer.engineer_name,
            capacity: engineer.capacity_hours_per_week,
            assigned: engineer.assigned_hours_per_week,
            available: engineer.available_hours,
            workloadPercent: engineer.workload_percent,
            teamName: engineer.team_name
          },
          icon: '💡',
          timestamp: new Date().toISOString()
        });
      });
    }

    // Deadline overlaps
    if (conflicts.deadline_overlaps && conflicts.deadline_overlaps.length > 0) {
      conflicts.deadline_overlaps.forEach((overlap, index) => {
        const severity = overlap.total_overlaps >= 3 ? 'critical' : 'warning';
        const projectNames = overlap.overlapping_projects.map(p => p.project_name).join(', ');
        alertsList.push({
          id: `deadline-${overlap.project_id}-${index}`,
          type: 'deadline_overlap',
          severity,
          title: `${overlap.total_overlaps} project(s) have similar deadlines`,
          message: `${overlap.project_name} (${overlap.deadline}) overlaps with: ${projectNames}`,
          details: {
            mainProject: overlap.project_name,
            deadline: overlap.deadline,
            priority: overlap.priority,
            completion: overlap.completion_percent,
            overlappingProjects: overlap.overlapping_projects
          },
          icon: '📅',
          timestamp: new Date().toISOString()
        });
      });
    }

    // Budget risks
    if (conflicts.budget_risks && conflicts.budget_risks.length > 0) {
      conflicts.budget_risks.forEach((risk, index) => {
        alertsList.push({
          id: `budget-${risk.project_id}-${index}`,
          type: 'budget_risk',
          severity: risk.risk_level,
          title: `Budget risk: ${risk.project_name}`,
          message: `${risk.spend_percent}% spent but only ${risk.completion_percent}% complete`,
          details: {
            projectName: risk.project_name,
            budgetTotal: risk.budget_total,
            budgetSpent: risk.budget_spent,
            budgetRemaining: risk.budget_remaining,
            spendPercent: risk.spend_percent,
            completionPercent: risk.completion_percent,
            priority: risk.priority,
            deadline: risk.deadline
          },
          icon: '💰',
          timestamp: new Date().toISOString()
        });
      });
    }

    // Absence conflicts
    if (conflicts.upcoming_absences && conflicts.upcoming_absences.length > 0) {
      conflicts.upcoming_absences.forEach((absence, index) => {
        if (absence.overlapping_assignments && absence.overlapping_assignments.length > 0) {
          const severity = absence.overlapping_assignments.length >= 2 ? 'warning' : 'info';
          const projectNames = absence.overlapping_assignments.map(a => a.project_name).join(', ');
          alertsList.push({
            id: `absence-${absence.absence_id}-${index}`,
            type: 'absence_conflict',
            severity,
            title: `${absence.engineer_name} has ${absence.type} conflicting with assignments`,
            message: `${absence.start_date} to ${absence.end_date} overlaps with: ${projectNames}`,
            details: {
              engineerName: absence.engineer_name,
              startDate: absence.start_date,
              endDate: absence.end_date,
              reason: absence.reason,
              type: absence.type,
              overlappingAssignments: absence.overlapping_assignments
            },
            icon: '🏖️',
            timestamp: new Date().toISOString()
          });
        }
      });
    }

    // Projects without assignments
    if (conflicts.projects_without_assignments && conflicts.projects_without_assignments.length > 0) {
      conflicts.projects_without_assignments.forEach((project, index) => {
        alertsList.push({
          id: `unassigned-${project.id}-${index}`,
          type: 'unassigned_project',
          severity: 'info',
          title: `${project.name} has no engineers assigned`,
          message: `Priority: ${project.priority}, Deadline: ${project.deadline}`,
          details: {
            projectName: project.name,
            priority: project.priority,
            deadline: project.deadline,
            status: project.status
          },
          icon: '👥',
          timestamp: new Date().toISOString()
        });
      });
    }

    // Sort by severity: critical > warning > info
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    alertsList.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return alertsList;
  };

  // Toggle alert expansion
  const toggleAlert = (alertId) => {
    const newExpanded = new Set(expandedAlerts);
    if (newExpanded.has(alertId)) {
      newExpanded.delete(alertId);
    } else {
      newExpanded.add(alertId);
    }
    setExpandedAlerts(newExpanded);
  };

  // Dismiss an alert
  const dismissAlert = (alertId) => {
    const newDismissed = new Set(dismissedAlerts);
    newDismissed.add(alertId);
    setDismissedAlerts(newDismissed);
  };

  // Get severity badge color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'severity-critical';
      case 'warning': return 'severity-warning';
      case 'info': return 'severity-info';
      default: return 'severity-info';
    }
  };

  // Filter out dismissed alerts
  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id));

  // Count alerts by severity
  const alertCounts = {
    critical: visibleAlerts.filter(a => a.severity === 'critical').length,
    warning: visibleAlerts.filter(a => a.severity === 'warning').length,
    info: visibleAlerts.filter(a => a.severity === 'info').length,
    total: visibleAlerts.length
  };

  if (loading) {
    return (
      <div className="risk-alerts-panel">
        <div className="alerts-header">
          <h3>Risk Alerts</h3>
        </div>
        <div className="loading-state">Loading alerts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="risk-alerts-panel">
        <div className="alerts-header">
          <h3>Risk Alerts</h3>
        </div>
        <div className="error-state">Error loading alerts: {error}</div>
      </div>
    );
  }

  return (
    <div className="risk-alerts-panel">
      <div className="alerts-header">
        <h3>Risk Alerts</h3>
        <div className="alert-summary">
          {alertCounts.critical > 0 && (
            <span className="summary-badge critical">{alertCounts.critical} Critical</span>
          )}
          {alertCounts.warning > 0 && (
            <span className="summary-badge warning">{alertCounts.warning} Warnings</span>
          )}
          {alertCounts.info > 0 && (
            <span className="summary-badge info">{alertCounts.info} Info</span>
          )}
          {alertCounts.total === 0 && (
            <span className="summary-badge success">All Clear</span>
          )}
        </div>
      </div>

      {visibleAlerts.length === 0 ? (
        <div className="no-alerts">
          <span className="success-icon">✅</span>
          <p>No active alerts or conflicts detected</p>
        </div>
      ) : (
        <div className="alerts-list">
          {visibleAlerts.map(alert => (
            <div
              key={alert.id}
              className={`alert-card ${getSeverityColor(alert.severity)} ${expandedAlerts.has(alert.id) ? 'expanded' : ''}`}
            >
              <div className="alert-header" onClick={() => toggleAlert(alert.id)}>
                <div className="alert-icon">{alert.icon}</div>
                <div className="alert-content">
                  <div className="alert-title">{alert.title}</div>
                  <div className="alert-message">{alert.message}</div>
                </div>
                <div className="alert-actions">
                  <button
                    className="dismiss-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      dismissAlert(alert.id);
                    }}
                    title="Dismiss"
                  >
                    ×
                  </button>
                  <span className="expand-icon">
                    {expandedAlerts.has(alert.id) ? '▼' : '▶'}
                  </span>
                </div>
              </div>

              {expandedAlerts.has(alert.id) && (
                <div className="alert-details">
                  {alert.type === 'overallocation' && (
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">Engineer:</span>
                        <span className="detail-value">{alert.details.engineerName}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Capacity:</span>
                        <span className="detail-value">{alert.details.capacity}h/week</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Assigned:</span>
                        <span className="detail-value">{alert.details.assigned}h/week</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Overload:</span>
                        <span className="detail-value alert-highlight">{alert.details.overload}h/week</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Workload:</span>
                        <span className="detail-value alert-highlight">{alert.details.workloadPercent}%</span>
                      </div>
                    </div>
                  )}

                  {alert.type === 'underutilization' && (
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">Engineer:</span>
                        <span className="detail-value">{alert.details.engineerName}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Team:</span>
                        <span className="detail-value">{alert.details.teamName || 'No team'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Capacity:</span>
                        <span className="detail-value">{alert.details.capacity}h/week</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Assigned:</span>
                        <span className="detail-value">{alert.details.assigned}h/week</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Available:</span>
                        <span className="detail-value alert-highlight">{alert.details.available}h/week</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Utilization:</span>
                        <span className="detail-value">{alert.details.workloadPercent}%</span>
                      </div>
                    </div>
                  )}

                  {alert.type === 'deadline_overlap' && (
                    <div className="detail-grid">
                      <div className="detail-item full-width">
                        <span className="detail-label">Main Project:</span>
                        <span className="detail-value">{alert.details.mainProject}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Deadline:</span>
                        <span className="detail-value">{alert.details.deadline}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Priority:</span>
                        <span className="detail-value">{alert.details.priority}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Completion:</span>
                        <span className="detail-value">{alert.details.completion}%</span>
                      </div>
                      <div className="detail-item full-width">
                        <span className="detail-label">Overlapping Projects:</span>
                        <ul className="overlap-list">
                          {alert.details.overlappingProjects.map((proj, idx) => (
                            <li key={idx}>
                              {proj.project_name} ({proj.deadline}) - {proj.days_apart} days apart
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {alert.type === 'budget_risk' && (
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">Total Budget:</span>
                        <span className="detail-value">CHF {alert.details.budgetTotal.toLocaleString()}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Spent:</span>
                        <span className="detail-value alert-highlight">CHF {alert.details.budgetSpent.toLocaleString()}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Remaining:</span>
                        <span className="detail-value">CHF {alert.details.budgetRemaining.toLocaleString()}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Spend %:</span>
                        <span className="detail-value alert-highlight">{alert.details.spendPercent}%</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Completion:</span>
                        <span className="detail-value">{alert.details.completionPercent}%</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Deadline:</span>
                        <span className="detail-value">{alert.details.deadline}</span>
                      </div>
                    </div>
                  )}

                  {alert.type === 'absence_conflict' && (
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">Engineer:</span>
                        <span className="detail-value">{alert.details.engineerName}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Start Date:</span>
                        <span className="detail-value">{alert.details.startDate}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">End Date:</span>
                        <span className="detail-value">{alert.details.endDate}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Reason:</span>
                        <span className="detail-value">{alert.details.reason}</span>
                      </div>
                      <div className="detail-item full-width">
                        <span className="detail-label">Affected Projects:</span>
                        <ul className="overlap-list">
                          {alert.details.overlappingAssignments.map((assign, idx) => (
                            <li key={idx}>
                              {assign.project_name} ({assign.hours_per_week}h/week)
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {alert.type === 'unassigned_project' && (
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">Priority:</span>
                        <span className="detail-value">{alert.details.priority}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Deadline:</span>
                        <span className="detail-value">{alert.details.deadline}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Status:</span>
                        <span className="detail-value">{alert.details.status}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RiskAlertsPanel;
