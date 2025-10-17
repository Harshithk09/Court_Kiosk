#!/bin/bash

echo "🚀 Court Kiosk - Production Deployment"
echo "======================================"

# Check if user is logged in to Vercel
if ! vercel whoami > /dev/null 2>&1; then
    echo "❌ Please login to Vercel first: vercel login"
    exit 1
fi

echo "📋 Current Vercel user: $(vercel whoami)"
echo ""

# Step 1: Set up environment variables if not already set
echo "🔧 Step 1: Checking environment variables..."
if [ -z "$(vercel env ls | grep RESEND_API_KEY)" ]; then
    echo "⚠️  Environment variables not set. Please run:"
    echo "   ./setup-vercel-env.sh"
    echo ""
    echo "Or manually add them via Vercel dashboard:"
    echo "   https://vercel.com/court-kiosks-projects/court-kiosk/settings/environment-variables"
    echo ""
    read -p "Press Enter after setting up environment variables..."
fi

# Step 2: Build frontend
echo "🔧 Step 2: Building frontend..."
cd frontend
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi
cd ..

# Step 3: Deploy to Vercel
echo "🔧 Step 3: Deploying to Vercel..."
vercel --prod --yes

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "🌐 Your application is now live at:"
    echo "   https://court-kiosk.vercel.app"
    echo ""
    echo "🔍 To test the deployment:"
    echo "   curl https://court-kiosk.vercel.app/api/health"
    echo ""
    echo "📊 To check deployment status:"
    echo "   vercel ls"
    echo ""
    echo "🔧 To manage environment variables:"
    echo "   vercel env ls"
    echo ""
else
    echo "❌ Deployment failed!"
    echo "Check the error messages above and try again."
    exit 1
fi
