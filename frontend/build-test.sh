#!/bin/bash

echo "🧪 Testing build process..."

# Clean any previous builds
echo "📦 Cleaning previous builds..."
rm -rf build/
rm -rf node_modules/

# Install dependencies
echo "📥 Installing dependencies..."
npm install

# Test build
echo "🔨 Testing build..."
npm run build

# Check if build was successful
if [ -d "build" ]; then
    echo "✅ Build successful! Build directory created."
    echo "📁 Build contents:"
    ls -la build/
else
    echo "❌ Build failed! No build directory created."
    exit 1
fi

echo "🎉 Build test completed successfully!"
