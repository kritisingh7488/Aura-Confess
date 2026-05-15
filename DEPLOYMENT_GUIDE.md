# AuraConfess - Deployment Guide (Vercel + Render)

## 🎯 Overview
- **Backend**: Node.js/Express on **Render** (Free tier)
- **Frontend**: React/Vite on **Vercel** (Free tier)
- **Database**: MongoDB Atlas (existing)
- **Package Manager**: NPM only (no yarn)

---

## ✅ Pre-Deployment Checklist

- [x] Code pushed to GitHub
- [x] `.env` files configured (local development)
- [x] `package-lock.json` committed
- [x] No yarn files (using npm only)
- [x] Backend server listens on `process.env.PORT`
- [x] Frontend uses environment variables for API URL
- [x] `render.yaml` and `vercel.json` created

---

## 📋 Part 1: Setup Backend on Render

### Step 1.1: Create Render Account
1. Visit [render.com](https://render.com)
2. Sign up with GitHub (recommended)
3. Connect your GitHub account

### Step 1.2: Deploy Backend
1. Click **"New +"** button
2. Select **"Web Service"**
3. Select your **GitHub repository** (AuraConfess)
4. Fill in deployment details:
   - **Name**: `aura-confess-backend`
   - **Environment**: `Node`
   - **Plan**: `Free` (or paid for production)
   - **Branch**: `main` (or your main branch)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: Leave empty (Render will use root)

### Step 1.3: Add Environment Variables on Render
Click **"Environment"** in the web service dashboard and add these variables:

```

```

⚠️ **Important**: Replace `https://your-vercel-app-name.vercel.app` with your actual Vercel URL (you'll get this in Part 2)

### Step 1.4: Wait for Deployment
- Render will automatically build and deploy
- Watch the deployment logs
- Once complete, your backend URL will be: `https://aura-confess-backend.onrender.com`
- Test it: Visit `https://aura-confess-backend.onrender.com/` - you should see JSON response

---

## 🚀 Part 2: Setup Frontend on Vercel

### Step 2.1: Create Vercel Account
1. Visit [vercel.com](https://vercel.com)
2. Sign up with GitHub (recommended)
3. Connect your GitHub account

### Step 2.2: Deploy Frontend
1. Click **"Add New..."** → **"Project"**
2. Select your **GitHub repository** (AuraConfess)
3. **Important**: Configure these settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 2.3: Add Environment Variables on Vercel
In the project settings, go to **"Environment Variables"** and add:

```
VITE_API_URL=https://aura-confess-backend.onrender.com
```

### Step 2.4: Deploy
- Click **"Deploy"**
- Vercel will build and deploy automatically
- Get your frontend URL (e.g., `https://aura-confess-nine.vercel.app`)

---

## 🔐 Step 3: Update Google OAuth Settings

### Update Google Cloud Console:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Find your OAuth 2.0 credentials for AuraConfess
3. Under **"Authorized redirect URIs"**, add:
   ```
   https://aura-confess-backend.onrender.com/auth/google/callback
   https://your-vercel-url.vercel.app/auth/google/callback
   ```
4. Save changes

---

## 🔄 Step 4: Final Setup - Update Backend Environment

After getting your Vercel URL, update Render environment variables:

1. Go to **Render Dashboard** → Your service
2. Click **"Environment"**
3. Update:
   - `CLIENT_URL`: Your actual Vercel URL
   - `GOOGLE_CALLBACK_URL`: `https://aura-confess-backend.onrender.com/auth/google/callback`
4. Click **"Save"** - Render will auto-redeploy

---

## ✨ Part 5: Testing & Verification

### Test Backend:
```bash
curl https://aura-confess-backend.onrender.com/
# Should return: {"message":"AuraConfess API is running! 🎮"}
```

### Test Frontend:
1. Visit your Vercel URL
2. Open **DevTools** (F12) → **Network** tab
3. Try logging in with Google
4. Check that requests go to your Render backend

### Checklist:
- [ ] Backend deployed on Render
- [ ] Frontend deployed on Vercel
- [ ] Backend URL works (returns JSON)
- [ ] Frontend loads without errors
- [ ] Google OAuth login works
- [ ] Can create confessions
- [ ] Can view confessions
- [ ] API calls succeed (check Network tab)
- [ ] MongoDB connection works

---

## 🛠️ File Structure After Deployment

```
AuraConfess/
├── backend/
│   ├── server.js              # Listens on process.env.PORT
│   ├── routes/
│   ├── models/
│   └── config/
├── client/
│   ├── src/
│   │   ├── services/
│   │   │   └── api.js         # Uses VITE_API_URL env var
│   │   └── ...
│   ├── .env.production        # Production API URL
│   ├── .env.development       # Local API URL
│   ├── vite.config.js
│   ├── vercel.json            # Vercel config
│   └── package.json
├── render.yaml                # Render config
├── package.json               # Root (npm only)
└── package-lock.json          # npm lock file (not yarn)
```

---

## 🚨 Troubleshooting

### 1. "Cannot GET /" on backend
- **Cause**: Backend not running or wrong URL
- **Fix**: Check Render deployment logs

### 2. CORS Error on frontend
- **Cause**: `CLIENT_URL` in backend doesn't match Vercel URL
- **Fix**: Update `CLIENT_URL` in Render environment

### 3. Confessions not loading
- **Cause**: `VITE_API_URL` incorrect or backend down
- **Fix**: Check frontend `.env.production` and Vercel build logs

### 4. Google OAuth not working
- **Cause**: Incorrect redirect URIs or client ID/secret
- **Fix**: Verify Google Cloud Console settings match Render URL

### 5. Build fails on Render
- **Cause**: Node modules issue
- **Fix**: Clear cache on Render and retry deployment

### 6. "Module not found" error
- **Cause**: Missing `package-lock.json`
- **Fix**: Ensure `package-lock.json` is committed to git

---

## 📱 Local Development

To develop locally while deployed:

```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

Then visit `http://localhost:5173`

---

## 🔄 Redeployment

### Auto-Redeploy on Push:
Both Render and Vercel automatically redeploy when you push to GitHub:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

### Manual Redeploy:
- **Render**: Dashboard → Select service → Click "Redeploy"
- **Vercel**: Dashboard → Select project → Click "Redeploy"

---

## 📊 Production URLs

Once deployed:
- **Frontend**: `https://your-project-name.vercel.app`
- **Backend API**: `https://aura-confess-backend.onrender.com`
- **MongoDB Atlas**: Already configured

---

## 🎉 Success Criteria

You'll know it's working when:
1. ✅ Frontend loads without errors
2. ✅ Can log in with Google OAuth
3. ✅ Can create new confessions
4. ✅ Can view all confessions
5. ✅ Can react/comment on confessions
6. ✅ Database shows new records

---

## 💡 Tips & Best Practices

1. **Keep `.env` files out of git** - Already in `.gitignore`
2. **Use environment variables** - Both backends configured
3. **Monitor logs** - Render and Vercel both provide logs
4. **Set up alerts** - Enable notifications for deployment failures
5. **Test thoroughly** - Test all features before production
6. **Plan for scale** - Upgrade plans as traffic increases

---

For more help:
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- GitHub: Your repository

---

**Last Updated**: 2026-05-16
**Deployment Strategy**: Free tier (Vercel + Render)
**Package Manager**: npm (no yarn)
