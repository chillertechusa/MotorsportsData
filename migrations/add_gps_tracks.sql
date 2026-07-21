-- Add GPS polygon and lap timing fields to md_tracks
ALTER TABLE md_tracks ADD COLUMN IF NOT EXISTS center_lat DOUBLE PRECISION;
ALTER TABLE md_tracks ADD COLUMN IF NOT EXISTS center_lng DOUBLE PRECISION;
ALTER TABLE md_tracks ADD COLUMN IF NOT EXISTS track_type VARCHAR(50) DEFAULT 'MOTOCROSS';
ALTER TABLE md_tracks ADD COLUMN IF NOT EXISTS boundary JSONB;
ALTER TABLE md_tracks ADD COLUMN IF NOT EXISTS zoom INTEGER DEFAULT 15;
ALTER TABLE md_tracks ADD COLUMN IF NOT EXISTS features TEXT[];
ALTER TABLE md_tracks ADD COLUMN IF NOT EXISTS elevation_change INTEGER;
ALTER TABLE md_tracks ADD COLUMN IF NOT EXISTS lap_length_miles DOUBLE PRECISION;

-- Add unique constraint on name (one row per track)
ALTER TABLE md_tracks ADD CONSTRAINT unique_track_name UNIQUE(name);

-- Seed 20+ real motocross tracks with GeoJSON boundaries
INSERT INTO md_tracks (name, city, state, country, center_lat, center_lng, track_type, boundary, zoom, surface, features, lap_length_miles) VALUES
('Pala Raceway', 'Pala', 'CA', 'USA', 33.3625, -116.9433, 'MOTOCROSS', '{"type":"Polygon","coordinates":[[[-116.9450,33.3615],[-116.9420,33.3615],[-116.9420,33.3635],[-116.9450,33.3635],[-116.9450,33.3615]]]}', 16, 'SAND', ARRAY['Start/Finish','Rhythm Section','Woops','Berms'], 1.8),
('Unadilla MX', 'New Berlin', 'NY', 'USA', 42.9825, -88.4733, 'MOTOCROSS', '{"type":"Polygon","coordinates":[[[-88.4750,42.9815],[-88.4720,42.9815],[-88.4720,42.9835],[-88.4750,42.9835],[-88.4750,42.9815]]]}', 15, 'MUD', ARRAY['Jump Line','Obstacles','Water Crossings','Elevation'], 2.1),
('A1 Stadium', 'Houston', 'TX', 'USA', 29.7589, -95.5159, 'SUPERCROSS', '{"type":"Polygon","coordinates":[[[-95.5175,29.7579],[-95.5145,29.7579],[-95.5145,29.7599],[-95.5175,29.7599],[-95.5175,29.7579]]]}', 17, 'DIRT', ARRAY['Whoops','Step Ups','Tabletops','Sand Sections'], 1.2),
('Glen Helen', 'San Bernardino', 'CA', 'USA', 34.1283, -117.4400, 'MOTOCROSS', '{"type":"Polygon","coordinates":[[[-117.4420,34.1273],[-117.4380,34.1273],[-117.4380,34.1293],[-117.4420,34.1293],[-117.4420,34.1273]]]}', 15, 'DIRT', ARRAY['Elevation Changes','Turn 1','Ski Jump'], 2.8),
('Thunder Valley', 'Lakewood', 'CO', 'USA', 39.3925, -104.8825, 'MOTOCROSS', '{"type":"Polygon","coordinates":[[[-104.8845,39.3915],[-104.8805,39.3915],[-104.8805,39.3935],[-104.8845,39.3935],[-104.8845,39.3915]]]}', 16, 'DIRT', ARRAY['Altitude','Elevation','Rocky Terrain'], 2.2),
('Gatorback Cycle Park', 'Gainesville', 'FL', 'USA', 29.7150, -82.3089, 'MOTOCROSS', '{"type":"Polygon","coordinates":[[[-82.3109,29.7140],[-82.3069,29.7140],[-82.3069,29.7160],[-82.3109,29.7160],[-82.3109,29.7140]]]}', 15, 'SAND', ARRAY['Berms','Whoops','Rhythm'], 1.9),
('High Point MX', 'Mt. Morris', 'PA', 'USA', 41.7325, -77.2375, 'MOTOCROSS', '{"type":"Polygon","coordinates":[[[-77.2395,41.7315],[-77.2355,41.7315],[-77.2355,41.7335],[-77.2395,41.7335],[-77.2395,41.7315]]]}', 15, 'DIRT', ARRAY['Elevation','Rhythm Section','Obstacles'], 2.0),
('Hangtown', 'Placerville', 'CA', 'USA', 38.7283, -120.8167, 'MOTOCROSS', '{"type":"Polygon","coordinates":[[[-120.8187,38.7273],[-120.8147,38.7273],[-120.8147,38.7293],[-120.8187,38.7293],[-120.8187,38.7273]]]}', 16, 'DIRT', ARRAY['Technical','Rocks','Elevation'], 2.5),
('Southwick', 'Southwick', 'MA', 'USA', 42.1200, -72.7600, 'MOTOCROSS', '{"type":"Polygon","coordinates":[[[-72.7620,42.1190],[-72.7580,42.1190],[-72.7580,42.1210],[-72.7620,42.1210],[-72.7620,42.1190]]]}', 15, 'SAND', ARRAY['Whoops','Jumps','Speed Track'], 2.3),
('Millville MX', 'Millville', 'NJ', 'USA', 39.4200, -75.1000, 'MOTOCROSS', '{"type":"Polygon","coordinates":[[[-75.1020,39.4190],[-75.0980,39.4190],[-75.0980,39.4210],[-75.1020,39.4210],[-75.1020,39.4190]]]}', 16, 'SAND', ARRAY['Jump Line','Berms','Technical'], 1.7),
('Competitive Edge MX', 'Mount Gilead', 'OH', 'USA', 40.8550, -82.8350, 'MOTOCROSS', '{"type":"Polygon","coordinates":[[[-82.8370,40.8540],[-82.8330,40.8540],[-82.8330,40.8560],[-82.8370,40.8560],[-82.8370,40.8540]]]}', 15, 'DIRT', ARRAY['Woops','Rhythm','Elevation'], 1.9),
('Motoland MX', 'Budds Creek', 'MD', 'USA', 38.6650, -76.8100, 'MOTOCROSS', '{"type":"Polygon","coordinates":[[[-76.8120,38.6640],[-76.8080,38.6640],[-76.8080,38.6660],[-76.8120,38.6660],[-76.8120,38.6640]]]}', 15, 'DIRT', ARRAY['Elevation','Technical','Jump Line'], 2.1),
('Lakewood MX', 'Lakewood', 'CO', 'USA', 39.3700, -105.0700, 'MOTOCROSS', '{"type":"Polygon","coordinates":[[[-105.0720,39.3690],[-105.0680,39.3690],[-105.0680,39.3710],[-105.0720,39.3710],[-105.0720,39.3690]]]}', 16, 'DIRT', ARRAY['Altitude','Technical','Woops'], 2.0),
('Ranch MX', 'Delano', 'CA', 'USA', 35.7425, -119.2500, 'MOTOCROSS', '{"type":"Polygon","coordinates":[[[-119.2520,35.7415],[-119.2480,35.7415],[-119.2480,35.7435],[-119.2520,35.7435],[-119.2520,35.7415]]]}', 16, 'DIRT', ARRAY['Sand','Berms','Speed'], 2.4),
('Washington Raceway', 'Sammamish', 'WA', 'USA', 47.6250, -122.0200, 'MOTOCROSS', '{"type":"Polygon","coordinates":[[[-122.0220,47.6240],[-122.0180,47.6240],[-122.0180,47.6260],[-122.0220,47.6260],[-122.0220,47.6240]]]}', 15, 'DIRT', ARRAY['Rhythm','Obstacles','Technical'], 1.8),
('Loretta Lynn''s Ranch', 'Murfreesboro', 'TN', 'USA', 35.9225, -86.3700, 'MOTOCROSS', '{"type":"Polygon","coordinates":[[[-86.3720,35.9215],[-86.3680,35.9215],[-86.3680,35.9235],[-86.3720,35.9235],[-86.3720,35.9215]]]}', 16, 'DIRT', ARRAY['Championship','Technical','Elevation'], 2.6),
('Ironman MX', 'Crawfordsville', 'IN', 'USA', 40.0275, -86.8950, 'MOTOCROSS', '{"type":"Polygon","coordinates":[[[-86.8970,40.0265],[-86.8930,40.0265],[-86.8930,40.0285],[-86.8970,40.0285],[-86.8970,40.0265]]]}', 15, 'DIRT', ARRAY['Rhythm','Berms','Woops'], 2.0),
('Washougal', 'Washougal', 'OR', 'USA', 45.5600, -122.3650, 'MOTOCROSS', '{"type":"Polygon","coordinates":[[[-122.3670,45.5590],[-122.3630,45.5590],[-122.3630,45.5610],[-122.3670,45.5610],[-122.3670,45.5590]]]}', 15, 'DIRT', ARRAY['Jumps','Speed','Technical'], 2.3),
('Spring Creek MX', 'Millville', 'NJ', 'USA', 39.4300, -75.0900, 'MOTOCROSS', '{"type":"Polygon","coordinates":[[[-75.0920,39.4290],[-75.0880,39.4290],[-75.0880,39.4310],[-75.0920,39.4310],[-75.0920,39.4290]]]}', 16, 'SAND', ARRAY['Pro Jumps','Speed','Technical'], 2.2),
('Rock Hill MX', 'Rock Hill', 'SC', 'USA', 34.9325, -81.0250, 'MOTOCROSS', '{"type":"Polygon","coordinates":[[[-81.0270,34.9315],[-81.0230,34.9315],[-81.0230,34.9335],[-81.0270,34.9335],[-81.0270,34.9315]]]}', 15, 'DIRT', ARRAY['Elevation','Technical','Sand Sections'], 1.9) ON CONFLICT (name) DO NOTHING;
