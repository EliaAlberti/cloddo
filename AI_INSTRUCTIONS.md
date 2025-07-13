# AI Instructions for Cloddo Project

## Project Context & Overview

This document provides comprehensive instructions for AI assistants working on the Cloddo project. The project aims to create Cloddo, a superior macOS desktop application alternative to the official Claude Desktop app, addressing key limitations and adding innovative features.

### Key Project Information
- **Project Name**: Cloddo (Code Name: Cloddo Desktop)
- **Location**: `/home/projects/desktop-apps/cloddo/`
- **Technology Stack**: Tauri 2 + React 18 + TypeScript + Rust
- **Primary Goal**: Create Cloddo, a customizable, feature-rich Claude Desktop alternative
- **Target Platforms**: macOS, Windows, Linux
- **License**: MIT

### Project Documentation Structure
- `EXECUTIVE_REPORT.md`: Market analysis and competitive research
- `DEVELOPMENT_PLAN.md`: Comprehensive technical roadmap
- `PROJECT_BLUEPRINT.md`: Technical architecture and implementation details
- `AI_INSTRUCTIONS.md`: This file - instructions for AI assistance

## Core Project Principles

### 1. User-Centric Design
- **Customization First**: Every aspect should be customizable
- **Minimal Visual Language**: Clean, uncluttered interface
- **Personality**: Distinct app personality that appeals to both novice and experienced users
- **Accessibility**: WCAG compliance and inclusive design

### 2. Performance Excellence
- **Startup Time**: < 2 seconds
- **Memory Usage**: < 100MB baseline
- **Binary Size**: < 50MB
- **Responsiveness**: Sub-100ms UI interactions

### 3. Security & Privacy
- **Local-First**: Data stored locally by default
- **Encrypted Storage**: Sensitive data encryption
- **Sandboxed Execution**: Agent and hook security
- **API Security**: Secure Claude API integration

## Current Implementation Status

### ✅ Completed Phase 1 Foundation
1. **Project Structure**: Complete Tauri 2 + React 18 + TypeScript setup
2. **Build System**: Vite configured for Tauri development
3. **Styling**: Tailwind CSS 3.x with basic theming
4. **UI Framework**: shadcn/ui components configured
5. **Type System**: Comprehensive TypeScript definitions for all core features
6. **Development Environment**: ESLint, build scripts, path aliases configured

### 🔄 Current Status
- **Build System**: ✅ Working (npm run build succeeds)
- **Type Definitions**: ✅ Complete for chat, agents, hooks, settings, API
- **File Structure**: ✅ Complete directory structure per blueprint
- **Dependencies**: ✅ All required packages installed

### 🚧 Next Phase Requirements
1. **Rust Backend Setup**: Configure SQLite, database models, Tauri commands
2. **State Management**: Implement Zustand stores for global state
3. **Core Layout**: Create Header, Sidebar, MainContent, StatusBar components
4. **Database Implementation**: Create schema and migrations
5. **Authentication**: Implement API key management and Anthropic integration

## Technical Architecture Guidelines

### Frontend Development (React 18)
**Component Structure**:
- Use functional components with hooks
- Implement proper TypeScript typing
- Follow React best practices for performance
- Use shadcn/ui components for consistency
- Implement proper error boundaries

**State Management**:
- Use Zustand for global state (chat, agents, hooks)
- Use Jotai for complex atomic state
- Implement proper state persistence
- Use React Query for server state

**Styling Guidelines**:
- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Implement consistent spacing and typography
- Use CSS Grid and Flexbox for layouts
- Support dark/light mode switching

### Backend Development (Rust)
**Tauri Commands**:
- Implement async commands for all operations
- Use proper error handling with Result types
- Implement request validation and sanitization
- Use structured logging with tracing
- Follow Rust best practices

**Database Operations**:
- Use SQLite with proper connection pooling
- Implement database migrations
- Use transactions for data integrity
- Implement proper indexing for performance
- Follow database normalization principles

## AI Assistant Continuation Strategy

### For New Sessions
When starting a new session, ALWAYS:

1. **Read This File First**: This AI_INSTRUCTIONS.md contains the current state
2. **Check Implementation Status**: Review the "Current Implementation Status" section above
3. **Verify Build Status**: Run `npm run build` to ensure the project builds successfully
4. **Review Recent Changes**: Check git log if available, or file timestamps
5. **Understand Context**: Read the type definitions in `/src/types/` to understand the data models

### Project Continuity Tracking

This file serves as the **AI Journal** and is updated after significant progress:

**Last Updated**: 2025-07-10 17:55 UTC
**Last Session Progress**:
- ✅ Fixed all TypeScript compilation errors
- ✅ Resolved Tailwind CSS configuration issues 
- ✅ Ensured project builds successfully
- ✅ Created comprehensive type definitions
- ✅ Established complete project file structure

**Current Blockers**: None - ready for Phase 2 implementation

