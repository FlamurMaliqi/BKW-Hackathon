/**
 * Assign Engineer Modal Component
 *
 * Modal dialog for assigning engineers to projects
 */

import React, { useState, useEffect } from 'react';
import { getAvailableEngineers } from '../services/api';
import './Modal.css';

const AssignEngineerModal = ({ isOpen, onClose, projectId, projectName, onEngineerAssigned }) => {
  const [engineers, setEngineers] = useState([]);
  const [formData, setFormData] = useState({
    engineer_id: '',
    hours_per_week: '',
    start_date: '',
    end_date: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingEngineers, setLoadingEngineers] = useState(false);

  // Load available engineers when modal opens
  useEffect(() => {
    if (isOpen && projectId) {
      loadAvailableEngineers();
    }
  }, [isOpen, projectId]);

  const loadAvailableEngineers = async () => {
    setLoadingEngineers(true);
    setError('');
    try {
      const response = await getAvailableEngineers(projectId);
      if (response.status === 'success') {
        setEngineers(response.engineers);
      }
    } catch (err) {
      setError('Failed to load available engineers');
    } finally {
      setLoadingEngineers(false);
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
    if (!formData.engineer_id) {
      setError('Please select an engineer');
      return;
    }
    if (!formData.hours_per_week || formData.hours_per_week <= 0) {
      setError('Hours per week must be greater than 0');
      return;
    }

    // Check if engineer will be overworked
    const selectedEngineer = engineers.find(e => e.id === parseInt(formData.engineer_id));
    if (selectedEngineer) {
      const remainingHours = selectedEngineer.available_hours || 0;
      if (parseInt(formData.hours_per_week) > remainingHours) {
        const confirmOverwork = window.confirm(
          `Warning: ${selectedEngineer.name} only has ${remainingHours} hours available. ` +
          `Assigning ${formData.hours_per_week} hours will overwork them. Continue anyway?`
        );
        if (!confirmOverwork) {
          return;
        }
      }
    }

    setLoading(true);

    try {
      await onEngineerAssigned({
        ...formData,
        engineer_id: parseInt(formData.engineer_id),
        hours_per_week: parseInt(formData.hours_per_week)
      });

      // Reset form and close modal
      setFormData({
        engineer_id: '',
        hours_per_week: '',
        start_date: '',
        end_date: ''
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to assign engineer');
    } finally {
      setLoading(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!loading) {
      setFormData({
        engineer_id: '',
        hours_per_week: '',
        start_date: '',
        end_date: ''
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
          <h2>Assign Engineer to {projectName}</h2>
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

            {loadingEngineers ? (
              <div className="loading-message">Loading available engineers...</div>
            ) : engineers.length === 0 ? (
              <div className="info-message">No engineers available for assignment</div>
            ) : (
              <>
                <div className="form-group">
                  <label htmlFor="engineer_id">
                    Engineer <span className="required">*</span>
                  </label>
                  <select
                    id="engineer_id"
                    name="engineer_id"
                    value={formData.engineer_id}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  >
                    <option value="">Select an engineer...</option>
                    {engineers.map(engineer => (
                      <option key={engineer.id} value={engineer.id}>
                        {engineer.name} - {engineer.role}
                        {engineer.available_hours !== undefined &&
                          ` (${engineer.available_hours}h available)`}
                        {engineer.is_overworked && ' ⚠️ Overworked'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="hours_per_week">
                    Hours per Week <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id="hours_per_week"
                    name="hours_per_week"
                    value={formData.hours_per_week}
                    onChange={handleChange}
                    placeholder="Enter hours per week"
                    min="1"
                    max="40"
                    disabled={loading}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="start_date">Start Date</label>
                    <input
                      type="date"
                      id="start_date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="end_date">End Date</label>
                    <input
                      type="date"
                      id="end_date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                </div>

                {formData.engineer_id && (
                  <div className="engineer-info">
                    {(() => {
                      const selected = engineers.find(e => e.id === parseInt(formData.engineer_id));
                      if (selected) {
                        return (
                          <div className="info-box">
                            <p><strong>{selected.name}</strong></p>
                            <p>Team: {selected.team_name || 'No team'}</p>
                            <p>Current workload: {selected.workload_percent || 0}%</p>
                            <p>Available hours: {selected.available_hours || 0}h / week</p>
                            {selected.is_overworked && (
                              <p className="warning">⚠️ This engineer is currently overworked</p>
                            )}
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                )}
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
              disabled={loading || loadingEngineers || engineers.length === 0}
            >
              {loading ? 'Assigning...' : 'Assign Engineer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignEngineerModal;
