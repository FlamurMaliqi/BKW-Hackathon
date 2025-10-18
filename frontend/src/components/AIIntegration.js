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

// Chat bubble component for individual messages
const ChatBubble = ({ message, isUser, timestamp }) => {
  return (
    <div className={`chat-bubble ${isUser ? 'user' : 'ai'}`}>
      <div className="bubble-content">
        <div className="bubble-text">{message}</div>
        <div className="bubble-timestamp">{timestamp}</div>
      </div>
      <div className="bubble-avatar">
        {isUser ? '👤' : '🤖'}
      </div>
    </div>
  );
};

// Quick action button component
const QuickActionButton = ({ text, onClick, icon }) => {
  return (
    <button className="quick-action-btn" onClick={onClick}>
      {icon && <span className="action-icon">{icon}</span>}
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

  // Mock OpenAI API call - simulates the actual API structure
  const mockOpenAIAPI = async (userMessage, conversationHistory) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
    
    // This would be the actual OpenAI API call structure:
    /*
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an AI project management assistant. You have access to the following project data: ${JSON.stringify(projectData)}. 
            Help users with project-related queries including deadlines, team workload, budget analysis, status updates, and resource allocation. 
            Provide detailed, actionable insights based on the project data.`
          },
          ...conversationHistory,
          {
            role: 'user',
            content: userMessage
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });
    
    const data = await response.json();
    return data.choices[0].message.content;
    */
    
    // Mock response based on user query
    const message = userMessage.toLowerCase();
    
    if (message.includes('deadline') || message.includes('due date')) {
      return {
        content: `Based on your current project data, here are the upcoming deadlines:\n\n**High Priority Projects:**\n• E-commerce Platform Redesign - February 15, 2024 (75% complete)\n• Data Analytics Dashboard - January 30, 2024 (90% complete)\n\n**Medium Priority Projects:**\n• Mobile App Development - March 1, 2024 (45% complete)\n\n**Low Priority Projects:**\n• API Integration Project - February 28, 2024 (30% complete)\n\n**Recommendations:**\n- The Data Analytics Dashboard is nearly complete and on track for its deadline\n- Consider accelerating the E-commerce Platform to ensure timely delivery\n- The API Integration project may need additional resources to meet its deadline`,
        usage: { total_tokens: 156, prompt_tokens: 89, completion_tokens: 67 }
      };
    }
    
    if (message.includes('overworked') || message.includes('workload') || message.includes('busy')) {
      return {
        content: `**Team Workload Analysis:**\n\n**Current Assignments:**\n• Alice Johnson: 1 project (E-commerce Platform) - Light workload\n• Bob Smith: 1 project (E-commerce Platform) - Light workload\n• Carol Davis: 1 project (E-commerce Platform) - Light workload\n• David Wilson: 1 project (Mobile App) - Light workload\n• Eva Brown: 1 project (Mobile App) - Light workload\n• Frank Miller: 1 project (Data Analytics) - Light workload\n• Grace Lee: 1 project (Data Analytics) - Light workload\n• Henry Taylor: 1 project (Data Analytics) - Light workload\n• Ivy Chen: 1 project (API Integration) - Light workload\n• Jack Anderson: 1 project (API Integration) - Light workload\n\n**Workload Distribution:**\n- All team members have balanced workloads\n- No overwork concerns detected\n- Consider cross-training opportunities for better resource flexibility`,
        usage: { total_tokens: 142, prompt_tokens: 89, completion_tokens: 53 }
      };
    }
    
    if (message.includes('status') || message.includes('progress') || message.includes('overview')) {
      return {
        content: `**Project Status Overview:**\n\n**Overall Progress:**\n• 4 active projects\n• Average completion: 60%\n• 1 project near completion (90%)\n• 2 projects in progress (45-75%)\n• 1 project in planning (30%)\n\n**Budget Analysis:**\n• Total allocated: $490,000\n• Amount spent: $292,500 (59.7%)\n• Remaining: $197,500\n• Budget health: Good\n\n**Risk Assessment:**\n• Low risk: Data Analytics Dashboard (90% complete)\n• Medium risk: E-commerce Platform (75% complete, high priority)\n• Medium risk: Mobile App (45% complete, medium priority)\n• High risk: API Integration (30% complete, approaching deadline)\n\n**Recommendations:**\n- Focus resources on API Integration project\n- Monitor E-commerce Platform closely\n- Prepare for Data Analytics Dashboard completion`,
        usage: { total_tokens: 198, prompt_tokens: 89, completion_tokens: 109 }
      };
    }
    
    if (message.includes('budget') || message.includes('cost') || message.includes('money')) {
      return {
        content: `**Budget Analysis Report:**\n\n**Project Budget Breakdown:**\n• E-commerce Platform: $150,000 (75% spent: $112,500)\n• Mobile App Development: $200,000 (45% spent: $90,000)\n• Data Analytics Dashboard: $80,000 (90% spent: $72,000)\n• API Integration: $60,000 (30% spent: $18,000)\n\n**Financial Health:**\n• Total allocated: $490,000\n• Total spent: $292,500\n• Remaining budget: $197,500\n• Budget utilization: 59.7%\n• Cost efficiency: Good\n\n**Budget Trends:**\n• Data Analytics: On track for completion within budget\n• E-commerce Platform: Slightly over pace but manageable\n• Mobile App: Well within budget constraints\n• API Integration: Under budget, good cost control\n\n**Recommendations:**\n- All projects are financially healthy\n- Consider reallocating unused budget from API Integration if needed\n- Monitor E-commerce Platform spending closely`,
        usage: { total_tokens: 187, prompt_tokens: 89, completion_tokens: 98 }
      };
    }
    
    if (message.includes('team') || message.includes('member') || message.includes('staff')) {
      return {
        content: `**Team Structure & Assignments:**\n\n**Project Teams:**\n\n**E-commerce Platform Redesign (High Priority):**\n• Alice Johnson (Lead)\n• Bob Smith (Developer)\n• Carol Davis (Designer)\n\n**Mobile App Development (Medium Priority):**\n• David Wilson (Lead)\n• Eva Brown (Developer)\n\n**Data Analytics Dashboard (High Priority):**\n• Frank Miller (Lead)\n• Grace Lee (Analyst)\n• Henry Taylor (Developer)\n\n**API Integration Project (Low Priority):**\n• Ivy Chen (Lead)\n• Jack Anderson (Developer)\n\n**Team Summary:**\n• Total team size: 9 members\n• Projects per member: 1 (balanced workload)\n• Leadership distribution: 4 leads across 4 projects\n• Skill distribution: Good mix of developers, designers, and analysts\n\n**Recommendations:**\n- Consider cross-project collaboration opportunities\n- Plan for knowledge sharing sessions\n- Identify potential backup resources for critical projects`,
        usage: { total_tokens: 203, prompt_tokens: 89, completion_tokens: 114 }
      };
    }
    
    // Default response for general queries
    return {
      content: `I understand you're asking about: "${userMessage}"\n\nAs your AI project management assistant, I can help you with:\n\n**Project Management:**\n• Project deadlines and timelines\n• Progress tracking and status updates\n• Risk assessment and mitigation\n\n**Resource Management:**\n• Team workload analysis\n• Resource allocation optimization\n• Capacity planning\n\n**Financial Management:**\n• Budget tracking and analysis\n• Cost optimization recommendations\n• Financial health monitoring\n\n**Strategic Insights:**\n• Project performance analytics\n• Predictive insights\n• Process improvement suggestions\n\nTry asking specific questions like:\n- "Show me project deadlines"\n- "Who is overworked?"\n- "What's our budget status?"\n- "Give me a team overview"`,
      usage: { total_tokens: 145, prompt_tokens: 89, completion_tokens: 56 }
    };
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
      // Prepare conversation history for context (last 10 messages)
      const conversationHistory = messages
        .slice(-10)
        .map(msg => ({
          role: msg.isUser ? 'user' : 'assistant',
          content: msg.text
        }));
      
      // Call mock OpenAI API
      const response = await mockOpenAIAPI(currentInput, conversationHistory);
      
      const aiResponse = {
        id: Date.now() + 1,
        text: response.content,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        usage: response.usage // Store token usage for future analytics
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
              <span className="chat-icon">🤖</span>
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
              icon="📅"
            />
            <QuickActionButton 
              text="Who is overworked?" 
              onClick={() => handleQuickAction("Who is overworked?")}
              icon="👥"
            />
            <QuickActionButton 
              text="General Status" 
              onClick={() => handleQuickAction("What's the general project status?")}
              icon="📊"
            />
            <QuickActionButton 
              text="Budget Overview" 
              onClick={() => handleQuickAction("Show me the budget overview")}
              icon="💰"
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
                  <div className="bubble-avatar">🤖</div>
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
