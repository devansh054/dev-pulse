-- DevPulse Database Schema for Supabase
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    github_id INTEGER UNIQUE,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    name VARCHAR(255),
    avatar_url TEXT,
    bio TEXT,
    location VARCHAR(255),
    company VARCHAR(255),
    blog VARCHAR(255),
    twitter_username VARCHAR(255),
    public_repos INTEGER,
    public_gists INTEGER,
    followers INTEGER,
    following INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- Projects table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    github_repo VARCHAR(255),
    language VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    is_private BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily metrics table
CREATE TABLE daily_metrics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    commits_count INTEGER DEFAULT 0,
    prs_opened INTEGER DEFAULT 0,
    prs_reviewed INTEGER DEFAULT 0,
    issues_closed INTEGER DEFAULT 0,
    lines_added INTEGER DEFAULT 0,
    lines_removed INTEGER DEFAULT 0,
    coding_time_minutes INTEGER DEFAULT 0,
    focus_time_minutes INTEGER DEFAULT 0,
    meeting_time_minutes INTEGER DEFAULT 0,
    late_night_commits INTEGER DEFAULT 0,
    weekend_work BOOLEAN DEFAULT FALSE,
    productivity_score DECIMAL(5,2),
    stress_level DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Goals table
CREATE TABLE goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    target_value INTEGER NOT NULL,
    current_value INTEGER DEFAULT 0,
    unit VARCHAR(50) NOT NULL,
    target_date TIMESTAMP WITH TIME ZONE NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insights table
CREATE TABLE insights (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    impact VARCHAR(20) NOT NULL,
    actionable BOOLEAN DEFAULT TRUE,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Teams table
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team members table
CREATE TABLE team_members (
    id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- Team member profiles table
CREATE TABLE team_member_profiles (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL,
    github_username VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar TEXT NOT NULL,
    bio TEXT,
    location VARCHAR(255),
    public_repos INTEGER DEFAULT 0,
    followers INTEGER DEFAULT 0,
    following INTEGER DEFAULT 0,
    commits INTEGER DEFAULT 0,
    pull_requests INTEGER DEFAULT 0,
    issues INTEGER DEFAULT 0,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(owner_id, github_username)
);

-- Activity logs table
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    metadata JSONB,
    repo_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Experiments table
CREATE TABLE experiments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    priority VARCHAR(20) DEFAULT 'medium',
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    estimated_duration INTEGER,
    actual_duration INTEGER,
    tags TEXT[],
    configuration JSONB,
    results JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Experiment benchmarks table
CREATE TABLE experiment_benchmarks (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    experiment_id TEXT NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    metric VARCHAR(100) NOT NULL,
    value DECIMAL(15,6) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    baseline DECIMAL(15,6),
    improvement DECIMAL(8,4),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- Experiment test runs table
CREATE TABLE experiment_test_runs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    experiment_id TEXT NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER,
    results JSONB,
    logs TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Devices table
CREATE TABLE devices (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'offline',
    specs JSONB,
    cpu_usage DECIMAL(5,2),
    memory_usage DECIMAL(10,2),
    storage_usage DECIMAL(5,2),
    location VARCHAR(255),
    ip_address INET,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Device metrics table
CREATE TABLE device_metrics (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    device_id TEXT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cpu_usage DECIMAL(5,2),
    memory_usage DECIMAL(10,2),
    storage_usage DECIMAL(5,2),
    network_in DECIMAL(10,2),
    network_out DECIMAL(10,2),
    temperature DECIMAL(5,2)
);

-- Prisma migrations table (for compatibility)
CREATE TABLE _prisma_migrations (
    id VARCHAR(36) PRIMARY KEY,
    checksum VARCHAR(64) NOT NULL,
    finished_at TIMESTAMP WITH TIME ZONE,
    migration_name VARCHAR(255) NOT NULL,
    logs TEXT,
    rolled_back_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    applied_steps_count INTEGER NOT NULL DEFAULT 0
);

-- Create indexes for better performance
CREATE INDEX idx_users_github_id ON users(github_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_daily_metrics_user_date ON daily_metrics(user_id, date);
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_insights_user_id ON insights(user_id);
CREATE INDEX idx_insights_created_at ON insights(created_at);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX idx_experiments_user_id ON experiments(user_id);
CREATE INDEX idx_devices_user_id ON devices(user_id);
CREATE INDEX idx_device_metrics_device_id ON device_metrics(device_id);
CREATE INDEX idx_device_metrics_timestamp ON device_metrics(timestamp);

-- Insert initial migration record
INSERT INTO _prisma_migrations (id, checksum, migration_name, applied_steps_count, finished_at)
VALUES (
    gen_random_uuid()::text,
    'manual_supabase_setup',
    'manual_supabase_schema_creation',
    1,
    NOW()
);

-- Create sample data for testing (optional)
INSERT INTO users (username, email, name, github_id) VALUES 
('demo-user', 'demo@devpulse.com', 'Demo User', 999999);

-- Success message
SELECT 'DevPulse database schema created successfully!' as message;
