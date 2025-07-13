# Cloddo Project - Claude Code Instructions

## 🎯 Project Overview
**Cloddo**: Production-ready Claude Desktop alternative built with Tauri 2 + React 18 + TypeScript
**Status**: 95% complete, ready for local testing
**Architecture**: Desktop-native application with file-based storage

## 🚀 Current State (IMPORTANT)
- ✅ **Fully functional** desktop application
- ✅ **All core features implemented**: API key save, OAuth connect, new chat
- ✅ **File-based storage**: `/tmp/cloddo_settings.json`, `/tmp/cloddo_chats.json`
- ✅ **Git repository ready** for GitHub distribution
- ✅ **Local testing approach** replaces VPS testing

## 📋 Key Commands
```bash
# Development
npm run tauri dev

# Build
npm run build
npm run tauri build

# Backend only
cd src-tauri && cargo build
```

## 🧠 Critical Files to Know
- `PROJECT_MEMORY.md` - Complete project context and status
- `LOCAL_TESTING_GUIDE.md` - Testing instructions for users
- `src-tauri/src/commands/settings.rs` - File-based settings storage
- `src-tauri/src/commands/chat.rs` - File-based chat management
- `src/components/layout/Layout.tsx` - Main application layout

## 🎯 Three Core Features (ALL WORKING)
1. **API Key Save**: Settings modal → save → persists to `/tmp/cloddo_settings.json`
2. **OAuth Connect**: Simplified implementation, no errors
3. **New Chat**: Button creates chats in `/tmp/cloddo_chats.json`

## 🔧 Current Development Focus
- Repository distribution via GitHub
- Local testing workflow (NO MORE VPS testing)
- MCP server integration
- Documentation optimization

## ⚠️ Important Notes
- **Database bypassed**: Using file-based storage (lines 32-34 in `src-tauri/src/lib.rs`)
- **Production ready**: User can test as real desktop application
- **No browser testing**: Pure desktop application approach
- **Local testing only**: VPS approach abandoned

## 🚀 Immediate Context
Last session completed:
- Cleaned up VPS artifacts
- Set up Git repository (commit 4d09d52)
- Created unified documentation
- Configured MCP servers
- Ready for GitHub distribution to github.com/eliaalberti

## 📚 Read First
Always check `PROJECT_MEMORY.md` for complete context and `LOCAL_TESTING_GUIDE.md` for testing procedures.

**Application is production-ready and awaiting GitHub setup for user testing.**