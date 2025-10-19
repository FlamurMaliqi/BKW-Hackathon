# BKW Engineering AI Project Management System

An intelligent project management platform that uses AI to help project managers, engineers, and executives make better decisions through natural language interaction and automated conflict detection.

## 🚀 Overview

This system provides an AI-powered assistant that can analyze project data, detect conflicts, and answer questions about resource allocation, deadlines, and workload management. The platform combines a React frontend with a Python backend and integrates with AI services for natural language processing.

## ✨ Key Features

### AI Overview Assistant
- **Chat/Voice Interface**: Ask questions like "How's project Alpha doing?" or "Which engineers are overbooked next month?"
- **Intelligent Summaries**: Get project status, workload conflicts, and upcoming risks at a glance
- **Natural Language Queries**: Interact with your project data using conversational language

### Risk & Conflict Detection Engine
- **Deadline Overlap Alerts**: Automatically detect when project deadlines conflict
- **Workload Analysis**: Monitor engineer capacity and identify overbooked team members
- **Holiday Integration**: Factor in absences and holidays when calculating workload

### Modern Dashboard UI
- **Project Overview**: Visual representation of all projects and their status
- **Team Management**: Manage engineers and their assignments
- **Conflict Visualization**: Clear display of detected conflicts and risks

## 🏗️ Architecture

```
├── frontend/          # React.js frontend application
├── backend/           # Python Flask API server
├── docker-compose.yml # Container orchestration
└── README.md         # This file
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 16+ (for local development)
- Python 3.8+ (for local development)

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd BKW-Hackathon
   ```

2. **Start the application**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Local Development

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

#### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## 📁 Project Structure

### Backend (`/backend`)
- **Flask API**: RESTful API endpoints for project management
- **AI Service**: Integration with language models for natural language processing
- **Conflict Detection**: Algorithms for detecting project conflicts and overbookings
- **Database**: SQLite database with mock data for development

### Frontend (`/frontend`)
- **React Application**: Modern UI built with React.js
- **Components**: Reusable UI components following BKW design system
- **AI Integration**: Voice-to-text and text-to-speech capabilities
- **Dashboard**: Project overview and team management interfaces

## 🤖 AI Features

### Natural Language Processing
- Ask questions about project status in plain English
- Get intelligent summaries of complex project data
- Receive proactive alerts about potential issues

### Voice Integration
- Speech-to-text input for hands-free interaction
- Text-to-speech responses for accessibility
- Voice-enabled project queries and updates

### Conflict Detection
- Automatic detection of deadline overlaps
- Workload capacity analysis
- Holiday and absence impact calculation

## 🎯 Use Cases

### For Project Managers
- "Summarize my risks for the next quarter"
- "Which engineer is most overloaded?"
- "Show me all projects with overlapping deadlines"

### For Managing Directors
- "Which major deadlines are at risk?"
- "Give me a high-level overview of all projects"
- "What's our team capacity for next month?"

### For Engineers
- "What's my workload next week?"
- "Which projects am I assigned to?"
- "When are my upcoming deadlines?"

## 🛠️ Development

### API Endpoints
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/engineers` - List all engineers
- `POST /api/ai/query` - Send AI query
- `GET /api/conflicts` - Get detected conflicts

### Design System
The frontend follows a comprehensive design system based on BKW Engineering brand guidelines. See `/frontend/src/README.md` for detailed design specifications.

## 📊 Data Model

### Projects
- ID, name, description, deadline, status
- Assigned engineers and workload distribution
- Risk level and priority

### Engineers
- ID, name, role, capacity
- Current assignments and availability
- Holiday and absence tracking

### Conflicts
- Type (deadline overlap, overcapacity, etc.)
- Severity level
- Affected projects and engineers
- Resolution suggestions

## 🔧 Configuration

### Environment Variables
- `FLASK_ENV`: Development or production mode
- `AI_API_KEY`: API key for AI service integration
- `DATABASE_URL`: Database connection string

### Docker Configuration
- Frontend runs on port 3000
- Backend runs on port 5000
- Database is SQLite (development) or PostgreSQL (production)

## 📈 Future Enhancements

- **Advanced Analytics**: Machine learning for predictive project insights
- **Integration APIs**: Connect with external project management tools
- **Mobile App**: Native mobile application for on-the-go access
- **Real-time Collaboration**: Live updates and team collaboration features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is developed for BKW Engineering hackathon purposes.

## 🆘 Support

For questions or issues, please contact the development team or create an issue in the repository.
