-- ResuMatch Database Schema

CREATE DATABASE IF NOT EXISTS resumatch;
USE resumatch;

-- USERS

CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(120) NOT NULL,
  email      VARCHAR(180) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,          -- bcrypt hash
  role       ENUM('user','hr') DEFAULT 'user',
  phone      VARCHAR(20),
  location   VARCHAR(120),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


--RESUMES

CREATE TABLE IF NOT EXISTS resumes (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT NOT NULL,
  original_name   VARCHAR(255),
  file_path       VARCHAR(500),              -- path on disk / S3 key
  extracted_text  LONGTEXT,                  -- raw parsed text
  extracted_skills JSON,                     -- ["React","Node.js",...]
  uploaded_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


--JOB DESCRIPTIONS
CREATE TABLE IF NOT EXISTS job_descriptions (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  created_by       INT NOT NULL,             -- HR user id
  job_title        VARCHAR(200) NOT NULL,
  description_text LONGTEXT NOT NULL,
  required_skills  JSON,                     -- extracted skill list
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);


-- MATCHES  (one row per candidate × JD)

CREATE TABLE IF NOT EXISTS matches (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT NOT NULL,             -- candidate
  resume_id        INT,
  jd_id            INT,
  job_title        VARCHAR(200),
  match_percentage TINYINT UNSIGNED,         -- 0-100
  matched_skills   JSON,
  missing_skills   JSON,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)    REFERENCES users(id)            ON DELETE CASCADE,
  FOREIGN KEY (resume_id)  REFERENCES resumes(id)          ON DELETE SET NULL,
  FOREIGN KEY (jd_id)      REFERENCES job_descriptions(id) ON DELETE SET NULL
);


-- HR CANDIDATE UPLOADS  (bulk upload pool)

CREATE TABLE IF NOT EXISTS hr_candidate_uploads (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  hr_user_id       INT NOT NULL,
  candidate_name   VARCHAR(150),
  candidate_email  VARCHAR(180),
  file_path        VARCHAR(500),
  extracted_skills JSON,
  uploaded_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hr_user_id) REFERENCES users(id) ON DELETE CASCADE
);


INSERT IGNORE INTO users (name, email, password, role) VALUES
  ('Demo Candidate', 'user@demo.com',  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
  ('HR Manager',     'hr@demo.com',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'hr');