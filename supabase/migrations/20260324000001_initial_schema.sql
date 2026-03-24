-- Users table (worker names + admin)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'worker')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Visit days (date + area)
CREATE TABLE visit_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  area TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, area)
);

-- Products catalog
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Visits (main table)
CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_day_id UUID NOT NULL REFERENCES visit_days(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  floor TEXT,
  apartment TEXT,
  building_code TEXT,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'bit')),
  is_paid BOOLEAN DEFAULT FALSE,
  total_price INTEGER NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Visit products (many-to-many with quantity)
CREATE TABLE visit_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(visit_id, product_id)
);

-- Indexes for common queries
CREATE INDEX idx_visits_visit_day ON visits(visit_day_id);
CREATE INDEX idx_visits_created_by ON visits(created_by);
CREATE INDEX idx_visit_products_visit ON visit_products(visit_id);
CREATE INDEX idx_visit_products_product ON visit_products(product_id);
CREATE INDEX idx_visit_days_date ON visit_days(date);
