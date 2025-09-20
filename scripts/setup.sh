#!/bin/bash

# DevPulse Setup Script
echo "🚀 Setting up DevPulse Development Environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if PostgreSQL is available
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL detected"
else
    echo "⚠️  PostgreSQL not found. You can use Docker instead."
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration before starting the server"
else
    echo "✅ .env file already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate

# Create logs directory
mkdir -p logs
echo "✅ Created logs directory"

echo ""
echo "🎉 Setup complete! Next steps:"
echo ""
echo "1. Edit .env file with your configuration:"
echo "   - Set DATABASE_URL for your PostgreSQL database"
echo "   - Add GitHub OAuth credentials (GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET)"
echo "   - Update JWT_SECRET with a secure random string"
echo ""
echo "2. Set up your database:"
echo "   npm run db:push    # Push schema to database"
echo "   npm run db:studio  # Open Prisma Studio (optional)"
echo ""
echo "3. Start the development server:"
echo "   npm run dev"
echo ""
echo "4. Or use Docker for complete setup:"
echo "   docker-compose up -d"
echo ""
echo "📚 Check README.md for detailed setup instructions"
echo "🌐 API will be available at http://localhost:5000"
echo "🔍 Health check: http://localhost:5000/health"
