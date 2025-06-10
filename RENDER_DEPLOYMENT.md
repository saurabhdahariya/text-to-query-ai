# 🚀 Render Deployment Guide

## 📋 **Pre-Deployment Checklist**

✅ **Repository**: Code pushed to GitHub  
✅ **Environment Variables**: Ready for Render configuration  
✅ **Build Scripts**: Production-ready package.json  
✅ **Security**: All credentials protected with .gitignore  

## 🌐 **Deploy to Render**

### **Step 1: Create Render Account**
1. Go to [Render.com](https://render.com)
2. Sign up with your GitHub account
3. Authorize Render to access your repositories

### **Step 2: Create New Web Service**
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `https://github.com/saurabhdahariya/text-to-query-ai.git`
3. Configure the service:

```
Name: text-to-sql-app
Environment: Node
Region: Oregon (US West) or closest to you
Branch: main
Build Command: npm install && npm run build && cd server && npm install
Start Command: cd server && node server.js
```

### **Step 3: Configure Environment Variables**

In Render dashboard, add these environment variables:

#### **Required Variables:**
```
NODE_ENV = production
PORT = 5000
OPENAI_API_KEY = sk-proj-your_actual_openai_api_key_here
OPENAI_BASE_URL = https://api.openai.com/v1
SESSION_SECRET = your_secure_random_session_secret_here
FRONTEND_URL = https://your-app-name.onrender.com
```

#### **Optional Variables:**
```
FRONTEND_URL = https://your-app-name.onrender.com
RATE_LIMIT_WINDOW_MS = 900000
RATE_LIMIT_MAX_REQUESTS = 100
```

### **Step 4: Deploy**
1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Build the React frontend
   - Start the Node.js server
3. Wait for deployment to complete (5-10 minutes)

### **Step 5: Access Your Application**
- Your app will be available at: `https://your-app-name.onrender.com`
- The URL will be shown in your Render dashboard

## 🔧 **Environment Variables Setup**

### **Getting Your OpenAI API Key:**
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create account or sign in
3. Click **"Create new secret key"**
4. Copy the key (starts with `sk-proj-...`)
5. Add to Render environment variables

### **Generating Session Secret:**
Use any of these methods to generate a secure session secret:

**Option 1: Online Generator**
- Visit: https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx
- Generate a 256-bit key

**Option 2: Node.js**
```javascript
require('crypto').randomBytes(64).toString('hex')
```

**Option 3: OpenSSL**
```bash
openssl rand -hex 64
```

## 🎯 **Post-Deployment Testing**

### **Test Demo Mode:**
1. Visit your Render URL
2. Click **"Try Demo"**
3. Ask: "Show me all customers from France"
4. Verify results display correctly

### **Test Database Connection:**
1. Click **"Connect Database"**
2. Enter your database credentials
3. Test connection
4. Query your data

### **Test Features:**
- ✅ Natural language queries
- ✅ Table display and pagination
- ✅ Search and sorting
- ✅ CSV export
- ✅ Dark/light mode toggle
- ✅ Mobile responsiveness

## 🔄 **Updating Your Application**

### **Automatic Deployments:**
Render automatically redeploys when you push to GitHub:

```bash
# Make changes locally
git add .
git commit -m "Update feature"
git push origin main
# Render automatically redeploys
```

### **Manual Deployment:**
1. Go to Render dashboard
2. Click your service
3. Click **"Manual Deploy"** → **"Deploy latest commit"**

## 🐛 **Troubleshooting**

### **Common Issues:**

#### **Build Failures:**
- Check build logs in Render dashboard
- Ensure all dependencies are in package.json
- Verify Node.js version compatibility

#### **Environment Variable Issues:**
- Double-check variable names (case-sensitive)
- Ensure no extra spaces in values
- Verify OpenAI API key is valid

#### **Database Connection Issues:**
- Check if database allows external connections
- Verify firewall settings
- Test connection from local environment first

#### **CORS Issues:**
- Set FRONTEND_URL to your Render app URL
- Check server CORS configuration

### **Checking Logs:**
1. Go to Render dashboard
2. Click your service
3. Click **"Logs"** tab
4. Check for error messages

### **Performance Issues:**
- Render free tier has limitations
- Consider upgrading to paid plan for production
- Monitor resource usage in dashboard

## 🎉 **Success Checklist**

After successful deployment, verify:

- ✅ **Application loads** at Render URL
- ✅ **Demo mode works** without database setup
- ✅ **Database connection** works with real credentials
- ✅ **OpenAI integration** generates SQL correctly
- ✅ **All features functional** (search, sort, export)
- ✅ **Mobile responsive** design works
- ✅ **Dark/light mode** toggles correctly

## 🔒 **Security Notes**

### **Production Security:**
- ✅ All credentials in environment variables
- ✅ No sensitive data in repository
- ✅ HTTPS enabled by default on Render
- ✅ SQL injection protection active
- ✅ Rate limiting configured

### **Monitoring:**
- Check Render logs regularly
- Monitor API usage and costs
- Set up alerts for errors
- Review security best practices

## 📞 **Support**

### **Render Support:**
- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)
- [Render Status](https://status.render.com)

### **Application Support:**
- Check GitHub Issues
- Review application logs
- Test locally first

---

**🎯 Your Text-to-SQL application is now ready for production deployment on Render!**
