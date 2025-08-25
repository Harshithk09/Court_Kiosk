# Vercel Deployment Guide

## Prerequisites
- Node.js 18+ installed
- Vercel account
- Git repository connected to Vercel

## Environment Variables
Set these in your Vercel project settings:

```
REACT_APP_API_URL=https://your-backend-url.com
REACT_APP_KIOSK_MODE=false
```

## Build Configuration
The project is configured for Vercel deployment with:
- `vercel.json` - Build and routing configuration
- `package.json` - Updated with correct react-scripts version (5.0.1)
- `.npmrc` - NPM configuration for build
- `.nvmrc` - Node.js version specification

## Deployment Steps
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

## Common Vercel Errors & Solutions

### "react-scripts: command not found"
**Solution**: ✅ Fixed - Updated `react-scripts` to version `5.0.1` in `package.json`

### "Build failed" or "Function500"
**Solutions**:
1. Check that all dependencies are properly listed in `package.json`
2. Ensure Node.js version is 18+ (specified in `.nvmrc`)
3. Verify environment variables are set correctly
4. Check build logs for specific error messages

### "Module not found" errors
**Solutions**:
1. Run `npm install` locally to ensure all dependencies are installed
2. Check that all imports use correct paths
3. Verify that all required files exist in the correct locations

### "Static file not found"
**Solution**: ✅ Fixed - Added proper routes in `vercel.json` for static files and data

## Local Testing
Before deploying, test locally:

```bash
# Install dependencies
npm install

# Test build
npm run build

# Start development server
npm start
```

## Build Locally
```bash
npm run build
```

## Vercel CLI (Alternative)
If you prefer using Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add REACT_APP_API_URL
vercel env add REACT_APP_KIOSK_MODE
```
