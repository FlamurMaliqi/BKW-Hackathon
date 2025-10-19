# Frontend - BKW Engineering AI Project Management

A modern React.js frontend application for the BKW Engineering AI Project Management system. This application provides an intuitive interface for project managers, engineers, and executives to interact with AI-powered project insights through natural language and visual dashboards.

## 🚀 Overview

The frontend is built with React.js and provides:
- Interactive project management dashboard
- AI-powered chat interface with voice capabilities
- Real-time conflict detection and visualization
- Team management and workload analysis
- Responsive design following BKW Engineering brand guidelines

## 🏗️ Architecture

```
frontend/
├── public/                 # Static assets and HTML template
│   ├── index.html         # Main HTML template
│   └── logo.jpg           # BKW Engineering logo
├── src/                   # Source code
│   ├── components/        # React components
│   │   ├── AIIntegration.js      # AI chat interface
│   │   ├── CreateProjectModal.js # Project creation modal
│   │   ├── HumanManagement.js    # Team management
│   │   ├── Navigation.js         # Main navigation
│   │   ├── OverviewDashboard.js  # Main dashboard
│   │   ├── ProjectOverview.js    # Project details
│   │   └── TeamDetail.js         # Engineer details
│   ├── hooks/             # Custom React hooks
│   │   └── useSpeechToText.js    # Voice input hook
│   ├── services/          # API integration
│   │   └── api.js         # API service layer
│   ├── App.js             # Main application component
│   ├── App.css            # Global styles
│   ├── index.js           # Application entry point
│   └── README.md          # Design system documentation
├── package.json           # Dependencies and scripts
├── Dockerfile            # Container configuration
└── README.md            # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16.0 or higher
- npm 7.0 or higher (or yarn)
- Backend API running on port 5000

### Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Open in browser**
   Navigate to `http://localhost:3000`

### Using Docker

```bash
# From project root
docker-compose up frontend
```

## 🎨 Design System

The application follows a comprehensive design system based on BKW Engineering brand guidelines. For detailed design specifications, see [`src/README.md`](./src/README.md).

### Key Design Principles
- **Professional**: Clean, medical-grade interface design
- **Accessible**: WCAG AA compliant with proper contrast ratios
- **Responsive**: Mobile-first design with tablet and desktop adaptations
- **Consistent**: Unified color palette, typography, and spacing

