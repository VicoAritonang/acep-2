-- Update existing schedules table to fix numeric field overflow
-- This script updates the DECIMAL precision for energy fields

-- First, let's check if the table exists and what the current structure is
-- If the table doesn't exist, run the schedule-table.sql first

-- Update the energy_consumption column to allow larger values
ALTER TABLE schedules 
ALTER COLUMN energy_consumption TYPE DECIMAL(15,2);

-- Update the energy_generation column to allow larger values  
ALTER TABLE schedules 
ALTER COLUMN energy_generation TYPE DECIMAL(15,2);

-- Add comments for documentation
COMMENT ON COLUMN schedules.energy_consumption IS 'Total energy consumption in kWh (max 999,999,999,999.99)';
COMMENT ON COLUMN schedules.energy_generation IS 'Total energy generation in kWh (max 999,999,999,999.99)';

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    numeric_precision, 
    numeric_scale 
FROM information_schema.columns 
WHERE table_name = 'schedules' 
AND column_name IN ('energy_consumption', 'energy_generation');
