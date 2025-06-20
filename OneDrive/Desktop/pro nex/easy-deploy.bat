@echo off
cls
echo ========================================
echo   CANDIDATE MANAGEMENT SYSTEM DEPLOY
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please download and install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo ✓ Node.js is installed
echo.

REM Install Vercel CLI
echo Installing Vercel CLI...
call npm install -g vercel@latest
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Vercel CLI
    pause
    exit /b 1
)

echo ✓ Vercel CLI installed
echo.

REM Navigate to project directory
cd /d "%~dp0"
echo Current directory: %cd%
echo.

REM Login to Vercel
echo Opening browser for Vercel login...
call vercel login

REM Deploy project
echo.
echo Starting deployment...
echo When prompted:
echo - Set up and deploy? Type: y
echo - Which scope? Choose your account
echo - Link to existing project? Type: n
echo - What's your project's name? Type: candidate-management
echo - In which directory is your code located? Press Enter
echo.
pause

call vercel

echo.
echo ========================================
echo   DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo NEXT STEPS:
echo 1. Copy the deployment URL from above
echo 2. Go to https://vercel.com/dashboard
echo 3. Click on your project
echo 4. Go to Settings → Environment Variables
echo 5. Add: MONGODB_URI
echo 6. Value: mongodb+srv://ProtosNexus:a5hhaad0105@protosnexus.ug0ovq2.mongodb.net/candidatedb?retryWrites=true&w=majority
echo 7. Save and redeploy: vercel --prod
echo.
pause
