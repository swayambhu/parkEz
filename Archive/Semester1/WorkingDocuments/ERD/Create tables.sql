CREATE TABLE IF NOT EXISTS Authentication(
	username VARCHAR(50) PRIMARY KEY,
	password VARCHAR(100) NOT NULL,
	created_at TIMESTAMP default current_timestamp
);

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS employee(
	id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
	full_name VARCHAR(50) NOT NULL,
	phone_no BIGINT NOT NULL,
	joining_date DATE NOT NULL,
	resign_date DATE,
	email_id VARCHAR(50) NOT NULL,
	addresss TEXT,
	CONSTRAINT fk_authentication FOREIGN KEY(email_id) REFERENCES Authentication(username)
);

CREATE TABLE IF NOT EXISTS department(
	id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
	dept_name VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS emp_dept(
	emp_id UUID  PRIMARY KEY,
	dept_id UUID NOT NULL,
	CONSTRAINT fk_employee FOREIGN KEY(emp_id) REFERENCES employee(id),
	CONSTRAINT fk_department FOREIGN KEY(dept_id) REFERENCES department(id) 
);

CREATE TABLE IF NOT EXISTS business(
	id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
	name VARCHAR(100) NOT NULL,
	contact_no bigint NOT NULL,
	address TEXT
);

CREATE TABLE IF NOT EXISTS advertisers(
	id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
	name VARCHAR(100) NOT NULL,
	contact_no bigint NOT NULL,
	address TEXT
);


CREATE TABLE IF NOT EXISTS external_users(
	id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
	full_name VARCHAR(50) NOT NULL,
	phone_no BIGINT NOT NULL,
	email_id VARCHAR(50) NOT NULL,
	business_id UUID,
	advertisers_id UUID,
	CONSTRAINT fk_authentication FOREIGN KEY(email_id) REFERENCES Authentication(username),
	CONSTRAINT fk_business FOREIGN KEY(business_id) REFERENCES business(id),
	CONSTRAINT fk_advertisers FOREIGN KEY(advertisers_id) REFERENCES advertisers(id)
);


