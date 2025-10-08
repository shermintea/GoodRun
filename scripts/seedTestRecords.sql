/*******************************************************
*Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
*File:      scripts/seedTestRecords.sql
*Author:    IT Project – Medical Pantry – Group 17
*Date:      08-10-2025
*Version:   1.0
*Purpose:   SQL command script used to seed testing records into goodrun-db-dev
*           tables organisation, jobs and users.
*           Ran on pgAdmin 4.
*Revisions:
*v1.0 - 08-10-2025 - Initial implementation
*******************************************************/

INSERT INTO organisation (name, address, contact_no, office_hours)
VALUES
('GoodRun Volunteers', '123 Collins St, Melbourne VIC', '0391234567', 'Mon-Fri 0800-1700'),
('Helping Hands', '45 Swanston St, Melbourne VIC', '0398765432', 'Everyday 0730-1500')
RETURNING id, name;

INSERT INTO jobs (progress_stage, deadline_date, weight, value, size, follow_up, intake_priority, organisation_id)
SELECT 'available', '2025-10-10', 5.2, 30.0, 'small', false, 'medium', id
FROM organisation
WHERE name = 'GoodRun Volunteers';

INSERT INTO jobs (progress_stage, deadline_date, weight, value, size, follow_up, intake_priority, organisation_id)
SELECT 'available', '2025-10-12', 3.0, 15.0, 'tiny', true, 'high', id
FROM organisation
WHERE name = 'GoodRun Volunteers';

INSERT INTO jobs (progress_stage, deadline_date, weight, value, size, follow_up, intake_priority, organisation_id)
SELECT 'reserved', '2025-09-30', 10.0, 45.0, 'small', false, 'low', id
FROM organisation
WHERE name = 'Helping Hands';

INSERT INTO users (name, email, role, password_hash)
VALUES
('Sofìa', 'sofia@example.com', 'volunteer', '$2b$10$QDp8dvPFvAj0FwtXHi./k.ks/RCr5Vko/2riYEO5QHGnbF4rlvyQe'),
('Esther', 'esther@example.com', 'volunteer', '$2b$10$LE0FAbI.5rYhcOaO.sVjNu4x4sAHWe5JnxCpPyvCTRLtVF9EY7AlG'),
('Monna', 'monna@example.com', 'volunteer', '$2b$10$fCg/q0u0r0WnwG9J4.l6B.7zeRMEstmpTE1HUc3a/ifo0bZKhbm2u'),
('Louie', 'louie@example.com', 'admin', '$2b$10$2P4/VB21IwU95tIZEu6iXuHvFuZLCZOB1THIcnINEkbgXXM1XHy5.'),
('Jeslyn', 'jeslyn@example.com', 'admin', '$2b$10$FW.zuSUm5MofEfEqC3zEOO37rb.feyZW.UR0Cz9sB9x11lFN4OP2G')

