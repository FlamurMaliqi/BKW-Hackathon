/**
 * Edit Worker Details Modal Component
 * 
 * This component provides a modal interface for editing worker contact
 * and personal information. It allows updating email, phone, and other
 * personal details of team members.
 * 
 * Features:
 * - Edit contact information (email, phone)
 * - Update personal details
 * - Form validation
 * - Save and cancel functionality
 */

import React, { useState, useEffect } from 'react';
import './EditWorkerDetailsModal.css';

const EditWorkerDetailsModal = ({ isOpen, onClose, worker, onWorkerUpdated }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    skills: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newSkill, setNewSkill] = useState('');

  // Initialize form data when worker changes
  useEffect(() => {
    if (worker) {
      setFormData({
        name: worker.name || '',
        email: worker.email || '',
        phone: worker.phone || '',
        role: worker.role || '',
        skills: worker.skills || []
      });
    }
  }, [worker]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle adding a new skill
  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  // Handle removing a skill
  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Here you would typically call an API to update the worker
      // For now, we'll simulate the update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Call the callback with updated worker data
      if (onWorkerUpdated) {
        onWorkerUpdated({
          ...worker,
          ...formData
        });
      }
      
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update worker details');
    } finally {
      setLoading(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="edit-worker-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Worker Details</h2>
          <button className="close-button" onClick={handleClose} disabled={loading}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-worker-form">
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone:</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Role:</label>
            <input
              type="text"
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Skills:</label>
            <div className="skills-container">
              <div className="skills-list">
                {formData.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill}
                    <button
                      type="button"
                      className="remove-skill"
                      onClick={() => handleRemoveSkill(skill)}
                      disabled={loading}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="add-skill">
                <input
                  type="text"
                  placeholder="Add a skill..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  disabled={loading || !newSkill.trim()}
                  className="add-skill-btn"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="btn-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-save"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditWorkerDetailsModal;
