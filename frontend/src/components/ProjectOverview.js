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

import React, { useState, useEffect } from 'react';
import './ProjectOverview.css';
import { getProjects, createProject, assignEngineerToProject, unassignEngineerFromProject } from '../services/api';
import CreateProjectModal from './CreateProjectModal';
import AssignEngineerModal from './AssignEngineerModal';
import { exportToCSV, getTimestamp } from '../utils/csvExport';

const ProjectOverview = () => {
  // State for managing expanded project items
  const [expandedProjects, setExpandedProjects] = useState(new Set());
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // Fetch projects from backend
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await getProjects();
      if (response.status === 'success' && response.projects) {
        setProjects(response.projects);
      } else {
        throw new Error('Failed to fetch projects');
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  // Handle project creation
  const handleCreateProject = async (projectData) => {
    const response = await createProject(projectData);
    if (response.status === 'success') {
      await fetchProjects(); // Refresh project list
    } else {
      throw new Error(response.error || 'Failed to create project');
    }
  };

  // Handle engineer assignment
  const handleAssignEngineer = async (assignmentData) => {
    const response = await assignEngineerToProject(selectedProject.id, assignmentData);
    if (response.status === 'success') {
      await fetchProjects(); // Refresh project list
    } else {
      throw new Error(response.error || 'Failed to assign engineer');
    }
  };

  // Handle engineer unassignment
  const handleUnassignEngineer = async (projectId, engineerName) => {
    if (!window.confirm(`Remove ${engineerName} from this project?`)) {
      return;
    }

    try {
      // Find engineer ID by name (this is a workaround - ideally we'd store engineer IDs)
      // For now, we'll need to implement this differently or fetch engineer details
      console.log('Unassign engineer:', engineerName, 'from project:', projectId);
      alert('Unassign functionality needs engineer ID mapping');
    } catch (err) {
      alert('Failed to remove engineer: ' + err.message);
    }
  };

  // Open assign modal for a project
  const openAssignModal = (project) => {
    setSelectedProject(project);
    setShowAssignModal(true);
  };

  // Dummy data for projects (fallback - removed)
  const fallbackProjects = [
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

  // Export active projects
  const handleExportProjects = () => {
    const projectData = projects.map(project => ({
      name: project.name,
      deadline: project.deadline,
      priority: project.priority,
      status: project.status,
      completion_percent: project.completion_percent || 0,
      budget_total: project.budget_total || 0,
      budget_spent: project.budget_spent || 0,
      budget_remaining: (project.budget_total || 0) - (project.budget_spent || 0),
      team_members: project.team_members || [],
      description: project.description
    }));

    const columns = [
      { key: 'name', label: 'Project Name' },
      { key: 'deadline', label: 'Deadline' },
      { key: 'priority', label: 'Priority' },
      { key: 'status', label: 'Status' },
      { key: 'completion_percent', label: 'Completion %' },
      { key: 'budget_total', label: 'Total Budget' },
      { key: 'budget_spent', label: 'Amount Spent' },
      { key: 'budget_remaining', label: 'Budget Remaining' },
      { key: 'team_members', label: 'Team Members' },
      { key: 'description', label: 'Description' }
    ];

    const timestamp = getTimestamp();
    exportToCSV(projectData, columns, `projects-overview-${timestamp}.csv`);
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

  // Show loading state
  if (loading) {
    return (
      <div className="project-overview">
        <div className="content-header">
          <h1>Project Overview</h1>
          <p>Monitor project status, deadlines, and resource allocation</p>
        </div>
        <div className="content-body">
          <div className="loading-message">Loading projects...</div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="project-overview">
        <div className="content-header">
          <h1>Project Overview</h1>
          <p>Monitor project status, deadlines, and resource allocation</p>
        </div>
        <div className="content-body">
          <div className="error-message">Error loading projects: {error}</div>
        </div>
      </div>
    );
  }

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
                            width: `${project.completion_percent || 0}%`,
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
                    const totalBudget = projects.reduce((sum, p) => sum + (p.budget_total || 0), 0);
                    const percentage = ((project.budget_total || 0) / totalBudget) * 100;
                    return (
                      <div key={project.id} className="budget-item">
                        <div className="budget-label">{project.name}</div>
                        <div className="budget-bar">
                          <div 
                            className="budget-fill" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="budget-amount">${(project.budget_total || 0).toLocaleString()}</div>
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
                        {(project.team_members || []).map((member, index) => (
                          <span key={index} className="team-member">{member}</span>
                        ))}
                      </div>
                      <div className="resource-count">{(project.team_members || []).length} members</div>
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
              <button className="btn-secondary" onClick={handleExportProjects}>Export</button>
              <button className="btn-primary" onClick={() => setShowCreateModal(true)}>New Project</button>
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
                        style={{ width: `${project.completion_percent || 0}%` }}
                      ></div>
                    </div>
                    <div className="progress-text">{project.completion_percent || 0}%</div>
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
                        <div className="team-members-section">
                          <div className="team-list">
                            {(project.team_members || []).map((member, index) => (
                              <div key={index} className="team-member-item">
                                <span className="team-member">{member}</span>
                                <button
                                  className="btn-remove-member"
                                  onClick={() => handleUnassignEngineer(project.id, member)}
                                  title="Remove from project"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                          <button
                            className="btn-assign-engineer"
                            onClick={() => openAssignModal(project)}
                          >
                            + Assign Engineer
                          </button>
                        </div>
                      </div>
                      <div className="detail-section">
                        <h4>Budget Information</h4>
                        <div className="budget-info">
                          <div className="budget-item">
                            <span>Total Budget:</span>
                            <span>${(project.budget_total || 0).toLocaleString()}</span>
                          </div>
                          <div className="budget-item">
                            <span>Amount Spent:</span>
                            <span>${(project.budget_spent || 0).toLocaleString()}</span>
                          </div>
                          <div className="budget-item">
                            <span>Remaining:</span>
                            <span>${(project.budget_remaining || 0).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="detail-section">
                        <h4>Progress Details</h4>
                        <div className="progress-details">
                          <div className="progress-item">
                            <span>Completion:</span>
                            <span>{project.completion_percent || 0}%</span>
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

      {/* Modals */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onProjectCreated={handleCreateProject}
      />

      <AssignEngineerModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        projectId={selectedProject?.id}
        projectName={selectedProject?.name}
        onEngineerAssigned={handleAssignEngineer}
      />
    </div>
  );
};

export default ProjectOverview;
