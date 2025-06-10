# 🌐 RENDER ENVIRONMENT VARIABLES

## 📋 **Required Environment Variables for Render Deployment**

Copy these exact values into your Render dashboard environment variables:

### **🔑 Core Application Variables**
```
NODE_ENV=production
PORT=5000
OPENAI_BASE_URL=https://api.openai.com/v1
FRONTEND_URL=https://your-app-name.onrender.com
```

### **🤖 OpenAI API Configuration**
```
OPENAI_API_KEY=your_openai_api_key_here
```

### **🔒 Security Configuration**
```
SESSION_SECRET=your_secure_random_session_secret_here_change_this
```
**Generate a secure session secret using:**
```javascript
require('crypto').randomBytes(64).toString('hex')
```

### **🗄️ Demo Database Configuration (For "Try Demo" Feature)**
```
DEMO_DB_HOST=your_demo_database_host
DEMO_DB_PORT=20854
DEMO_DB_USER=your_demo_database_user
DEMO_DB_PASSWORD=your_demo_database_password
DEMO_DB_NAME=classicmodels
```

### **⚡ Performance Configuration**
```
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🎯 **How to Set Environment Variables in Render**

1. **Go to your Render dashboard**
2. **Select your web service**
3. **Click "Environment" tab**
4. **Add each variable above**
5. **Click "Save Changes"**
6. **Render will automatically redeploy**

## ✅ **Verification Checklist**

After setting environment variables, verify:

- ✅ **OPENAI_API_KEY** - Set to your actual OpenAI API key
- ✅ **SESSION_SECRET** - Set to a secure random string
- ✅ **FRONTEND_URL** - Set to your actual Render app URL
- ✅ **DEMO_DB_*** - Set to enable "Try Demo" functionality
- ✅ **NODE_ENV** - Set to "production"

## 🚀 **Expected Functionality After Deployment**

### **✅ Demo Mode**
- Users can click "Try Demo"
- Real database queries with classicmodels data
- OpenAI GPT-3.5 Turbo SQL generation
- Full table functionality (search, sort, export)

### **✅ Database Connection**
- Users can connect their own MySQL/PostgreSQL databases
- Real-time SQL generation and execution
- Secure credential handling
- Production-grade error handling

### **✅ Application Features**
- Unlimited query results (no LIMIT restrictions)
- Advanced table interface
- Dark/light mode
- Mobile responsive design
- CSV export functionality

## 🔧 **Local Development**

For local development, use the `.env.local` file with real credentials:

```bash
# Copy the local environment file
cp server/.env.local server/.env

# Start the application
npm run dev
```

## 🎉 **Ready for Production!**

Your Text-to-SQL application will be fully functional on Render with:
- ✅ Real OpenAI GPT-3.5 Turbo integration
- ✅ Real database demo functionality
- ✅ User database connection capability
- ✅ Production-grade security and performance
