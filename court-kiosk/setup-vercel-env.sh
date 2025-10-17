#!/bin/bash

echo "🚀 Setting up Vercel Environment Variables for Court Kiosk"
echo "=========================================================="

# Check if user is logged in to Vercel
if ! vercel whoami > /dev/null 2>&1; then
    echo "❌ Please login to Vercel first: vercel login"
    exit 1
fi

echo "📋 You'll need the following API keys:"
echo "1. Resend API Key (for emails) - Get from https://resend.com/api-keys"
echo "2. OpenAI API Key (for AI features) - Get from https://platform.openai.com/api-keys"
echo ""

# Function to add environment variable
add_env_var() {
    local var_name=$1
    local var_description=$2
    local var_url=$3
    
    echo "🔧 Adding $var_name..."
    echo "   Description: $var_description"
    if [ ! -z "$var_url" ]; then
        echo "   Get it from: $var_url"
    fi
    echo ""
    
    vercel env add "$var_name" production
    echo ""
}

# Add all required environment variables
add_env_var "RESEND_API_KEY" "Resend API key for sending emails" "https://resend.com/api-keys"
add_env_var "OPENAI_API_KEY" "OpenAI API key for AI features" "https://platform.openai.com/api-keys"
add_env_var "CORS_ORIGINS" "CORS origins (use * for all)" ""
add_env_var "LOG_LEVEL" "Logging level (INFO, DEBUG, ERROR)" ""
add_env_var "SECRET_KEY" "Flask secret key for sessions" ""

echo "✅ Environment variables setup complete!"
echo ""
echo "🔍 To verify your environment variables:"
echo "   vercel env ls"
echo ""
echo "🚀 To deploy with new environment variables:"
echo "   vercel --prod"
echo ""
echo "📊 To check deployment status:"
echo "   vercel ls"
