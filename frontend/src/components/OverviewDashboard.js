/**
 * Overview Dashboard Component
 * 
 * This component displays the main overview dashboard with three key charts:
 * 1. Gauge/Circular Progress Chart - Overall project completion percentage
 * 2. Bar Chart - Monthly project metrics and trends
 * 3. Area Chart - Budget utilization and spending trends over time
 * 
 * The component follows the same design patterns as the existing frontend,
 * using vanilla CSS for styling and React state management for data.
 */

import React, { useState, useEffect } from 'react';
import './OverviewDashboard.css';
import { getProjects, getEngineers, getTeams, createProject, unassignEngineerFromProject, assignEngineerToProject, importCSVData } from '../services/api';
import { exportToCSV, getTimestamp } from '../utils/csvExport';
import CreateProjectModal from './CreateProjectModal';
import AssignEngineerModal from './AssignEngineerModal';

const OverviewDashboard = () => {
  // State management
  const [expandedProjects, setExpandedProjects] = useState(new Set());
  const [projects, setProjects] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartsHighlighted, setChartsHighlighted] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  // Chart data states
  const [overallCompletion, setOverallCompletion] = useState(0);
  const [monthlyData, setMonthlyData] = useState([]);
  const [budgetTrendData, setBudgetTrendData] = useState([]);
  const [chartStats, setChartStats] = useState({});

  // Workload analysis states
  const [workloadData, setWorkloadData] = useState({
    overloaded: [],
    underloaded: [],
    teamAverages: []
  });
  const [showAllWorkers, setShowAllWorkers] = useState(false);

  // Fetch all data from APIs
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [projectsRes, engineersRes, teamsRes] = await Promise.all([
        getProjects(),
        getEngineers(),
        getTeams()
      ]);

      if (projectsRes.status === 'success') {
        setProjects(projectsRes.projects || []);
      }
      if (engineersRes.status === 'success') {
        setEngineers(engineersRes.engineers || []);
      }
      if (teamsRes.status === 'success') {
        setTeams(teamsRes.teams || []);
      }

      // Process data for charts
      processChartData(projectsRes.projects || []);
      
      // Process workload analysis data
      processWorkloadData(engineersRes.engineers || [], teamsRes.teams || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Process data for all three charts
  const processChartData = (projectsData) => {
    // 1. Calculate overall completion percentage
    const totalCompletion = projectsData.reduce((sum, project) => 
      sum + (project.completion_percent || 0), 0);
    const avgCompletion = projectsData.length > 0 ? totalCompletion / projectsData.length : 0;
    setOverallCompletion(Math.round(avgCompletion));

    // 2. Generate monthly data for bar chart
    const monthlyMetrics = generateMonthlyData(projectsData);
    setMonthlyData(monthlyMetrics);

    // 3. Generate budget trend data for area chart
    const budgetTrends = generateBudgetTrendData(projectsData);
    setBudgetTrendData(budgetTrends);

    // 4. Calculate additional statistics
    const stats = calculateStatistics(projectsData);
    setChartStats(stats);
  };

  // Generate monthly project metrics
  const generateMonthlyData = (projectsData) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    return months.map((month, index) => {
      // Simulate realistic data based on project status
      const completedProjects = Math.floor(Math.random() * 2); // 0-1 completed per month
      const newProjects = Math.floor(Math.random() * 3) + 1; // 1-3 new per month
      
      return {
        month,
        completed: completedProjects,
        new: newProjects,
        total: completedProjects + newProjects
      };
    });
  };

  // Generate budget trend data
  const generateBudgetTrendData = (projectsData) => {
    const totalBudget = projectsData.reduce((sum, p) => sum + (p.budget_total || 0), 0);
    const totalSpent = projectsData.reduce((sum, p) => sum + (p.budget_spent || 0), 0);
    
    // Generate 12 months of trend data - ensure all months are included
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return months.map((month, index) => {
      // Simulate realistic budget spending progression
      const baseSpending = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
      const monthlyVariation = (Math.random() - 0.5) * 15; // ±7.5% variation
      const progression = (index / 11) * 0.7; // 70% of total by current month
      
      const budgetUsed = Math.max(0, Math.min(100, baseSpending * progression + monthlyVariation));
      const budgetRemaining = 100 - budgetUsed;
      
      return {
        month,
        budgetUsed: Math.round(budgetUsed),
        budgetRemaining: Math.round(budgetRemaining),
        totalBudget: Math.round(totalBudget / 1000000), // In millions
        spent: Math.round((budgetUsed / 100) * totalBudget)
      };
    });
  };

  // Calculate additional statistics
  const calculateStatistics = (projectsData) => {
    const totalProjects = projectsData.length;
    const activeProjects = projectsData.filter(p => p.status === 'active').length;
    const completedProjects = projectsData.filter(p => (p.completion_percent || 0) >= 100).length;
    const totalBudget = projectsData.reduce((sum, p) => sum + (p.budget_total || 0), 0);
    const totalSpent = projectsData.reduce((sum, p) => sum + (p.budget_spent || 0), 0);
    const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    
    return {
      totalProjects,
      activeProjects,
      completedProjects,
      totalBudget,
      totalSpent,
      budgetUtilization: Math.round(budgetUtilization),
      avgCompletion: Math.round(overallCompletion)
    };
  };

  // Process workload analysis data
  const processWorkloadData = (engineersData, teamsData) => {
    // Calculate workload for each engineer
    const engineersWithWorkload = engineersData.map(engineer => {
      const currentLoad = engineer.current_load || 0;
      const capacity = engineer.capacity_hours_per_week || 40;
      const loadPercentage = capacity > 0 ? (currentLoad / capacity) * 100 : 0;
      
      return {
        ...engineer,
        loadPercentage: Math.round(loadPercentage),
        isOverloaded: loadPercentage > 100,
        isUnderloaded: loadPercentage < 50
      };
    });

    // Sort engineers by load percentage
    const sortedEngineers = engineersWithWorkload.sort((a, b) => b.loadPercentage - a.loadPercentage);
    
    // Get overloaded workers (load > 100%)
    const overloaded = sortedEngineers.filter(eng => eng.isOverloaded);
    
    // Get underloaded workers (load < 50%)
    const underloaded = sortedEngineers.filter(eng => eng.isUnderloaded);

    // Calculate average load per team
    const teamAverages = teamsData.map(team => {
      const teamEngineers = engineersWithWorkload.filter(eng => eng.team_id === team.id);
      const totalLoad = teamEngineers.reduce((sum, eng) => sum + eng.loadPercentage, 0);
      const averageLoad = teamEngineers.length > 0 ? totalLoad / teamEngineers.length : 0;
      
      return {
        teamId: team.id,
        teamName: team.name,
        averageLoad: Math.round(averageLoad),
        memberCount: teamEngineers.length
      };
    }).sort((a, b) => b.averageLoad - a.averageLoad);

    setWorkloadData({
      overloaded,
      underloaded,
      teamAverages
    });
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Get priority color helper
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  // Get status color helper
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return '#007bff';
      case 'completed': return '#28a745';
      case 'planning': return '#6c757d';
      default: return '#6c757d';
    }
  };

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

  // Handle View Details button click to highlight charts
  const handleViewDetails = () => {
    setChartsHighlighted(!chartsHighlighted);
  };

  // Handle CSV import
  const handleImportCSV = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const result = await importCSVData(file);
      setImportResult(result);
      
      // Refresh data after successful import
      if (result.status === 'success') {
        await fetchDashboardData();
      }
    } catch (error) {
      console.error('Import failed:', error);
      setImportResult({
        status: 'error',
        message: error.message || 'Import failed'
      });
    } finally {
      setImporting(false);
      // Clear the file input
      event.target.value = '';
    }
  };

  // Export dashboard report
  const handleExportReport = () => {
    const reportData = [
      {
        metric: 'Total Projects',
        value: chartStats.totalProjects || 0,
        description: 'Total number of projects in the system'
      },
      {
        metric: 'Active Projects',
        value: chartStats.activeProjects || 0,
        description: 'Currently active projects'
      },
      {
        metric: 'Completed Projects',
        value: chartStats.completedProjects || 0,
        description: 'Successfully completed projects'
      },
      {
        metric: 'Overall Completion %',
        value: `${overallCompletion}%`,
        description: 'Average completion percentage across all projects'
      },
      {
        metric: 'Total Budget',
        value: `$${Math.round((chartStats.totalBudget || 0) / 1000000)}M`,
        description: 'Total budget allocated across all projects'
      },
      {
        metric: 'Total Spent',
        value: `$${Math.round((chartStats.totalSpent || 0) / 1000000)}M`,
        description: 'Total amount spent across all projects'
      },
      {
        metric: 'Budget Utilization %',
        value: `${chartStats.budgetUtilization || 0}%`,
        description: 'Percentage of total budget utilized'
      }
    ];

    const columns = [
      { key: 'metric', label: 'Metric' },
      { key: 'value', label: 'Value' },
      { key: 'description', label: 'Description' }
    ];

    const timestamp = getTimestamp();
    exportToCSV(reportData, columns, `dashboard-report-${timestamp}.csv`);
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
    exportToCSV(projectData, columns, `active-projects-${timestamp}.csv`);
  };

  // Handle project creation
  const handleCreateProject = async (projectData) => {
    const response = await createProject(projectData);
    if (response.status === 'success') {
      await fetchDashboardData(); // Refresh dashboard data
    } else {
      throw new Error(response.error || 'Failed to create project');
    }
  };

  // Handle removing team member from project
  const handleRemoveTeamMember = async (projectId, memberName) => {
    try {
      // Find the engineer ID by name
      const engineer = engineers.find(eng => eng.name === memberName);
      if (!engineer) {
        console.error('Engineer not found:', memberName);
        return;
      }

      const response = await unassignEngineerFromProject(projectId, engineer.id);
      if (response.status === 'success') {
        // Refresh dashboard data to update the UI
        await fetchDashboardData();
        console.log(`Successfully removed ${memberName} from project`);
      } else {
        console.error('Failed to remove team member:', response.error);
      }
    } catch (error) {
      console.error('Error removing team member:', error);
    }
  };

  // Handle assigning engineer to project
  const handleAssignEngineer = async (assignmentData) => {
    try {
      const response = await assignEngineerToProject(selectedProject.id, assignmentData);
      if (response.status === 'success') {
        // Refresh dashboard data to update the UI
        await fetchDashboardData();
        console.log(`Successfully assigned engineer to project ${selectedProject.name}`);
      } else {
        throw new Error(response.error || 'Failed to assign engineer');
      }
    } catch (error) {
      console.error('Error assigning engineer:', error);
      throw error;
    }
  };

  // Render gauge chart
  const renderGaugeChart = () => {
    const size = 160;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (overallCompletion / 100) * circumference;
    const center = size / 2;

    return (
      <div className="gauge-chart">
        <div className="gauge-container">
          <svg width={size} height={size} className="gauge-svg">
            {/* Background circle */}
            <circle
              stroke="#E9ECEF"
              fill="transparent"
              strokeWidth={strokeWidth}
              r={radius}
              cx={center}
              cy={center}
            />
            {/* Progress circle */}
            <circle
              stroke="#28A745"
              fill="transparent"
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              style={{
                strokeDashoffset,
                strokeLinecap: 'round',
                transition: 'stroke-dashoffset 0.5s ease-in-out'
              }}
              r={radius}
              cx={center}
              cy={center}
            />
          </svg>
          <div className="gauge-text">
            <div className="gauge-percentage">{overallCompletion}%</div>
            <div className="gauge-label">Overall Completion</div>
          </div>
        </div>
        <div className="gauge-stats">
          <div className="stat-item">
            <span className="stat-value">{chartStats.totalProjects || 0}</span>
            <span className="stat-label">Total Projects</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{chartStats.activeProjects || 0}</span>
            <span className="stat-label">Active</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{chartStats.completedProjects || 0}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
      </div>
    );
  };

  // Render bar chart
  const renderBarChart = () => {
    const maxValue = Math.max(...monthlyData.map(d => Math.max(d.completed, d.new)));
    
    return (
      <div className="bar-chart">
        <div className="chart-header">
          <div className="chart-title">Project Activity (Last 6 Months)</div>
          <div className="chart-subtitle">New vs Completed Projects</div>
        </div>
        <div className="chart-content">
          <div className="bars-container">
            {monthlyData.map((data, index) => (
              <div key={data.month} className="bar-group">
                <div className="bar-labels">
                  <div className="bar-label">{data.month}</div>
                  <div className="bar-value">{data.total}</div>
                </div>
                <div className="bars">
                  <div className="bar completed" style={{
                    height: `${maxValue > 0 ? (data.completed / maxValue) * 100 : 0}%`
                  }}></div>
                  <div className="bar new" style={{
                    height: `${maxValue > 0 ? (data.new / maxValue) * 100 : 0}%`
                  }}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="chart-legend">
            <div className="legend-item">
              <div className="legend-color completed"></div>
              <span>Completed</span>
            </div>
            <div className="legend-item">
              <div className="legend-color new"></div>
              <span>New Projects</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render area chart
  const renderAreaChart = () => {
    const maxBudget = Math.max(...budgetTrendData.map(d => d.budgetUsed));
    
    return (
      <div className="area-chart">
        <div className="chart-header">
          <div className="chart-title">Budget Utilization Trend</div>
          <div className="chart-subtitle">Monthly Spending vs Budget</div>
        </div>
        <div className="chart-content">
          <div className="area-container">
            <svg viewBox="0 0 400 200" className="area-svg">
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map((value, index) => (
                <line
                  key={index}
                  x1="0"
                  y1={200 - (value / 100) * 180}
                  x2="400"
                  y2={200 - (value / 100) * 180}
                  stroke="#E9ECEF"
                  strokeWidth="1"
                />
              ))}
              
              {/* Area path */}
              <path
                d={budgetTrendData.map((data, index) => {
                  const x = (index / (budgetTrendData.length - 1)) * 400;
                  const y = 200 - (data.budgetUsed / 100) * 180;
                  return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ')}
                fill="url(#areaGradient)"
                stroke="#1A5276"
                strokeWidth="2"
              />
              
              {/* Gradient definition */}
              <defs>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#1A5276" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#1A5276" stopOpacity="0.05"/>
                </linearGradient>
              </defs>
              
              {/* Data points */}
              {budgetTrendData.map((data, index) => {
                const x = (index / (budgetTrendData.length - 1)) * 400;
                const y = 200 - (data.budgetUsed / 100) * 180;
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#1A5276"
                    className="data-point"
                  />
                );
              })}
            </svg>
            
            {/* X-axis labels */}
            <div className="x-axis-labels">
              {budgetTrendData.map((data, index) => (
                <div key={index} className="x-label">
                  {data.month}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Statistics moved outside chart content */}
        <div className="area-stats">
          <div className="stat-item">
            <span className="stat-value">{chartStats.budgetUtilization || 0}%</span>
            <span className="stat-label">Budget Used</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">${Math.round((chartStats.totalBudget || 0) / 1000000)}M</span>
            <span className="stat-label">Total Budget</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">${Math.round((chartStats.totalSpent || 0) / 1000000)}M</span>
            <span className="stat-label">Total Spent</span>
          </div>
        </div>
      </div>
    );
  };

  // Render workload analysis
  const renderWorkloadAnalysis = () => {
    const { overloaded, underloaded, teamAverages } = workloadData;
    
    // Get workers to display (3 by default, all if showAllWorkers is true)
    const displayOverloaded = showAllWorkers ? overloaded : overloaded.slice(0, 3);
    const displayUnderloaded = showAllWorkers ? underloaded : underloaded.slice(0, 3);
    
    return (
      <div className="workload-analysis">
        {/* Overloaded Workers */}
        <div className="workload-section">
          <div className="workload-header">
            <h4>Overloaded Workers</h4>
            <span className="workload-count">{overloaded.length}</span>
          </div>
          <div className="workers-list">
            {displayOverloaded.length > 0 ? (
              displayOverloaded.map((engineer, index) => (
                <div key={engineer.id} className="worker-item overloaded">
                  <div className="worker-info">
                    <span className="worker-name">{engineer.name}</span>
                    <span className="worker-role">{engineer.role}</span>
                  </div>
                  <div className="worker-load">
                    <span className="load-percentage">{engineer.loadPercentage}%</span>
                    <div className="load-bar">
                      <div 
                        className="load-fill overloaded-fill"
                        style={{ width: `${Math.min(engineer.loadPercentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">No overloaded workers</div>
            )}
          </div>
        </div>

        {/* Underloaded Workers */}
        <div className="workload-section">
          <div className="workload-header">
            <h4>Underloaded Workers</h4>
            <span className="workload-count">{underloaded.length}</span>
          </div>
          <div className="workers-list">
            {displayUnderloaded.length > 0 ? (
              displayUnderloaded.map((engineer, index) => (
                <div key={engineer.id} className="worker-item underloaded">
                  <div className="worker-info">
                    <span className="worker-name">{engineer.name}</span>
                    <span className="worker-role">{engineer.role}</span>
                  </div>
                  <div className="worker-load">
                    <span className="load-percentage">{engineer.loadPercentage}%</span>
                    <div className="load-bar">
                      <div 
                        className="load-fill underloaded-fill"
                        style={{ width: `${engineer.loadPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">No underloaded workers</div>
            )}
          </div>
        </div>

        {/* Team Averages */}
        <div className="workload-section">
          <div className="workload-header">
            <h4>Average Load by Team</h4>
          </div>
          <div className="teams-list">
            {teamAverages.map((team, index) => (
              <div key={team.teamId} className="team-item">
                <div className="team-info">
                  <span className="team-name">{team.teamName}</span>
                  <span className="team-members">{team.memberCount} members</span>
                </div>
                <div className="team-load">
                  <span className="load-percentage">{team.averageLoad}%</span>
                  <div className="load-bar">
                    <div 
                      className="load-fill team-fill"
                      style={{ width: `${Math.min(team.averageLoad, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* See More Button */}
        {(overloaded.length > 3 || underloaded.length > 3) && (
          <div className="workload-actions">
            <button 
              className="btn-see-more"
              onClick={() => setShowAllWorkers(!showAllWorkers)}
            >
              {showAllWorkers ? 'Show Less' : 'See More'}
            </button>
          </div>
        )}
      </div>
    );
  };

  // Show loading state
  if (loading) {
    return (
      <div className="overview-dashboard">
        <div className="content-header">
          <h1>Overview Dashboard</h1>
          <p>Key metrics and project insights at a glance</p>
        </div>
        <div className="content-body">
          <div className="loading-message">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="overview-dashboard">
        <div className="content-header">
          <h1>Overview Dashboard</h1>
          <p>Key metrics and project insights at a glance</p>
        </div>
        <div className="content-body">
          <div className="error-message">Error loading dashboard: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="overview-dashboard">
      {/* Header section */}
      <div className="content-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Overview Dashboard</h1>
            <p>Key metrics and project insights at a glance</p>
          </div>
          <div className="header-actions">
            <input
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              style={{ display: 'none' }}
              id="csv-import-input"
            />
            <label htmlFor="csv-import-input" className="btn-secondary">
              {importing ? 'Importing...' : 'Import CSV'}
            </label>
            <button className="btn-secondary" onClick={handleExportReport}>Export Report</button>
            <button className="btn-primary" onClick={handleViewDetails}>View Details</button>
          </div>
        </div>
      </div>

      {/* Import Result Display */}
      {importResult && (
        <div className={`import-result ${importResult.status === 'success' ? 'success' : 'error'}`}>
          <div className="import-result-content">
            <h3>{importResult.status === 'success' ? '✅ Import Successful' : '❌ Import Failed'}</h3>
            <p>{importResult.message}</p>
            {importResult.summary && (
              <div className="import-summary">
                <p><strong>Summary:</strong></p>
                <ul>
                  <li>Teams: {importResult.summary.teams_added} added, {importResult.summary.teams_skipped} skipped</li>
                  <li>Engineers: {importResult.summary.engineers_added} added, {importResult.summary.engineers_skipped} skipped</li>
                  <li>Projects: {importResult.summary.projects_added} added, {importResult.summary.projects_skipped} skipped</li>
                  <li>Assignments: {importResult.summary.assignments_added} added, {importResult.summary.assignments_skipped} skipped</li>
                </ul>
                {importResult.summary.errors && importResult.summary.errors.length > 0 && (
                  <div className="import-errors">
                    <p><strong>Errors:</strong></p>
                    <ul>
                      {importResult.summary.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            <button 
              className="btn-secondary" 
              onClick={() => setImportResult(null)}
              style={{ marginTop: '10px' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="content-body">
        {/* Charts Grid */}
        <div className="charts-grid">
          {/* Gauge Chart */}
          <div className={`chart-card gauge-card ${chartsHighlighted ? 'highlighted' : ''}`}>
            <div className="chart-header">
              <h3>Project Completion</h3>
              <span className="chart-icon">🎯</span>
            </div>
            <div className="chart-content">
              {renderGaugeChart()}
            </div>
          </div>

          {/* Bar Chart */}
          <div className={`chart-card bar-card ${chartsHighlighted ? 'highlighted' : ''}`}>
            <div className="chart-header">
              <h3>Monthly Activity</h3>
              <span className="chart-icon">📊</span>
            </div>
            <div className="chart-content">
              {renderBarChart()}
            </div>
          </div>

          {/* Area Chart */}
          <div className={`chart-card area-card ${chartsHighlighted ? 'highlighted' : ''}`}>
            <div className="chart-header">
              <h3>Budget Trends</h3>
              <span className="chart-icon">💰</span>
            </div>
            <div className="chart-content">
              {renderAreaChart()}
            </div>
          </div>

          {/* Workload Analysis */}
          <div className={`chart-card workload-card ${chartsHighlighted ? 'highlighted' : ''}`}>
            <div className="chart-header">
              <h3>Workload Analysis</h3>
              <span className="chart-icon">⚖️</span>
            </div>
            <div className="chart-content">
              {renderWorkloadAnalysis()}
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
                                  onClick={() => handleRemoveTeamMember(project.id, member)}
                                  title="Remove from project"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                          <button
                            className="btn-assign-engineer"
                            onClick={() => {
                              setSelectedProject(project);
                              setShowAssignModal(true);
                            }}
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
                            <span>${((project.budget_total || 0) - (project.budget_spent || 0)).toLocaleString()}</span>
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

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onProjectCreated={handleCreateProject}
      />

      {/* Assign Engineer Modal */}
      <AssignEngineerModal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedProject(null);
        }}
        projectId={selectedProject?.id}
        projectName={selectedProject?.name}
        onEngineerAssigned={handleAssignEngineer}
      />
    </div>
  );
};

export default OverviewDashboard;
