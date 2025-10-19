# Backend API - BKW Engineering AI Project Management

A Flask-based REST API that powers the BKW Engineering AI Project Management system. This backend provides intelligent project analysis, conflict detection, and AI-powered insights through natural language processing.

## 🚀 Overview

The backend serves as the core intelligence layer, handling:
- Project and engineer data management
- AI-powered conflict detection and analysis
- Natural language query processing
- Workload analysis and capacity planning
- RESTful API endpoints for frontend integration

## 🏗️ Architecture

```
backend/
├── app.py                 # Main Flask application
├── ai_service.py         # AI integration and NLP processing
├── conflict_detection.py # Conflict detection algorithms
├── workload_analyzer.py  # Workload analysis and capacity planning
├── database/             # Database schema and mock data
│   ├── connection.py     # Database connection management
│   ├── schema.sql        # Database schema definitions
│   └── mock_data.sql     # Sample data for development
├── requirements.txt      # Python dependencies
├── Dockerfile           # Container configuration
└── README.md           # This file
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)
- SQLite3 (included with Python)

### Installation

1. **Clone and navigate to backend**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Initialize database**
   ```bash
   python -c "from database.connection import init_db; init_db()"
   ```

5. **Run the application**
   ```bash
   python app.py
   ```

The API will be available at `http://localhost:5000`

### Using Docker

```bash
# From project root
docker-compose up backend
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
Currently, the API operates without authentication for development purposes. In production, implement proper authentication middleware.

### Endpoints

#### Projects

**GET /api/projects**
- **Description**: Retrieve all projects
- **Response**: Array of project objects
- **Example**:
  ```json
  [
    {
      "id": 1,
      "name": "Project Alpha",
      "description": "AI-powered analytics platform",
      "deadline": "2024-03-15",
      "status": "active",
      "priority": "high"
    }
  ]
  ```

**POST /api/projects**
- **Description**: Create a new project
- **Body**: Project object
- **Response**: Created project object

**GET /api/projects/{id}**
- **Description**: Retrieve a specific project
- **Parameters**: `id` (integer) - Project ID
- **Response**: Project object

**PUT /api/projects/{id}**
- **Description**: Update a project
- **Parameters**: `id` (integer) - Project ID
- **Body**: Updated project object
- **Response**: Updated project object

**DELETE /api/projects/{id}**
- **Description**: Delete a project
- **Parameters**: `id` (integer) - Project ID
- **Response**: Success message

#### Engineers

**GET /api/engineers**
- **Description**: Retrieve all engineers
- **Response**: Array of engineer objects
- **Example**:
  ```json
  [
    {
      "id": 1,
      "name": "Alice Johnson",
      "role": "Senior Developer",
      "capacity": 40,
      "current_workload": 35
    }
  ]
  ```

**POST /api/engineers**
- **Description**: Create a new engineer
- **Body**: Engineer object
- **Response**: Created engineer object

#### AI Integration

**POST /api/ai/query**
- **Description**: Send a natural language query to the AI assistant
- **Body**: 
  ```json
  {
    "query": "Which engineers are overbooked next month?",
    "context": "optional additional context"
  }
  ```
- **Response**: AI-generated response
- **Example**:
  ```json
  {
    "response": "Based on current workload analysis, Alice Johnson and Bob Smith are overbooked for next month with 110% and 105% capacity respectively.",
    "confidence": 0.92,
    "suggestions": [
      "Consider redistributing tasks from Alice to other team members",
      "Delay non-critical tasks for Bob's projects"
    ]
  }
  ```

#### Conflict Detection

**GET /api/conflicts**
- **Description**: Retrieve all detected conflicts
- **Response**: Array of conflict objects
- **Example**:
  ```json
  [
    {
      "id": 1,
      "type": "deadline_overlap",
      "severity": "high",
      "description": "Project Alpha and Beta have overlapping deadlines",
      "affected_projects": [1, 2],
      "affected_engineers": [1, 2],
      "suggestions": ["Adjust Project Beta deadline", "Increase team capacity"]
    }
  ]
  ```

**GET /api/conflicts/projects/{project_id}**
- **Description**: Get conflicts for a specific project
- **Parameters**: `project_id` (integer) - Project ID
- **Response**: Array of conflict objects

**GET /api/conflicts/engineers/{engineer_id}**
- **Description**: Get conflicts for a specific engineer
- **Parameters**: `engineer_id` (integer) - Engineer ID
- **Response**: Array of conflict objects

#### Workload Analysis

**GET /api/workload**
- **Description**: Get current workload analysis
- **Response**: Workload analysis object
- **Example**:
  ```json
  {
    "total_capacity": 200,
    "utilized_capacity": 180,
    "utilization_percentage": 90,
    "overbooked_engineers": [
      {
        "engineer_id": 1,
        "name": "Alice Johnson",
        "capacity": 40,
        "workload": 45,
        "overload_percentage": 112.5
      }
    ]
  }
  ```

**GET /api/workload/engineers/{engineer_id}**
- **Description**: Get workload analysis for a specific engineer
- **Parameters**: `engineer_id` (integer) - Engineer ID
- **Response**: Engineer workload object

## 🤖 AI Integration

### AI Service Configuration

The AI service integrates with language models to provide natural language processing capabilities:

```python
# Configuration in ai_service.py
AI_MODEL = "gpt-3.5-turbo"  # or your preferred model
MAX_TOKENS = 1000
TEMPERATURE = 0.7
```

### Supported Query Types

1. **Project Status Queries**
   - "How is Project Alpha doing?"
   - "What's the status of all active projects?"

2. **Workload Analysis Queries**
   - "Which engineers are overbooked?"
   - "What's the team capacity for next month?"

3. **Conflict Detection Queries**
   - "Are there any deadline conflicts?"
   - "Which projects have overlapping timelines?"

4. **Resource Planning Queries**
   - "Can we take on Project Gamma?"
   - "Who should work on the new project?"

## 🗄️ Database Schema

### Projects Table
```sql
CREATE TABLE projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    deadline DATE,
    status TEXT DEFAULT 'active',
    priority TEXT DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Engineers Table
