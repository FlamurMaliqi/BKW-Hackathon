/**
 * Main App Component - BKW Hackathon AI Project Management Frontend
 * 
 * This is the root component that orchestrates the entire application.
 * It manages the main navigation state and renders the appropriate
 * content based on the selected tab.
 * 
 * Application Structure:
 * - Fixed sidebar navigation with 3 main tabs
 * - Dynamic content area that changes based on selected tab
 * - Responsive design for desktop, tablet, and mobile
 * 
 * Main Tabs:
 * 1. Project Overview - Project status, timelines, resource allocation
 * 2. Human Management - Team management, workload, collaboration
 * 3. AI Integration - AI assistant, automation, analytics, ML models
 */

import React, { useState } from 'react';
import './App.css';

// Import the main navigation component
import Navigation from './components/Navigation';

// Import the three main content components
import ProjectOverview from './components/ProjectOverview';
import HumanManagement from './components/HumanManagement';
import AIIntegration from './components/AIIntegration';
import OverviewDashboard from './components/OverviewDashboard';

function App() {
  // State management for the currently active tab
  // 'overview' is the default tab when the app loads
  const [activeTab, setActiveTab] = useState('overview');

  /**
   * Handle tab changes when user clicks on navigation items
   * @param {string} tabId - The ID of the tab to switch to
   */
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  /**
   * Render the appropriate content component based on the active tab
   * @returns {JSX.Element} The component to render
   */
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewDashboard />;
      case 'projects':
        return <ProjectOverview />;
      case 'management':
        return <HumanManagement />;
      case 'ai':
        return <AIIntegration />;
      default:
        return <OverviewDashboard />; // Fallback to overview dashboard
    }
  };

  return (
    <div className="App">
      {/* Fixed sidebar navigation - always visible */}
      <Navigation 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
      />
      
      {/* Main content area - changes based on selected tab */}
      <main className="main-content">
        {renderActiveTab()}
      </main>
    </div>
  );
}

export default App;

