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
(1, '2K23-IT-36', 'password123', 'student'),
(2, '2K23-IT-104', 'password123', 'student'),
(3, '2K23-IT-85', 'password123', 'student'),
(4, '2K23-IT-51', 'password123', 'student'),
(5, '2K23-IT-100', 'password123', 'student'),
(6, '2K23-IT-25', 'password123', 'student'),
(7, '2K23-IT-35', 'password123', 'student'),
(8, '2K23-IT-26', 'password123', 'student'),
(9, 'T-01', 'password123', 'teacher'),
(10, 'T-02', 'password123', 'teacher'),
(11, 'T-03', 'password123', 'teacher'),
(12, 'T-04', 'password123', 'teacher'),
(13, 'ADMIN', 'admin123', 'teacher');

-- Insert Profiles
INSERT INTO profiles (user_id, name, roll_no, department, semester, email) VALUES 
(1, 'Abdul Wahab', '2K23-IT-36', 'Information Technology', 'Semester 6', 'abdul.wahab2k23@university.edu'),
(2, 'M Ahsan', '2K23-IT-104', 'Information Technology', 'Semester 6', 'm.ahsan2k23@university.edu'),
(3, 'Junaid Ahmed', '2K23-IT-85', 'Information Technology', 'Semester 6', 'junaid2k23@university.edu'),
(4, 'Arif Mustafa', '2K23-IT-51', 'Information Technology', 'Semester 6', 'arif2k23@university.edu'),
(5, 'Kalsoom', '2K23-IT-100', 'Information Technology', 'Semester 6', 'kalsoom2k23@university.edu'),
(6, 'Tahira', '2K23-IT-25', 'Information Technology', 'Semester 6', 'tahira2k23@university.edu'),
(7, 'Haleema', '2K23-IT-35', 'Information Technology', 'Semester 6', 'haleema2k23@university.edu'),
(8, 'Tayyaba Lodhi', '2K23-IT-26', 'Information Technology', 'Semester 6', 'tayyaba2k23@university.edu');

INSERT INTO profiles (user_id, name, roll_no, department, designation, email) VALUES 
(9, 'Mr. Zulfiqar Ali Maher', 'T-01', 'Information Technology', 'Assistant Prof', 'z.maher@university.edu'),
(10, 'Ms. Suhni Abbasi', 'T-02', 'Information Technology', 'Associate Prof', 'suhni.abbasi@university.edu'),
(11, 'Mr. Suhrab Thaheem', 'T-03', 'Information Technology', 'Assistant Prof', 'suhrab.thaheem@university.edu'),
(12, 'Mr. Mukhtiar Memon', 'T-04', 'Information Technology', 'Professor', 'mukhtiar.memon@university.edu'),
(13, 'Visiting Faculty Member', 'ADMIN', 'General Studies', 'Teacher', 'admin@university.edu');

-- Insert Polls
INSERT INTO polls (id, title, status, total_eligible, audience) VALUES 
(1, 'Class Representative (CR) Election', 'LIVE', 120, 'student'),
(2, 'Girls Representative (GR) Election', 'LIVE', 120, 'student'),
(3, 'SOUTA Faculty Elections', 'LIVE', 200, 'teacher');

-- Insert Candidates (CR Election)
INSERT INTO poll_options (poll_id, candidate_name, roll_no, initials) VALUES 
(1, 'Abdul Wahab', '2K23-IT-36', 'AW'),
(1, 'M Ahsan', '2K23-IT-104', 'MA'),
(1, 'Junaid Ahmed', '2K23-IT-85', 'JA'),
(1, 'Arif Mustafa', '2K23-IT-51', 'AM');

-- Insert Candidates (GR Election)
INSERT INTO poll_options (poll_id, candidate_name, roll_no, initials) VALUES 
(2, 'Kalsoom', '2K23-IT-100', 'K'),
(2, 'Tahira', '2K23-IT-25', 'T'),
(2, 'Haleema', '2K23-IT-35', 'H'),
(2, 'Tayyaba Lodhi', '2K23-IT-26', 'TL');

-- Insert Candidates (Faculty Election)
INSERT INTO poll_options (poll_id, candidate_name, roll_no, initials) VALUES 
(3, 'Mr. Zulfiqar Ali Maher', 'Assistant Prof', 'ZM'),
(3, 'Ms. Suhni Abbasi', 'Associate Prof', 'SA'),
(3, 'Mr. Suhrab Thaheem', 'Assistant Prof', 'ST'),
(3, 'Mr. Mukhtiar Memon', 'Professor', 'MM');
