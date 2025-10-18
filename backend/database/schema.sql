-- BKW Hackathon - AI Project Management Database Schema
-- PostgreSQL database structure for project management data

-- Create database (run this manually)
-- CREATE DATABASE bkw_pm;

CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    deadline DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    priority VARCHAR(50) DEFAULT 'medium', -- high, medium, low
    completion_percent NUMERIC(5,2) DEFAULT 0 CHECK (completion_percent BETWEEN 0 AND 100),
    budget_total NUMERIC(12,2) DEFAULT 0 CHECK (budget_total >= 0),
    budget_spent NUMERIC(12,2) DEFAULT 0 CHECK (budget_spent >= 0 AND budget_spent <= budget_total),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(20),
    performance_score NUMERIC(5,2) DEFAULT 0 CHECK (performance_score BETWEEN 0 AND 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Engineers table
CREATE TABLE IF NOT EXISTS engineers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    capacity_hours_per_week INTEGER DEFAULT 40,
    role VARCHAR(100),
    team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'active', -- active, inactive, contractor, etc.
    availability VARCHAR(50) DEFAULT 'available', -- available, busy, holiday, sick, remote
    workload_percent INTEGER DEFAULT 0 CHECK (workload_percent BETWEEN 0 AND 100),
    is_overworked BOOLEAN DEFAULT FALSE,
    skills TEXT[] DEFAULT '{}'::TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project assignments (many-to-many relationship)
CREATE TABLE IF NOT EXISTS project_assignments (
    id SERIAL PRIMARY KEY,
    engineer_id INTEGER REFERENCES engineers(id) ON DELETE CASCADE,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    hours_per_week INTEGER NOT NULL,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(engineer_id, project_id)
);

-- Absences/Holidays table
CREATE TABLE IF NOT EXISTS absences (
    id SERIAL PRIMARY KEY,
    engineer_id INTEGER REFERENCES engineers(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason VARCHAR(255),
    type VARCHAR(50) DEFAULT 'holiday', -- holiday, sick, personal
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Engineer presence tracking for activity heatmaps (in-office vs away)
CREATE TABLE IF NOT EXISTS engineer_presence (
    id SERIAL PRIMARY KEY,
    engineer_id INTEGER NOT NULL REFERENCES engineers(id) ON DELETE CASCADE,
    presence_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('in_office', 'out_of_office')), -- map directly to heatmap indicators
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(engineer_id, presence_date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_deadline ON projects(deadline);
CREATE INDEX IF NOT EXISTS idx_projects_priority ON projects(priority);
CREATE INDEX IF NOT EXISTS idx_assignments_engineer ON project_assignments(engineer_id);
CREATE INDEX IF NOT EXISTS idx_assignments_project ON project_assignments(project_id);
CREATE INDEX IF NOT EXISTS idx_absences_engineer ON absences(engineer_id);
CREATE INDEX IF NOT EXISTS idx_absences_dates ON absences(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_engineers_team ON engineers(team_id);
CREATE INDEX IF NOT EXISTS idx_presence_engineer_date ON engineer_presence(engineer_id, presence_date);