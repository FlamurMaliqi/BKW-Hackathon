/**
 * AI Integration Component
 * 
 * This component displays the AI-powered features dashboard.
 * It showcases artificial intelligence capabilities for project
 * management, automation, analytics, and machine learning.
 * This is the third tab in the main navigation.
 * 
 * Features:
 * - AI assistant for natural language queries
 * - Workflow automation and task management
 * - Advanced analytics and predictive insights
 * - Custom AI model training and deployment
 */

import React, { useState, useRef, useEffect } from 'react';
import './AIIntegration.css';
import { sendAIChat } from '../services/api';

// Chat bubble component for individual messages
const ChatBubble = ({ message, isUser, timestamp }) => {
  return (
    <div className={`chat-bubble ${isUser ? 'user' : 'ai'}`}>
      <div className="bubble-content">
        <div className="bubble-text">{message}</div>
        <div className="bubble-timestamp">{timestamp}</div>
      </div>
    </div>
  );
};

// Quick action button component
const QuickActionButton = ({ text, onClick }) => {
  return (
    <button className="quick-action-btn" onClick={onClick}>
      {text}
    </button>
  );
};

const AIIntegration = () => {
  // State for chat messages
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI project assistant. How can I help you today?",
      isUser: false,
      timestamp: "10:30 AM"
    }
  ]);
  
  // State for input field
  const [inputValue, setInputValue] = useState('');
  
  // State for loading indicator
  const [isLoading, setIsLoading] = useState(false);
  
  // Ref for auto-scrolling to bottom
  const messagesEndRef = useRef(null);
  
  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mock project data that would come from your backend/API
  const projectData = {
    projects: [
      {
        id: 1,
        name: "E-commerce Platform Redesign",
        deadline: "2024-02-15",
        completion: 75,
        priority: "High",
        team: ["Alice Johnson", "Bob Smith", "Carol Davis"],
        budget: 150000,
        spent: 112500,
        status: "In Progress",
        description: "Complete redesign of the e-commerce platform with modern UI/UX and improved performance."
      },
      {
        id: 2,
        name: "Mobile App Development",
        deadline: "2024-03-01",
        completion: 45,
        priority: "Medium",
        team: ["David Wilson", "Eva Brown"],
        budget: 200000,
        spent: 90000,
        status: "In Progress",
        description: "Native mobile application for iOS and Android with cross-platform compatibility."
      },
      {
        id: 3,
        name: "Data Analytics Dashboard",
        deadline: "2024-01-30",
        completion: 90,
        priority: "High",
        team: ["Frank Miller", "Grace Lee", "Henry Taylor"],
        budget: 80000,
        spent: 72000,
        status: "Near Completion",
        description: "Real-time analytics dashboard with advanced reporting capabilities."
      },
      {
        id: 4,
        name: "API Integration Project",
        deadline: "2024-02-28",
        completion: 30,
        priority: "Low",
        team: ["Ivy Chen", "Jack Anderson"],
        budget: 60000,
        spent: 18000,
        status: "Planning",
        description: "Integration of third-party APIs for enhanced functionality."
      }
    ]
  };

  // Call the real backend AI API
  const callBackendAI = async (userMessage) => {
    try {
      const response = await sendAIChat(userMessage);
      if (response.status === 'success' && response.response) {
        return {
          content: response.response,
          generated_at: response.generated_at
        };
      } else {
        throw new Error('Failed to get AI response');
      }
    } catch (error) {
      console.error('Error calling backend AI:', error);
      throw error;
    }
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage = {
      id: Date.now(),
      text: inputValue,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);
    
    try {
      // Call the backend AI endpoint
      const response = await callBackendAI(currentInput);

      const aiResponse = {
        id: Date.now() + 1,
        text: response.content,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        generated_at: response.generated_at
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error calling AI API:', error);
      const errorResponse = {
        id: Date.now() + 1,
        text: "I'm sorry, I encountered an error processing your request. Please try again.",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle quick action clicks
  const handleQuickAction = async (action) => {
    setInputValue(action);
    // Wait a moment for the input to update, then send
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="ai-integration">
      {/* Header section with page title */}
      <div className="content-header">
        <h1>AI Integration</h1>
        <p>Leverage AI for intelligent project management and automation</p>
      </div>

      {/* Main content area with chat interface */}
      <div className="content-body">
        <div className="chat-container">
          {/* Chat header */}
          <div className="chat-header">
            <div className="chat-title">
              <h3>AI Project Assistant</h3>
            </div>
            <div className="chat-actions">
              <button className="btn-secondary">Clear Chat</button>
              <button className="btn-primary">Export Chat</button>
            </div>
          </div>

          {/* Quick action buttons */}
          <div className="quick-actions">
            <QuickActionButton 
              text="Show Project Deadlines" 
              onClick={() => handleQuickAction("Show me all project deadlines")}
            />
            <QuickActionButton 
              text="Who is overworked?" 
              onClick={() => handleQuickAction("Who is overworked?")}
            />
            <QuickActionButton 
              text="General Status" 
              onClick={() => handleQuickAction("What's the general project status?")}
            />
            <QuickActionButton 
              text="Budget Overview" 
              onClick={() => handleQuickAction("Show me the budget overview")}
            />
          </div>

          {/* Messages area */}
          <div className="messages-container">
            <div className="messages-list">
              {messages.map(message => (
                <ChatBubble
                  key={message.id}
                  message={message.text}
                  isUser={message.isUser}
                  timestamp={message.timestamp}
                />
              ))}
              {isLoading && (
                <div className="chat-bubble ai">
                  <div className="bubble-content">
                    <div className="bubble-text">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input area */}
          <div className="chat-input-container">
            <div className="input-wrapper">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your projects..."
                className="chat-input"
                rows="1"
              />
              <button 
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="send-button"
              >
                <span className="send-icon">➤</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIIntegration;