**Next Immediate Tasks**:
1. Set up Rust backend with SQLite database
2. Create Tauri commands for database operations
3. Implement state management with Zustand
4. Create basic layout components

### How This Continuity System Works

1. **This File is the Source of Truth**: Always read this file first in any session
2. **Status Updates**: After completing significant work, update the "Current Implementation Status" and "Last Session Progress" sections
3. **Context Preservation**: Key decisions, architectural choices, and lessons learned are documented here
4. **Next Steps**: Clear action items are always listed for the next session
5. **Problem Tracking**: Any blockers or challenges are documented with solutions

### File Structure Reference

```
src/
├── components/           # React components
│   ├── ui/              # shadcn/ui base components ✅
│   ├── layout/          # Layout components (Header, Sidebar, etc.) 🚧
│   ├── chat/            # Chat-specific components 🚧
│   ├── agents/          # Agent management components 🚧
│   ├── hooks/           # Hook/automation components 🚧
│   ├── settings/        # Settings components 🚧
│   └── common/          # Shared components 🚧
├── hooks/               # Custom React hooks 🚧
├── stores/              # State management (Zustand/Jotai) 🚧
├── services/            # API services 🚧
├── types/               # TypeScript definitions ✅
├── utils/               # Utility functions ✅
└── styles/              # Global styles ✅

src-tauri/
├── src/
│   ├── commands/        # Tauri commands 🚧
│   ├── database/        # Database operations 🚧
│   ├── agents/          # Agent system 🚧
│   ├── hooks/           # Hooks system 🚧
│   └── integrations/    # External integrations 🚧
```

Legend: ✅ Complete, 🚧 Needs Implementation, ❌ Not Started

## Key Features to Implement

### 1. Chat Management System
**Current Problem**: Claude Desktop has fixed grid view, poor organization
**Solution**: Flexible views with advanced organization

**Implementation Guidelines**:
- Support grid, list, and compact view modes
- Implement hierarchical folder structure
- Add tagging system for conversations
- Include smart grouping and AI-powered categorization
- Implement full-text search with advanced filtering
- Add favorites, bookmarks, and conversation summaries

### 2. Background Agent System
**Current Problem**: No background automation in Claude Desktop
**Solution**: Full agent system with custom prompts and scheduling

**Implementation Guidelines**:
- Create GUI for agent creation and management
- Support custom prompt templates with variables
- Implement cron-like scheduling system
- Add real-time performance monitoring
- Include agent library for sharing/importing
- Implement error handling and recovery

### 3. Hooks & Automation
**Current Problem**: No hooks functionality in Claude Desktop (available in Claude Code)
**Solution**: Comprehensive workflow automation system

**Implementation Guidelines**:
- Support event-driven triggers (chat events, file changes, schedules)
- Implement custom actions (API calls, file operations, notifications)
- Create workflow builder interface
- Add conditional logic and multi-step workflows
- Include external tool integration

### 4. Advanced Customization
**Current Problem**: Limited customization options in Claude Desktop
**Solution**: Extensive theming and personalization

**Implementation Guidelines**:
- Implement theme system (light, dark, custom)
- Support custom color schemes and fonts
- Add layout customization options
- Include personality customization for AI responses
- Support configurable keyboard shortcuts

## Development Workflow Guidelines

### 1. Code Quality Standards
- **TypeScript**: Use strict mode, comprehensive typing (✅ configured)
- **Rust**: Use clippy lints, proper error handling
- **Testing**: Maintain 80%+ code coverage (🚧 needs setup)
- **Documentation**: Inline code documentation
- **Code Reviews**: All changes should be reviewed

### 2. Performance Guidelines
- **Bundle Optimization**: Code splitting and lazy loading
- **Memory Management**: Efficient state management
- **Database Optimization**: Proper indexing and queries
- **UI Performance**: Virtual scrolling for large lists
- **Caching**: Implement intelligent caching strategies

### 3. Security Guidelines
- **Input Validation**: Validate all user inputs
- **API Security**: Secure API key management
- **Data Encryption**: Encrypt sensitive data at rest
- **Sandboxing**: Isolate agent and hook execution
- **Regular Updates**: Keep dependencies updated

## Success Metrics & Goals

### Technical Metrics
- **Performance**: < 2s startup, < 100MB memory
- **Reliability**: 99.9% uptime, < 1% crash rate
- **Security**: 0 critical vulnerabilities
- **Quality**: 90%+ code coverage

### User Metrics
- **Adoption**: 10k+ active users in 6 months
- **Satisfaction**: 4.5+ rating, 80%+ retention
- **Engagement**: 30+ minutes daily usage
- **Community**: 1k+ GitHub stars

---

*AI Instructions v1.1*  
*Created: 2025-01-09*  
*Last Updated: 2025-07-10*  
*Status: Active - Phase 1 Complete, Ready for Phase 2*