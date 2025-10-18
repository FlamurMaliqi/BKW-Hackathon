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
};