```sql
CREATE TABLE engineers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT,
    capacity INTEGER DEFAULT 40,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Assignments Table
```sql
CREATE TABLE assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    engineer_id INTEGER,
    project_id INTEGER,
    hours_per_week INTEGER,
    start_date DATE,
    end_date DATE,
    FOREIGN KEY (engineer_id) REFERENCES engineers (id),
    FOREIGN KEY (project_id) REFERENCES projects (id)
);
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
FLASK_ENV=development
FLASK_DEBUG=True
DATABASE_URL=sqlite:///project_management.db
AI_API_KEY=your_ai_api_key_here
AI_MODEL=gpt-3.5-turbo
MAX_TOKENS=1000
TEMPERATURE=0.7
```

### Flask Configuration

```python
# Default configuration in app.py
class Config:
    SECRET_KEY = 'your-secret-key-here'
    DATABASE_URL = 'sqlite:///project_management.db'
    AI_API_KEY = os.getenv('AI_API_KEY')
    CORS_ORIGINS = ['http://localhost:3000']
```

## 🧪 Testing

### Running Tests

```bash
# Install test dependencies
pip install pytest pytest-flask

# Run tests
pytest tests/
```

### Test Structure

```
tests/
├── test_api.py          # API endpoint tests
├── test_ai_service.py   # AI service tests
├── test_conflicts.py    # Conflict detection tests
└── test_workload.py     # Workload analysis tests
```

## 📊 Performance

### Optimization Tips

1. **Database Indexing**: Ensure proper indexes on frequently queried columns
2. **Caching**: Implement Redis caching for frequently accessed data
3. **Connection Pooling**: Use connection pooling for database connections
4. **Async Processing**: Consider async processing for AI queries

### Monitoring

- **Logging**: Comprehensive logging for debugging and monitoring
- **Metrics**: Track API response times and error rates
- **Health Checks**: Implement health check endpoints

## 🚀 Deployment

### Production Considerations

1. **Environment Variables**: Use secure environment variable management
2. **Database**: Switch to PostgreSQL for production
3. **Authentication**: Implement proper authentication and authorization
4. **Rate Limiting**: Add rate limiting to prevent abuse
5. **HTTPS**: Ensure all communications use HTTPS
6. **Monitoring**: Set up application monitoring and alerting

### Docker Deployment

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5000

CMD ["python", "app.py"]
```

## 🤝 Contributing

1. Follow PEP 8 style guidelines
2. Add type hints to all functions
3. Write comprehensive docstrings
4. Include tests for new features
5. Update API documentation

## 📄 License

This project is developed for BKW Engineering hackathon purposes.
