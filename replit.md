# ExcuseMe - AI-Powered Excuse Generator

## Overview

ExcuseMe is a full-stack web application that generates personalized excuses for Korean students using AI. The application features a modern React frontend with a Node.js/Express backend, utilizing OpenAI's GPT models for intelligent excuse generation. The system includes usage tracking, bookmark functionality, and a chat-like interface for user interaction.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API endpoints
- **Development**: Hot reload with tsx for TypeScript execution

### Database Architecture
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (via Neon serverless)
- **Migrations**: Drizzle Kit for schema management
- **Storage Implementation**: Dual storage pattern with in-memory fallback

## Key Components

### Core Features
1. **AI Excuse Generation**: OpenAI GPT-4o integration for contextual excuse creation
2. **Category System**: Health, family, transport, and personal excuse categories
3. **Tone Selection**: Light, moderate, and serious tone options
4. **Usage Tracking**: Weekly usage monitoring with warnings
5. **Bookmark System**: Save and retrieve favorite excuses
6. **Chat Interface**: Conversational UI with bot/user message distinction

### Data Models
- **Excuses**: Store generated excuses with metadata (category, tone, content, timestamps)
- **Usage Stats**: Track weekly usage patterns with automatic counting
- **Request Validation**: Zod schemas for type-safe API communication

### UI Components
- **CategorySelector**: Interactive category selection with icons
- **ExcuseCard**: Display generated excuses with action buttons
- **ChatMessage**: Conversational message display component
- **UsageStatus**: Visual usage tracking with progress indicators
- **SavedExcuses**: Bookmark management interface

## Data Flow

1. **Excuse Generation Flow**:
   - User selects category, tone, and optional input
   - Frontend validates request using Zod schemas
   - Backend calls OpenAI API with structured prompts
   - Generated excuse is saved to database
   - Usage statistics are automatically updated
   - Response returned to frontend for display

2. **Storage Pattern**:
   - Primary: PostgreSQL via Drizzle ORM
   - Fallback: In-memory storage for development
   - Automatic failover between storage implementations

3. **State Management**:
   - Server state managed by TanStack Query
   - Local UI state managed by React hooks
   - Form validation handled by react-hook-form with Zod resolvers

## External Dependencies

### Core Dependencies
- **OpenAI**: GPT-4o model for excuse generation
- **Neon Database**: Serverless PostgreSQL hosting
- **Radix UI**: Headless UI component primitives
- **Tailwind CSS**: Utility-first CSS framework

### Development Tools
- **Vite**: Build tool with HMR and TypeScript support
- **ESBuild**: Fast JavaScript bundler for production
- **Drizzle Kit**: Database migration and introspection tools
- **Replit Integration**: Development environment optimization

### API Integration
- **OpenAI Configuration**: 
  - Model: gpt-4o (latest available)
  - API key via environment variables
  - Structured prompts for Korean excuse generation
  - Error handling and fallback responses

## Deployment Strategy

### Development Environment
- **Hot Reload**: Vite dev server with Express middleware
- **Type Checking**: Continuous TypeScript compilation
- **Database**: Environment-based connection handling

### Production Build
- **Frontend**: Vite production build with asset optimization
- **Backend**: ESBuild compilation to ES modules
- **Database**: Drizzle migrations with production schema
- **Environment**: Node.js production server with static file serving

### Configuration Management
- **Environment Variables**: Database URLs, API keys, feature flags
- **Path Aliases**: TypeScript path mapping for clean imports
- **Asset Handling**: Vite asset pipeline with proper caching

The application follows a modern full-stack TypeScript architecture with emphasis on type safety, developer experience, and maintainable code structure. The dual storage pattern ensures development flexibility while maintaining production reliability.