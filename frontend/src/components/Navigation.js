/**
 * Navigation Component
 * 
 * This component renders the main navigation sidebar for the application.
 * It displays the logo and three main navigation tabs that allow users
 * to switch between different sections of the application.
 * 
 * Props:
 * - activeTab: string - The currently selected tab ID
 * - onTabChange: function - Callback function called when a tab is clicked
 */

import React from 'react';
import './Navigation.css';

const Navigation = ({ activeTab, onTabChange }) => {
  // Define the three main navigation tabs with their properties
  // Each tab has an ID, display label, and emoji icon
  const tabs = [
    { id: 'overview', label: 'Project Overview', icon: '📊' },
    { id: 'management', label: 'Human Management', icon: '👥' },
    { id: 'ai', label: 'AI Integration', icon: '🤖' }
  ];

  return (
    <nav className="navigation">
      {/* Header section containing the application logo */}
      <div className="nav-header">
        <div className="logo">
          {/* Stylized "A" icon in a blue circle */}
          <span className="logo-icon">A</span>
          {/* Application name "Avelias" */}
          <span className="logo-text">Avelias</span>
        </div>
      </div>
      
      {/* Navigation tabs section */}
      <div className="nav-tabs">
        {/* Dynamically render each tab as a clickable button */}
        {tabs.map(tab => (
          <button
            key={tab.id}
            // Apply 'active' class if this tab is currently selected
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            // Call the onTabChange callback when clicked
            onClick={() => onTabChange(tab.id)}
          >
            {/* Display the emoji icon for this tab */}
            <span className="tab-icon">{tab.icon}</span>
            {/* Display the text label for this tab */}
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
