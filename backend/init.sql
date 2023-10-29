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
('advertiser2@example.com', '$2a$12$ueHwq6TvxZ89.KHevWdupesQpFAj8VRYSjGfOzL1p6QZQy8jbqS3m', TRUE),
('business@example.com', '$2a$12$ueHwq6TvxZ89.KHevWdupesQpFAj8VRYSjGfOzL1p6QZQy8jbqS3m', TRUE);

-- Inserting businesses with stripe_customer_id
INSERT INTO business (email, name, address, phone_no, type, stripe_customer_id) VALUES
('advertiser@example.com', 'Advertiser Business 1 Inc.', '120 Advertiser St.', '444-444-4445', 'ADVERTISERS', 'cus_OmI33gnfCxqxG6'),
('advertiser2@example.com', 'Advertiser Business 2 Inc.', '125 Advertiser St.', '555-555-5556', 'ADVERTISERS', 'cus_OuDNYRF9letOjY'),
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




-- Auto export starts here (Ads, ad-lot associations, images of lots)
COPY public.ad (advert_id, name, start_date, end_date, business_id, url, impressions, clicks, top_banner_image1_path, top_banner_image2_path, top_banner_image3_path, image_change_interval) FROM stdin;
1	Yorktown	2023-09-04	2024-04-04	2	https://www.yorktownny.org/community/north-county-trailway	0	0	app/ads/2/Yorktown_1.jpg	app/ads/2/Yorktown_2.jpg	app/ads/2/Yorktown_3.jpg	3
2	StarOld	2023-10-09	2023-10-27	2	https://www.stardewvalley.net/	0	0	app/ads/2/StarOld_1.jpg	app/ads/2/StarOld_2.jpg	app/ads/2/StarOld_3.jpg	3
3	noir	2023-10-22	2024-02-29	1	https://genesisnoirgame.com/	0	0	app/ads/1/noir_1.jpg	app/ads/1/noir_2.jpg	app/ads/1/noir_3.jpg	2
4	babaisu	2023-10-10	2025-10-28	1	https://hempuli.com/baba/	0	0	app/ads/1/babaisu_1.jpg	app/ads/1/babaisu_2.jpg	app/ads/1/babaisu_3.jpg	3
\.


--
-- Data for Name: ad_lot_association; Type: TABLE DATA; Schema: public; Owner: dev
--

COPY public.ad_lot_association (ad_id, lot_id) FROM stdin;
1	1
1	2
2	1
2	2
2	3
2	4
2	5
3	1
3	2
3	3
4	4
4	3
4	2
4	1
\.


--
-- Data for Name: camimage; Type: TABLE DATA; Schema: public; Owner: dev
--

