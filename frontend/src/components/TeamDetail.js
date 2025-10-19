/**
 * Team Detail Component
 * 
 * This component displays detailed information about a specific team.
 * It shows team members, projects, performance metrics, and team statistics.
 * Follows the modern BKW Engineering design language and patterns.
 * 
 * Features:
 * - Team member profiles and roles
 * - Team performance metrics
 * - Project assignments and progress
 * - Team collaboration tools
 * - Skills matrix and development planning
 */

import React, { useState, useEffect } from 'react';
import './TeamDetail.css';
import { getTeams } from '../services/api';

const TeamDetail = ({ teamName, onBack }) => {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch team data from backend
  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        const response = await getTeams(7);
        
        if (response.status === 'success' && response.teams) {
          // Find the team by name
          const foundTeam = response.teams.find(t => t.name === teamName);
          if (foundTeam) {
            setTeam(foundTeam);
          } else {
            setError(`Team "${teamName}" not found`);
          }
        } else {
          setError('Failed to fetch team data');
        }
      } catch (err) {
        console.error('Error fetching team data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [teamName]);

  if (loading) {
    return (
      <div className="team-detail">
        <div className="content-header">
          <div className="header-actions">
            <button className="btn-back" onClick={onBack}>
              ← Back to Human Management
            </button>
          </div>
          <div className="team-title">
            <h1>Loading...</h1>
          </div>
        </div>
        <div className="content-body">
          <div className="loading-spinner">Loading team data...</div>
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="team-detail">
        <div className="content-header">
          <div className="header-actions">
            <button className="btn-back" onClick={onBack}>
              ← Back to Human Management
            </button>
          </div>
          <div className="team-title">
            <h1>Error</h1>
          </div>
        </div>
        <div className="content-body">
          <div className="error-message">
            {error || 'Team not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="team-detail">
      {/* Header section with back button and team title */}
      <div className="content-header">
        <div className="header-actions">
          <button className="btn-back" onClick={onBack}>
            ← Back to Human Management
          </button>
        </div>
        <div className="team-title">
          <h1 style={{ color: team.color || 'var(--bkw-blue)' }}>{team.name}</h1>
          <p>{team.description || 'Team description not available'}</p>
        </div>
      </div>

      {/* Main content area */}
      <div className="content-body">
        {/* Team Overview Cards */}
        <div className="overview-cards">
          <div className="overview-card">
            <div className="card-icon">👥</div>
            <div className="card-content">
              <h3>Team Members</h3>
              <div className="card-value">{team.member_count || 0}</div>
            </div>
          </div>

          <div className="overview-card">
            <div className="card-icon">📊</div>
            <div className="card-content">
              <h3>Performance</h3>
              <div className="card-value">{team.performance_score || 0}%</div>
            </div>
          </div>

          <div className="overview-card">
            <div className="card-icon">📋</div>
            <div className="card-content">
              <h3>Active Projects</h3>
              <div className="card-value">{team.projects?.length || 0}</div>
            </div>
          </div>

          <div className="overview-card">
            <div className="card-icon">🎯</div>
            <div className="card-content">
              <h3>Goals Met</h3>
              <div className="card-value">85%</div>
            </div>
          </div>
        </div>

        {/* Team Projects Section */}
        <div className="team-projects">
          <div className="section-header">
            <h2>Team Projects</h2>
            <span className="section-count">{team.projects?.length || 0} projects</span>
          </div>
          <div className="projects-list">
            {team.projects && team.projects.length > 0 ? (
              team.projects.map((project, index) => (
                <div key={index} className="project-item">
                  <div className="project-info">
                    <h4>{project}</h4>
                    <p>Project assigned to this team</p>
                  </div>
                  <div className="project-status">
                    <span className="status-badge active">Active</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-projects">
                <p>No projects assigned to this team</p>
              </div>
            )}
          </div>
        </div>

        {/* Team Members Section */}
        <div className="team-members">
          <div className="section-header">
            <h2>Team Members</h2>
            <span className="section-count">{team.member_count || 0} members</span>
          </div>
          <div className="members-grid">
            {team.members && team.members.length > 0 ? (
              team.members.map((member, index) => (
                <div key={member.id || index} className="member-card">
                  <div className="member-avatar">
                    {member.availability === 'holiday' ? '🏖️' : 
                     member.availability === 'sick' ? '🤒' :
                     member.availability === 'remote' ? '🏠' : '👨‍💻'}
                  </div>
                  <div className="member-info">
                    <h4>{member.name}</h4>
                    <p>{member.role}</p>
                    <div className="member-status">
                      <span className={`status-badge ${member.availability}`}>
                        {member.availability}
                      </span>
                      {member.is_overworked && (
                        <span className="status-badge overworked">Overworked</span>
                      )}
                    </div>
                    <div className="member-skills">
                      {member.skills && member.skills.slice(0, 3).map((skill, skillIndex) => (
                        <span key={skillIndex} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                    <div className="member-metrics">
                      <div className="metric">
                        <span className="metric-label">Workload:</span>
                        <div className="workload-bar">
                          <div 
                            className="workload-fill"
                            style={{ 
                              width: `${member.workload_percent || 0}%`,
                              background: member.is_overworked ? 'linear-gradient(90deg, #dc3545, #fd7e14)' : 'linear-gradient(90deg, #28a745, #20c997)'
                            }}
                          ></div>
                        </div>
                        <span className="metric-value">{member.workload_percent || 0}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-members">
                <p>No members in this team</p>
              </div>
            )}
          </div>
        </div>

        {/* Team Performance Section */}
        <div className="team-performance">
          <div className="section-header">
            <h2>Team Performance</h2>
            <span className="section-count">Overall: {team.performance_score || 0}%</span>
          </div>
          <div className="performance-metrics">
            <div className="metric-item">
              <div className="metric-label">Team Performance</div>
              <div className="metric-value">
                <div className="progress-bar-small">
                  <div
                    className="progress-fill-small"
                    style={{ width: `${team.performance_score || 0}%` }}
                  ></div>
                </div>
                <span className="progress-text-small">{team.performance_score || 0}%</span>
              </div>
            </div>
            <div className="metric-item">
              <div className="metric-label">Member Utilization</div>
              <div className="metric-value">
                <div className="progress-bar-small">
                  <div
                    className="progress-fill-small"
                    style={{ 
                      width: `${team.members ? Math.round(team.members.reduce((sum, member) => sum + (member.workload_percent || 0), 0) / team.members.length) : 0}%` 
                    }}
                  ></div>
                </div>
                <span className="progress-text-small">
                  {team.members ? Math.round(team.members.reduce((sum, member) => sum + (member.workload_percent || 0), 0) / team.members.length) : 0}%
                </span>
              </div>
            </div>
            <div className="metric-item">
              <div className="metric-label">Project Coverage</div>
              <div className="metric-value">
                <div className="budget-bar-small">
                  <div 
                    className="budget-used-small"
                    style={{ 
                      width: `${team.projects && team.projects.length > 0 ? Math.min(100, (team.projects.length * 25)) : 0}%` 
                    }}
                  ></div>
                </div>
                <span className="budget-text-small">{team.projects?.length || 0} projects</span>
              </div>
            </div>
            <div className="metric-item">
              <div className="metric-label">Overwork Risk</div>
              <div className="metric-value">
                <div className="budget-bar-small">
                  <div 
                    className="budget-used-small"
                    style={{ 
                      width: `${team.members ? Math.round((team.members.filter(member => member.is_overworked).length / team.members.length) * 100) : 0}%`,
                      background: team.members && team.members.filter(member => member.is_overworked).length > 0 ? 'linear-gradient(90deg, #dc3545, #fd7e14)' : 'linear-gradient(90deg, #28a745, #20c997)'
                    }}
                  ></div>
                </div>
                <span className="budget-text-small">
                  {team.members ? team.members.filter(member => member.is_overworked).length : 0} overworked
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TeamDetail;
