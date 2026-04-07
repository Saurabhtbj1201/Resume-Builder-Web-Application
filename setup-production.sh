#!/bin/bash
# Quick setup script for Resume Builder production deployment
# Run this script on your server/deployment platform

echo "🚀 Resume Builder Production Setup"
echo "=================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "📝 Please create .env file using .env.example as template"
    exit 1
fi

echo "✅ .env file found"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed!"
    exit 1
fi

echo "✅ npm version: $(npm --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm ci  # Use 'ci' for production (clean install)

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"

# Verify environment variables
echo ""
echo "🔐 Verifying environment configuration..."

if [ -z "$MONGODB_URI" ]; then
    echo "⚠️  MONGODB_URI not set as environment variable"
    echo "    Will use value from .env file"
fi

echo "✅ Configuration validated"

# Start the application
echo ""
echo "🚀 Starting application..."
echo "Environment: ${NODE_ENV:-production}"
echo "Port: ${PORT:-3000}"
echo ""

NODE_ENV=production npm start
