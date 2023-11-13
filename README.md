# ParkEz (current QA branch)
## Live Demo: https://qa.gruevy.com/

ParkEZ is a parking lot monitoring platform with different webpages for both the public and parking lot operators to monitor lot occupancy, provide security, stop overparking and recommend customers the best spots. Advertisers are also able to place ads on the public facing webpages. This repository is part of a 2-semester course progression, and it currently implements functional requirement module 1: Account Management, with all its subfeatures. The remaining modules will be implemented in the next semester's class.




## Table of Contents

1. [Introduction](#introduction)
2. [Features](#features)
3. [Implemented Module](#implemented-module)
4. [Upcoming Modules](#upcoming-modules)
5. [Usage Scenarios](#usage-scenarios)
6. [Revenue Generation](#revenue-generation)
7. [Screenshots](#screenshots)

## Introduction

ParkEz utilizes AI-powered analysis of parking lot camera footage to offer value to parking lot owners, local businesses, and customers. The platform is designed to help businesses maximize revenue, minimize crime, and ease the burden of parking lot management.

## Features

ParkEz consists of 5 major functional requirement modules:

1. **Account Management**: Authenticate and create account.
2. **Parking Lot Management**: All functions for parking lot operators and employees at ParkEZ, assisting them with occupancy tracking, accessing archived footage, over parking detection notification, and license plate tracking.
3. **Parking Lot Status**: Allows users to check parking lot occupancy status, find optimal spaces, and locate parking lots using ParkEZ. Also allows business owners to include this information on their website.
4. **Advertising Management**: Enables local businesses to post and modify ads on ParkEZ's parking lot webpages and view impressions and clicks on their ads.
5. **Payment Gateway**: A module for subscribers (advertisers and parking lot managers) to enter payment method and have their payment validated.

## Implemented Requirements

### Module 1: Account Management
- **1.1 Authenticate Account**: Authentication pages for subscribed customers to log in (both lot operators and advertisers).
- **1.2 Create Account**: A page for users to create an account.

### Module 2: Parking Lot Management
- **2.1 Track Occupancy**: Tracking of how many spots are taken at what times, presented for individuals who manage parking lots

### Module 3: Parking Lot Status
- **3.1 Search and Select Lot**: Unsubscribed users can browse and search parking lots using ParkEZ. 
- **3.2 View Occupancy**: Shows unsubscribed users most optimal space available and occupancy of selected parkng lot. View includes ads.
- **3.3 Access Occupancy Remotely**: A non GUI element offers occupancy status data through an interface Parking Lot Managers can use with their website.

### Module 4: Advertising Management
- **4.1 Create Ad**: Uploads ads.
- **4.2 Modify Ad**: Edits existing ad's content.
- **4.3 View Ad Statistics**: View impressions and clicks of placed ads.

### Module 5: Payment Gateway
- **5.1 Define Payment Method**: Users decide how they pay for their subscription (ad or lot manger).
- **5.2 Validate Payment**: Checks that customer payment method can be billed correctly.


## Upcoming Requirements
- **2.2 Access Footage Archive**: Lot owners can access archived footage of their parking lots.
- **2.3 Detect Overparking**: Notification of whenever a space is occupied longer than a specified period of time.

## Usage Scenarios

ParkEZ has various usage scenarios for external customers and internal users. External customers include parking customers, business owners, and park lot operators, while internal users consist of employees in various roles, such as customer support.

## Revenue Generation

ParkEZ generates revenue through the following streams:
1. Monthly Subscription: Parking lot operators and advertisers pay a monthly fee to use ParkEZ's features.
2. Advertisement Fees: Local businesses pay to advertise on ParkEZ's parking lot webpages.
