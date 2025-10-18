/**
 * Add Member Modal Component
 *
 * Modal dialog for adding new team members (engineers)
 */

import React, { useState, useEffect } from 'react';
import { getTeams } from '../services/api';
import './Modal.css';

const AddMemberModal = ({ isOpen, onClose, onMemberAdded }) => {
  const [teams, setTeams] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    team_id: '',
    phone: '',
    capacity_hours_per_week: 40,
    status: 'active',
    availability: 'available',
    skills: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(false);

  // Load teams when modal opens
  useEffect(() => {
    if (isOpen) {
      loadTeams();
    }
  }, [isOpen]);

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

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }
    if (!formData.role.trim()) {
      setError('Role is required');
      return;
    }
    if (!formData.team_id) {
      setError('Please select a team');
      return;
    }

    setLoading(true);

    try {
      // Prepare skills array from comma-separated string
      const skillsArray = formData.skills 
        ? formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill)
        : [];

      await onMemberAdded({
        ...formData,
        team_id: parseInt(formData.team_id),
        capacity_hours_per_week: parseInt(formData.capacity_hours_per_week),
        skills: skillsArray
      });

      // Reset form and close modal
      setFormData({
        name: '',
        email: '',
        role: '',
        team_id: '',
        phone: '',
        capacity_hours_per_week: 40,
        status: 'active',
        availability: 'available',
        skills: ''
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: '',
        email: '',
        role: '',
        team_id: '',
        phone: '',
        capacity_hours_per_week: 40,
        status: 'active',
        availability: 'available',
        skills: ''
      });
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Team Member</h2>
          <button className="modal-close" onClick={handleClose} disabled={loading}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="modal-error">
                {error}
              </div>
            )}

            {loadingTeams ? (
              <div className="loading-message">Loading teams...</div>
            ) : (
              <>
                <div className="form-group">
                  <label htmlFor="name">
                    Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    disabled={loading}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    Email <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    disabled={loading}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="role">
                      Role <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      placeholder="e.g., Senior Engineer"
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="team_id">
                      Team <span className="required">*</span>
                    </label>
                    <select
                      id="team_id"
                      name="team_id"
                      value={formData.team_id}
                      onChange={handleChange}
                      disabled={loading}
                      required
                    >
                      <option value="">Select a team...</option>
                      {teams.map(team => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Phone</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="capacity_hours_per_week">Hours per Week</label>
                    <input
                      type="number"
                      id="capacity_hours_per_week"
                      name="capacity_hours_per_week"
                      value={formData.capacity_hours_per_week}
                      onChange={handleChange}
                      min="1"
                      max="60"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="contractor">Contractor</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="availability">Availability</label>
                    <select
                      id="availability"
                      name="availability"
                      value={formData.availability}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <option value="available">Available</option>
                      <option value="busy">Busy</option>
                      <option value="holiday">Holiday</option>
                      <option value="sick">Sick</option>
                      <option value="remote">Remote</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="skills">Skills (comma-separated)</label>
                  <input
                    type="text"
                    id="skills"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="e.g., React, Python, Project Management"
                    disabled={loading}
                  />
                </div>
              </>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || loadingTeams}
            >
              {loading ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;
