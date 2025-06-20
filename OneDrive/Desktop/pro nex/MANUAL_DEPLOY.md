# Manual Deployment Instructions

## If command line doesn't work, try this:

### Step 1: Create a ZIP file
1. Select all files in your `pro nex` folder
2. Right-click → Send to → Compressed folder
3. Name it `candidate-management.zip`

### Step 2: Use Vercel CLI from anywhere
1. Download and install Vercel CLI: https://vercel.com/cli
2. Open Command Prompt as Administrator
3. Run: `vercel --cwd "c:\Users\ashha\OneDrive\Desktop\pro nex"`

### Step 3: Alternative - Upload via Vercel Dashboard
1. Go to https://vercel.com
2. Sign up/Login
3. Try the import option
4. If drag/drop doesn't work, look for "Browse" or "Upload" button

### Step 4: Manual Git Deploy
```bash
# In Command Prompt
cd "c:\Users\ashha\OneDrive\Desktop\pro nex"
git init
git add .
git commit -m "Initial commit"
# Then connect to GitHub or deploy directly
```

## Your MongoDB Connection String (Copy This):
```
mongodb+srv://ProtosNexus:a5hhaad0105@protosnexus.ug0ovq2.mongodb.net/candidatedb?retryWrites=true&w=majority
```

## Testing Locally First:
1. Install Node.js from https://nodejs.org
2. Run: `npm install -g vercel`
3. Run: `vercel dev` in your project folder
4. Test at http://localhost:3000
