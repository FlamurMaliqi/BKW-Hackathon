-- BKW Hackathon - AI Project Management Database Schema
-- PostgreSQL database structure for project management data

-- Create database (run this manually)
-- CREATE DATABASE bkw_pm;

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    deadline DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Engineers table
CREATE TABLE IF NOT EXISTS engineers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    capacity_hours_per_week INTEGER DEFAULT 40,
    role VARCHAR(100),
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_deadline ON projects(deadline);
CREATE INDEX IF NOT EXISTS idx_assignments_engineer ON project_assignments(engineer_id);
CREATE INDEX IF NOT EXISTS idx_assignments_project ON project_assignments(project_id);
CREATE INDEX IF NOT EXISTS idx_absences_engineer ON absences(engineer_id);
CREATE INDEX IF NOT EXISTS idx_absences_dates ON absences(start_date, end_date);

