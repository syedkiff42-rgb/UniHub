-- ============================================================
--  UniHub Database Schema
--  Engine: MySQL 8.x
-- ============================================================

CREATE DATABASE IF NOT EXISTS unihub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE unihub;

-- ── Users ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(120)        NOT NULL,
  email        VARCHAR(191)        NOT NULL UNIQUE,
  password     VARCHAR(255)        NOT NULL,
  student_id   VARCHAR(30)         DEFAULT NULL,
  phone        VARCHAR(20)         DEFAULT NULL,
  gpa_target   DECIMAL(3,2)        DEFAULT 3.50,
  avatar_url   VARCHAR(512)        DEFAULT NULL,
  created_at   DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── Refresh tokens (persistent login) ────────────────────────
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED        NOT NULL,
  token        VARCHAR(512)        NOT NULL UNIQUE,
  expires_at   DATETIME            NOT NULL,
  created_at   DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── Uploaded PDFs ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pdf_uploads (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED        NOT NULL,
  filename     VARCHAR(512)        NOT NULL,
  original_name VARCHAR(512)       NOT NULL,
  file_size    INT UNSIGNED        NOT NULL,
  status       ENUM('pending','processing','done','failed') NOT NULL DEFAULT 'pending',
  error_msg    TEXT                DEFAULT NULL,
  uploaded_at  DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  parsed_at    DATETIME            DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES pdf_uploads(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── Parsed schedule events (from PDF) ────────────────────────
CREATE TABLE IF NOT EXISTS schedule_events (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED        NOT NULL,
  pdf_id       INT UNSIGNED        DEFAULT NULL,
  title        VARCHAR(512)        NOT NULL,
  event_type   ENUM('exam','lecture','lab','assignment','holiday','other') NOT NULL DEFAULT 'other',
  event_date   DATE                NOT NULL,
  start_time   TIME                DEFAULT NULL,
  end_time     TIME                DEFAULT NULL,
  venue        VARCHAR(255)        DEFAULT NULL,
  course_code  VARCHAR(30)         DEFAULT NULL,
  notes        TEXT                DEFAULT NULL,
  source       ENUM('pdf','manual','moodle') NOT NULL DEFAULT 'manual',
  created_at   DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (pdf_id) REFERENCES pdf_uploads(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ── Tasks ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED        NOT NULL,
  title        VARCHAR(512)        NOT NULL,
  course_code  VARCHAR(30)         DEFAULT NULL,
  task_type    ENUM('assignment','lab','study','fyp','quiz','personal','other') NOT NULL DEFAULT 'other',
  priority     ENUM('High','Med','Low') NOT NULL DEFAULT 'Med',
  due_date     DATE                DEFAULT NULL,
  completed    TINYINT(1)          NOT NULL DEFAULT 0,
  completed_at DATETIME            DEFAULT NULL,
  notes        TEXT                DEFAULT NULL,
  created_at   DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── GPA records ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gpa_records (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED        NOT NULL,
  semester     VARCHAR(30)         NOT NULL,
  course_code  VARCHAR(30)         NOT NULL,
  course_name  VARCHAR(255)        NOT NULL,
  credit_hours TINYINT UNSIGNED    NOT NULL,
  grade        VARCHAR(3)          DEFAULT NULL,
  grade_point  DECIMAL(3,2)        DEFAULT NULL,
  marks        DECIMAL(5,2)        DEFAULT NULL,
  created_at   DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── Notifications ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED        NOT NULL,
  title        VARCHAR(255)        NOT NULL,
  body         TEXT                NOT NULL,
  type         ENUM('deadline','clash','reminder','system') NOT NULL DEFAULT 'reminder',
  is_read      TINYINT(1)          NOT NULL DEFAULT 0,
  created_at   DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── Seed: demo user (password = "unihub123") ─────────────────
INSERT IGNORE INTO users (name, email, password, student_id, phone)
VALUES (
  'Syed Zulkifli',
  'zulkifli@student.unihub.edu.my',
  '$2b$10$qTDx7FDZQ6wGhh7MPXB7BO6y5TnoVKLHk9JKKG.Fx9j5cO5eKRv4a',
  '52213224368',
  '0135680636'
);