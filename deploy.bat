@echo off
echo 🚀 Starting Text-to-SQL Production Deployment...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 16+ first.
    pause
    exit /b 1
)

echo ✅ Node.js version:
node --version

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies!
    pause
    exit /b 1
)

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd server
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies!
    pause
    exit /b 1
)
cd ..

REM Check if .env file exists
if not exist "server\.env" (
    echo ⚠️  Creating .env file from template...
    copy "server\.env.example" "server\.env"
    echo 📝 Please edit server\.env with your actual credentials before running the application.
)

REM Build frontend for production
echo 🏗️  Building frontend for production...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed!
    pause
    exit /b 1
)

REM Check if build was successful
if not exist "build" (
    echo ❌ Frontend build directory not found!
    pause
    exit /b 1
)

echo ✅ Frontend build completed successfully!

REM Create production start script
echo @echo off > start-production.bat
echo echo 🚀 Starting Text-to-SQL in production mode... >> start-production.bat
echo set NODE_ENV=production >> start-production.bat
echo cd server >> start-production.bat
echo node server.js >> start-production.bat
echo pause >> start-production.bat

REM Create development start script
echo @echo off > start-development.bat
echo echo 🚀 Starting Text-to-SQL in development mode... >> start-development.bat
echo start "Backend" cmd /k "cd server && node server.js" >> start-development.bat
echo timeout /t 3 /nobreak ^>nul >> start-development.bat
echo start "Frontend" cmd /k "npm start" >> start-development.bat
echo echo Backend and Frontend started in separate windows. >> start-development.bat
echo pause >> start-development.bat

echo 🎉 Deployment completed successfully!
echo.
echo 📋 Next steps:
echo 1. Edit server\.env with your actual credentials
echo 2. For development: start-development.bat
echo 3. For production: start-production.bat
echo.
echo 🌐 Application will be available at:
echo    - Development: http://localhost:3000
echo    - Production: http://localhost:5000
echo.
echo 📚 Documentation:
echo    - README.md - Setup instructions
echo    - server\.env.example - Environment variables
echo    - PRODUCTION_READY_GUIDE.md - Production guide
echo.
pause
