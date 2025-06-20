# 🚀 Deployment Guide - Candidate Management System

## Your MongoDB Connection String (Ready to Use)
```
mongodb+srv://ProtosNexus:a5hhaad0105@protosnexus.ug0ovq2.mongodb.net/candidatedb?retryWrites=true&w=majority
```

## Step 1: Install Vercel CLI
Open Command Prompt as Administrator and run:
```bash
npm install -g vercel
```

## Step 2: Deploy to Vercel
1. Open Command Prompt
2. Navigate to your project:
   ```bash
   cd "c:\Users\ashha\OneDrive\Desktop\pro nex"
   ```
3. Start deployment:
   ```bash
   vercel
   ```
4. Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? (choose your account)
   - Link to existing project? **N**
   - Project name: **protosnexus-candidate-management** (or any name)
   - In which directory is your code located? **./** (current directory)

## Step 3: Add Environment Variable
1. After deployment, go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Find your project → Click on it
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Name:** `MONGODB_URI`
   - **Value:** `mongodb+srv://ProtosNexus:a5hhaad0105@protosnexus.ug0ovq2.mongodb.net/candidatedb?retryWrites=true&w=majority`
   - **Environment:** Production, Preview, Development (check all)
5. Click **Save**

## Step 4: Redeploy
```bash
vercel --prod
```

## Step 5: Test Your App
1. Vercel will provide a URL (like: https://your-project.vercel.app)
2. Open the URL in your browser
3. Try adding a candidate to test the database connection

## 🎉 Success Indicators
- ✅ App loads without errors
- ✅ Can add candidates (they persist after refresh)
- ✅ History page shows changes
- ✅ Sand clock displays correctly

## 🆘 Troubleshooting
If you encounter issues:
1. Check Vercel function logs in dashboard
2. Verify environment variable is set correctly
3. Test with browser developer tools (F12) for console errors

## 📞 Alternative: Manual Setup
If CLI doesn't work:
1. Go to [vercel.com](https://vercel.com)
2. Import from GitHub (if you push code there)
3. Or drag & drop your project folder
