-- Create schedule table for device assignments and energy calculations
CREATE TABLE IF NOT EXISTS schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    device_id UUID NOT NULL,
    device_name VARCHAR(255) NOT NULL,
    device_type VARCHAR(50) NOT NULL, -- 'consumption_tool' or 'power_plant'
    hours_used DECIMAL(5,2) NOT NULL DEFAULT 0,
    energy_consumption DECIMAL(15,2) NOT NULL DEFAULT 0, -- in kWh
    energy_generation DECIMAL(15,2) NOT NULL DEFAULT 0, -- in kWh
    is_recurring BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Composite unique constraint for user, date, and device
    UNIQUE(user_id, date, device_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_schedules_user_date ON schedules(user_id, date);
CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(date);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_schedules_updated_at 
    BEFORE UPDATE ON schedules 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE schedules IS 'Stores daily device assignments and energy calculations for each user';
COMMENT ON COLUMN schedules.device_type IS 'Type of device: consumption_tool or power_plant';
COMMENT ON COLUMN schedules.hours_used IS 'Number of hours the device will be used on this date';
COMMENT ON COLUMN schedules.energy_consumption IS 'Total energy consumption in kWh for this device on this date';
COMMENT ON COLUMN schedules.energy_generation IS 'Total energy generation in kWh for this device on this date';
COMMENT ON COLUMN schedules.is_recurring IS 'Whether this schedule repeats daily';
