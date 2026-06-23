# Habit Tracker App

A fully offline habit tracking application with secure PIN authentication, calendar views, and progress statistics.

## Features

✅ **4-Digit PIN Authentication** - Secure access to your personal data  
✅ **Daily Habit Tracking** - Simple checkbox interface for daily completion  
✅ **Calendar View** - Visual monthly overview with completion heatmap  
✅ **Statistics & Graphs** - Track streaks, completion rates, and trends  
✅ **Completely Offline** - All data stored locally using IndexedDB  
✅ **PWA Support** - Install on Android devices as a native app  
✅ **Data Export/Import** - Backup and restore your habit data  
✅ **Responsive Design** - Works on mobile and desktop  

## Technology Stack

- **Frontend**: React + TypeScript
- **Routing**: React Router v7
- **UI Components**: Radix UI + Tailwind CSS
- **Database**: IndexedDB (via idb)
- **Charts**: Recharts
- **Build Tool**: Vite

## Getting Started

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

### Development

Run the development server:
```bash
pnpm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

Build the app for production:
```bash
pnpm run build
```

The build output will be in the `dist` folder.

## Deploying to Production

### Option 1: Deploy to Netlify/Vercel

1. Build the app: `pnpm run build`
2. Upload the `dist` folder to your hosting service
3. Configure for SPA routing (all routes should serve `index.html`)

### Option 2: Deploy as PWA on Android

1. Build the app and host it on HTTPS (required for PWA)
2. Open the app in Chrome on Android
3. Tap the menu (3 dots) → "Add to Home Screen"
4. The app will install like a native app

**Important**: PWA requires HTTPS in production. Use services like:
- Netlify (automatic HTTPS)
- Vercel (automatic HTTPS)
- GitHub Pages (automatic HTTPS)
- Your own server with SSL certificate

### PWA Configuration

The app includes:
- `manifest.json` - Defines app metadata and icons
- `service-worker.js` - Enables offline functionality
- Meta tags for iOS/Android compatibility

## Using the App

### First Launch

1. Open the app
2. Create a 4-digit PIN (you'll need this to access the app)
3. Confirm your PIN

### Adding Habits

1. Tap the "+" button at the bottom
2. Enter habit name and optional description
3. Choose a color
4. Tap "Add Habit"

### Tracking Habits

- Check off habits daily on the main screen
- View streaks and completion stats
- Navigate between days using Previous/Next buttons

### Viewing Calendar

- Tap "Calendar" in the bottom navigation
- See monthly completion heatmap
- Colors indicate completion rate for each day

### Viewing Statistics

- Tap "Stats" to see:
  - Current and best streaks
  - Total completions
  - Weekly and monthly charts
  - Per-habit performance

### Settings

- Lock the app (returns to PIN screen)
- Export your data as JSON backup
- Import data from backup
- Clear all data

## Data Storage

All data is stored locally in your browser's IndexedDB:
- **Completely private** - No data leaves your device
- **No internet required** - Works 100% offline
- **Persistent** - Data survives browser restarts
- **Portable** - Export/import to move between devices

## Security Notes

- Your PIN is stored locally and never transmitted
- The app is designed for personal use on your own device
- Not suitable for storing highly sensitive information
- Consider using device encryption for additional security

## Browser Compatibility

Works best on:
- Chrome/Edge (Desktop & Android)
- Safari (iOS & macOS)
- Firefox (Desktop & Android)

Requires:
- Modern browser with IndexedDB support
- JavaScript enabled

## Troubleshooting

### PWA not installing on Android
- Ensure you're accessing via HTTPS
- Clear browser cache and try again
- Check that manifest.json is accessible

### Data not persisting
- Check browser storage settings
- Ensure IndexedDB is not blocked
- Don't use incognito/private mode

### Service Worker not registering
- Check browser console for errors
- Ensure HTTPS in production
- Try unregistering and re-registering

## License

This project is open source and available for personal use.

## Support

For issues or questions, please check the browser console for error messages.
