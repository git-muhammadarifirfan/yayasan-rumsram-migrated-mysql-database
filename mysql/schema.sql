-- MySQL schema for Rumsram
-- Tested with MySQL 8+

CREATE TABLE IF NOT EXISTS site_settings (
  id TINYINT NOT NULL PRIMARY KEY,
  org_name VARCHAR(200) NOT NULL,
  tagline VARCHAR(240) NULL,
  hero_title VARCHAR(240) NULL,
  hero_subtitle TEXT NULL,
  donation_cta_label VARCHAR(120) NULL,
  donation_link TEXT NULL,
  about_short TEXT NULL,
  about_long MEDIUMTEXT NULL,
  vision TEXT NULL,
  mission_items JSON NULL,
  values_items JSON NULL,
  address TEXT NULL,
  phone VARCHAR(80) NULL,
  email VARCHAR(160) NULL,
  social JSON NULL,
  logo_url LONGTEXT NULL,
  hero_image_url LONGTEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS programs (
  id CHAR(36) NOT NULL PRIMARY KEY,
  title VARCHAR(220) NOT NULL,
  slug VARCHAR(220) NOT NULL,
  excerpt TEXT NULL,
  content_md MEDIUMTEXT NULL,
  cover_url LONGTEXT NULL,
  gallery_urls JSON NULL,
  status ENUM('draft','published') NOT NULL DEFAULT 'draft',
  sort_order INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_programs_slug (slug)
);

CREATE TABLE IF NOT EXISTS events (
  id CHAR(36) NOT NULL PRIMARY KEY,
  title VARCHAR(220) NOT NULL,
  slug VARCHAR(220) NOT NULL,
  excerpt TEXT NULL,
  content_md MEDIUMTEXT NULL,
  event_date DATE NULL,
  location VARCHAR(240) NULL,
  cover_url LONGTEXT NULL,
  status ENUM('draft','published') NOT NULL DEFAULT 'draft',
  sort_order INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_events_slug (slug)
);

CREATE TABLE IF NOT EXISTS posts (
  id CHAR(36) NOT NULL PRIMARY KEY,
  title VARCHAR(240) NOT NULL,
  slug VARCHAR(240) NOT NULL,
  excerpt TEXT NULL,
  content_md MEDIUMTEXT NULL,
  cover_url LONGTEXT NULL,
  status ENUM('draft','published') NOT NULL DEFAULT 'draft',
  published_at DATE NULL,
  category VARCHAR(80) NULL,
  author_id CHAR(36) NULL,
  author_email VARCHAR(160) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_posts_slug (slug)
);

CREATE TABLE IF NOT EXISTS post_comments (
  id CHAR(36) NOT NULL PRIMARY KEY,
  post_id CHAR(36) NOT NULL,
  author_name VARCHAR(80) NOT NULL,
  author_email VARCHAR(160) NULL,
  content TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_post_comments_post_id (post_id),
  CONSTRAINT fk_post_comments_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS gallery_items (
  id CHAR(36) NOT NULL PRIMARY KEY,
  title VARCHAR(200) NULL,
  category VARCHAR(80) NULL,
  image_url LONGTEXT NOT NULL,
  sort_order INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS team_members (
  id CHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  role_title VARCHAR(200) NULL,
  bio TEXT NULL,
  photo_url LONGTEXT NULL,
  sort_order INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admins (
  id CHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(200) NULL,
  email VARCHAR(160) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','editor') NOT NULL DEFAULT 'admin',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_admins_email (email)
);
