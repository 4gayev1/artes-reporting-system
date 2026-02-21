CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY,
  type VARCHAR(50) DEFAULT 'other',
  name VARCHAR(255) NOT NULL,
  minio_url TEXT NOT NULL,
  report_url TEXT NOT NULL,
  project VARCHAR(100) DEFAULT 'other',
  upload_date TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS status (
  id UUID PRIMARY KEY REFERENCES reports(id) ON DELETE CASCADE,
  failed          INTEGER DEFAULT 0,
  broken          INTEGER DEFAULT 0,
  passed          INTEGER DEFAULT 0,
  skipped         INTEGER DEFAULT 0,
  unknown         INTEGER DEFAULT 0,
  pipeline_status INTEGER DEFAULT 0,
  pipeline_url         VARCHAR(255),
  pipeline_name        VARCHAR(100),
  pipeline_build_order INTEGER
);

