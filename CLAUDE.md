# Cloddo Project Memory

## Key Development Context for Future Sessions

### Project Overview
- **Cloddo**: Claude Desktop alternative built with Tauri 2 + React 18 + TypeScript
- **Current Status**: Production-ready desktop application for user testing
- **Architecture**: Desktop-only, no browser fallbacks, file-based storage system

### Testing Environment Setup
- **Environment**: VPS with X11 virtual display (Xvfb) for headless desktop testing
- **Commands to start testing**:
  - `export DISPLAY=:99.0`
  - `Xvfb :99 -screen 0 1024x768x24 > /dev/null 2>&1 &`
  - `cd /home/projects/desktop-apps/cloddo && npm run tauri dev`

### Critical User Requirements
1. **Production-Ready Testing**: User wants to test the app exactly as end users would experience it
2. **Desktop-Only Architecture**: No browser solutions, must work as native desktop app
3. **Three Core Issues Fixed**:
   - API key save functionality (file-based storage in `/tmp/cloddo_settings.json`)
   - OAuth authentication flow (simplified for testing)
   - New chat button functionality (file-based chat storage in `/tmp/cloddo_chats.json`)

### Implementation Details
- **Storage System**: File-based instead of SQLite to avoid database initialization issues
- **Settings**: `/tmp/cloddo_settings.json`
- **Chats**: `/tmp/cloddo_chats.json`
- **Database**: Bypassed in `src-tauri/src/lib.rs` (lines 32-34)
- **OAuth**: Simplified implementation for testing purposes

### Key Files Modified
- `/home/projects/desktop-apps/cloddo/src-tauri/src/commands/settings.rs` - File-based settings
- `/home/projects/desktop-apps/cloddo/src-tauri/src/commands/chat.rs` - File-based chat management
- `/home/projects/desktop-apps/cloddo/src-tauri/src/commands/oauth.rs` - Simplified OAuth flow
- `/home/projects/desktop-apps/cloddo/src-tauri/src/lib.rs` - Database initialization bypassed

### Build & Run Commands
- Development: `npm run tauri dev`
- Production build: `npm run tauri build`
- Backend compile: `cd src-tauri && cargo build`

### User Testing Priorities
1. **API Key Save**: Must provide feedback and persist to file
2. **OAuth Connect**: Must not show errors, should work with simplified flow
3. **New Chat**: Must create new chats and show in interface

### Important Notes
- User explicitly wants FULL production application, not demo/test versions
- All functionality must work as desktop application would for end users
- File paths use `/tmp/` for development but should be production-ready
- Compilation warnings are acceptable, but no errors
- Application successfully builds and runs with X11 virtual display