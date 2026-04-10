# Cryptocurrency Price Prediction Platform

## Overview

This is a full-stack cryptocurrency price prediction platform built with React, Express, and PostgreSQL. The application provides real-time cryptocurrency data, AI-powered price predictions, technical analysis indicators, portfolio management, and price alerts. Users can track market trends, manage watchlists, analyze technical indicators, and receive predictions for various cryptocurrencies.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built with React and TypeScript using a modern component-based architecture:

- **UI Framework**: React with TypeScript for type safety
- **Styling**: TailwindCSS with shadcn/ui component library for consistent design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Real-time Updates**: WebSocket connection for live price updates and notifications
- **Charts**: Recharts library for cryptocurrency price charts and technical analysis visualization

The frontend follows a modular structure with components organized by functionality (layout, UI components, pages) and includes custom hooks for data fetching and WebSocket management.

### Backend Architecture

The backend is built with Express.js and follows a service-oriented architecture:

- **Framework**: Express.js with TypeScript for API endpoints
- **Real-time Communication**: WebSocket server for broadcasting price updates and alerts
- **Data Layer**: Service classes for cryptocurrency data fetching, price predictions, and technical analysis
- **API Integration**: CoinGecko API for real-time cryptocurrency market data
- **Modular Services**: Separate services for crypto data, predictions, and technical indicators

### Data Storage Solutions

The application uses PostgreSQL as the primary database with Drizzle ORM:

- **Database**: PostgreSQL hosted on Neon for scalability and reliability
- **ORM**: Drizzle ORM with schema-first approach for type-safe database operations
- **Connection**: Neon serverless connection pooling for optimal performance
- **Migrations**: Drizzle Kit for database schema management and migrations

Database schema includes tables for cryptocurrencies, users, watchlists, price alerts, portfolio items, predictions, and historical price data.

### Authentication and Authorization

Currently implements a basic user system:

- **User Management**: Basic user creation and retrieval functionality
- **Session Management**: Ready for session-based authentication implementation
- **Data Isolation**: User-specific data for watchlists, portfolios, and alerts

### Technical Analysis Engine

The application includes a sophisticated technical analysis system:

- **Indicators**: RSI, MACD, Simple Moving Averages (SMA), Bollinger Bands
- **Signal Generation**: Automated buy/sell/hold signals based on technical indicators
- **Trend Analysis**: Volume analysis and trend direction detection
- **Real-time Updates**: Continuous calculation of indicators as new price data arrives

### Prediction System

AI-powered price prediction functionality:

- **Algorithms**: Technical indicator-based prediction models
- **Timeframes**: Support for multiple prediction timeframes (24h, 7d, 30d)
- **Accuracy Tracking**: Historical prediction accuracy monitoring
- **User Interface**: Visual charts showing predicted vs actual prices

## External Dependencies

### Third-party Services

- **CoinGecko API**: Primary source for real-time cryptocurrency market data, prices, and market information
- **Neon Database**: PostgreSQL hosting service for database infrastructure

### Key NPM Packages

**Frontend Dependencies:**
- `@tanstack/react-query`: Server state management and caching
- `@radix-ui/*`: Accessible UI primitives for components
- `tailwindcss`: Utility-first CSS framework
- `recharts`: Chart library for data visualization
- `wouter`: Lightweight routing for React
- `date-fns`: Date manipulation and formatting

**Backend Dependencies:**
- `drizzle-orm`: Type-safe ORM for PostgreSQL
- `@neondatabase/serverless`: Neon database connection
- `express`: Web framework for API endpoints
- `ws`: WebSocket library for real-time communication
- `connect-pg-simple`: PostgreSQL session store

**Development Tools:**
- `vite`: Build tool and development server
- `typescript`: Type checking and compilation
- `esbuild`: Fast JavaScript bundler for production builds
- `tsx`: TypeScript execution for development

### Build and Deployment

The application uses Vite for development and building:

- **Development**: Hot module replacement with Vite dev server
- **Production**: Optimized builds with code splitting and asset optimization
- **TypeScript**: Full type checking across client, server, and shared code
- **Asset Management**: Automatic asset optimization and caching strategies