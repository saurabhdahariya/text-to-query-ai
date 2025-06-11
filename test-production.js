#!/usr/bin/env node

/**
 * Production Test Script
 * Tests the production build locally before deployment
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Testing Production Build Locally\n');

// Check if build directory exists
const buildDir = path.join(__dirname, 'build');
if (!fs.existsSync(buildDir)) {
  console.log('❌ Build directory not found. Running build first...\n');
  
  const buildProcess = spawn('npm', ['run', 'build'], {
    stdio: 'inherit',
    shell: true
  });
  
  buildProcess.on('close', (code) => {
    if (code === 0) {
      console.log('\n✅ Build completed successfully!');
      startProductionServer();
    } else {
      console.log('\n❌ Build failed. Please check the errors above.');
      process.exit(1);
    }
  });
} else {
  console.log('✅ Build directory found. Starting production server...\n');
  startProductionServer();
}

function startProductionServer() {
  // Set production environment
  process.env.NODE_ENV = 'production';
  
  console.log('🔧 Environment: production');
  console.log('🌐 Starting server on http://localhost:5000');
  console.log('📁 Serving static files from build/');
  console.log('🔗 API routes available at /api/*');
  console.log('\n📋 Test checklist:');
  console.log('   □ Frontend loads correctly');
  console.log('   □ API endpoints respond');
  console.log('   □ Static files serve properly');
  console.log('   □ React routing works');
  console.log('\n⏹️  Press Ctrl+C to stop\n');
  
  const serverProcess = spawn('node', ['server/server.js'], {
    stdio: 'inherit',
    shell: true,
    cwd: __dirname,
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PORT: '5000'
    }
  });
  
  serverProcess.on('close', (code) => {
    console.log(`\n🛑 Server stopped with code ${code}`);
  });
  
  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping production test server...');
    serverProcess.kill('SIGINT');
    process.exit(0);
  });
}
