# Project Overview - FullStack Storage and Booking App

## Introduction

The FullStack Storage and Booking App is a comprehensive platform designed to manage and facilitate the booking of physical storage items. The system allows users to browse available storage options across different locations, make reservations, and manage their bookings through a streamlined interface. The application features multi-role access control, a robust payment system, and detailed tracking of inventory and orders.

## System Architecture

The application follows a modern full-stack architecture with the following components:

- **Frontend**: Client-side application built for responsive web access
- **Backend API**: Server-side logic handling business operations
- **Supabase Integration**: For database, authentication, and storage

### Architecture Diagram

```
┌─────────────┐      ┌──────────────┐      ┌─────────────────┐
│ Frontend    │────▶│ Backend API   │────▶│ Supabase        │
└─────────────┘      └──────────────┘      │ - Database      │
     ▲                         ▲           │ - Authentication│
     │                         │           │ - Storage       │
     └─────────────────────────┘           └─────────────────┘
```

## Core Features

For Users

- **Browse Storage Options**: View available storage items
- **Booking System**: Reserve storage items for specific time periods
- **User Account Management**: User data and preferences
- **Order History**: Track current and past bookings
- **Multilingual Support**: Full English/Finnish translation across the entire application interface
  <!-- - **Review System**: Rate and review storage experiences //TODO: to be added later -->
  <!-- - **Saved Lists**: Create and manage lists of favorite storage options //TODO: to be added later -->

For Administrators

- **Inventory Management**: Track storage items across locations
- **Order Processing**: Manage booking requests and confirmations
- **User Management**: Administrative control over user accounts

## Data Model

The application is built around a comprehensive data model with key entities:

- **Storage Locations**: Physical locations where storage items are available
- **Storage Items**: Individual items available for booking
- **User Profiles**: Extended user information beyond basic authentication
- **Orders & Order Items**: Bookings and their line items
<!-- - **Reviews**: User feedback on storage items//TODO: to be added later -->

## Technology Stack

- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Security**: Row-Level Security policies in PostgreSQL
- **API Layer**: RESTful API endpoints
- **Frontend Framework**: React with TypeScript
- **State Management**: Redux Toolkit
- **Build Tool**: Vite for fast development and building
- **Testing**: Cypress for end-to-end testing, Jest for unit testing, Stryker for mutation testing
- **Deployment**: Azure for hosting the backend and frontend
- **Development Tools**: Node.js (v18 or higher recommended), npm
- **Version Control**: Git for source code management
- **Documentation**: Markdown for project documentation
- **CI/CD**: GitHub Actions for continuous integration and deployment
- **UI Libraries**: Shadcn/ui for UI components and styling

## Security Model

The application implements a robust security model with three primary user roles:

- **User**: Standard access for booking and managing personal orders
- **Admin**: Extended privileges for managing inventory and user accounts
- **SuperVera**: System-wide administrative access with complete control

Row-Level Security ensures data protection at the database level, restricting access based on user identity and role.

## Future Roadmap

<!-- TODO: write more -->

- Review System
- Saved Lists
- Mobile application development
- Performance optimizations
- User feedback and feature requests
- Continuous improvement based on user needs
