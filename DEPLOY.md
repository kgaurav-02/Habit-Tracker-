# Deployment Guide for Habit Tracker

## Quick Deploy to Web (Recommended for Android)

### Option 1: Netlify (Easiest)

1. **Build the app**:
   ```bash
   pnpm run build
   ```

2. **Deploy to Netlify**:
   - Go to https://app.netlify.com
   - Drag and drop the `dist` folder
   - Your app is live with HTTPS! 🎉

3. **Install on Android**:
   - Open the URL in Chrome on Android
   - Tap menu (⋮) → "Add to Home Screen"
   - App installs as a native app!

### Option 2: Vercel

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   pnpm run build
   vercel --prod
   ```

3. Follow the prompts and your app is live!

### Option 3: GitHub Pages

1. **Install gh-pages**:
   ```bash
   pnpm add -D gh-pages
   ```

2. **Update package.json**:
   ```json
   {
     "scripts": {
       "predeploy": "pnpm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Deploy**:
   ```bash
   pnpm run deploy
   ```

## PWA Installation on Android

Once deployed to HTTPS:

1. **Open in Chrome**: Visit your deployed URL
2. **Add to Home Screen**: 
   - Tap the menu (⋮)
   - Select "Add to Home Screen"
   - Tap "Add"
3. **Launch**: Find the app icon on your home screen
4. **Works Offline**: The app works completely offline!

## Important Notes

### HTTPS Required
- PWA features only work on HTTPS
- Development works on localhost
- Production MUST use HTTPS (Netlify/Vercel provide this free)

### Offline Functionality
- All data stored in IndexedDB
- Service Worker caches the app
- Works 100% offline after first load

### Browser Support
**Best on:**
- Chrome/Edge (Android & Desktop)
- Safari (iOS & macOS)

**Features:**
- ✅ PIN authentication
- ✅ Offline storage
- ✅ PWA installation (Android/Desktop)
- ✅ Data export/import
- ✅ Full habit tracking

### Data Storage
- Stored locally in browser's IndexedDB
- Private to your device
- Export data before clearing browser data
- Use export/import to move between devices

## Building from Source

```bash
# Install dependencies
pnpm install

# Development
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview
```

## Configuration

### Change App Name
Edit `/public/manifest.json`:
```json
{
  "name": "Your App Name",
  "short_name": "Short Name"
}
```

### Change Theme Color
Edit `/public/manifest.json`:
```json
{
  "theme_color": "#8B5CF6"
}
```

## Troubleshooting

### PWA Not Installing
- Ensure you're on HTTPS
- Check browser console for errors
- Clear cache and try again

### Data Not Persisting
- Don't use incognito mode
- Check browser storage permissions
- Ensure IndexedDB is enabled

### Service Worker Issues
- Unregister old service workers in DevTools
- Clear all site data
- Hard refresh (Ctrl+Shift+R)

## Next Steps After Deployment

1. ✅ Share the URL with users
2. ✅ Test on different devices
3. ✅ Bookmark for easy access
4. ✅ Install as PWA on phones
5. ✅ Export data regularly as backup

## Production Checklist

- [ ] Build completes without errors
- [ ] App loads on HTTPS
- [ ] PIN login works
- [ ] Can add/delete habits
- [ ] Calendar shows data
- [ ] Stats display correctly
- [ ] Export/import works
- [ ] Works offline
- [ ] PWA installs on Android

Enjoy your habit tracker! 🎯
