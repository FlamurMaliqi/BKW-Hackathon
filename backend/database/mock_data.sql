-- BKW Hackathon - Mock Data for AI Project Management
-- Sample data to demonstrate conflict detection and AI capabilities

-- Insert sample engineers
INSERT INTO engineers (name, email, capacity_hours_per_week, role) VALUES
('Alice Johnson', 'alice@bkw.com', 40, 'Senior Developer'),
('Bob Smith', 'bob@bkw.com', 40, 'Project Manager'),
('Carol Davis', 'carol@bkw.com', 35, 'UI/UX Designer'),
('David Wilson', 'david@bkw.com', 40, 'Backend Developer'),
('Eva Brown', 'eva@bkw.com', 30, 'QA Engineer');

-- Insert sample projects with overlapping deadlines (conflict scenarios)
INSERT INTO projects (name, description, deadline, status) VALUES
('Project Alpha', 'E-commerce platform development', '2024-03-15', 'active'),
('Project Beta', 'Mobile app for customer portal', '2024-03-20', 'active'),
('Project Gamma', 'Data analytics dashboard', '2024-03-25', 'active'),
('Project Delta', 'API integration project', '2024-04-10', 'active'),
('Project Echo', 'Security audit and compliance', '2024-04-15', 'active');

-- Insert project assignments (creating overcapacity scenarios)
INSERT INTO project_assignments (engineer_id, project_id, hours_per_week, start_date, end_date) VALUES
-- Alice is overbooked (50 hours total, capacity 40)
(1, 1, 25, '2024-01-01', '2024-03-15'), -- Project Alpha
(1, 2, 25, '2024-01-01', '2024-03-20'), -- Project Beta

-- Bob has normal workload
(2, 1, 15, '2024-01-01', '2024-03-15'), -- Project Alpha
(2, 3, 20, '2024-01-01', '2024-03-25'), -- Project Gamma

-- Carol is slightly overbooked (40 hours, capacity 35)
(3, 2, 20, '2024-01-01', '2024-03-20'), -- Project Beta
(3, 3, 20, '2024-01-01', '2024-03-25'), -- Project Gamma

-- David has normal workload
(4, 1, 20, '2024-01-01', '2024-03-15'), -- Project Alpha
(4, 4, 15, '2024-01-01', '2024-04-10'), -- Project Delta

-- Eva is underutilized
(5, 4, 15, '2024-01-01', '2024-04-10'); -- Project Delta

-- Insert absences (creating holiday impact scenarios)
INSERT INTO absences (engineer_id, start_date, end_date, reason, type) VALUES
(1, '2024-03-01', '2024-03-08', 'Vacation', 'holiday'),
(2, '2024-03-10', '2024-03-12', 'Conference', 'personal'),
(3, '2024-03-15', '2024-03-22', 'Sick leave', 'sick'),
(4, '2024-04-01', '2024-04-05', 'Easter break', 'holiday');

