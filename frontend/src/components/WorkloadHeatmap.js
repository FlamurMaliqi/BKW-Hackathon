/**
 * Workload Heatmap Component
 *
 * Visual representation of engineer workload over time
 * - Rows: Engineers
 * - Columns: Weeks or Days
 * - Color intensity: Workload percentage (0%-100%+)
 * - Tooltips with assignment details
 */

import React, { useState, useEffect } from 'react';
import './WorkloadHeatmap.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const WorkloadHeatmap = () => {
  const [engineers, setEngineers] = useState([]);
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'day'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);

  // Fetch engineers workload data
  const fetchEngineers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/workload/weekly`);
      const data = await response.json();

      if (data.status === 'success') {
        setEngineers(data.engineers || []);
      } else {
        throw new Error(data.error || 'Failed to fetch workload data');
      }
    } catch (err) {
      console.error('Error fetching workload data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEngineers();

    // Refresh every 30 seconds to pick up assignment changes
    const interval = setInterval(fetchEngineers, 30000);
    return () => clearInterval(interval);
  }, []);

  // Generate weeks for the next 8 weeks
  const generateWeeks = () => {
    const weeks = [];
    const today = new Date();

    for (let i = 0; i < 8; i++) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() + (i * 7));

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      weeks.push({
        label: `${weekStart.getDate()}/${weekStart.getMonth() + 1}`,
        start: weekStart,
        end: weekEnd,
        index: i
      });
    }

    return weeks;
  };

  const weeks = generateWeeks();

  // Get workload color based on percentage
  const getWorkloadColor = (workloadPercent) => {
    if (workloadPercent === 0) return '#f3f4f6'; // Empty - gray
    if (workloadPercent <= 25) return '#bbf7d0'; // Very light green
    if (workloadPercent <= 50) return '#86efac'; // Light green
    if (workloadPercent <= 75) return '#4ade80'; // Medium green
    if (workloadPercent <= 90) return '#22c55e'; // Green
    if (workloadPercent <= 100) return '#16a34a'; // Dark green
    if (workloadPercent <= 120) return '#fb923c'; // Orange - warning
    return '#dc2626'; // Red - critical
  };

  // Get workload text color for contrast
  const getTextColor = (workloadPercent) => {
    return workloadPercent >= 50 ? '#ffffff' : '#1f2937';
  };

  // Get actual workload for a specific week from the engineer's data
  const getWorkloadForWeek = (engineer, weekIndex) => {
    if (!engineer.weekly_workload || !engineer.weekly_workload[weekIndex]) {
      return 0;
    }
    return engineer.weekly_workload[weekIndex];
  };

  if (loading) {
    return (
      <div className="workload-heatmap">
        <div className="heatmap-header">
          <h3>Engineer Workload Heatmap</h3>
        </div>
        <div className="loading-state">Loading heatmap...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="workload-heatmap">
        <div className="heatmap-header">
          <h3>Engineer Workload Heatmap</h3>
        </div>
        <div className="error-state">Error loading heatmap: {error}</div>
      </div>
    );
  }

  if (engineers.length === 0) {
    return (
      <div className="workload-heatmap">
        <div className="heatmap-header">
          <h3>Engineer Workload Heatmap</h3>
        </div>
        <div className="empty-state">No engineers found</div>
      </div>
    );
  }

  return (
    <div className="workload-heatmap">
      <div className="heatmap-header">
        <h3>Engineer Workload Heatmap</h3>
        <div className="heatmap-legend">
          <span className="legend-label">Workload:</span>
          <div className="legend-gradient">
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#f3f4f6' }}></div>
              <span>0%</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#86efac' }}></div>
              <span>50%</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#22c55e' }}></div>
              <span>100%</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#dc2626' }}></div>
              <span>120%+</span>
            </div>
          </div>
        </div>
      </div>

      <div className="heatmap-container">
        <div className="heatmap-grid">
          {/* Header row with week labels */}
          <div className="heatmap-row header-row">
            <div className="engineer-label-cell header-cell">Engineer</div>
            {weeks.map((week) => (
              <div key={week.index} className="heatmap-cell header-cell">
                {week.label}
              </div>
            ))}
          </div>

          {/* Engineer rows */}
          {engineers.map((engineer, engineerIndex) => (
            <div key={engineer.id} className="heatmap-row">
              <div className="engineer-label-cell">
                <div className="engineer-name">{engineer.name}</div>
                <div className="engineer-role">{engineer.role || 'Engineer'}</div>
                <div className="engineer-team">{engineer.team_name || 'No team'}</div>
              </div>
              {weeks.map((week) => {
                const workload = getWorkloadForWeek(engineer, week.index);
                const weekProjects = engineer.weekly_projects && engineer.weekly_projects[week.index] ? engineer.weekly_projects[week.index] : [];
                const bgColor = getWorkloadColor(workload);
                const textColor = getTextColor(workload);
                const cellKey = `${engineer.id}-${week.index}`;
                const isHovered = hoveredCell === cellKey;
                // Show tooltip above if this is one of the last 3 rows
                const isBottomRow = engineerIndex >= engineers.length - 3;

                return (
                  <div
                    key={week.index}
                    className={`heatmap-cell workload-cell ${isHovered ? 'hovered' : ''}`}
                    style={{
                      backgroundColor: bgColor,
                      color: textColor
                    }}
                    onMouseEnter={() => setHoveredCell(cellKey)}
                    onMouseLeave={() => setHoveredCell(null)}
                    title={`${engineer.name}\nWeek ${week.label}\nWorkload: ${workload}%\nCapacity: ${engineer.capacity_hours_per_week}h/week`}
                  >
                    <span className="workload-value">{workload}%</span>
                    {isHovered && (
                      <div className={`workload-tooltip ${isBottomRow ? 'tooltip-above' : ''}`}>
                        <div className="tooltip-header">
                          <strong>{engineer.name}</strong>
                        </div>
                        <div className="tooltip-content">
                          <div>Week: {week.label}</div>
                          <div>Workload: {workload}%</div>
                          <div>Capacity: {engineer.capacity_hours_per_week}h/week</div>
                          <div>Availability: {engineer.availability || 'available'}</div>
                          {weekProjects.length > 0 && (
                            <div className="tooltip-projects">
                              <div style={{ marginTop: '8px', fontWeight: 'bold' }}>Active Projects:</div>
                              {weekProjects.map((project, idx) => (
                                <div key={idx} style={{ marginLeft: '8px', fontSize: '12px' }}>
                                  • {project.name} ({project.hours}h/week)
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Summary statistics */}
      <div className="heatmap-summary">
        <div className="summary-item">
          <span className="summary-label">Total Engineers:</span>
          <span className="summary-value">{engineers.length}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Overallocated (Week 1):</span>
          <span className="summary-value alert">
            {engineers.filter(e => e.weekly_workload && e.weekly_workload[0] > 100).length}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Available (Week 1):</span>
          <span className="summary-value success">
            {engineers.filter(e => e.weekly_workload && e.weekly_workload[0] <= 75).length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default WorkloadHeatmap;
