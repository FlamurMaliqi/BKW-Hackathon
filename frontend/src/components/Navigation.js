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
  // Each tab has an ID and professional single-word label
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'management', label: 'Management' },
    { id: 'ai', label: 'Manir AI' }
  ];

  return (
    <nav className="navigation">
      {/* Header section containing the application logo */}
      <div className="nav-header">
        <div className="logo">
          {/* BKW Engineering logo image */}
          <img 
            src="/logo.jpg" 
            alt="BKW Engineering" 
            className="logo-image"
          />
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
            {/* Display the text label for this tab */}
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
