# 🧪 Cloddo Local Testing Guide

*Complete instructions for testing Cloddo on your local machine*

## 📋 Overview

This guide replaces the previous VPS-based testing approach with a streamlined local development workflow. Test Cloddo exactly as end users will experience it on their desktop.

## 🎯 Prerequisites

### Required Software
- **Node.js**: Version 18 or higher
- **Rust**: Latest stable version
- **Git**: For repository cloning
- **Tauri Prerequisites**: Platform-specific dependencies

### Tauri Prerequisites by Platform

**macOS**:
```bash
xcode-select --install
```

**Linux (Ubuntu/Debian)**:
```bash
sudo apt update
sudo apt install libwebkit2gtk-4.0-dev libappindicator3-dev librsvg2-dev patchelf
```

**Windows**:
- Microsoft Visual Studio C++ Build Tools
- WebView2 (usually pre-installed)

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd cloddo
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Environment
```bash
npm run tauri dev
```

**Expected Result**: Cloddo desktop application launches in development mode

## ✅ Testing the Three Core Features

### 🔑 **Test 1: API Key Save Functionality**

**Steps**:
1. Click **Settings** (gear icon) in top-right corner
2. Enter a test API key: `sk-ant-test1234567890`
3. Click **Save** button
4. Look for confirmation message/feedback

**Expected Results**:
- ✅ Save button provides feedback (success message or UI change)
- ✅ Settings modal can be closed and reopened
- ✅ API key persists when reopening settings

**Verification**:
```bash
# Check if settings file was created (macOS/Linux)
cat /tmp/cloddo_settings.json

# Should show something like:
# {"api.anthropicApiKey": "sk-ant-test1234567890", ...}
```

### 🔗 **Test 2: OAuth Connect**

**Steps**:
1. Open **Settings** modal
2. Select **OAuth** as authentication method (if available)
3. Click **Connect** or similar OAuth button
4. Observe the response

**Expected Results**:
- ✅ No connection errors displayed
- ✅ Either successful OAuth flow or demo response
- ✅ UI provides clear feedback on OAuth status

**Note**: Current implementation uses simplified OAuth for testing

### 💬 **Test 3: New Chat Button**

**Steps**:
1. Look for **New Chat** button (usually in header or sidebar)
2. Click the button
3. Check if new chat appears in sidebar
4. Verify you can interact with the new chat

**Expected Results**:
- ✅ New chat appears immediately in chat list
- ✅ Chat has auto-generated title like "New Chat"
- ✅ Newly created chat becomes active/selected
- ✅ Can type in message input area

**Verification**:
```bash
# Check if chat file was created
cat /tmp/cloddo_chats.json

# Should show JSON array with chat objects
```

## 🔧 Development Commands

### Essential Commands
```bash
# Start development with hot reload
npm run tauri dev

# Build frontend only
npm run build

# Build complete application
npm run tauri build

# Run linting
npm run lint

# Check backend compilation
cd src-tauri && cargo build
```

### File Monitoring
```bash
# Monitor settings changes (macOS/Linux)
watch -n 1 'echo "=== SETTINGS ===" && cat /tmp/cloddo_settings.json 2>/dev/null || echo "No settings file"'

# Monitor chat changes
watch -n 1 'echo "=== CHATS ===" && cat /tmp/cloddo_chats.json 2>/dev/null || echo "No chats file"'
```

## 🐛 Troubleshooting

### Common Issues

**Application Won't Start**:
```bash
# Check Node.js version
node --version  # Should be 18+

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check Rust/Tauri setup
cargo --version
```

**Build Errors**:
```bash
# Clear build cache
npm run clean  # If available
rm -rf dist/ src-tauri/target/

# Rebuild
npm run build
```

**Settings/Chat Files Not Created**:
- **macOS/Linux**: Check `/tmp/` directory permissions
- **Windows**: Files may be in `%TEMP%` directory
- Ensure application has write permissions

**Performance Issues**:
- Check available memory (should use <100MB)
- Monitor CPU usage during startup
- Verify no other Tauri apps are running

### Expected Performance Metrics
- **Startup Time**: 3-5 seconds (target: <2s)
- **Memory Usage**: 60-80MB (target: <100MB)
- **UI Responsiveness**: <100ms for most interactions

## 📊 Testing Checklist

### ✅ **Basic Functionality**
- [ ] Application launches successfully
- [ ] Main UI loads (header, sidebar, main content)
- [ ] Settings modal opens and closes
- [ ] No critical errors in console/logs

### ✅ **Core Features**
- [ ] API key can be saved with feedback
- [ ] OAuth connection doesn't show errors
- [ ] New chat button creates functional chats
- [ ] Chat list updates dynamically

### ✅ **User Experience**
- [ ] Interface is responsive and smooth
- [ ] No obvious visual glitches
- [ ] Desktop app feels native (not web-like)
- [ ] All buttons and controls work as expected

### ✅ **Data Persistence**
- [ ] Settings persist across app restarts
- [ ] Chat history is maintained
- [ ] No data loss during normal usage

## 📋 Reporting Issues

### Information to Include
1. **Operating System**: macOS/Windows/Linux version
2. **Node.js Version**: `node --version`
3. **Rust Version**: `cargo --version`
4. **Error Messages**: Copy exact error text
5. **Steps to Reproduce**: Detailed sequence
6. **Screenshots**: If visual issues

### File Locations for Debugging
- **Settings**: `/tmp/cloddo_settings.json` (Unix) or `%TEMP%\cloddo_settings.json` (Windows)
- **Chats**: `/tmp/cloddo_chats.json` (Unix) or `%TEMP%\cloddo_chats.json` (Windows)
- **Logs**: Check console output from `npm run tauri dev`

## 🎯 Success Criteria

The testing is successful when:
- ✅ All three core features work as described
- ✅ Application performs smoothly on your hardware
- ✅ No data loss or corruption occurs
- ✅ User experience feels polished and professional

## 🚀 Next Steps After Testing

1. **Report Results**: Share findings with development team
2. **Feature Requests**: Document desired enhancements
3. **Performance Feedback**: Note any performance issues
4. **UI/UX Suggestions**: Propose interface improvements

---

## 📚 Additional Resources

- **Project Memory**: `PROJECT_MEMORY.md` - Complete project context
- **Technical Details**: `AI_INSTRUCTIONS.md` - Development guidelines
- **Repository**: Latest code and documentation

---

*Last Updated: 2025-07-13*  
*Version: 1.0 - Local Testing*  
*Status: Ready for Production Testing*