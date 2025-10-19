/**
 * Gantt Chart Component
 *
 * Interactive timeline visualization for projects showing:
 * - Project timelines with start dates and deadlines
 * - Color-coded priority levels
 * - Completion progress within bars
 * - Filtering by priority, status, team
 * - Zoom levels: Week, Month, Quarter, Year
 * - Current date indicator
 */

import React, { useState, useEffect } from 'react';
import './GanttChart.css';

const GanttChart = ({ projects, onProjectClick }) => {
  const [viewMode, setViewMode] = useState('month'); // week, month, quarter, year
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);

  // Calculate date range for the chart
  const calculateDateRange = () => {
    if (!projects || projects.length === 0) {
      const today = new Date();
      return {
        start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
        end: new Date(today.getFullYear(), today.getMonth() + 3, 0)
      };
    }

    const dates = projects.flatMap(p => [
      p.start_date ? new Date(p.start_date) : null,
      p.deadline ? new Date(p.deadline) : null
    ]).filter(d => d !== null);

    if (dates.length === 0) {
      const today = new Date();
      return {
        start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
        end: new Date(today.getFullYear(), today.getMonth() + 3, 0)
      };
    }

    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));

    // Add padding
    const start = new Date(minDate);
    start.setMonth(start.getMonth() - 1);
    const end = new Date(maxDate);
    end.setMonth(end.getMonth() + 1);

    return { start, end };
  };

  const dateRange = calculateDateRange();

  // Generate time markers based on view mode
  const generateTimeMarkers = () => {
    const markers = [];
    const { start, end } = dateRange;
    let current = new Date(start);

    switch (viewMode) {
      case 'week':
        while (current <= end) {
          markers.push({
            date: new Date(current),
            label: `${current.getDate()}/${current.getMonth() + 1}`
          });
          current.setDate(current.getDate() + 7);
        }
        break;
      case 'month':
        current.setDate(1);
        while (current <= end) {
          markers.push({
            date: new Date(current),
            label: current.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
          });
          current.setMonth(current.getMonth() + 1);
        }
        break;
      case 'quarter':
        const quarter = Math.floor(current.getMonth() / 3);
        current.setMonth(quarter * 3);
        current.setDate(1);
        while (current <= end) {
          const q = Math.floor(current.getMonth() / 3) + 1;
          markers.push({
            date: new Date(current),
            label: `Q${q} ${current.getFullYear()}`
          });
          current.setMonth(current.getMonth() + 3);
        }
        break;
      case 'year':
        current.setMonth(0);
        current.setDate(1);
        while (current <= end) {
          markers.push({
            date: new Date(current),
            label: current.getFullYear().toString()
          });
          current.setFullYear(current.getFullYear() + 1);
        }
        break;
      default:
        break;
    }

    return markers;
  };

  const timeMarkers = generateTimeMarkers();

  // Calculate position and width for a project bar
  const calculateBarPosition = (project) => {
    const startDate = project.start_date ? new Date(project.start_date) : new Date(dateRange.start);
    const endDate = project.deadline ? new Date(project.deadline) : new Date(startDate);
    endDate.setDate(endDate.getDate() + 1); // Include the deadline day

    const totalDuration = dateRange.end - dateRange.start;
    const left = ((startDate - dateRange.start) / totalDuration) * 100;
    const width = ((endDate - startDate) / totalDuration) * 100;

    return {
      left: Math.max(0, Math.min(100, left)),
      width: Math.max(1, Math.min(100 - left, width))
    };
  };

  // Get color based on priority
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return '#dc2626';
      case 'medium': return '#f59e0b';
      case 'low': return '#22c55e';
      default: return '#6b7280';
    }
  };

  // Filter projects
  const filteredProjects = projects.filter(project => {
    if (filterPriority !== 'all' && project.priority?.toLowerCase() !== filterPriority) {
      return false;
    }
    if (filterStatus !== 'all' && project.status?.toLowerCase() !== filterStatus) {
      return false;
    }
    return true;
  });

  // Handle project click
  const handleProjectClick = (project) => {
    setSelectedProject(project);
    if (onProjectClick) {
      onProjectClick(project);
    }
  };

  // Calculate current date position
  const getCurrentDatePosition = () => {
    const today = new Date();
    const totalDuration = dateRange.end - dateRange.start;
    const position = ((today - dateRange.start) / totalDuration) * 100;
    return Math.max(0, Math.min(100, position));
  };

  const currentDatePosition = getCurrentDatePosition();

  if (!projects || projects.length === 0) {
    return (
      <div className="gantt-chart">
        <div className="gantt-header">
          <h3>Project Timeline</h3>
        </div>
        <div className="gantt-empty">
          <p>No projects to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gantt-chart">
      <div className="gantt-header">
        <h3>Project Timeline</h3>
        <div className="gantt-controls">
          <div className="filter-group">
            <label>Priority:</label>
            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
              <option value="all">All</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Status:</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="planning">Planning</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="view-mode-group">
            <button
              className={`view-mode-btn ${viewMode === 'week' ? 'active' : ''}`}
              onClick={() => setViewMode('week')}
            >
              Week
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'month' ? 'active' : ''}`}
              onClick={() => setViewMode('month')}
            >
              Month
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'quarter' ? 'active' : ''}`}
              onClick={() => setViewMode('quarter')}
            >
              Quarter
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'year' ? 'active' : ''}`}
              onClick={() => setViewMode('year')}
            >
              Year
            </button>
          </div>
        </div>
      </div>

      <div className="gantt-container">
        {/* Timeline header */}
        <div className="timeline-header">
          <div className="project-labels-header">Projects</div>
          <div className="timeline-markers">
            {timeMarkers.map((marker, index) => (
              <div
                key={index}
                className="time-marker"
                style={{ width: `${100 / timeMarkers.length}%` }}
              >
                {marker.label}
              </div>
            ))}
          </div>
        </div>

        {/* Project rows */}
        <div className="timeline-body">
          {filteredProjects.map((project) => {
            const barPosition = calculateBarPosition(project);
            const priorityColor = getPriorityColor(project.priority);
            const completion = project.completion_percent || 0;

            return (
              <div
                key={project.id}
                className={`project-row ${selectedProject?.id === project.id ? 'selected' : ''}`}
              >
                <div className="project-label">
                  <div className="gantt-project-name" title={project.name}>
                    {project.name}
                  </div>
                  <div className="gantt-project-meta">
                    <span className="priority-badge" style={{ backgroundColor: priorityColor }}>
                      {project.priority}
                    </span>
                    <span className="completion-badge">{completion}%</span>
                  </div>
                </div>
                <div className="timeline-grid">
                  {/* Current date indicator */}
                  <div
                    className="current-date-line"
                    style={{ left: `${currentDatePosition}%` }}
                    title={`Today: ${new Date().toLocaleDateString()}`}
                  />

                  {/* Time markers grid */}
                  {timeMarkers.map((_, index) => (
                    <div
                      key={index}
                      className="grid-line"
                      style={{ width: `${100 / timeMarkers.length}%` }}
                    />
                  ))}

                  {/* Project bar */}
                  <div
                    className="project-bar"
                    style={{
                      left: `${barPosition.left}%`,
                      width: `${barPosition.width}%`,
                      backgroundColor: priorityColor
                    }}
                    onClick={() => handleProjectClick(project)}
                    title={`${project.name}\nStart: ${project.start_date || 'N/A'}\nDeadline: ${project.deadline}\nCompletion: ${completion}%`}
                  >
                    <div
                      className="gantt-project-progress"
                      style={{ width: `${completion}%` }}
                    />
                    <span className="project-bar-label">{project.name}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="gantt-legend">
          <div className="gantt-legend-item">
            <div className="gantt-legend-color" style={{ backgroundColor: '#dc2626' }}></div>
            <span>High Priority</span>
          </div>
          <div className="gantt-legend-item">
            <div className="gantt-legend-color" style={{ backgroundColor: '#f59e0b' }}></div>
            <span>Medium Priority</span>
          </div>
          <div className="gantt-legend-item">
            <div className="gantt-legend-color" style={{ backgroundColor: '#22c55e' }}></div>
            <span>Low Priority</span>
          </div>
          <div className="gantt-legend-item">
            <div className="gantt-legend-line current-date"></div>
            <span>Today</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;
