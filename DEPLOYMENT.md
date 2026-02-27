# Deployment Guide - AllSwing Golf Tracker

## 🚀 Quick Deploy to Railway (Recommended)

### Prerequisites
- GitHub account (free)
- Railway account (free)

### Step-by-Step Instructions

#### 1. Push Code to GitHub

First, let's get your code on GitHub:

```bash
# Navigate to your project
cd /Users/domach/allswing-golf-tracker

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - AllSwing Golf Tracker"
```

Now go to https://github.com and:
1. Click the "+" icon in top right
2. Click "New repository"
3. Name it: `allswing-golf-tracker`
4. Leave it public (or private if you prefer)
5. **DO NOT** initialize with README (we already have code)
6. Click "Create repository"

GitHub will show you commands like this - run them:
```bash
git remote add origin https://github.com/YOUR_USERNAME/allswing-golf-tracker.git
git branch -M main
git push -u origin main
```

#### 2. Deploy to Railway

1. **Sign Up**
   - Go to https://railway.app
   - Click "Login" then "Login with GitHub"
   - Authorize Railway to access your GitHub

2. **Create New Project**
   - Click "New Project"
   - Click "Deploy from GitHub repo"
   - Select `allswing-golf-tracker`
   - Railway will automatically start building!

3. **Configure Environment**
   - Click on your project
   - Go to "Variables" tab
   - Click "New Variable"
   - Add: `NODE_ENV` with value `production`

4. **Get Your Public URL**
   - Go to "Settings" tab
   - Under "Domains", click "Generate Domain"
   - You'll get a URL like: `allswing-golf-tracker.up.railway.app`
   - **This is your live website!**

#### 3. Test Your Live Site

Open your Railway URL in a browser and test:
- ✅ Club selection works
- ✅ Can record shots
- ✅ Can view history
- ✅ Sessions are saved

---

## 📱 Install as App on Phone

Once deployed, users can install it like a native app:

### On iPhone (Safari)
1. Open your Railway URL in Safari
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"
5. App icon appears on home screen!

### On Android (Chrome)
1. Open your Railway URL in Chrome
2. Tap the three dots menu
3. Tap "Add to Home Screen"
4. Tap "Add"
5. App icon appears on home screen!

---

## 🔄 Updating Your Live Site

Whenever you make changes:

```bash
# Make your changes to the code
# Then commit and push:
git add .
git commit -m "Description of changes"
git push
```

Railway automatically detects the push and redeploys! Usually takes 1-2 minutes.

---

## 💰 Costs

### Railway Free Tier
- 500 execution hours per month (enough for hobby use)
- $5/month after that
- Can add credit card for additional usage

### If You Need More Free Options:

**Vercel** (Frontend hosting)
- Unlimited bandwidth
- Perfect for this app
- 100% free for hobby projects

**Render** (Full stack hosting)
- Free tier: 750 hours/month
- Spins down after inactivity (takes 30 seconds to wake up)

---

## 🌐 Custom Domain (Optional)

Want `allswing.com` instead of Railway's URL?

1. Buy domain from Namecheap, GoDaddy, etc ($10-15/year)
2. In Railway:
   - Go to Settings > Domains
   - Click "Custom Domain"
   - Enter your domain
   - Add DNS records as instructed
3. Done! Your app is at your custom domain

---

## 🔒 Security Considerations

For MVP/personal use, current setup is fine. For production with many users, consider:

- Add user authentication
- Use PostgreSQL instead of SQLite
- Add rate limiting
- Enable HTTPS (Railway does this automatically)
- Add data backup system

---

## 📊 Monitoring

Railway provides:
- Deployment logs
- Server logs
- Metrics dashboard
- Usage statistics

Access from your Railway dashboard.

---

## 🆘 Troubleshooting

### Build Failed
- Check Railway logs
- Ensure `package.json` has correct scripts
- Verify `NODE_ENV=production` is set

### Database Issues
- SQLite database persists on Railway's disk
- If you redeploy, data is preserved
- For production, consider upgrading to PostgreSQL

### App Not Loading
- Check Railway logs for errors
- Verify build completed successfully
- Check browser console for frontend errors

---

## 🎯 Next Steps After Deployment

1. ✅ Test all features on live site
2. ✅ Install as app on your phone
3. ✅ Share with friends to test
4. ✅ Use it during actual practice!
5. Consider adding features:
   - User accounts
   - Cloud sync across devices
   - Advanced analytics
   - Share sessions with friends
   - Practice goals and streaks

---

## Alternative: Vercel Deployment

If you prefer Vercel:

1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Add New Project"
4. Import your GitHub repo
5. Configure:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
6. Add Environment Variable: `NODE_ENV=production`
7. Deploy!

Note: You'll need to deploy the backend separately or use serverless functions.

---

## Questions?

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- This README: See README.md for API details

Good luck! 🏌️⛳
