#!/bin/bash

# Text-to-SQL Production Deployment Script
echo "🚀 Starting Text-to-SQL Production Deployment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd server
npm install
cd ..

# Check if .env file exists
if [ ! -f "server/.env" ]; then
    echo "⚠️  Creating .env file from template..."
    cp server/.env.example server/.env
    echo "📝 Please edit server/.env with your actual credentials before running the application."
fi

# Build frontend for production
echo "🏗️  Building frontend for production..."
npm run build

# Check if build was successful
if [ ! -d "build" ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi

echo "✅ Frontend build completed successfully!"

# Create production start script
cat > start-production.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Text-to-SQL in production mode..."

# Set production environment
export NODE_ENV=production

# Start the server
cd server
node server.js
EOF

chmod +x start-production.sh

# Create development start script
cat > start-development.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Text-to-SQL in development mode..."

# Start backend
cd server
node server.js &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
cd ..
npm start &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"

# Wait for user input to stop
echo "Press any key to stop the application..."
read -n 1

# Kill processes
kill $BACKEND_PID $FRONTEND_PID
echo "Application stopped."
EOF

chmod +x start-development.sh

echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Edit server/.env with your actual credentials"
echo "2. For development: ./start-development.sh"
echo "3. For production: ./start-production.sh"
echo ""
echo "🌐 Application will be available at:"
echo "   - Development: http://localhost:3000"
echo "   - Production: http://localhost:5000"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Setup instructions"
echo "   - server/.env.example - Environment variables"
echo "   - PRODUCTION_READY_GUIDE.md - Production guide"
