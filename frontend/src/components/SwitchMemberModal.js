/**
 * Switch Member Modal Component
 *
 * Modal dialog for switching a team member to a different team
 */

import React, { useState, useEffect } from 'react';
import { getTeams, switchEngineerTeam } from '../services/api';
import './Modal.css';

const SwitchMemberModal = ({ isOpen, onClose, member, onMemberSwitched }) => {
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(false);

  // Load teams when modal opens
  useEffect(() => {
    if (isOpen && member) {
      loadTeams();
      setSelectedTeamId(member.teamId || '');
    }
  }, [isOpen, member]);

  const loadTeams = async () => {
    setLoadingTeams(true);
    setError('');
    try {
      const response = await getTeams();
      if (response.status === 'success') {
        setTeams(response.teams);
      }
    } catch (err) {
      setError('Failed to load teams');
    } finally {
      setLoadingTeams(false);
    }
  };

  // Handle team selection change
  const handleTeamChange = (e) => {
    setSelectedTeamId(e.target.value);
    setError('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!selectedTeamId) {
      setError('Please select a team');
      return;
    }

    if (selectedTeamId === member.teamId) {
      setError('Member is already in this team');
      return;
    }

    setLoading(true);

    try {
      console.log('Switching member:', member.id, 'to team:', selectedTeamId);
      const response = await switchEngineerTeam(member.id, parseInt(selectedTeamId));
      console.log('Switch response:', response);
      if (response.status === 'success') {
        // Call the callback to refresh the data
        await onMemberSwitched(response.engineer);
        onClose();
      }
    } catch (err) {
      console.error('Switch member error:', err);
      setError(err.message || 'Failed to switch member team');
    } finally {
      setLoading(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!loading) {
      setSelectedTeamId('');
      setError('');
      onClose();
    }
  };

  if (!isOpen || !member) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Switch Team Member</h2>
          <button className="modal-close" onClick={handleClose} disabled={loading}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="member-info">
            <h3>{member.name}</h3>
            <p><strong>Current Team:</strong> {member.team}</p>
            <p><strong>Role:</strong> {member.role}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="team-select">Select New Team:</label>
              {loadingTeams ? (
                <div className="loading">Loading teams...</div>
              ) : (
                <select
                  id="team-select"
                  value={selectedTeamId}
                  onChange={handleTeamChange}
                  disabled={loading}
                  className="form-select"
                >
                  <option value="">Choose a team...</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !selectedTeamId || selectedTeamId === member.teamId}
                className="btn btn-primary"
              >
                {loading ? 'Switching...' : 'Switch Team'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SwitchMemberModal;
