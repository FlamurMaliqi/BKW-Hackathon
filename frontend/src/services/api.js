/**
 * API Service Layer
 *
 * This module provides functions to interact with the BKW backend API.
 * All API calls are centralized here for easy maintenance and error handling.
 */

// Use environment variable or default to backend service for Docker
// Frontend in browser needs to reach backend via the host machine's port
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

/**
 * Generic fetch wrapper with error handling
 */
const apiFetch = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Get all projects with assignment summaries
 * @returns {Promise<{projects: Array, status: string}>}
 */
export const getProjects = async () => {
  return apiFetch('/api/projects');
};

/**
 * Get all engineers with presence data
 * @param {number} presenceDays - Number of days of presence data to include (default: 7)
 * @returns {Promise<{engineers: Array, status: string}>}
 */
export const getEngineers = async (presenceDays = 7) => {
  return apiFetch(`/api/engineers?presenceDays=${presenceDays}`);
};

/**
 * Get all teams with member details and projects
 * @param {number} presenceDays - Number of days of presence data to include (default: 7)
 * @returns {Promise<{teams: Array, status: string}>}
 */
export const getTeams = async (presenceDays = 7) => {
  return apiFetch(`/api/teams?presenceDays=${presenceDays}`);
};

/**
 * Get conflict detection results
 * @param {number} daysAhead - Number of days ahead to check for conflicts (default: 28)
 * @returns {Promise<{conflicts: Object, status: string}>}
 */
export const getConflicts = async (daysAhead = 28) => {
  return apiFetch(`/api/conflicts?daysAhead=${daysAhead}`);
};

/**
 * Send a query to the AI assistant
 * @param {string} query - The user's question or command
 * @returns {Promise<{response: string, generated_at: string, status: string}>}
 */
export const sendAIChat = async (query) => {
  return apiFetch('/api/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ query }),
  });
};

/**
 * Create a new project
 * @param {Object} projectData - Project information
 * @param {string} projectData.name - Project name
 * @param {string} projectData.description - Project description
 * @param {string} projectData.start_date - Project start date (YYYY-MM-DD, optional)
 * @param {string} projectData.deadline - Project deadline (YYYY-MM-DD)
 * @param {string} projectData.priority - Project priority (high, medium, low)
 * @param {number} projectData.budget_total - Total budget
 * @returns {Promise<{project: Object, status: string}>}
 */
export const createProject = async (projectData) => {
  return apiFetch('/api/projects', {
    method: 'POST',
    body: JSON.stringify(projectData),
  });
};

/**
 * Assign an engineer to a project
 * @param {number} projectId - Project ID
 * @param {Object} assignmentData - Assignment information
 * @param {number} assignmentData.engineer_id - Engineer ID
 * @param {number} assignmentData.hours_per_week - Hours per week
 * @param {string} assignmentData.start_date - Start date (YYYY-MM-DD, optional)
 * @param {string} assignmentData.end_date - End date (YYYY-MM-DD, optional)
 * @returns {Promise<{assignment: Object, status: string}>}
 */
export const assignEngineerToProject = async (projectId, assignmentData) => {
  return apiFetch(`/api/projects/${projectId}/assign`, {
    method: 'POST',
    body: JSON.stringify(assignmentData),
  });
};

/**
 * Remove an engineer from a project
 * @param {number} projectId - Project ID
 * @param {number} engineerId - Engineer ID
 * @returns {Promise<{status: string}>}
 */
export const unassignEngineerFromProject = async (projectId, engineerId) => {
  return apiFetch(`/api/projects/${projectId}/assign/${engineerId}`, {
    method: 'DELETE',
  });
};

/**
 * Get engineers available for assignment to a project
 * @param {number} projectId - Project ID
 * @returns {Promise<{engineers: Array, status: string}>}
 */
export const getAvailableEngineers = async (projectId) => {
  return apiFetch(`/api/projects/${projectId}/available-engineers`);
};

