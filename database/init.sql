-- Textile ERP Database Initialization
-- This file initializes the PostgreSQL database for the Textile ERP system

-- Create the database (if not exists)
-- Note: The database is already created by the POSTGRES_DB environment variable

-- Create user if not exists (done by environment variables)
-- User 'erp_user' is created with password from POSTGRES_PASSWORD

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE textile_erp TO erp_user;

-- Set timezone
SET timezone = 'UTC';

-- Enable extensions that might be useful
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Log successful initialization
\echo 'Database initialization completed successfully'