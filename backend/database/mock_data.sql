-- BKW Hackathon - Mock Data for legacy projects/engineers schema
-- Inserts sample projects, engineers, assignments, and absences

-- ---------------------------------------------------------------------
-- Projects
-- ---------------------------------------------------------------------

INSERT INTO projects (name, description, deadline, status) VALUES
    ('Solar Roof Expansion', 'PV capacity increase across municipal buildings', '2026-03-15', 'active'),
    ('District Heating Retrofit', 'Modernise district heating control loops for downtown grid', '2025-12-01', 'active'),
    ('Battery Storage Pilot', 'Pilot-scale storage system for peak shaving', '2026-01-20', 'active'),
    ('Hydro Plant Modernization', 'Turbine control upgrade and monitoring rollout', '2025-11-15', 'active'),
    ('HVAC Optimization Program', 'Energy efficiency improvements for office portfolio', '2026-02-10', 'planning');

-- ---------------------------------------------------------------------
-- Engineers
-- ---------------------------------------------------------------------

INSERT INTO engineers (name, email, capacity_hours_per_week, role) VALUES
    ('Anna Keller', 'anna.keller@bkw.ch', 40, 'Senior Engineer'),
    ('Lukas Meier', 'lukas.meier@bkw.ch', 32, 'Electrical Engineer'),
    ('Sofia Baumann', 'sofia.baumann@bkw.ch', 40, 'Project Manager'),
    ('Marco Steiner', 'marco.steiner@bkw.ch', 30, 'Mechanical Engineer'),
    ('Laura Brunner', 'laura.brunner@bkw.ch', 35, 'Energy Analyst'),
    ('Jonas Frei', 'jonas.frei@bkw.ch', 40, 'Controls Specialist');

-- ---------------------------------------------------------------------
-- Project assignments
-- ---------------------------------------------------------------------

INSERT INTO project_assignments (engineer_id, project_id, hours_per_week, start_date, end_date) VALUES
    ((SELECT id FROM engineers WHERE email = 'anna.keller@bkw.ch'), (SELECT id FROM projects WHERE name = 'Solar Roof Expansion'), 25, '2025-09-01', '2026-03-01'),
    ((SELECT id FROM engineers WHERE email = 'anna.keller@bkw.ch'), (SELECT id FROM projects WHERE name = 'Hydro Plant Modernization'), 10, '2025-06-01', '2025-11-30'),
    ((SELECT id FROM engineers WHERE email = 'lukas.meier@bkw.ch'), (SELECT id FROM projects WHERE name = 'District Heating Retrofit'), 28, '2025-07-15', '2025-12-15'),
    ((SELECT id FROM engineers WHERE email = 'sofia.baumann@bkw.ch'), (SELECT id FROM projects WHERE name = 'District Heating Retrofit'), 18, '2025-04-01', '2025-12-01'),
    ((SELECT id FROM engineers WHERE email = 'sofia.baumann@bkw.ch'), (SELECT id FROM projects WHERE name = 'HVAC Optimization Program'), 12, '2025-10-15', '2026-02-10'),
    ((SELECT id FROM engineers WHERE email = 'marco.steiner@bkw.ch'), (SELECT id FROM projects WHERE name = 'Battery Storage Pilot'), 22, '2025-08-01', '2026-01-31'),
    ((SELECT id FROM engineers WHERE email = 'laura.brunner@bkw.ch'), (SELECT id FROM projects WHERE name = 'Solar Roof Expansion'), 18, '2025-09-15', '2026-03-10'),
    ((SELECT id FROM engineers WHERE email = 'laura.brunner@bkw.ch'), (SELECT id FROM projects WHERE name = 'HVAC Optimization Program'), 12, '2025-10-20', '2026-02-10'),
    ((SELECT id FROM engineers WHERE email = 'jonas.frei@bkw.ch'), (SELECT id FROM projects WHERE name = 'Hydro Plant Modernization'), 35, '2025-05-01', '2025-11-15'),
    ((SELECT id FROM engineers WHERE email = 'jonas.frei@bkw.ch'), (SELECT id FROM projects WHERE name = 'Battery Storage Pilot'), 10, '2025-08-01', '2026-01-20');

-- ---------------------------------------------------------------------
-- Absences
-- ---------------------------------------------------------------------

INSERT INTO absences (engineer_id, start_date, end_date, reason, type) VALUES
    ((SELECT id FROM engineers WHERE email = 'anna.keller@bkw.ch'), '2025-12-23', '2026-01-03', 'Winter holidays', 'holiday'),
    ((SELECT id FROM engineers WHERE email = 'lukas.meier@bkw.ch'), '2025-10-25', '2025-10-29', 'Grid automation training', 'training'),
    ((SELECT id FROM engineers WHERE email = 'laura.brunner@bkw.ch'), '2025-11-11', '2025-11-13', 'Seasonal flu', 'sick'),
    ((SELECT id FROM engineers WHERE email = 'jonas.frei@bkw.ch'), '2025-12-02', '2025-12-06', 'Family event', 'personal');


