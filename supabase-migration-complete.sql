-- ACEP Complete Database Schema Migration
-- Drop all existing tables and create new structure

-- Drop existing tables (in reverse order of dependencies)
DROP TABLE IF EXISTS weather_forecast CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS storage_units CASCADE;
DROP TABLE IF EXISTS power_plants CASCADE;
DROP TABLE IF EXISTS consumption_tools CASCADE;
DROP TABLE IF EXISTS chat_history CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Table: users (updated with location attributes)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'demo',
  latitude NUMERIC DEFAULT -1.256,
  longitude NUMERIC DEFAULT 116.822,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table: consumption_tools (renamed from tools)
CREATE TABLE consumption_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  kw_per_hour NUMERIC NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table: power_plants
CREATE TABLE power_plants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  kw_per_hour NUMERIC NOT NULL,
  quantity INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table: storage_units
CREATE TABLE storage_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  capacity_kwh NUMERIC NOT NULL,
  current_kwh NUMERIC DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table: chat_history
CREATE TABLE chat_history (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  chat TEXT NOT NULL,
  output TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert demo account
INSERT INTO users (email, full_name, role, latitude, longitude)
VALUES ('demo@acep.app', 'ACEP Demo Account', 'demo', -1.256, 116.822)
ON CONFLICT (email) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_consumption_tools_user_id ON consumption_tools(user_id);
CREATE INDEX IF NOT EXISTS idx_power_plants_user_id ON power_plants(user_id);
CREATE INDEX IF NOT EXISTS idx_storage_units_user_id ON storage_units(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON chat_history(created_at);
