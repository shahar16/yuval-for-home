-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Visit days table
CREATE TABLE visit_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  area TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, area)
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Visits table
CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_day_id UUID NOT NULL REFERENCES visit_days(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  floor TEXT NOT NULL,
  apartment TEXT NOT NULL,
  building_code TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'bit')),
  is_paid BOOLEAN NOT NULL DEFAULT FALSE,
  total_price INTEGER NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Visit products junction table
CREATE TABLE visit_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(visit_id, product_id)
);

-- Indexes for performance
CREATE INDEX idx_visits_visit_day ON visits(visit_day_id);
CREATE INDEX idx_visits_created_at ON visits(created_at);
CREATE INDEX idx_visit_days_date ON visit_days(date);
CREATE INDEX idx_visit_products_visit ON visit_products(visit_id);

-- Seed initial users
INSERT INTO users (name) VALUES
  ('יובל'),
  ('שרה'),
  ('דוד');

-- Seed sample products
INSERT INTO products (name) VALUES
  ('סל מתנה א'),
  ('פרחים'),
  ('יין'),
  ('שוקולד');
