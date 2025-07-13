# Cloddo Project - Claude Code Instructions

## 🎯 Project Overview
**Cloddo**: PRODUCTION-READY Claude Desktop alternative  
**Status**: 100% functional, local testing successful ✅  
**Architecture**: Tauri 2 + React 18 + TypeScript + File-based storage  
**Repository**: https://github.com/EliaAlberti/cloddo.git  

## 🚀 Current State (CRITICAL SUCCESS)
- ✅ **FULLY FUNCTIONAL** desktop application running locally
- ✅ **ALL THREE CORE FEATURES WORKING**: API key save, OAuth connect, new chat
- ✅ **Complete testing workflow**: VPS → GitHub → Local user testing
- ✅ **SSH authentication established** for seamless Git operations
- ✅ **Icon issues resolved** - Tauri builds successfully
- ✅ **User validates application** exactly as end users would experience

## 🔧 MCP Integration Protocol (PROACTIVE USE REQUIRED)

### **Planning & Strategy**
- **sequential-thinking**: ALWAYS use for complex problem decomposition and step-by-step planning
- **memory**: Use for persistent context and knowledge graph management

### **UI/UX Development** 
- **figma**: Use for design research, UI patterns, and component inspiration
- **inspector**: Use for debugging MCP connections and development tools

### **Research & Analysis**
- **perplexity**: Use in deep research mode for market analysis and technical research
- **tavily**: Use for comprehensive web research and competitive analysis

### **Development Support**
- **filesystem**: Already configured for project file management
- **puppeteer**: Use for automated testing and web scraping when needed
- **ref-tools**: Use for documentation and reference management

### **Workflow Integration**
```bash
# Available MCP servers (use proactively):
claude mcp list
# filesystem, memory, sequential-thinking, inspector, puppeteer, 
# figma, ref-tools, jsonresume, xcodebuild, hyper-shell
```

## 📋 Essential Commands & Workflow

### **Development Commands**
```bash
# Start application (user testing)
npm run tauri dev

# Build for production
npm run tauri build

# Backend compilation
cd src-tauri && cargo build

# Git operations (VPS)
git add . && git commit -m "Description" && git push
```

### **Testing Validation**
```bash
# Three core features test:
# 1. API Key: Settings → Save → Check /tmp/cloddo_settings.json
# 2. OAuth: Connect → No errors
# 3. New Chat: Button → Check /tmp/cloddo_chats.json
```

## 🧠 Critical Knowledge Files
- **KNOWLEDGE_BASE.md** - Complete persistent learning database
- **LOCAL_TESTING_GUIDE.md** - User testing procedures  
- **PROJECT_MEMORY.md** - Project context and architecture
- **src-tauri/src/commands/settings.rs** - File-based settings
- **src-tauri/src/commands/chat.rs** - Chat management
- **src/components/layout/Layout.tsx** - Main UI layout

## 🎯 PROVEN WORKING FEATURES
1. **API Key Storage**: File-based persistence working ✅
2. **OAuth Authentication**: Simplified flow, error-free ✅  
3. **Chat Creation**: Dynamic chat management ✅
4. **Local Testing**: User can test as production desktop app ✅
5. **Git Workflow**: VPS → GitHub → Local seamless ✅

## 🔄 Development Workflow (ESTABLISHED)

### **Session Initialization**
1. **Read this file first** (Claude Code reads CLAUDE.md)
2. **Check KNOWLEDGE_BASE.md** for persistent learnings
3. **Review git status** and recent commits
4. **Use sequential-thinking MCP** for complex planning

### **Feature Development**
1. **Use sequential-thinking** for task breakdown
2. **Use memory MCP** for context persistence  
3. **Implement incrementally** with frequent commits
4. **Test via local user workflow** (git pull + npm run tauri dev)
5. **Update knowledge base** with new learnings

### **Research & Planning**
1. **Use perplexity MCP** for deep market research
2. **Use tavily MCP** for competitive analysis
3. **Use figma MCP** for UI/UX inspiration
4. **Compile findings** into actionable development plans

## ⚠️ CRITICAL SUCCESS FACTORS
- **File-based storage**: No database complexity (`/tmp/cloddo_*.json`)
- **Icon management**: All PNG files in git (!src-tauri/icons/*.png in .gitignore)
- **SSH authentication**: VPS can push directly to GitHub
- **Local testing**: Real user experience validation working
- **MCP integration**: 10 servers configured for enhanced development

## 🚀 IMMEDIATE CONTEXT (SUCCESS ACHIEVED)
- **Local testing**: User successfully runs `npm run tauri dev` ✅
- **All features working**: API key, OAuth, new chat functional ✅
- **Git workflow**: VPS → GitHub → Local pipeline established ✅  
- **Icon issues**: Resolved (32x32.png and all icons in repository) ✅
- **Production ready**: Application ready for user adoption ✅

## 📚 SESSION STARTUP PROTOCOL
1. **Read KNOWLEDGE_BASE.md** for complete persistent learning database
2. **Use sequential-thinking MCP** for any planning tasks immediately
3. **Check git log** for latest changes
4. **Verify application builds** (`npm run build` should succeed)
5. **Use memory MCP** to maintain context across sessions

## 🎯 ACCOMPLISHMENT TRACKING PROTOCOL (CRITICAL)

### **MANDATORY: Auto-Documentation Process**
After ANY major accomplishment (Tier 1/2):
1. **Immediate Knowledge Capture**: Update KNOWLEDGE_BASE.md with learning
2. **Documentation Sync**: Update affected .md files 
3. **Git Commit with Flag**: Use "MAJOR ACCOMPLISHMENT:" prefix
4. **Learning Extraction**: Document solution patterns for reuse

### **Accomplishment Detection Triggers**
- ✅ Feature implementation complete
- ✅ Critical bug resolution 
- ✅ User validation success
- ✅ Workflow establishment
- ✅ Architecture changes
- ✅ Research completion with actionable results

### **Use TodoWrite Integration**
- Mark high-priority completions immediately
- Auto-trigger documentation updates
- Preserve ALL critical knowledge

**RULE**: NO major progress without corresponding knowledge capture!

**STATUS: PRODUCTION-READY DESKTOP APPLICATION - LOCAL TESTING SUCCESSFUL**

*Next phase: Research-driven development planning using MCP tools with auto-documentation*