-- Add private_house boolean field to visits table
ALTER TABLE visits ADD COLUMN private_house BOOLEAN NOT NULL DEFAULT FALSE;

-- When private_house is true, floor and apartment can be null
ALTER TABLE visits ALTER COLUMN floor DROP NOT NULL;
ALTER TABLE visits ALTER COLUMN apartment DROP NOT NULL;
