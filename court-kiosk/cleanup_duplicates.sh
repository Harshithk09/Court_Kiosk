#!/bin/bash

# Cleanup script to remove duplicate files from root directory
# Run this after confirming all files are properly moved to court-kiosk

echo "🧹 Cleaning up duplicate files from root directory..."
echo "⚠️  This script will remove files that are now duplicated in court-kiosk/"
echo ""

# Check if we're in the right directory
if [ ! -d "court-kiosk" ]; then
    echo "❌ Error: court-kiosk directory not found. Run this script from the project root."
    exit 1
fi

# List of files to remove (they're now in court-kiosk/)
files_to_remove=(
    "chroma_service.py"
    "package.json"
    "package-lock.json"
    ".nvmrc"
    "tailwind.config.js"
    "vercel.json"
    "SummaryPage.tsx"
    "DVPage.tsx"
    "FlowRunner.tsx"
    "README_ENHANCED.md"
    "README_ENHANCED_SYSTEM.md"
    "README_NEW.md"
    "README.md"
    "start-enhanced-system.sh"
    "start-enhanced.sh"
    "start-integrated.sh"
    "run.sh"
    "dev-setup.sh"
    "dv_flow_combined.json"
)

# List of directories to remove
dirs_to_remove=(
    "backend"
    "frontend"
    "openai"
)

echo "📁 Files to remove:"
for file in "${files_to_remove[@]}"; do
    if [ -f "$file" ]; then
        echo "  - $file"
    fi
done

echo ""
echo "📂 Directories to remove:"
for dir in "${dirs_to_remove[@]}"; do
    if [ -d "$dir" ]; then
        echo "  - $dir/"
    fi
done

echo ""
read -p "🤔 Do you want to proceed with cleanup? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️  Removing duplicate files..."
    
    # Remove files
    for file in "${files_to_remove[@]}"; do
        if [ -f "$file" ]; then
            rm "$file"
            echo "  ✅ Removed: $file"
        fi
    done
    
    # Remove directories
    for dir in "${dirs_to_remove[@]}"; do
        if [ -d "$dir" ]; then
            rm -rf "$dir"
            echo "  ✅ Removed: $dir/"
        fi
    done
    
    echo ""
    echo "🎉 Cleanup completed! All project files are now consolidated in court-kiosk/"
    echo ""
    echo "📋 Next steps:"
    echo "  1. cd court-kiosk"
    echo "  2. Review the PROJECT_STRUCTURE.md file"
    echo "  3. Use the startup scripts to run your application"
    
else
    echo "❌ Cleanup cancelled. Files remain in root directory."
    echo ""
    echo "💡 You can run this script again later when you're ready."
fi
