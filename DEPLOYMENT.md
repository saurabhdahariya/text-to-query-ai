# Deployment Guide for Text-to-SQL Application

This guide will help you deploy the Text-to-SQL application to Render.com for production use.

## Prerequisites

1. A GitHub account
2. A Render.com account (free tier available)
3. An OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)

## Quick Deployment Steps

### 1. Prepare Your Repository

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Prepare for production deployment"
   git push origin main
   ```

### 2. Deploy to Render

1. Go to [Render.com](https://render.com) and sign in
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Use these settings:
   - **Name**: `text-to-sql-app` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build && cd server && npm install`
   - **Start Command**: `cd server && node server.js`

### 3. Set Environment Variables

In the Render dashboard, add these environment variables:

**Required Variables:**
- `NODE_ENV`: `production`
- `OPENAI_API_KEY`: Your OpenAI API key
- `SESSION_SECRET`: Generate using `require('crypto').randomBytes(64).toString('hex')`

**Optional Variables:**
- `OPENAI_BASE_URL`: `https://api.openai.com/v1` (default)
- `RATE_LIMIT_WINDOW_MS`: `900000` (15 minutes)
- `RATE_LIMIT_MAX_REQUESTS`: `100`

**Note**: `PORT` and `RENDER_EXTERNAL_URL` are automatically set by Render.

### 4. Deploy

1. Click "Create Web Service"
2. Wait for the build and deployment to complete (5-10 minutes)
3. Your app will be available at `https://your-app-name.onrender.com`

## Project Structure

```
text-to-sql/
├── build/                 # React production build (generated)
├── public/               # React public files
├── src/                  # React source code
├── server/               # Express.js backend
│   ├── routes/          # API routes
│   ├── package.json     # Backend dependencies
│   └── server.js        # Main server file
├── package.json         # Frontend dependencies & scripts
└── render.yaml          # Render deployment config
```

## How It Works

1. **Build Process**: 
   - Frontend React app is built to `build/` directory
   - Backend dependencies are installed in `server/`

2. **Production Server**:
   - Serves static React files from `build/` directory
   - Handles API requests under `/api/*` routes
   - Serves React app for all other routes (SPA routing)

3. **Environment Detection**:
   - Static file serving only enabled in production
   - CORS configured for production domains
   - Error messages sanitized in production

## Troubleshooting

### Common Issues

1. **"Route not found" errors**:
   - Fixed: Static file serving now comes before 404 handler
   - React app routing properly handled

2. **CORS errors**:
   - Fixed: Production CORS allows Render domain
   - Automatic detection of Render external URL

3. **Build failures**:
   - Ensure all dependencies are in package.json
   - Check build logs in Render dashboard

### Logs and Monitoring

- View logs in Render dashboard under "Logs" tab
- Health check available at `/health` endpoint
- Monitor API responses and error rates

## Local Development

```bash
# Install dependencies
npm install
npm run install:server

# Start development servers
npm run dev
```

This starts both frontend (port 3000) and backend (port 5000) in development mode.

## Production Testing

Before deploying, test production build locally:

```bash
# Build for production
npm run build:production

# Start production server
npm run start:production
```

Visit `http://localhost:5000` to test the production build.

## Security Notes

- Never commit `.env` files with real API keys
- Use strong, unique SESSION_SECRET in production
- Rate limiting is enabled by default
- HTTPS is enforced by Render automatically
- CORS is configured for production domains only

## Support

If you encounter issues:
1. Check Render deployment logs
2. Verify environment variables are set correctly
3. Ensure OpenAI API key is valid and has credits
4. Test locally with production build first
