-- Inserting users
INSERT INTO users (username, password, is_active) VALUES 
('customer_support@example.com', '$2a$12$ueHwq6TvxZ89.KHevWdupesQpFAj8VRYSjGfOzL1p6QZQy8jbqS3m', TRUE),
('lot_specialist@example.com', '$2a$12$ueHwq6TvxZ89.KHevWdupesQpFAj8VRYSjGfOzL1p6QZQy8jbqS3m', TRUE),
('advertising_specialist@example.com', '$2a$12$ueHwq6TvxZ89.KHevWdupesQpFAj8VRYSjGfOzL1p6QZQy8jbqS3m', TRUE),
('accountant@example.com', '$2a$12$ueHwq6TvxZ89.KHevWdupesQpFAj8VRYSjGfOzL1p6QZQy8jbqS3m', TRUE);

-- Inserting employees
INSERT INTO employees (type, full_name, phone_no, email) VALUES
('CUSTOMER_SUPPORT', 'Customer Support Name', '111-111-1111', 'customer_support@example.com'),
('LOT_SPECIALIST', 'Lot Specialist Name', '333-333-3333', 'lot_specialist@example.com'),
('ADVERTISING_SPECIALIST', 'Advertising Specialist Name', '444-444-4444', 'advertising_specialist@example.com'),
('ACCOUNTANT', 'Accountant Name', '555-555-5555', 'accountant@example.com');

-- Inserting business users
INSERT INTO users (username, password, is_active) VALUES 
('advertiser@example.com', '$2a$12$ueHwq6TvxZ89.KHevWdupesQpFAj8VRYSjGfOzL1p6QZQy8jbqS3m', TRUE),
('business@example.com', '$2a$12$ueHwq6TvxZ89.KHevWdupesQpFAj8VRYSjGfOzL1p6QZQy8jbqS3m', TRUE);

-- Inserting businesses with stripe_customer_id
INSERT INTO business (email, name, address, phone_no, type, stripe_customer_id) VALUES
('advertiser@example.com', 'Advertiser Business Inc.', '123 Advertiser St.', '666-666-6666', 'ADVERTISERS', 'cus_OmI33gnfCxqxG6'),
('business@example.com', 'General Business Corp.', '456 Business Ave.', '777-777-7777', 'BUSINESS', 'cus_OmI4R9FT0VEl3c');

-- Inserts parking lots
INSERT INTO lotmetadata (id, name, url_name, gps_coordinates, city, state, zip, owner_id)  VALUES 
-- Real parking lot that really recognizes spaces
(1, 'Collingwood Town', 'colltown', '44.5013,-80.2167', 'Collingwood', 'ON', NULL, (SELECT id FROM business WHERE email = 'business@example.com')),
-- Filler data for testing lot search tools
(2, '(fake lot) The Beefy Beagle Barbecue', 'beeflot', '40.5940,-74.1647', 'Staten Island', 'NY', '10314', NULL),
(3, '(fake lot) Cereal Killer Café', 'cerealot', '40.7001,-73.8983', 'Queens', 'NY', '11385', NULL),
(4, '(fake lot) Jurassic Pork BBQ', 'porklot', '40.7506,-73.9353', 'Long Island City', 'NY', '11101', NULL),
(5, '(fake lot) Latté Da Coffee House', 'lattlot', '40.8198,-73.8221', 'Bronx', 'NY', '10465', NULL);

-- Associates cameras with lots
INSERT INTO cammetadata (name, lot_id) VALUES ('colltown', '1');