-- Make building_code optional in visits table
ALTER TABLE visits ALTER COLUMN building_code DROP NOT NULL;
