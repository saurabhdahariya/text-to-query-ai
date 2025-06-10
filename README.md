# 🚀 Text-to-SQL AI Application

A production-ready application that converts natural language queries into SQL using OpenAI GPT-3.5 Turbo. Query your MySQL or PostgreSQL databases using plain English!

![Text-to-SQL Demo](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Node.js](https://img.shields.io/badge/Node.js-16%2B-green)
![React](https://img.shields.io/badge/React-19-blue)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--3.5--Turbo-orange)

## 🌟 Features

- **🧪 Try Demo Mode**: Test the experience with a sample  database without connecting your own database
- **🔌 Connect Your Database**: Securely connect to PostgreSQL and MySQL databases with step-by-step instructions
- **Natural Language to SQL**: Convert plain English questions to SQL queries using ChatGPT
- **Database Support**: Works with PostgreSQL and MySQL databases
- **Secure Connections**: Safe, read-only query execution with validation
- **Modern UI**: Clean black-and-white theme using React + TailwindCSS + shadcn/ui
- **Real-time Results**: Execute generated SQL and view results in styled tables

## 📱 Application Pages

### 🏠 Landing Page
- Modern hero section with gradient text effects
- Interactive example queries
- Two main CTAs: "Connect Your Database" and "Try Demo"
- Feature showcase and professional footer

### 🧪 Try Demo Page
- **Live Database Connection**: Uses demo MySQL database with classicmodels schema
- **OpenAI GPT-3.5 Turbo Integration**: Natural language queries converted to SQL using OpenAI API
- **Interactive Examples**: Pre-built queries for customers, orders, products, employees, and offices
- **Real-time Execution**: Generated SQL is executed on demo database and results displayed
- **Unlimited Results**: No artificial limits - query entire tables
- **Advanced Table Features**: Search, sort, pagination, and CSV export
- **Error Handling**: Comprehensive error messages and validation

### 🔌 Connect Your Database Page
- Step-by-step setup instructions with numbered guides
- Security best practices and read-only user recommendations
- Professional form with validation and error handling
- Two action buttons: "Test Connection" and "Save & Connect"
- Responsive design with instructions sidebar

## 🗄️ Demo Database Schema (ClassicModels)

The demo uses the **classicmodels** database with the following tables:

- **customers**: Customer information with contact details and credit limits
- **orders**: Order records with dates, status, and customer relationships
- **orderdetails**: Individual line items for each order with quantities and prices
- **products**: Product catalog with descriptions, pricing, and inventory
- **employees**: Employee records with job titles and office assignments
- **offices**: Office locations with addresses and territories
- **payments**: Customer payment records with amounts and dates
- **productlines**: Product categories with descriptions

**Example Queries You Can Try:**
- "Show me all customers from the USA"
- "List the top 5 most expensive products"
- "Find all orders placed in 2023"
- "Show employees and their office locations"
- "Get total sales by product line"
- "Find customers with the highest credit limits"

## 🚀 Quick Start

### **🎯 Try Demo (No Setup Required)**
1. Visit the deployed application
2. Click "Try Demo"
3. Start querying with natural language immediately!
4. Uses OpenAI GPT-3.5 Turbo with mock data

### **🔌 Connect Your Database**
1. Click "Connect Database"
2. Enter your MySQL or PostgreSQL credentials
3. Query your real data with natural language

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key (get from [OpenAI Platform](https://platform.openai.com/api-keys))
- Optional: MySQL or PostgreSQL database

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd text-to-sql
```

2. **Install dependencies**
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

3. **Environment Setup**

**Backend (.env in /server directory):**
```env
PORT=5000
NODE_ENV=development
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_BASE_URL=https://api.openai.com/v1
SESSION_SECRET=your_super_secret_session_key_here
FRONTEND_URL=http://localhost:3000
```

**Get your OpenAI API key from:** [OpenAI Platform](https://platform.openai.com/api-keys)

### Running the Application

1. **Start the backend server**
```bash
cd server
npm start
# Server will run on http://localhost:5000
```

2. **Start the frontend (in a new terminal)**
```bash
npm start
# Frontend will run on http://localhost:3000
```

## 🔧 Available Scripts

### Frontend
- `npm start` - Runs the React app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner

### Backend
- `npm start` - Starts the Express server
- `npm run dev` - Starts the server with nodemon for development

## 🏗️ Architecture

### Frontend (React + TailwindCSS + shadcn/ui)
- **LandingPage**: Welcome page with features and CTA
- **DatabaseConnectForm**: Database connection form with validation
- **NaturalLanguageInput**: Text input for natural language queries
- **SqlOutput**: Display generated SQL with execution button
- **ResultTable**: Display query results in a styled table
- **Navbar**: Navigation with connection status and disconnect

### Backend (Node.js + Express)
- **SQL Generation API**: `/api/openai-sql/generate` - Converts natural language to SQL using OpenAI GPT-3.5 Turbo
- **Database API**: `/api/database/*` - Handles database connections and query execution
- **Security**: Rate limiting, input validation, read-only queries only

## 🔒 Security Features

- **Read-only Queries**: Only SELECT statements are allowed
- **SQL Injection Protection**: Parameterized queries and input validation
- **Rate Limiting**: Prevents API abuse
- **Session Management**: Secure session handling for database connections
- **Input Sanitization**: Validates all user inputs

## 🎯 Usage

1. **Connect to Database**: Enter your database credentials (host, port, username, password, database name)
2. **Ask Questions**: Type natural language questions like "Show me all users from last month"
3. **Review SQL**: Check the generated SQL query before execution
4. **Execute & View**: Run the query and view results in a formatted table

## 📝 Example Queries

- "Show me all users who signed up last month"
- "What are the top 5 products by sales?"
- "Find customers with more than 3 orders"
- "Show revenue by month for this year"

## 🛠️ Tech Stack

- **Frontend**: React 19, TailwindCSS 3, shadcn/ui, Lucide Icons
- **Backend**: Node.js, Express.js, OpenAI GPT-3.5 Turbo API
- **Database**: PostgreSQL, MySQL (via pg and mysql2)
- **Security**: Helmet, CORS, Rate Limiting, Joi Validation






