# Migration Guide: Consolidating Project Files

## What Was Moved

All project files have been consolidated into the `court-kiosk/` directory to create a clean, organized project structure.

### Files Moved to court-kiosk/ Root
- `chroma_service.py` - ChromaDB service
- `.nvmrc` - Node.js version specification
- `vercel.json` - Vercel deployment configuration
- `package.json` and `package-lock.json` - Root-level dependencies (copied as .root versions)

### Directories Consolidated
- `backend/` → `court-kiosk/backend/` (merged with existing)
- `frontend/` → `court-kiosk/frontend/` (merged with existing)

### Additional Files Copied
- `routes/` directory from root backend
- `server.js` from root backend
- `test_app.py` from root backend
- `complete_dvro.json` from root frontend

## Current Project Structure

```
court-kiosk/
├── backend/           # Complete Python backend
├── frontend/          # Complete React frontend
├── openai/            # OpenAI integration
├── venv/              # Python virtual environment
├── chroma_service.py  # ChromaDB service
├── package.json       # Root dependencies
├── .nvmrc            # Node version
├── vercel.json       # Deployment config
├── Various startup scripts
└── Documentation files
```

## Next Steps

### 1. Verify the Consolidation
```bash
cd court-kiosk
ls -la
```

### 2. Review Project Structure
Read `PROJECT_STRUCTURE.md` for a complete overview of the project organization.

### 3. Test Your Application
```bash
# From court-kiosk directory
./run.sh
# Or use specific startup scripts
./start-enhanced-system.sh
```

### 4. Clean Up Duplicates (Optional)
When you're confident everything is working:
```bash
# From the project root (parent of court-kiosk)
./court-kiosk/cleanup_duplicates.sh
```

## Benefits of This Organization

1. **Single Source of Truth**: All project files are in one place
2. **Cleaner Workspace**: Root directory is no longer cluttered
3. **Easier Deployment**: Everything needed for deployment is in one directory
4. **Better Organization**: Clear separation between project and workspace files
5. **Simplified Development**: All tools and scripts are in the project directory

## Important Notes

- **Backup**: Make sure you have a backup or version control before cleanup
- **Dependencies**: Both Python and Node.js dependencies are preserved
- **Configuration**: All configuration files are maintained
- **Scripts**: All startup and utility scripts are preserved

## Troubleshooting

If you encounter issues after consolidation:

1. Check that all required files are in `court-kiosk/`
2. Verify Python virtual environment is activated
3. Ensure Node.js dependencies are installed in frontend/
4. Check file permissions on startup scripts
5. Review the PROJECT_STRUCTURE.md for file locations

## Support

If you need help with the consolidated structure:
1. Check the documentation files in `court-kiosk/`
2. Review the startup scripts for configuration options
3. Ensure you're running commands from the correct directory
