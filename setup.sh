#!/bin/bash

echo "🤖 AI-Powered SaaS RAG Platform Setup"
echo "======================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    echo "   Visit: https://postgresql.org/download/"
    exit 1
fi

echo "✅ PostgreSQL detected"

# Install dependencies
echo "📦 Installing dependencies..."
if command -v yarn &> /dev/null; then
    yarn install
else
    npm install
fi

# Copy environment file
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cp .env.example .env.local
    echo "⚠️  Please edit .env.local with your actual credentials:"
    echo "   - DATABASE_URL"
    echo "   - OPENAI_API_KEY"
    echo "   - STRIPE_SECRET_KEY"
    echo "   - NEXTAUTH_SECRET"
    echo "   - Google OAuth credentials (optional)"
else
    echo "✅ .env.local already exists"
fi

# Database setup
echo "🗄️  Setting up database..."
read -p "Enter your database name (default: ai_saas_rag): " DB_NAME
DB_NAME=${DB_NAME:-ai_saas_rag}

read -p "Enter your PostgreSQL username (default: postgres): " DB_USER
DB_USER=${DB_USER:-postgres}

echo "Creating database and enabling pgvector..."

# Create database if it doesn't exist
createdb -U "$DB_USER" "$DB_NAME" 2>/dev/null || echo "Database may already exist"

# Enable pgvector extension
psql -U "$DB_USER" -d "$DB_NAME" -c "CREATE EXTENSION IF NOT EXISTS vector;" 2>/dev/null

# Update .env.local with database URL
if [ -f .env.local ]; then
    sed -i.bak "s|DATABASE_URL=\".*\"|DATABASE_URL=\"postgresql://$DB_USER@localhost:5432/$DB_NAME\"|g" .env.local
    rm .env.local.bak 2>/dev/null || true
fi

echo "✅ Database setup complete"

# Generate and run migrations
echo "🔄 Running database migrations..."
if command -v yarn &> /dev/null; then
    yarn db:generate
    yarn db:migrate
else
    npm run db:generate
    npm run db:migrate
fi

# Seed database
echo "🌱 Seeding database..."
if command -v yarn &> /dev/null; then
    yarn db:seed
else
    npm run db:seed
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your API keys and credentials"
echo "2. Start the development server:"
if command -v yarn &> /dev/null; then
    echo "   yarn dev"
else
    echo "   npm run dev"
fi
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "📚 Documentation: README.md"
echo "🆘 Support: Create an issue on GitHub"
echo ""
echo "Happy coding! 🚀"