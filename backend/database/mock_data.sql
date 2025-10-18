-- BKW Hackathon - Mock Data aligned with raw-data schema
-- Sample dataset inspired by the provided Excel workbooks

-- ---------------------------------------------------------------------
-- Delivery teams and members
-- ---------------------------------------------------------------------

INSERT INTO delivery_teams (name) VALUES
('Gruppe Schnyder'),
('Gruppe Wagner'),
('Gebäudeautomation');

INSERT INTO team_members (full_name, delivery_team_id, role, capacity_percent) VALUES
('Manuel Bachmann', (SELECT id FROM delivery_teams WHERE name = 'Gruppe Schnyder'), 'Projektleiter HLKS', 100),
('Michael Oehen', (SELECT id FROM delivery_teams WHERE name = 'Gruppe Schnyder'), 'Senior Engineer', 90),
('Heinrich Arnet', (SELECT id FROM delivery_teams WHERE name = 'Gruppe Schnyder'), 'Projektleiter', 90),
('Florian Schnider', (SELECT id FROM delivery_teams WHERE name = 'Gruppe Schnyder'), 'Bauleiter', 100),
('Michi Wagner', (SELECT id FROM delivery_teams WHERE name = 'Gruppe Wagner'), 'Teamleiter', 100),
('Thomas Rohrer', (SELECT id FROM delivery_teams WHERE name = 'Gebäudeautomation'), 'Projektleiter GA', 100);

-- ---------------------------------------------------------------------
-- Availability status dictionary
-- ---------------------------------------------------------------------

INSERT INTO availability_status_codes (code, description) VALUES
('AVAILABLE', 'Voll einsatzfähig'),
('HOLIDAY', 'Ferien / Abwesenheit'),
('SICK', 'Krankheit / Unfall'),
('TRAINING', 'Weiterbildung'),
('RESERVED', 'Reserviert für andere Einheit');

-- ---------------------------------------------------------------------
-- Project catalogue
-- ---------------------------------------------------------------------

INSERT INTO project_catalog (project_code, name, customer, status, delivery_team_id) VALUES
('1320072', 'Bucherer Longines, Luzern', 'Bucherer', 'active', (SELECT id FROM delivery_teams WHERE name = 'Gruppe Schnyder')),
('1320092', 'Bucherer Büro 1. OG, Luzern', 'Bucherer', 'active', (SELECT id FROM delivery_teams WHERE name = 'Gruppe Schnyder')),
('1320141', 'Freie Strasse 35/37, Basel', 'Bucherer', 'active', (SELECT id FROM delivery_teams WHERE name = 'Gruppe Schnyder')),
('1320158', 'NWV Kleinstadt Luzern', 'ewl', 'active', (SELECT id FROM delivery_teams WHERE name = 'Gruppe Schnyder')),
('1332018', 'MSD One Roof, Luzern', 'MSD', 'active', (SELECT id FROM delivery_teams WHERE name = 'Gruppe Schnyder'));

INSERT INTO project_risk_assessments (
	project_catalog_id,
	reporting_year,
	reporting_quarter,
	risk_description,
	risk_probability,
	risk_impact,
	risk_score,
	mitigation_plan
) VALUES
((SELECT id FROM project_catalog WHERE project_code = '1320072'), 2025, 1, 'Abschluss erfolgt, SR erstellt', 1, 1, 1, 'Keine weiteren Massnahmen notwendig'),
((SELECT id FROM project_catalog WHERE project_code = '1320092'), 2025, 1, 'Projekt ist gewachsen, Altbau mit vielen Altlasten', 2, 5, NULL, 'Ressourcenplanung HLK/S/GA sicherstellen'),
((SELECT id FROM project_catalog WHERE project_code = '1320141'), 2025, 1, 'Kostenüberschreitung durch Altbauaufwände', 2, 5, 10, 'Monatliche Abstimmung mit GA/SAN, Ressourcenunterstützung einplanen'),
((SELECT id FROM project_catalog WHERE project_code = '1320158'), 2025, 1, 'Entscheid zum weiteren Vorgehen ausstehend', 1, 1, 1, 'Nachfassen beim Auftraggeber bezüglich Entscheid'),
((SELECT id FROM project_catalog WHERE project_code = '1332018'), 2025, 1, 'Schlussrechnung gestellt, Zahlung teilweise offen', 2, 4, 8, 'Erneute Mahnung vorbereiten');

-- ---------------------------------------------------------------------
-- Capacity snapshot and entries (ISO week 42 / Stand 2025-10-17)
-- ---------------------------------------------------------------------

WITH snapshot AS (
	INSERT INTO capacity_snapshots (delivery_team_id, label, stand_date)
	VALUES ((SELECT id FROM delivery_teams WHERE name = 'Gruppe Schnyder'), 'KW42 / Stand 2025-10-17', '2025-10-17')
	RETURNING id
)
INSERT INTO capacity_entries (
	capacity_snapshot_id,
	team_member_id,
	project_code,
	project_name,
	workstream,
	current_week_load,
	four_week_load,
	risk_flag
)
SELECT
	snapshot.id,
	tm.id,
	data.project_code,
	data.project_name,
	data.workstream,
	data.current_week_load,
	data.four_week_load,
	data.risk_flag
FROM snapshot
CROSS JOIN LATERAL (
	VALUES
		('Manuel Bachmann', '1320092', 'Bucherer, Büro 1. OG, Luzern', 'Projektarbeit', 0.60, 0.85, 'YELLOW'),
		('Michael Oehen', '1320072', 'Bucherer Longines, Luzern', 'Projektarbeit', 0.70, 0.90, 'GREEN'),
		('Heinrich Arnet', '1332018', 'MSD One Roof, Luzern', 'Projektarbeit', 0.95, 1.05, 'ORANGE'),
		('Florian Schnider', '1320158', 'NWV Kleinstadt Luzern', 'Projektarbeit', 0.65, 0.80, 'YELLOW'),
		('Michi Wagner', 'ADZ-SUPPORT', 'Interne Unterstützung', 'Support', 0.40, 0.60, 'GREEN'),
		('Thomas Rohrer', 'GA-2025-04', 'Gebäudeautomation Support', 'GA Projekte', 0.85, 1.10, 'ORANGE')
) AS data(full_name, project_code, project_name, workstream, current_week_load, four_week_load, risk_flag)
JOIN team_members tm ON tm.full_name = data.full_name;

-- ---------------------------------------------------------------------
-- Member availability (4-week window)
-- ---------------------------------------------------------------------

INSERT INTO member_availability_calendar (team_member_id, day, status_code_id, comment)
SELECT tm.id, dates.day, status_codes.id, dates.comment
FROM (
	VALUES
		('Manuel Bachmann', DATE '2025-10-20', 'HOLIDAY', 'Ferien Herbst'),
		('Michael Oehen', DATE '2025-10-21', 'SICK', 'Grippe gemeldet'),
		('Heinrich Arnet', DATE '2025-10-23', 'HOLIDAY', 'Kurzurlaub'),
		('Florian Schnider', DATE '2025-11-01', 'TRAINING', 'Schulung BIM Auswertung'),
		('Michi Wagner', DATE '2025-10-28', 'RESERVED', 'Support für SPP HH'),
		('Thomas Rohrer', DATE '2025-10-22', 'HOLIDAY', 'Freier Tag')
) AS dates(full_name, day, code, comment)
JOIN team_members tm ON tm.full_name = dates.full_name
JOIN availability_status_codes status_codes ON status_codes.code = dates.code;


