-- ACEP Database Schema Migration
-- Run this in your Supabase SQL editor

-- Table: power_plants
CREATE TABLE IF NOT EXISTS power_plants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  kw_per_hour NUMERIC NOT NULL,
  quantity INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table: storage_units
CREATE TABLE IF NOT EXISTS storage_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  capacity_kwh NUMERIC NOT NULL,
  current_kwh NUMERIC DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table: weather_forecast
CREATE TABLE IF NOT EXISTS weather_forecast (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  location TEXT NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  solar_radiation JSONB,
  cloud_cover JSONB,
  predicted_kwh NUMERIC,
  effective_hours NUMERIC,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(date, location)
);

-- Table: locations (for future location management)
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default location (Kariangau, Balikpapan)
INSERT INTO locations (name, latitude, longitude, is_default) 
VALUES ('Kariangau, Balikpapan', -1.256, 116.822, TRUE)
ON CONFLICT DO NOTHING;

-- Table: users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  full_name TEXT,
  role TEXT DEFAULT 'demo',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert demo account
INSERT INTO users (email, full_name, role)
VALUES ('demo@acep.app', 'ACEP Demo Account', 'demo')
ON CONFLICT (email) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_weather_forecast_date ON weather_forecast(date);
CREATE INDEX IF NOT EXISTS idx_weather_forecast_location ON weather_forecast(location);
CREATE INDEX IF NOT EXISTS idx_power_plants_created_at ON power_plants(created_at);
CREATE INDEX IF NOT EXISTS idx_storage_units_created_at ON storage_units(created_at);
