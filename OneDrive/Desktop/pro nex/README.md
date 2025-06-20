# Candidate Management System

A modern, cloud-based candidate management system with real-time data persistence using Vercel and MongoDB Atlas.

## Features

- 🔥 Real-time candidate management
- 📊 Interactive dashboard with statistics
- 🕐 Beautiful 24-hour sand clock visual
- 📅 Interview scheduling with calendar view
- 📈 Candidate history tracking
- 📤 Excel export functionality
- 🌓 Dark theme UI
- ☁️ Cloud-based data storage (MongoDB Atlas)
- 🚀 Serverless deployment (Vercel)

## Setup Instructions

### 1. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas/database) and create a free account
2. Create a new cluster (choose the free M0 tier)
3. Go to "Database Access" → Add a new database user
   - Username: `candidateuser` (or any username you prefer)
   - Password: Generate a secure password and save it
   - Database User Privileges: Read and write to any database
4. Go to "Network Access" → Add IP Address
   - Add `0.0.0.0/0` to allow access from anywhere (for Vercel deployment)
5. Go to "Database" → Connect → Choose "Connect your application"
6. Copy the connection string (it looks like: `mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)
7. Replace `<password>` with your actual password

### 2. Vercel Deployment

1. Install Vercel CLI: `npm i -g vercel`
2. In your project directory, run: `vercel`
3. Follow the prompts to create a new project
4. Set up environment variable:
   - Go to your Vercel dashboard → Your project → Settings → Environment Variables
   - Add: `MONGODB_URI` = `your-mongodb-connection-string`
5. Redeploy: `vercel --prod`

### 3. Local Development (Optional)

If you want to run locally:

1. Create a `.env` file:
   ```
   MONGODB_URI=your-mongodb-connection-string
   ```
2. Install dependencies: `npm install`
3. Run: `vercel dev`

## File Structure

```
├── index.html              # Main application entry point
├── candidate-management.html # Main dashboard (copied to index.html)
├── history.html            # History page
├── login.html             # Login page
├── package.json           # Dependencies
├── vercel.json           # Vercel configuration
└── api/
    ├── candidates.js     # API for candidate CRUD operations
    └── history.js        # API for history tracking
```

## API Endpoints

- `GET /api/candidates` - Get all candidates
- `POST /api/candidates` - Save candidates array
- `GET /api/history` - Get history records
- `POST /api/history` - Add new history entry

## Environment Variables

- `MONGODB_URI` - MongoDB Atlas connection string

## Technologies Used

- Frontend: Vanilla HTML, CSS, JavaScript
- Backend: Vercel Serverless Functions
- Database: MongoDB Atlas
- Deployment: Vercel
- Excel Export: SheetJS

## Support

If you encounter any issues:

1. Check Vercel function logs in your dashboard
2. Verify MongoDB Atlas network access settings
3. Ensure environment variables are properly set
4. Check browser console for any errors

## License

MIT License - Feel free to modify and use for your projects.