### Brand Colors
- **Primary**: BKW Blue (#004488)
- **Secondary**: White (#FFFFFF)
- **Accent**: Medium Blue (#1A5276)
- **Background**: Light Gray (#F8F9FA)

## 🧩 Components

### Core Components

#### AIIntegration
- **Purpose**: AI chat interface with voice capabilities
- **Features**: Speech-to-text, text-to-speech, natural language queries
- **Props**: `onQuery`, `isLoading`, `messages`

#### OverviewDashboard
- **Purpose**: Main project overview and analytics
- **Features**: Project cards, conflict alerts, workload visualization
- **Props**: `projects`, `conflicts`, `workload`

#### HumanManagement
- **Purpose**: Team and engineer management
- **Features**: Engineer list, capacity management, assignment tracking
- **Props**: `engineers`, `onUpdateEngineer`, `onAddEngineer`

#### ProjectOverview
- **Purpose**: Detailed project view and management
- **Features**: Project details, timeline, assigned engineers
- **Props**: `project`, `engineers`, `onUpdateProject`

### Modal Components

#### CreateProjectModal
- **Purpose**: Project creation and editing
- **Features**: Form validation, deadline selection, engineer assignment
- **Props**: `isOpen`, `onClose`, `onSubmit`, `project`

#### AssignEngineerModal
- **Purpose**: Engineer assignment to projects
- **Features**: Engineer selection, workload calculation, conflict detection
- **Props**: `isOpen`, `onClose`, `onAssign`, `project`, `engineers`

## 🎤 Voice Integration

### Speech-to-Text
The application includes voice input capabilities using the Web Speech API:

```javascript
// Example usage in components
import { useSpeechToText } from './hooks/useSpeechToText';

const { isListening, transcript, startListening, stopListening } = useSpeechToText();
```

### Text-to-Speech
AI responses can be read aloud using the Web Speech API:

```javascript
// Example TTS implementation
const speak = (text) => {
  const utterance = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utterance);
};
```

## 🔌 API Integration

### API Service Layer
All backend communication is handled through the `api.js` service:

```javascript
// Example API calls
import { api } from './services/api';

// Get all projects
const projects = await api.getProjects();

// Send AI query
const response = await api.sendAIQuery("Which engineers are overbooked?");

// Create new project
const newProject = await api.createProject(projectData);
```

### API Endpoints
- `GET /api/projects` - Fetch all projects
- `POST /api/projects` - Create new project
- `GET /api/engineers` - Fetch all engineers
- `POST /api/ai/query` - Send AI query
- `GET /api/conflicts` - Fetch detected conflicts

## 📱 Responsive Design

### Breakpoints
- **Mobile**: 0px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

### Mobile Adaptations
- Collapsible navigation sidebar
- Touch-friendly button sizes (44px minimum)
- Optimized form layouts
- Swipe gestures for navigation

## 🎯 Key Features

### AI-Powered Insights
- **Natural Language Queries**: Ask questions in plain English
- **Voice Interaction**: Hands-free operation with speech recognition
- **Intelligent Summaries**: Get project status and risk analysis
- **Proactive Alerts**: Automatic conflict and overload detection

### Project Management
- **Project Overview**: Visual project cards with status indicators
- **Timeline Management**: Gantt-style project timelines
- **Resource Allocation**: Engineer assignment and workload tracking
- **Conflict Detection**: Visual alerts for deadline overlaps and overbookings

### Team Management
- **Engineer Profiles**: Detailed engineer information and capacity
- **Workload Analysis**: Visual workload distribution and capacity planning
- **Assignment Tracking**: Monitor engineer assignments across projects
- **Availability Management**: Track holidays and absences

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Run linting
npm run lint

# Eject from Create React App (not recommended)
npm run eject
```

### Code Structure

#### Component Organization
- **Functional Components**: All components use React hooks
- **Custom Hooks**: Reusable logic in `hooks/` directory
- **Service Layer**: API calls centralized in `services/`
- **CSS Modules**: Component-specific styles

#### State Management
- **Local State**: React hooks (useState, useEffect)
- **Context API**: For global state (theme, user preferences)
- **Custom Hooks**: For complex state logic

### Styling Guidelines

#### CSS Architecture
- **Global Styles**: `index.css` for base styles
- **Component Styles**: Individual CSS files for components
- **Design System**: CSS variables for consistent theming
- **Responsive**: Mobile-first approach with media queries

#### Naming Conventions
- **CSS Classes**: BEM methodology
- **Components**: PascalCase
- **Files**: camelCase for JS, kebab-case for CSS
- **Variables**: camelCase

## 🧪 Testing

### Testing Strategy
- **Unit Tests**: Individual component testing
- **Integration Tests**: Component interaction testing
- **E2E Tests**: Full user workflow testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## 🚀 Deployment

### Production Build
```bash
# Create production build
npm run build

# Serve production build locally
npx serve -s build
```

### Docker Deployment
```dockerfile
FROM node:16-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables
Create a `.env` file for environment-specific configuration:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_AI_ENABLED=true
REACT_APP_VOICE_ENABLED=true
```

## 🔧 Configuration

### Build Configuration
The application uses Create React App with minimal configuration. For advanced configuration, consider ejecting or using CRACO.

### Performance Optimization
- **Code Splitting**: Lazy loading for route components
- **Bundle Analysis**: Use `npm run build` and analyze bundle
- **Image Optimization**: Optimize images before adding to public/
- **Caching**: Implement proper caching strategies

## 🤝 Contributing

### Development Guidelines
1. Follow React best practices and hooks patterns
2. Use TypeScript for type safety (if migrating)
3. Write comprehensive tests for new components
4. Follow the established design system
5. Ensure accessibility compliance

### Code Review Checklist
- [ ] Component follows design system guidelines
- [ ] Proper error handling and loading states
- [ ] Responsive design implementation
- [ ] Accessibility features (ARIA labels, keyboard navigation)
- [ ] Performance considerations (memoization, lazy loading)

## 📄 License

This project is developed for BKW Engineering hackathon purposes.

## 🆘 Support

For frontend development questions or issues, please contact the development team or create an issue in the repository.
