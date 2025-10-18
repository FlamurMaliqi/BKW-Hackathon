

-- BKW Hackathon - Minimal database schema for hackathon prototype
-- Focused on teams, capacity, risks, and availability with only essential fields.

-- Delivery structure -------------------------------------------------------

CREATE TABLE IF NOT EXISTS delivery_teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS team_members (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    delivery_team_id INTEGER REFERENCES delivery_teams(id) ON DELETE SET NULL,
    role VARCHAR(100),
    capacity_percent NUMERIC(5,2) DEFAULT 100
);

-- Capacity tracking --------------------------------------------------------

CREATE TABLE IF NOT EXISTS capacity_snapshots (
    id SERIAL PRIMARY KEY,
    delivery_team_id INTEGER REFERENCES delivery_teams(id) ON DELETE SET NULL,
    label VARCHAR(100),
    stand_date DATE
);

CREATE TABLE IF NOT EXISTS capacity_entries (
    id SERIAL PRIMARY KEY,
    capacity_snapshot_id INTEGER REFERENCES capacity_snapshots(id) ON DELETE CASCADE,
    team_member_id INTEGER REFERENCES team_members(id) ON DELETE SET NULL,
    project_code VARCHAR(30),
    project_name TEXT,
    workstream VARCHAR(100),
    current_week_load NUMERIC(5,2),
    four_week_load NUMERIC(5,2),
    risk_flag VARCHAR(20)
);

-- Project catalogue and risk profile --------------------------------------

CREATE TABLE IF NOT EXISTS project_catalog (
    id SERIAL PRIMARY KEY,
    project_code VARCHAR(30) NOT NULL,
    name TEXT NOT NULL,
    customer TEXT,
    status VARCHAR(50),
    delivery_team_id INTEGER REFERENCES delivery_teams(id) ON DELETE SET NULL,
    CONSTRAINT uq_project_catalog_code UNIQUE (project_code)
);

CREATE TABLE IF NOT EXISTS project_risk_assessments (
    id SERIAL PRIMARY KEY,
    project_catalog_id INTEGER REFERENCES project_catalog(id) ON DELETE CASCADE,
    reporting_year SMALLINT NOT NULL CHECK (reporting_year >= 2000),
    reporting_quarter SMALLINT NOT NULL CHECK (reporting_quarter BETWEEN 1 AND 4),
    risk_description TEXT,
    risk_probability SMALLINT CHECK (risk_probability BETWEEN 0 AND 5),
    risk_impact SMALLINT CHECK (risk_impact BETWEEN 0 AND 5),
    risk_score SMALLINT,
    mitigation_plan TEXT,
    UNIQUE (project_catalog_id, reporting_year, reporting_quarter)
);

-- Availability -------------------------------------------------------------

CREATE TABLE IF NOT EXISTS availability_status_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE IF NOT EXISTS member_availability_calendar (
    id SERIAL PRIMARY KEY,
    team_member_id INTEGER REFERENCES team_members(id) ON DELETE CASCADE,
    day DATE NOT NULL,
    status_code_id INTEGER REFERENCES availability_status_codes(id) ON DELETE SET NULL,
    comment TEXT,
    UNIQUE (team_member_id, day)
);

-- Indexes ------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_capacity_entries_project ON capacity_entries(project_code);
CREATE INDEX IF NOT EXISTS idx_project_catalog_code ON project_catalog(project_code);
CREATE INDEX IF NOT EXISTS idx_project_risk_period ON project_risk_assessments(reporting_year, reporting_quarter);
CREATE INDEX IF NOT EXISTS idx_member_availability_day ON member_availability_calendar(day);

