/**
 * BKW Hackathon - AI Project Management Frontend
 * Main React application component
 */
import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // AI Chat functionality
  const handleAIQuery = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      
      const data = await res.json();
      setResponse(data.response);
    } catch (error) {
      setResponse('Error: Could not connect to AI assistant');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🤖 BKW AI Project Management Assistant</h1>
        <p>Ask me anything about your projects, deadlines, and team workload</p>
      </header>

      <main className="App-main">
        {/* AI Chat Interface */}
        <section className="ai-chat">
          <h2>AI Assistant</h2>
          <form onSubmit={handleAIQuery} className="chat-form">
            <div className="input-group">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask me: 'How are we doing this month?' or 'Which deadlines overlap?'"
                className="chat-input"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                className="chat-button"
                disabled={isLoading || !query.trim()}
              >
                {isLoading ? 'Thinking...' : 'Ask AI'}
              </button>
            </div>
          </form>

          {response && (
            <div className="ai-response">
              <h3>AI Response:</h3>
              <p>{response}</p>
            </div>
          )}
        </section>

        {/* Dashboard Placeholder */}
        <section className="dashboard">
          <h2>Project Dashboard</h2>
          <div className="dashboard-placeholder">
            <p>Dashboard will show project conflicts, workload heatmaps, and Gantt charts</p>
            <p>This serves as a fallback to the AI assistant</p>
          </div>
        </section>
      </main>

      <footer className="App-footer">
        <p>BKW Hackathon 2024 - AI-Centric Project Management</p>
      </footer>
    </div>
  );
}

export default App;

