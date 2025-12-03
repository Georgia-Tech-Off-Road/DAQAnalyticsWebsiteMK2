CREATE TABLE IF NOT EXISTS Location (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    competition INTEGER CHECK(competition IN (0, 1)) NOT NULL,
    created_at TEXT NOT NULL CHECK(created_at IS datetime(created_at, 'auto')),
    updated_at TEXT NOT NULL CHECK(updated_at IS datetime(updated_at, 'auto')),
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    parent_id TEXT REFERENCES Location(id) ON DELETE SET NULL -- Do not delete child locations when parent is deleted
);

CREATE TABLE IF NOT EXISTS Dataset (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL CHECK(date IS datetime(date, 'auto')),
    uploaded_at TEXT NOT NULL CHECK(uploaded_at IS datetime(uploaded_at, 'auto')),
    updated_at TEXT NOT NULL CHECK(updated_at IS datetime(updated_at, 'auto')),
    location_id TEXT REFERENCES Location(id) ON DELETE SET NULL, -- Do not delete datasets when its location is deleted
    vehicle_id TEXT REFERENCES Vehicle(id) ON DELETE SET NULL, -- Do not delete datasets when its vehicle is deleted
    competition INTEGER CHECK(competition IN (0, 1)) -- Make sure competition is a bool (0 = false, 1 = true)
);

CREATE TABLE IF NOT EXISTS Vehicle (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    uploaded_at TEXT NOT NULL CHECK(uploaded_at IS datetime(uploaded_at, 'auto')),
    updated_at TEXT NOT NULL CHECK(updated_at IS datetime(updated_at, 'auto'))
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_location_parent ON Location(parent_id);
CREATE INDEX IF NOT EXISTS idx_dataset_location ON Dataset(location_id);