/**
 * Human Management Component
 * 
 * This component displays the human resource management dashboard.
 * It focuses on team management, workload distribution, collaboration,
 * and skills development. This is the second tab in the main navigation.
 * 
 * Features:
 * - Team member management and profiles
 * - Workload balancing and capacity planning
 * - Collaboration tools and communication
 * - Skills assessment and development planning
 * - Search and filtering capabilities
 * - Activity tracking and absence management
 */

import React, { useState, useMemo, useEffect } from 'react';
import TeamDetail from './TeamDetail';
import AddMemberModal from './AddMemberModal';
import SwitchMemberModal from './SwitchMemberModal';
import './HumanManagement.css';
import { getEngineers, getTeams, createEngineer } from '../services/api';

const HumanManagement = () => {
  // State for search and filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [groupBy, setGroupBy] = useState('team'); // 'team' or 'project'
  const [filterTeam, setFilterTeam] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [filterAvailability, setFilterAvailability] = useState('all');
  const [expandedTeams, setExpandedTeams] = useState(new Set());
  const [expandedProjects, setExpandedProjects] = useState(new Set());
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [engineers, setEngineers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showSwitchMemberModal, setShowSwitchMemberModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // Fetch engineers and teams from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [engineersResponse, teamsResponse] = await Promise.all([
          getEngineers(7),
          getTeams(7)
        ]);

        if (engineersResponse.status === 'success' && engineersResponse.engineers) {
          setEngineers(engineersResponse.engineers);
        }
        if (teamsResponse.status === 'success' && teamsResponse.teams) {
          setTeams(teamsResponse.teams);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Dummy data for teams (fallback - removed)
  const fallbackTeams = [
    { id: 1, name: 'Frontend Team', color: '#007bff' },
    { id: 2, name: 'Backend Team', color: '#28a745' },
    { id: 3, name: 'DevOps Team', color: '#ffc107' },
    { id: 4, name: 'Design Team', color: '#dc3545' },
    { id: 5, name: 'QA Team', color: '#6f42c1' }
  ];

  // Extract unique projects from engineers
  const projects = useMemo(() => {
    const projectSet = new Set();
    engineers.forEach(engineer => {
      (engineer.project_names || []).forEach(project => projectSet.add(project));
    });
    return Array.from(projectSet).map((name, index) => ({
      id: index + 1,
      name: name,
      status: 'active'
    }));
  }, [engineers]);

  // Map backend engineers to workers format
  const workers = useMemo(() => {
    return engineers.map(engineer => ({
      id: engineer.id,
      name: engineer.name,
      role: engineer.role,
      team: engineer.team_name || 'No Team',
      teamId: engineer.team_id,
      projects: engineer.project_names || [],
      status: engineer.status || 'active',
      availability: engineer.availability || 'available',
      workload: engineer.workload_percent || 0,
      isOverworked: engineer.is_overworked || false,
      absence: engineer.current_absence || null,
      activity: (engineer.presence || []).slice(-7).map(p => p.status === 'in_office' ? Math.floor(Math.random() * 5) + 1 : 0),
      skills: engineer.skills || [],
      email: engineer.email || '',
      phone: engineer.phone || ''
    }));
  }, [engineers]);

  // Fallback dummy data for workers (removed)
  const fallbackWorkers = [
    {
      id: 1,
      name: 'Alice Johnson',
      role: 'Senior Frontend Developer',
      team: 'Frontend Team',
      teamId: 1,
      projects: ['E-commerce Platform', 'UI/UX Redesign'],
      status: 'active',
      availability: 'available',
      workload: 85, // percentage
      isOverworked: true,
      absence: null,
      activity: [1, 3, 2, 4, 1, 0, 2], // Last 7 days activity (commits/contributions)
      skills: ['React', 'TypeScript', 'CSS', 'Node.js'],
      email: 'alice.johnson@company.com',
      phone: '+1-555-0123'
    },
    {
      id: 2,
      name: 'Bob Smith',
      role: 'Backend Developer',
      team: 'Backend Team',
      teamId: 2,
      projects: ['E-commerce Platform', 'API Integration'],
      status: 'active',
      availability: 'available',
      workload: 70,
      isOverworked: false,
      absence: null,
      activity: [2, 4, 3, 1, 3, 2, 1],
      skills: ['Python', 'Django', 'PostgreSQL', 'Docker'],
      email: 'bob.smith@company.com',
      phone: '+1-555-0124'
    },
    {
      id: 3,
      name: 'Carol Davis',
      role: 'DevOps Engineer',
      team: 'DevOps Team',
      teamId: 3,
      projects: ['E-commerce Platform', 'Mobile App', 'Analytics Dashboard'],
      status: 'active',
      availability: 'busy',
      workload: 95,
      isOverworked: true,
      absence: null,
      activity: [3, 5, 4, 2, 4, 3, 2],
      skills: ['AWS', 'Kubernetes', 'Terraform', 'Jenkins'],
      email: 'carol.davis@company.com',
      phone: '+1-555-0125'
    },
    {
      id: 4,
      name: 'David Wilson',
      role: 'UI/UX Designer',
      team: 'Design Team',
      teamId: 4,
      projects: ['Mobile App', 'UI/UX Redesign'],
      status: 'active',
      availability: 'available',
      workload: 60,
      isOverworked: false,
      absence: null,
      activity: [1, 2, 0, 3, 2, 1, 0],
      skills: ['Figma', 'Sketch', 'Adobe XD', 'Prototyping'],
      email: 'david.wilson@company.com',
      phone: '+1-555-0126'
    },
    {
      id: 5,
      name: 'Eva Brown',
      role: 'QA Engineer',
      team: 'QA Team',
      teamId: 5,
      projects: ['E-commerce Platform', 'Mobile App'],
      status: 'active',
      availability: 'available',
      workload: 75,
      isOverworked: false,
      absence: null,
      activity: [2, 3, 1, 2, 3, 2, 1],
      skills: ['Selenium', 'Jest', 'Cypress', 'Manual Testing'],
      email: 'eva.brown@company.com',
      phone: '+1-555-0127'
    },
    {
      id: 6,
      name: 'Frank Miller',
      role: 'Full Stack Developer',
      team: 'Frontend Team',
      teamId: 1,
      projects: ['Analytics Dashboard', 'API Integration'],
      status: 'active',
      availability: 'holiday',
      workload: 0,
      isOverworked: false,
      absence: { type: 'holiday', startDate: '2024-01-15', endDate: '2024-01-22' },
      activity: [0, 0, 0, 0, 0, 0, 0],
      skills: ['React', 'Node.js', 'MongoDB', 'Express'],
      email: 'frank.miller@company.com',
      phone: '+1-555-0128'
    },
    {
      id: 7,
      name: 'Grace Lee',
      role: 'Senior Backend Developer',
      team: 'Backend Team',
      teamId: 2,
      projects: ['E-commerce Platform', 'Analytics Dashboard', 'API Integration'],
      status: 'active',
      availability: 'sick',
      workload: 0,
      isOverworked: false,
      absence: { type: 'sick', startDate: '2024-01-18', endDate: '2024-01-20' },
      activity: [0, 0, 0, 0, 0, 0, 0],
      skills: ['Java', 'Spring Boot', 'Microservices', 'Redis'],
      email: 'grace.lee@company.com',
      phone: '+1-555-0129'
    },
    {
      id: 8,
      name: 'Henry Taylor',
      role: 'Frontend Developer',
      team: 'Frontend Team',
      teamId: 1,
      projects: ['Mobile App'],
      status: 'active',
      availability: 'available',
      workload: 45,
      isOverworked: false,
      absence: null,
      activity: [1, 2, 1, 0, 2, 1, 1],
      skills: ['Vue.js', 'JavaScript', 'CSS', 'Webpack'],
      email: 'henry.taylor@company.com',
      phone: '+1-555-0130'
    }
  ];

  // Filter workers based on search and filters
  const filteredWorkers = useMemo(() => {
    return workers.filter(worker => {
      const matchesSearch = worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           worker.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           worker.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesTeam = filterTeam === 'all' || worker.team === filterTeam;
      const matchesProject = filterProject === 'all' || worker.projects.includes(filterProject);
      const matchesAvailability = filterAvailability === 'all' || worker.availability === filterAvailability;

      return matchesSearch && matchesTeam && matchesProject && matchesAvailability;
    });
  }, [workers, searchTerm, filterTeam, filterProject, filterAvailability]);

  // Group workers by team or project
  const groupedWorkers = useMemo(() => {
    if (groupBy === 'team') {
      const grouped = {};
      teams.forEach(team => {
        grouped[team.name] = filteredWorkers.filter(worker => worker.team === team.name);
      });
      return grouped;
    } else {
      const grouped = {};
      projects.forEach(project => {
        grouped[project.name] = filteredWorkers.filter(worker => worker.projects.includes(project.name));
      });
      return grouped;
    }
  }, [teams, projects, filteredWorkers, groupBy]);

  // Toggle team/project expansion
  const toggleExpansion = (name) => {
    if (groupBy === 'team') {
      const newExpanded = new Set(expandedTeams);
      if (newExpanded.has(name)) {
        newExpanded.delete(name);
      } else {
        newExpanded.add(name);
      }
      setExpandedTeams(newExpanded);
    } else {
      const newExpanded = new Set(expandedProjects);
      if (newExpanded.has(name)) {
        newExpanded.delete(name);
      } else {
        newExpanded.add(name);
      }
      setExpandedProjects(newExpanded);
    }
  };

  // Navigate to team details
  const goToTeamDetails = (teamName) => {
    setSelectedTeam(teamName);
  };

  // Navigate back to main view
  const goBackToMain = () => {
    setSelectedTeam(null);
  };

  // Handle adding a new member
  const handleAddMember = async (memberData) => {
    try {
      const response = await createEngineer(memberData);
      if (response.status === 'success') {
        // Refresh the engineers list
        const engineersResponse = await getEngineers(7);
        if (engineersResponse.status === 'success' && engineersResponse.engineers) {
          setEngineers(engineersResponse.engineers);
        }
        setShowAddMemberModal(false);
      }
    } catch (err) {
      throw new Error(err.message || 'Failed to add member');
    }
  };

  // Handle switching a member to a different team
  const handleSwitchMember = (member) => {
    setSelectedMember(member);
    setShowSwitchMemberModal(true);
  };

  // Handle member switched successfully
  const handleMemberSwitched = async (updatedEngineer) => {
    // Refresh the engineers list
    try {
      const engineersResponse = await getEngineers(7);
      if (engineersResponse.status === 'success' && engineersResponse.engineers) {
        setEngineers(engineersResponse.engineers);
      }
    } catch (err) {
      console.error('Error refreshing engineers after team switch:', err);
    }
  };

  // Get activity level color
  const getActivityColor = (level) => {
    if (level === 0) return '#ebedf0';
    if (level <= 2) return '#c6e48b';
    if (level <= 4) return '#7bc96f';
    return '#239a3b';
  };

  // Get availability status color
  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'available': return '#28a745';
      case 'busy': return '#ffc107';
      case 'holiday': return '#17a2b8';
      case 'sick': return '#dc3545';
      default: return '#6c757d';
    }
  };

  // Get workload status color
  const getWorkloadColor = (workload) => {
    if (workload >= 90) return '#dc3545';
    if (workload >= 75) return '#ffc107';
    return '#28a745';
  };

  // Show loading state
  if (loading) {
    return (
      <div className="human-management">
        <div className="content-header">
          <h1>Human Management</h1>
          <p>Manage team members, workload distribution, and collaboration</p>
        </div>
        <div className="content-body">
          <div className="loading-message">Loading engineers and teams...</div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="human-management">
        <div className="content-header">
          <h1>Human Management</h1>
          <p>Manage team members, workload distribution, and collaboration</p>
        </div>
        <div className="content-body">
          <div className="error-message">Error loading data: {error}</div>
        </div>
      </div>
    );
  }

  // If a team is selected, show team detail view
  if (selectedTeam) {
    return <TeamDetail teamName={selectedTeam} onBack={goBackToMain} />;
  }

  return (
    <div className="human-management">
      {/* Header section with page title */}
      <div className="content-header">
        <h1>Human Management</h1>
        <p>Manage team members, workload distribution, and collaboration</p>
      </div>

      {/* Main content area */}
      <div className="content-body">
        {/* Search and Filter Controls */}
        <div className="controls-section">
          <div className="search-controls">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by name, role, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>
          </div>

          <div className="filter-controls">
            <div className="filter-group">
              <label>Group by:</label>
              <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)} className="filter-select">
                <option value="team">Team</option>
                <option value="project">Project</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Team:</label>
              <select value={filterTeam} onChange={(e) => setFilterTeam(e.target.value)} className="filter-select">
                <option value="all">All Teams</option>
                {teams.map(team => (
                  <option key={team.id} value={team.name}>{team.name}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Project:</label>
              <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)} className="filter-select">
                <option value="all">All Projects</option>
                {projects.map(project => (
                  <option key={project.id} value={project.name}>{project.name}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Availability:</label>
              <select value={filterAvailability} onChange={(e) => setFilterAvailability(e.target.value)} className="filter-select">
                <option value="all">All</option>
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="holiday">Holiday</option>
                <option value="sick">Sick</option>
              </select>
            </div>
          </div>
        </div>

        {/* Workers List */}
        <div className="workers-section">
          <div className="workers-header">
            <h2>{groupBy === 'team' ? 'Teams' : 'Projects'} Overview</h2>
            <div className="workers-actions">
              <button className="btn-secondary">Export</button>
              <button 
                className="btn-primary" 
                onClick={() => setShowAddMemberModal(true)}
              >
                Add Member
              </button>
            </div>
          </div>

          {/* Debug info */}
          {workers.length === 0 && (
            <div style={{padding: '20px', background: '#f0f0f0', margin: '10px 0'}}>
              <p>No workers found. Engineers: {engineers.length}, Teams: {teams.length}</p>
            </div>
          )}
          {workers.length > 0 && Object.keys(groupedWorkers).length === 0 && (
            <div style={{padding: '20px', background: '#fff3cd', margin: '10px 0'}}>
              <p>Workers loaded ({workers.length}) but no groups found. Check team/project names.</p>
            </div>
          )}

          <div className="workers-list">
            {Object.entries(groupedWorkers).map(([groupName, groupWorkers]) => {
              // Show all groups in debug
              console.log(`Group: ${groupName}, Workers: ${groupWorkers.length}`);
              if (groupWorkers.length === 0) return null;
              
              const isExpanded = groupBy === 'team' ? expandedTeams.has(groupName) : expandedProjects.has(groupName);
              const team = teams.find(t => t.name === groupName);
              const project = projects.find(p => p.name === groupName);
              const groupColor = team?.color || '#6c757d';

              return (
                <div key={groupName} className="group-section">
                  <div 
                    className="group-header"
                    onClick={() => toggleExpansion(groupName)}
                    style={{ borderLeftColor: groupColor }}
                  >
                    <div className="group-info">
                      <h3>{groupName}</h3>
                      <span className="group-count">{groupWorkers.length} member{groupWorkers.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="group-actions">
                      <button 
                        className="btn-details"
                        onClick={(e) => {
                          e.stopPropagation();
                          goToTeamDetails(groupName);
                        }}
                      >
                        View Details
                      </button>
                      <span className="expand-icon">
                        {isExpanded ? '▼' : '▶'}
                      </span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="group-content">
                      {groupWorkers.map(worker => (
                        <div key={worker.id} className={`worker-card ${worker.isOverworked ? 'overworked' : ''}`}>
                          <div className="worker-header">
                            <div className="worker-info">
                              <h4>{worker.name}</h4>
                              <p className="worker-role">{worker.role}</p>
                            </div>
                            <div className="worker-status">
                              <span 
                                className="availability-badge"
                                style={{ backgroundColor: getAvailabilityColor(worker.availability) }}
                              >
                                {worker.availability}
                              </span>
                              {worker.isOverworked && (
                                <span className="overworked-badge">⚠️ Overworked</span>
                              )}
                              {worker.absence && (
                                <span className="absence-badge">
                                  {worker.absence.type === 'holiday' ? '🏖️ Holiday' : '🤒 Sick'}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="worker-details">
                            <div className="worker-projects">
                              <h5>Projects:</h5>
                              <div className="project-tags">
                                {worker.projects.map(project => (
                                  <span key={project} className="project-tag">{project}</span>
                                ))}
                              </div>
                            </div>

                            <div className="worker-activity">
                              <h5>Last 7 Days Activity:</h5>
                              <div className="activity-grid">
                                {worker.activity.map((level, index) => (
                                  <div
                                    key={index}
                                    className="activity-day"
                                    style={{ backgroundColor: getActivityColor(level) }}
                                    title={`Day ${index + 1}: ${level} contributions`}
                                  />
                                ))}
                              </div>
                            </div>

                            <div className="worker-metrics">
                              <div className="metric">
                                <span className="metric-label">Workload:</span>
                                <div className="workload-bar">
                                  <div 
                                    className="workload-fill"
                                    style={{ 
                                      width: `${worker.workload}%`,
                                      backgroundColor: getWorkloadColor(worker.workload)
                                    }}
                                  />
                                </div>
                                <span className="metric-value">{worker.workload}%</span>
                              </div>
                            </div>

                            <div className="worker-skills">
                              <h5>Skills:</h5>
                              <div className="skill-tags">
                                {worker.skills.map(skill => (
                                  <span key={skill} className="skill-tag">{skill}</span>
                                ))}
                              </div>
                            </div>

                            <div className="worker-contact">
                              <p>📧 {worker.email}</p>
                              <p>📞 {worker.phone}</p>
                            </div>

                            <div className="worker-actions">
                              <button
                                className="btn-switch-member"
                                onClick={() => handleSwitchMember(worker)}
                                title="Switch to another team"
                              >
                                🔄 Switch Member
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        onMemberAdded={handleAddMember}
      />

      {/* Switch Member Modal */}
      <SwitchMemberModal
        isOpen={showSwitchMemberModal}
        onClose={() => setShowSwitchMemberModal(false)}
        member={selectedMember}
        onMemberSwitched={handleMemberSwitched}
      />
    </div>
  );
};

export default HumanManagement;
