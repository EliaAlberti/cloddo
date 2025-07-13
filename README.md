# Cloddo - Claude Desktop Alternative

A superior desktop application alternative to Claude Desktop, built with Tauri 2, React 18, and TypeScript.

## 🚀 Features

Cloddo addresses key limitations of the official Claude Desktop app by providing:

- **Advanced Chat Management**: Flexible views (grid, list, compact), hierarchical folders, tagging, and smart organization
- **Background Agent System**: Custom AI agents with scheduling, templates, and automation
- **Hooks & Workflows**: Event-driven automation system for seamless integrations
- **Extensive Customization**: Themes, layouts, shortcuts, and AI personality customization
- **Performance Optimized**: < 2s startup, < 100MB memory usage, native desktop performance

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Rust + Tauri 2 + SQLite
- **Build System**: Vite
- **Development**: ESLint + Prettier + Hot Reload

## 📁 Project Structure

```
cloddo/
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── stores/            # State management (Zustand)
│   ├── services/          # API services
│   ├── types/             # TypeScript definitions
│   └── utils/             # Utility functions
├── src-tauri/             # Rust backend
│   ├── src/commands/      # Tauri commands
│   ├── src/database/      # Database operations
│   ├── src/agents/        # Agent system
│   └── src/hooks/         # Hooks system
└── docs/                  # Documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Rust and Cargo
- Platform-specific dependencies for Tauri

### Development Setup

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd cloddo
   npm install
   ```

2. **Run development server**:
   ```bash
   npm run tauri:dev
   ```

3. **Build for production**:
   ```bash
   npm run tauri:build
   ```

### Available Scripts

- `npm run dev` - Start Vite development server
- `npm run build` - Build frontend for production
- `npm run tauri:dev` - Start Tauri development environment
- `npm run tauri:build` - Build Tauri application
- `npm run lint` - Run ESLint

## 🏗️ Development Status

### ✅ Phase 1 Complete - Foundation
- [x] Tauri 2 + React 18 + TypeScript setup
- [x] Vite build system configuration
- [x] Tailwind CSS + shadcn/ui styling
- [x] Complete TypeScript type definitions
- [x] Project file structure
- [x] Development environment setup

### 🚧 Phase 2 In Progress - Core Implementation
- [ ] Rust backend with SQLite database
- [ ] Tauri commands for data operations
- [ ] State management with Zustand
- [ ] Basic layout components
- [ ] Authentication system

### 📋 Planned Features
- [ ] Chat management system
- [ ] Background agent system
- [ ] Hooks and automation
- [ ] Advanced customization
- [ ] Cross-platform packaging

## 🎯 Core Differentiators

### vs Claude Desktop
- **Flexible Chat Views**: Grid, list, compact modes vs fixed grid
- **Advanced Organization**: Folders, tags, smart grouping vs basic chronological
- **Background Agents**: Full automation system vs none
- **Hooks System**: Event-driven workflows vs none
- **Customization**: Extensive theming and layout options vs limited

### Performance Targets
- **Startup Time**: < 2 seconds
- **Memory Usage**: < 100MB baseline
- **Binary Size**: < 50MB
- **UI Responsiveness**: Sub-100ms interactions

## 🔐 Security & Privacy

- **Local-First**: All data stored locally by default
- **Encrypted Storage**: Sensitive information encrypted at rest
- **Sandboxed Execution**: Agent and hook operations run in secure environments
- **API Security**: Secure Claude API integration with proper key management

## 📚 Documentation

- `AI_INSTRUCTIONS.md` - Comprehensive AI assistant guidelines and project context
- `docs/` - Additional documentation and guides

## 🤝 Contributing

This project follows strict development guidelines:

1. **Code Quality**: TypeScript strict mode, comprehensive testing, proper documentation
2. **Performance**: All changes must maintain performance targets
3. **Security**: Security review required for all data handling and API integration
4. **Architecture**: Follow established patterns and conventions

## 📄 License

MIT License - see LICENSE file for details

---

**Cloddo** - Reimagining desktop AI interaction with power, performance, and personalization.