/**
 * Create a new engineer/team member
 * @param {Object} engineerData - Engineer information
 * @param {string} engineerData.name - Engineer name
 * @param {string} engineerData.email - Engineer email
 * @param {string} engineerData.role - Engineer role
 * @param {number} engineerData.team_id - Team ID
 * @param {string} engineerData.phone - Phone number (optional)
 * @param {number} engineerData.capacity_hours_per_week - Hours per week (default: 40)
 * @param {string} engineerData.status - Status (default: 'active')
 * @param {string} engineerData.availability - Availability (default: 'available')
 * @param {Array<string>} engineerData.skills - Skills array (optional)
 * @returns {Promise<{engineer: Object, status: string}>}
 */
export const createEngineer = async (engineerData) => {
  return apiFetch('/api/engineers', {
    method: 'POST',
    body: JSON.stringify(engineerData),
  });
};

/**
 * Switch an engineer to a different team
 * @param {number} engineerId - Engineer ID
 * @param {number} teamId - New team ID
 * @returns {Promise<{engineer: Object, status: string}>}
 */
export const switchEngineerTeam = async (engineerId, teamId) => {
  return apiFetch(`/api/engineers/${engineerId}/team`, {
    method: 'PUT',
    body: JSON.stringify({ team_id: teamId }),
  });
};

/**
 * Get workload analysis and overwork periods for an engineer
 * @param {number} engineerId - Engineer ID
 * @param {number} daysAhead - Number of days ahead to analyze (default: 90)
 * @returns {Promise<{engineer_id: number, overwork_periods: Array, total_overwork_days: number, is_at_risk: boolean, status: string}>}
 */
export const getEngineerWorkload = async (engineerId, daysAhead = 90) => {
  return apiFetch(`/api/workload/engineer/${engineerId}?days_ahead=${daysAhead}`);
};

/**
 * Get detailed daily workload timeline for an engineer
 * @param {number} engineerId - Engineer ID
 * @param {number} daysAhead - Number of days ahead to analyze (default: 90)
 * @returns {Promise<{engineer_id: number, timeline: Array, status: string}>}
 */
export const getEngineerTimeline = async (engineerId, daysAhead = 90) => {
  return apiFetch(`/api/workload/engineer/${engineerId}/timeline?days_ahead=${daysAhead}`);
};

/**
 * Get workload forecast for a team
 * @param {number} teamId - Team ID
 * @param {number} daysAhead - Number of days ahead to analyze (default: 90)
 * @returns {Promise<{forecast: Object, status: string}>}
 */
export const getTeamWorkload = async (teamId, daysAhead = 90) => {
  return apiFetch(`/api/workload/team/${teamId}?days_ahead=${daysAhead}`);
};

/**
 * Get all workload conflicts across the company
 * @param {number} daysAhead - Number of days ahead to analyze (default: 90)
 * @returns {Promise<{conflicts: Array, total_engineers_at_risk: number, status: string}>}
 */
export const getWorkloadConflicts = async (daysAhead = 90) => {
  return apiFetch(`/api/workload/conflicts?days_ahead=${daysAhead}`);
};

/**
 * Get company-wide workload forecast
 * @param {number} daysAhead - Number of days ahead to analyze (default: 90)
 * @returns {Promise<{forecast: Object, status: string}>}
 */
export const getCompanyForecast = async (daysAhead = 90) => {
  return apiFetch(`/api/workload/forecast?days_ahead=${daysAhead}`);
};

/**
 * Import Abacus data with duplicate prevention
 * @param {File} file - Abacus file to import
 * @returns {Promise<{summary: Object, message: string, status: string}>}
 */
export const importAbacusData = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/import/csv`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Import failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error importing Abacus:', error);
    throw error;
  }
};

// Export all API functions as a default object for convenience
export default {
  getProjects,
  getEngineers,
  getTeams,
  getConflicts,
  sendAIChat,
  createProject,
  assignEngineerToProject,
  unassignEngineerFromProject,
  getAvailableEngineers,
  createEngineer,
  switchEngineerTeam,
  getEngineerWorkload,
  getEngineerTimeline,
  getTeamWorkload,
  getWorkloadConflicts,
  getCompanyForecast,
  importAbacusData,
};
