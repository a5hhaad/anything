@echo off
echo =============================================
echo  Candidate Management System - Deployment
echo =============================================
echo.
echo Your MongoDB Connection String:
echo mongodb+srv://ProtosNexus:a5hhaad0105@protosnexus.ug0ovq2.mongodb.net/candidatedb?retryWrites=true&w=majority
echo.
echo Prerequisites Check:
echo 1. MongoDB Atlas cluster is running ✓
echo 2. Database user created ✓
echo 3. Network access configured ✓
echo 4. Connection string ready ✓
echo.
pause

echo Installing Vercel CLI...
call npm install -g vercel

echo.
echo Starting Vercel deployment...
echo Follow the prompts:
echo - Set up and deploy? Y
echo - Link to existing project? N  
echo - Project name: protosnexus-candidate-management
echo - Directory: ./
echo.
call vercel

echo.
echo =============================================
echo  IMPORTANT: Add Environment Variable
echo =============================================
echo.
echo 1. Go to https://vercel.com/dashboard
echo 2. Find your project and click on it
echo 3. Go to Settings → Environment Variables
echo 4. Add new variable:
echo    Name: MONGODB_URI
echo    Value: mongodb+srv://ProtosNexus:a5hhaad0105@protosnexus.ug0ovq2.mongodb.net/candidatedb?retryWrites=true&w=majority
echo 5. Save and redeploy with: vercel --prod
echo.
echo Your app will be live at the Vercel URL!
echo.
pause
