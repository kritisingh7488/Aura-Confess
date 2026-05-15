# 🚀 Quick Start Deployment Steps

## NPM Only - No Yarn

Your project is now ready for deployment using **npm only** (no yarn dependencies).

---

## 📝 Changes Made

✅ **Updated Files**:
- `client/src/services/api.js` - Now uses `VITE_API_URL` environment variable
- `.gitignore` - Cleaned up for npm only deployment

✅ **Created Files**:
- `render.yaml` - Render backend deployment config
- `client/vercel.json` - Vercel frontend deployment config
- `client/.env.production` - Production API URL
- `client/.env.development` - Development API URL
- `DEPLOYMENT_GUIDE.md` - Complete deployment documentation

---

## 🎬 Quick Start (5 Minutes)

### **Backend to Render** (5 min)

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click **"New +"** → **"Web Service"**
4. Select **your GitHub repo**
5. Set:
   - Name: `aura-confess-backend`
   - Build: `npm install`
   - Start: `npm start`
6. Add environment variables (see `DEPLOYMENT_GUIDE.md`)
7. Deploy! ✅

**Your Render URL**: `https://aura-confess-backend.onrender.com`

---

### **Frontend to Vercel** (5 min)

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click **"Add New..."** → **"Project"**
4. Select **your GitHub repo**
5. Set:
   - Framework: `Vite`
   - Root Directory: `./client`
   - Build: `npm run build`
   - Output: `dist`
6. Add environment variable:
   - `VITE_API_URL`: `https://aura-confess-backend.onrender.com`
7. Deploy! ✅

**Your Vercel URL**: `https://your-app.vercel.app`

---

### **Update Google OAuth** (2 min)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Add authorized redirect URIs:
   - `https://aura-confess-backend.onrender.com/auth/google/callback`
   - `https://your-app.vercel.app/auth/google/callback`
3. Update Render env: `CLIENT_URL=https://your-app.vercel.app`
4. Save! ✅

---

## ✅ Testing

```bash
# Test backend
curl https://aura-confess-backend.onrender.com/

# Visit frontend
https://your-app.vercel.app
```

---

## 📌 Next Steps

1. **Read**: `DEPLOYMENT_GUIDE.md` for detailed instructions
2. **Push**: Commit and push to GitHub
   ```bash
   git add .
   git commit -m "Setup deployment configs"
   git push origin main
   ```
3. **Deploy**: Follow steps above
4. **Test**: Verify everything works

---

## 🆘 Common Issues

| Issue | Solution |
|-------|----------|
| CORS Error | Update `CLIENT_URL` in Render |
| API 404 | Check `VITE_API_URL` in Vercel |
| OAuth fails | Verify Google console redirect URIs |
| Build fails | Ensure `package-lock.json` is committed |
| Port issues | Render env should have `PORT=5000` |

---

For detailed help: See `DEPLOYMENT_GUIDE.md`
