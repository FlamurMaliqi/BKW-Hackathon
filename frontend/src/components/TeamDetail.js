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

import React from 'react';
import './TeamDetail.css';

const TeamDetail = ({ teamName, onBack }) => {
  // Team data with BKW design system colors
  const teamData = {
    'Frontend Team': {
      name: 'Frontend Team',
      description: 'Responsible for user interface development and user experience',
      members: 3,
      projects: ['E-commerce Platform', 'UI/UX Redesign'],
      performance: 85,
      color: 'var(--bkw-blue)'
    },
    'Backend Team': {
      name: 'Backend Team',
      description: 'Handles server-side logic, APIs, and database management',
      members: 2,
      projects: ['E-commerce Platform', 'API Integration', 'Analytics Dashboard'],
      performance: 78,
      color: 'var(--medium-blue)'
    },
    'DevOps Team': {
      name: 'DevOps Team',
      description: 'Manages infrastructure, deployment, and system operations',
      members: 1,
      projects: ['E-commerce Platform', 'Mobile App', 'Analytics Dashboard'],
      performance: 92,
      color: 'var(--info)'
    },
    'Design Team': {
      name: 'Design Team',
      description: 'Creates user interfaces, graphics, and design systems',
      members: 1,
      projects: ['Mobile App', 'UI/UX Redesign'],
      performance: 88,
      color: 'var(--warning)'
    },
    'QA Team': {
      name: 'QA Team',
      description: 'Ensures software quality through testing and validation',
      members: 1,
      projects: ['E-commerce Platform', 'Mobile App'],
      performance: 90,
      color: 'var(--success)'
    }
  };

  const team = teamData[teamName] || teamData['Frontend Team'];

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
          <h1 style={{ color: team.color }}>{team.name}</h1>
          <p>{team.description}</p>
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
              <div className="card-value">{team.members}</div>
            </div>
          </div>

          <div className="overview-card">
            <div className="card-icon">📊</div>
            <div className="card-content">
              <h3>Performance</h3>
              <div className="card-value">{team.performance}%</div>
            </div>
          </div>

          <div className="overview-card">
            <div className="card-icon">📋</div>
            <div className="card-content">
              <h3>Active Projects</h3>
              <div className="card-value">{team.projects.length}</div>
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
            <span className="section-count">{team.projects.length} projects</span>
          </div>
          <div className="projects-list">
            {team.projects.map((project, index) => (
              <div key={index} className="project-item">
                <div className="project-info">
                  <h4>{project}</h4>
                  <p>Active project assigned to this team</p>
                </div>
                <div className="project-status">
                  <span className="status-badge active">Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Members Section */}
        <div className="team-members">
          <div className="section-header">
            <h2>Team Members</h2>
            <span className="section-count">{team.members} members</span>
          </div>
          <div className="members-grid">
            <div className="member-card">
              <div className="member-avatar">👨‍💻</div>
              <div className="member-info">
                <h4>Team Lead</h4>
                <p>Senior Developer</p>
                <div className="member-skills">
                  <span className="skill-tag">Leadership</span>
                  <span className="skill-tag">Technical</span>
                </div>
              </div>
            </div>
            <div className="member-card">
              <div className="member-avatar">👩‍💻</div>
              <div className="member-info">
                <h4>Senior Developer</h4>
                <p>Full Stack Developer</p>
                <div className="member-skills">
                  <span className="skill-tag">Frontend</span>
                  <span className="skill-tag">Backend</span>
                </div>
              </div>
            </div>
            <div className="member-card">
              <div className="member-avatar">👨‍🎨</div>
              <div className="member-info">
                <h4>Junior Developer</h4>
                <p>Frontend Developer</p>
                <div className="member-skills">
                  <span className="skill-tag">React</span>
                  <span className="skill-tag">CSS</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Performance Section */}
        <div className="team-performance">
          <div className="section-header">
            <h2>Team Performance</h2>
            <span className="section-count">Overall: {team.performance}%</span>
          </div>
          <div className="performance-metrics">
            <div className="metric-item">
              <div className="metric-label">Code Quality</div>
              <div className="metric-bar">
                <div className="metric-fill" style={{ width: '92%' }}></div>
              </div>
              <div className="metric-value">92%</div>
            </div>
            <div className="metric-item">
              <div className="metric-label">Delivery Speed</div>
              <div className="metric-bar">
                <div className="metric-fill" style={{ width: '78%' }}></div>
              </div>
              <div className="metric-value">78%</div>
            </div>
            <div className="metric-item">
              <div className="metric-label">Collaboration</div>
              <div className="metric-bar">
                <div className="metric-fill" style={{ width: '85%' }}></div>
              </div>
              <div className="metric-value">85%</div>
            </div>
            <div className="metric-item">
              <div className="metric-label">Innovation</div>
              <div className="metric-bar">
                <div className="metric-fill" style={{ width: '88%' }}></div>
              </div>
              <div className="metric-value">88%</div>
            </div>
          </div>
        </div>

        {/* Future Features Section */}
        <div className="future-features">
          <div className="section-header">
            <h2>Coming Soon</h2>
            <span className="section-count">Advanced Features</span>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🤝</div>
              <h4>Team Collaboration</h4>
              <p>Enhanced communication and collaboration tools</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h4>Performance Analytics</h4>
              <p>Advanced metrics and insights dashboard</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎓</div>
              <h4>Skill Development</h4>
              <p>Personalized learning and growth planning</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h4>Communication Hub</h4>
              <p>Integrated team messaging and updates</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDetail;