COPY public.camimage (id, image, "timestamp", camera_name, human_labels, model_labels) FROM stdin;
1	colltown_202310291259.jpg	2023-10-29 12:59:00	colltown	{"b1": true, "b2": true, "b3": true, "b4": true, "b5": true, "b6": true, "b7": true, "b8": true, "b9": true, "b10": true, "b11": true, "b12": true, "b13": true, "b14": true, "b15": true, "b16": true, "a1": true, "a2": true, "a3": true, "a4": true, "a5": true, "a6": true}	{"b1": true, "b2": true, "b3": true, "b4": true, "b5": true, "b6": true, "b7": true, "b8": true, "b9": true, "b10": true, "b11": true, "b12": true, "b13": true, "b14": true, "b15": true, "b16": true, "a1": true, "a2": true, "a3": true, "a4": true, "a5": true, "a6": true}
2	colltown_202310290938.jpg	2023-10-29 09:38:00	colltown	{"b1": true, "b2": false, "b3": true, "b4": false, "b5": false, "b6": false, "b7": false, "b8": false, "b9": false, "b10": false, "b11": false, "b12": true, "b13": false, "b14": false, "b15": false, "b16": false, "a1": true, "a2": true, "a3": true, "a4": true, "a5": true, "a6": true}	{"b1": true, "b2": false, "b3": true, "b4": false, "b5": false, "b6": false, "b7": false, "b8": false, "b9": false, "b10": false, "b11": false, "b12": true, "b13": false, "b14": false, "b15": false, "b16": false, "a1": true, "a2": true, "a3": true, "a4": true, "a5": true, "a6": true}
3	colltown_202310291446.jpg	2023-10-29 14:46:00	colltown	{"b1": true, "b2": true, "b3": true, "b4": true, "b5": true, "b6": true, "b7": true, "b8": true, "b9": true, "b10": true, "b11": true, "b12": true, "b13": true, "b14": true, "b15": true, "b16": true, "a1": true, "a2": true, "a3": true, "a4": true, "a5": true, "a6": true}	{"b1": true, "b2": true, "b3": true, "b4": true, "b5": true, "b6": true, "b7": true, "b8": true, "b9": true, "b10": true, "b11": true, "b12": true, "b13": true, "b14": true, "b15": true, "b16": true, "a1": true, "a2": true, "a3": true, "a4": true, "a5": true, "a6": true}
4	colltown_202310291056.jpg	2023-10-29 10:56:00	colltown	{"b1": true, "b2": true, "b3": true, "b4": true, "b5": true, "b6": true, "b7": true, "b8": true, "b9": true, "b10": true, "b11": false, "b12": false, "b13": false, "b14": true, "b15": true, "b16": false, "a1": true, "a2": true, "a3": true, "a4": false, "a5": false, "a6": false}	{"b1": true, "b2": true, "b3": true, "b4": true, "b5": true, "b6": true, "b7": true, "b8": true, "b9": true, "b10": true, "b11": false, "b12": false, "b13": false, "b14": true, "b15": true, "b16": false, "a1": true, "a2": true, "a3": true, "a4": false, "a5": false, "a6": false}
5	colltown_202310291229.jpg	2023-10-29 12:29:00	colltown	{"b1": true, "b2": false, "b3": false, "b4": true, "b5": true, "b6": true, "b7": true, "b8": true, "b9": true, "b10": true, "b11": true, "b12": true, "b13": true, "b14": true, "b15": true, "b16": true, "a1": true, "a2": true, "a3": true, "a4": true, "a5": true, "a6": true}	{"b1": true, "b2": false, "b3": false, "b4": true, "b5": true, "b6": true, "b7": true, "b8": true, "b9": true, "b10": true, "b11": true, "b12": true, "b13": true, "b14": true, "b15": true, "b16": true, "a1": true, "a2": true, "a3": true, "a4": true, "a5": true, "a6": true}
6	colltown_202310291158.jpg	2023-10-29 11:58:00	colltown	{"b1": true, "b2": true, "b3": true, "b4": true, "b5": true, "b6": true, "b7": true, "b8": true, "b9": true, "b10": true, "b11": true, "b12": true, "b13": true, "b14": false, "b15": true, "b16": true, "a1": true, "a2": true, "a3": true, "a4": true, "a5": true, "a6": true}	{"b1": true, "b2": true, "b3": true, "b4": true, "b5": true, "b6": true, "b7": true, "b8": true, "b9": true, "b10": true, "b11": true, "b12": true, "b13": true, "b14": false, "b15": true, "b16": true, "a1": true, "a2": true, "a3": true, "a4": true, "a5": true, "a6": true}
7	colltown_202310291330.jpg	2023-10-29 13:30:00	colltown	{"b1": true, "b2": true, "b3": true, "b4": true, "b5": true, "b6": true, "b7": true, "b8": true, "b9": true, "b10": true, "b11": true, "b12": true, "b13": true, "b14": true, "b15": true, "b16": true, "a1": true, "a2": true, "a3": true, "a4": true, "a5": true, "a6": true}	{"b1": true, "b2": true, "b3": true, "b4": true, "b5": true, "b6": true, "b7": true, "b8": true, "b9": true, "b10": true, "b11": true, "b12": true, "b13": true, "b14": true, "b15": true, "b16": true, "a1": true, "a2": true, "a3": true, "a4": true, "a5": true, "a6": true}
8	colltown_202310291416.jpg	2023-10-29 14:16:00	colltown	{"b1": true, "b2": true, "b3": true, "b4": true, "b5": true, "b6": true, "b7": true, "b8": true, "b9": true, "b10": true, "b11": true, "b12": true, "b13": true, "b14": true, "b15": true, "b16": true, "a1": true, "a2": true, "a3": true, "a4": true, "a5": true, "a6": true}	{"b1": true, "b2": true, "b3": true, "b4": true, "b5": true, "b6": true, "b7": true, "b8": true, "b9": true, "b10": true, "b11": true, "b12": true, "b13": true, "b14": true, "b15": true, "b16": true, "a1": true, "a2": true, "a3": true, "a4": true, "a5": true, "a6": true}
9	colltown_202310291128.jpg	2023-10-29 11:28:00	colltown	{"b1": true, "b2": true, "b3": true, "b4": true, "b5": true, "b6": true, "b7": true, "b8": false, "b9": true, "b10": false, "b11": true, "b12": false, "b13": false, "b14": true, "b15": false, "b16": false, "a1": true, "a2": true, "a3": true, "a4": true, "a5": false, "a6": true}	{"b1": true, "b2": true, "b3": true, "b4": true, "b5": true, "b6": true, "b7": true, "b8": false, "b9": true, "b10": false, "b11": true, "b12": false, "b13": false, "b14": true, "b15": false, "b16": false, "a1": true, "a2": true, "a3": true, "a4": true, "a5": false, "a6": true}
10	colltown_202310291025.jpg	2023-10-29 10:25:00	colltown	{"b1": true, "b2": false, "b3": true, "b4": true, "b5": false, "b6": true, "b7": true, "b8": true, "b9": true, "b10": false, "b11": false, "b12": true, "b13": false, "b14": true, "b15": true, "b16": false, "a1": true, "a2": true, "a3": true, "a4": false, "a5": true, "a6": true}	{"b1": true, "b2": false, "b3": true, "b4": true, "b5": false, "b6": true, "b7": true, "b8": true, "b9": true, "b10": false, "b11": false, "b12": true, "b13": false, "b14": true, "b15": true, "b16": false, "a1": true, "a2": true, "a3": true, "a4": false, "a5": true, "a6": true}
\.


