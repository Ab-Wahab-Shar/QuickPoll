-- CREATE DATABASE
CREATE DATABASE IF NOT EXISTS quickpoll_db;
USE quickpoll_db;

-- 1. USERS TABLE (Accounts for login)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    university_id VARCHAR(50) NOT NULL UNIQUE,  -- e.g. '2K23-IT-36' or 'T-01'
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'teacher') NOT NULL DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. PROFILES TABLE (Information about the user)
CREATE TABLE IF NOT EXISTS profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    roll_no VARCHAR(50) NULL,
    department VARCHAR(100) DEFAULT 'Information Technology',
    -- For Students
    semester VARCHAR(50) NULL,
    -- For Faculty
    designation VARCHAR(100) NULL,
    email VARCHAR(100) NULL,
    avatar_url MEDIUMTEXT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. POLLS TABLE
CREATE TABLE IF NOT EXISTS polls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    status ENUM('LIVE', 'PAUSED', 'ENDED') DEFAULT 'LIVE',
    total_eligible INT DEFAULT 0,
    audience ENUM('student', 'teacher') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. POLL OPTIONS TABLE (Candidates)
CREATE TABLE IF NOT EXISTS poll_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    poll_id INT NOT NULL,
    candidate_name VARCHAR(100) NOT NULL,
    roll_no VARCHAR(50) NULL,
    initials VARCHAR(10) NOT NULL,
    votes_count INT DEFAULT 0,
    FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE
);

-- 5. VOTES TABLE (To track who voted where)
CREATE TABLE IF NOT EXISTS votes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    poll_id INT NOT NULL,
    option_id INT NOT NULL,
    voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Prevent a user from voting twice on the same poll
    UNIQUE KEY unique_vote (user_id, poll_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
    FOREIGN KEY (option_id) REFERENCES poll_options(id) ON DELETE CASCADE
);

-- ==========================================
-- DUMMY DATA FOR TESTING
-- ==========================================

-- Clean existing data to avoid duplicate key errors on reload
DELETE FROM votes;
DELETE FROM poll_options;
DELETE FROM polls;
DELETE FROM profiles;
DELETE FROM users;

-- Insert Accounts
INSERT INTO users (id, university_id, password, role) VALUES 
(1, 'STU-TEST-001', 'password123', 'student'),
(2, 'STU-TEST-002', 'password123', 'student'),
(3, 'STU-TEST-003', 'password123', 'student'),
(4, 'STU-TEST-004', 'password123', 'student'),
(5, 'STU-TEST-005', 'password123', 'student'),
(6, 'STU-TEST-006', 'password123', 'student'),
(7, 'STU-TEST-007', 'password123', 'student'),
(8, 'STU-TEST-008', 'password123', 'student'),
(9, 'T-01', 'password123', 'teacher'),
(10, 'T-02', 'password123', 'teacher'),
(11, 'T-03', 'password123', 'teacher'),
(12, 'T-04', 'password123', 'teacher'),
(13, 'ADMIN', 'admin123', 'teacher');

-- Insert Profiles
INSERT INTO profiles (user_id, name, roll_no, department, semester, email) VALUES 
(1, 'Student One', 'STU-TEST-001', 'Information Technology', 'Semester 6', 'student1@university.edu'),
(2, 'Student Two', 'STU-TEST-002', 'Information Technology', 'Semester 6', 'student2@university.edu'),
(3, 'Student Three', 'STU-TEST-003', 'Information Technology', 'Semester 6', 'student3@university.edu'),
(4, 'Student Four', 'STU-TEST-004', 'Information Technology', 'Semester 6', 'student4@university.edu'),
(5, 'Student Five', 'STU-TEST-005', 'Information Technology', 'Semester 6', 'student5@university.edu'),
(6, 'Student Six', 'STU-TEST-006', 'Information Technology', 'Semester 6', 'student6@university.edu'),
(7, 'Student Seven', 'STU-TEST-007', 'Information Technology', 'Semester 6', 'student7@university.edu'),
(8, 'Student Eight', 'STU-TEST-008', 'Information Technology', 'Semester 6', 'student8@university.edu');

INSERT INTO profiles (user_id, name, roll_no, department, designation, email) VALUES 
(9, 'Teacher One', 'T-01', 'Information Technology', 'Assistant Prof', 'teacher1@university.edu'),
(10, 'Teacher Two', 'T-02', 'Information Technology', 'Associate Prof', 'teacher2@university.edu'),
(11, 'Teacher Three', 'T-03', 'Information Technology', 'Assistant Prof', 'teacher3@university.edu'),
(12, 'Teacher Four', 'T-04', 'Information Technology', 'Professor', 'teacher4@university.edu'),
(13, 'Administrator', 'ADMIN', 'General Studies', 'Teacher', 'admin@university.edu');

-- Insert Polls
INSERT INTO polls (id, title, status, total_eligible, audience) VALUES 
(1, 'Class Representative (CR) Election', 'LIVE', 120, 'student'),
(2, 'Girls Representative (GR) Election', 'LIVE', 120, 'student'),
(3, 'SOUTA Faculty Elections', 'LIVE', 200, 'teacher');

-- Insert Candidates (CR Election)
INSERT INTO poll_options (poll_id, candidate_name, roll_no, initials) VALUES 
(1, 'Student One', 'STU-TEST-001', 'S1'),
(1, 'Student Two', 'STU-TEST-002', 'S2'),
(1, 'Student Three', 'STU-TEST-003', 'S3'),
(1, 'Student Four', 'STU-TEST-004', 'S4');

-- Insert Candidates (GR Election)
INSERT INTO poll_options (poll_id, candidate_name, roll_no, initials) VALUES 
(2, 'Student Five', 'STU-TEST-005', 'S5'),
(2, 'Student Six', 'STU-TEST-006', 'S6'),
(2, 'Student Seven', 'STU-TEST-007', 'S7'),
(2, 'Student Eight', 'STU-TEST-008', 'S8');

-- Insert Candidates (Faculty Election)
INSERT INTO poll_options (poll_id, candidate_name, roll_no, initials) VALUES 
(3, 'Teacher One', 'Assistant Prof', 'T1'),
(3, 'Teacher Two', 'Associate Prof', 'T2'),
(3, 'Teacher Three', 'Assistant Prof', 'T3'),
(3, 'Teacher Four', 'Professor', 'T4');
