# 🛠️ LOCAL DEVELOPMENT GUIDE

## 🚀 **Quick Start for Local Development**

### **Step 1: Clone and Setup**
```bash
git clone https://github.com/saurabhdahariya/text-to-query-ai.git
cd text-to-query-ai
```

### **Step 2: Install Dependencies**
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### **Step 3: Setup Environment Variables**
```bash
# Copy the local development environment file
cd server
copy .env.local .env
```

### **Step 4: Start the Application**
```bash
# Start backend (from server directory)
cd server
npm start

# Start frontend (from root directory, in new terminal)
cd ..
npm start
```

### **Step 5: Access the Application**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Try Demo**: Click "Try Demo" button for real database queries

## 🔧 **Environment Configuration**

### **Local Development (.env.local)**
The `.env.local` file contains real credentials for local development:

```env
# OpenAI API Configuration
OPENAI_API_KEY=your_real_openai_api_key_here
OPENAI_BASE_URL=https://api.openai.com/v1

# Demo Database (Real Database for Local Development)
DEMO_DB_HOST=your_demo_database_host
DEMO_DB_PORT=20854
DEMO_DB_USER=your_demo_database_user
DEMO_DB_PASSWORD=your_demo_database_password
DEMO_DB_NAME=classicmodels
DEMO_DB_SSL=true
```

### **Production (.env)**
The `.env` file is safe for GitHub and contains placeholders:

```env
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Demo Database Configuration (Optional)
# DEMO_DB_HOST=your_demo_database_host
# DEMO_DB_PORT=20854
# DEMO_DB_USER=your_demo_database_user
# DEMO_DB_PASSWORD=your_demo_database_password
# DEMO_DB_NAME=classicmodels
```

## ✅ **Local Testing Checklist**

### **Backend Testing**
```bash
# Test demo query endpoint
curl -X POST http://localhost:5000/api/demo/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Show me all customers from France"}'

# Test schema endpoint
curl http://localhost:5000/api/demo/schema
```

### **Frontend Testing**
1. **Open**: http://localhost:3000
2. **Click**: "Try Demo" button
3. **Test Query**: "Show me all customers from France"
4. **Verify**: Real data from Aiven database appears
5. **Test Features**: Search, sort, pagination, CSV export

### **Expected Results**
- ✅ **Demo Mode**: Returns real data from classicmodels database
- ✅ **OpenAI Integration**: Generates SQL using GPT-3.5 Turbo
- ✅ **Table Features**: Search, sort, pagination work perfectly
- ✅ **Export**: CSV export downloads real data
- ✅ **Unlimited Results**: No LIMIT restrictions on queries

## 🔄 **Development Workflow**

### **Making Changes**
1. **Edit Code**: Make your changes
2. **Test Locally**: Verify everything works
3. **Prepare for Push**: Copy production-safe .env
4. **Commit and Push**: Push to GitHub

### **Before GitHub Push**
```bash
# Ensure production-safe .env
cd server
copy .env.example .env

# Or manually edit .env to remove credentials
# Then commit and push
git add .
git commit -m "Your changes"
git push origin main
```

### **After GitHub Push**
```bash
# Restore local development environment
cd server
copy .env.local .env

# Continue local development
npm start
```

## 🎯 **Features Working Locally**

### **✅ Demo Mode**
- **Real Database**: Connects to Aiven MySQL database
- **122 Customers**: Real customer data from classicmodels
- **110 Products**: Complete product catalog
- **326+ Orders**: Full order history
- **OpenAI Integration**: GPT-3.5 Turbo generates SQL

### **✅ Database Connection**
- **MySQL Support**: Full MySQL database connectivity
- **PostgreSQL Support**: Complete PostgreSQL compatibility
- **User Databases**: Connect any MySQL/PostgreSQL database
- **Real-time Queries**: Execute SQL on connected databases

### **✅ Advanced Features**
- **Unlimited Queries**: No LIMIT restrictions
- **Smart Search**: Real-time filtering across all columns
- **Intelligent Sorting**: Click any column to sort
- **Flexible Pagination**: 50, 100, 200, 500, 1000, or ALL rows
- **CSV Export**: Export all data or filtered results
- **Dark/Light Mode**: Perfect theme switching
- **Mobile Responsive**: Works on all devices

## 🐛 **Troubleshooting**

### **Common Issues**

#### **Backend Won't Start**
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill process if needed
taskkill /PID <process_id> /F

# Restart backend
cd server
npm start
```

#### **Frontend Won't Start**
```bash
# Check if port 3000 is in use
# React will automatically suggest another port

# Or manually specify port
set PORT=3001 && npm start
```

#### **Database Connection Issues**
```bash
# Verify .env.local has real credentials
cd server
type .env.local

# Copy to .env if needed
copy .env.local .env
```

#### **OpenAI API Issues**
- **Check API Key**: Verify in .env.local
- **Check Billing**: Ensure OpenAI account has credits
- **Check Network**: Verify internet connection

### **Environment Issues**
```bash
# Reset environment
cd server
del .env
copy .env.local .env

# Restart backend
npm start
```

## 🎉 **Success Indicators**

### **✅ Backend Running Successfully**
```
Environment loaded - OpenAI API Key: Present
OpenAI Base URL: https://api.openai.com/v1
🚀 Server running on port 5000
📊 Environment: development
🔗 Frontend URL: http://localhost:3000
```

### **✅ Frontend Running Successfully**
```
Compiled successfully!
You can now view text-to-sql in the browser.
Local: http://localhost:3000
```

### **✅ Demo Working Successfully**
- **Try Demo**: Button works and loads demo interface
- **Real Data**: Queries return actual database records
- **OpenAI**: SQL generation works with GPT-3.5 Turbo
- **Table Features**: All advanced features functional

## 🚀 **Ready for Development!**

Your local development environment is now fully functional with:
- ✅ **Real Database Integration**: Aiven MySQL with classicmodels
- ✅ **OpenAI GPT-3.5 Turbo**: Working SQL generation
- ✅ **Production-Grade Features**: All features working locally
- ✅ **Secure Credential Management**: Local and production environments
- ✅ **Complete Testing**: All endpoints and features verified
