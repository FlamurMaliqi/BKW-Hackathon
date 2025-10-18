/**
 * Project Overview Component
 * 
 * This component displays the main project management dashboard.
 * It shows project status, timelines, and resource allocation in a
 * card-based layout. This is the first tab in the main navigation.
 * 
 * Features:
 * - Project status monitoring
 * - Timeline and deadline management
 * - Resource allocation tracking
 * - Interactive project lists with expandable details
 * - Multiple chart visualizations
 */

import React, { useState } from 'react';
import './ProjectOverview.css';

const ProjectOverview = () => {
  // State for managing expanded project items
  const [expandedProjects, setExpandedProjects] = useState(new Set());

  // Dummy data for projects
  const projects = [
    {
      id: 1,
      name: "E-commerce Platform Redesign",
      deadline: "2024-02-15",
      completion: 75,
      priority: "High",
      team: ["Alice Johnson", "Bob Smith", "Carol Davis"],
      budget: 150000,
      spent: 112500,
      status: "In Progress",
      description: "Complete redesign of the e-commerce platform with modern UI/UX and improved performance."
    },
    {
      id: 2,
      name: "Mobile App Development",
      deadline: "2024-03-01",
      completion: 45,
      priority: "Medium",
      team: ["David Wilson", "Eva Brown"],
      budget: 200000,
      spent: 90000,
      status: "In Progress",
      description: "Native mobile application for iOS and Android with cross-platform compatibility."
    },
    {
      id: 3,
      name: "Data Analytics Dashboard",
      deadline: "2024-01-30",
      completion: 90,
      priority: "High",
      team: ["Frank Miller", "Grace Lee", "Henry Taylor"],
      budget: 80000,
      spent: 72000,
      status: "Near Completion",
      description: "Real-time analytics dashboard with advanced reporting capabilities."
    },
    {
      id: 4,
      name: "API Integration Project",
      deadline: "2024-02-28",
      completion: 30,
      priority: "Low",
      team: ["Ivy Chen", "Jack Anderson"],
      budget: 60000,
      spent: 18000,
      status: "Planning",
      description: "Integration of third-party APIs for enhanced functionality."
    }
  ];

  // Toggle project expansion
  const toggleProject = (projectId) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  // Navigate to project details (placeholder)
  const goToProjectDetails = (projectId) => {
    console.log(`Navigate to project details for project ${projectId}`);
    // This would typically use React Router or similar navigation
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return '#dc3545';
      case 'Medium': return '#ffc107';
      case 'Low': return '#28a745';
      default: return '#6c757d';
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress': return '#007bff';
      case 'Near Completion': return '#28a745';
      case 'Planning': return '#6c757d';
      default: return '#6c757d';
    }
  };

  return (
    <div className="project-overview">
      {/* Header section with page title */}
      <div className="content-header">
        <h1>Project Overview</h1>
        <p>Monitor project status, deadlines, and resource allocation</p>
      </div>

      {/* Main content area */}
      <div className="content-body">
        {/* Graphs Overview Section */}
        <div className="graphs-overview">
          <div className="graphs-header">
            <h2>Graphs Overview</h2>
            <button className="btn-primary">View Detailed Graphs</button>
          </div>
          
          <div className="graphs-grid">
            {/* Gantt Chart */}
            <div className="graph-card">
              <div className="graph-header">
                <h3>Project Timeline</h3>
                <span className="graph-icon">📊</span>
              </div>
              <div className="graph-content">
                <div className="gantt-chart">
                  {projects.map(project => (
                    <div key={project.id} className="gantt-bar">
                      <div className="gantt-label">{project.name}</div>
                      <div className="gantt-progress">
                        <div 
                          className="gantt-fill" 
                          style={{ 
                            width: `${project.completion}%`,
                            backgroundColor: getPriorityColor(project.priority)
                          }}
                        ></div>
                      </div>
                      <div className="gantt-deadline">{project.deadline}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Budget Allocation Chart */}
            <div className="graph-card">
              <div className="graph-header">
                <h3>Budget Allocation</h3>
                <span className="graph-icon">💰</span>
              </div>
              <div className="graph-content">
                <div className="budget-chart">
                  {projects.map(project => {
                    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
                    const percentage = (project.budget / totalBudget) * 100;
                    return (
                      <div key={project.id} className="budget-item">
                        <div className="budget-label">{project.name}</div>
                        <div className="budget-bar">
                          <div 
                            className="budget-fill" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="budget-amount">${project.budget.toLocaleString()}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Resource Allocation Chart */}
            <div className="graph-card">
              <div className="graph-header">
                <h3>Resource Allocation</h3>
                <span className="graph-icon">👥</span>
              </div>
              <div className="graph-content">
                <div className="resource-chart">
                  {projects.map(project => (
                    <div key={project.id} className="resource-item">
                      <div className="resource-label">{project.name}</div>
                      <div className="resource-team">
                        {project.team.map((member, index) => (
                          <span key={index} className="team-member">{member}</span>
                        ))}
                      </div>
                      <div className="resource-count">{project.team.length} members</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Projects List */}
        <div className="projects-section">
          <div className="projects-header">
            <h2>Active Projects</h2>
            <div className="projects-actions">
              <button className="btn-secondary">Export</button>
              <button className="btn-primary">New Project</button>
            </div>
          </div>

          <div className="projects-list">
            {projects.map(project => (
              <div key={project.id} className="project-item">
                <div 
                  className="project-summary"
                  onClick={() => toggleProject(project.id)}
                >
                  <div className="project-info">
                    <div className="project-name">{project.name}</div>
                    <div className="project-meta">
                      <span className="project-deadline">Deadline: {project.deadline}</span>
                      <span 
                        className="project-priority"
                        style={{ color: getPriorityColor(project.priority) }}
                      >
                        {project.priority} Priority
                      </span>
                      <span 
                        className="project-status"
                        style={{ color: getStatusColor(project.status) }}
                      >
                        {project.status}
                      </span>
                    </div>
                  </div>
                  <div className="project-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${project.completion}%` }}
                      ></div>
                    </div>
                    <div className="progress-text">{project.completion}%</div>
                  </div>
                  <div className="project-actions">
                    <button 
                      className="btn-details"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToProjectDetails(project.id);
                      }}
                    >
                      View Details
                    </button>
                    <span className="expand-icon">
                      {expandedProjects.has(project.id) ? '▼' : '▶'}
                    </span>
                  </div>
                </div>

                {expandedProjects.has(project.id) && (
                  <div className="project-details">
                    <div className="details-grid">
                      <div className="detail-section">
                        <h4>Description</h4>
                        <p>{project.description}</p>
                      </div>
                      <div className="detail-section">
                        <h4>Team Members</h4>
                        <div className="team-list">
                          {project.team.map((member, index) => (
                            <span key={index} className="team-member">{member}</span>
                          ))}
                        </div>
                      </div>
                      <div className="detail-section">
                        <h4>Budget Information</h4>
                        <div className="budget-info">
                          <div className="budget-item">
                            <span>Total Budget:</span>
                            <span>${project.budget.toLocaleString()}</span>
                          </div>
                          <div className="budget-item">
                            <span>Amount Spent:</span>
                            <span>${project.spent.toLocaleString()}</span>
                          </div>
                          <div className="budget-item">
                            <span>Remaining:</span>
                            <span>${(project.budget - project.spent).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="detail-section">
                        <h4>Progress Details</h4>
                        <div className="progress-details">
                          <div className="progress-item">
                            <span>Completion:</span>
                            <span>{project.completion}%</span>
                          </div>
                          <div className="progress-item">
                            <span>Status:</span>
                            <span style={{ color: getStatusColor(project.status) }}>
                              {project.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverview;
