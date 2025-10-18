# BKW Hackathon - AI Project Management Setup

## Quick Start

1. **Get your Gemini API Key:**
   - Go to https://makersuite.google.com/app/apikey
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy the generated key

2. **Set up your API key:**
   ```bash
   # Edit the .env file and replace the placeholder
   nano .env
   # Replace "your_gemini_api_key_here" with your actual API key
   ```

3. **Start the project:**
   ```bash
   docker-compose up --build
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001
   - Database: localhost:5432

## Features

- **AI-Powered Chatbot**: Ask questions about projects, team workload, and deadlines
- **Project Management**: View and manage projects with conflict detection
- **Team Overview**: Monitor engineer availability and workload
- **Real-time Insights**: Get AI-generated insights about project status

## Example AI Queries

- "How's project Alpha doing?"
- "Which engineers are overworked?"
- "What are the major deadline risks?"
- "Show me the budget status"
- "Who's available for new projects?"

## Troubleshooting

If you see "GEMINI_API_KEY environment variable is required":
1. Make sure you've set your API key in the `.env` file
2. Restart the containers: `docker-compose down && docker-compose up --build`

## API Endpoints

- `POST /api/ai/chat` - Chat with AI assistant
- `GET /api/projects` - Get all projects
- `GET /api/engineers` - Get all engineers
- `GET /api/teams` - Get all teams
- `GET /api/conflicts` - Get conflict analysis
