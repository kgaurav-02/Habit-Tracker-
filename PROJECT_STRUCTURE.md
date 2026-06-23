# 📁 Habit Tracker - Project Structure

## Overview
This is a complete, production-ready habit tracking application with offline capabilities.

```
habit-tracker/
├── public/                      # Static assets & PWA files
│   ├── manifest.json           # PWA manifest for Android installation
│   ├── service-worker.js       # Service worker for offline functionality
│   ├── icon-192.png            # App icon 192x192
│   └── icon-512.png            # App icon 512x512
│
├── src/
│   ├── app/
│   │   ├── components/         # React components
│   │   │   ├── ui/            # UI component library (Radix + Tailwind)
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── checkbox.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── calendar.tsx
│   │   │   │   ├── progress.tsx
│   │   │   │   ├── alert-dialog.tsx
│   │   │   │   └── ... (50+ components)
│   │   │   │
│   │   │   ├── AddHabitDialog.tsx      # Dialog for creating new habits
│   │   │   └── ManageHabitsDialog.tsx  # Dialog for managing/deleting habits
│   │   │
│   │   ├── contexts/           # React contexts
│   │   │   └── AuthContext.tsx # Authentication & PIN management
│   │   │
│   │   ├── pages/              # Route pages
│   │   │   ├── LoginPage.tsx   # 4-digit PIN authentication
│   │   │   ├── HabitsPage.tsx  # Main daily tracking page
│   │   │   ├── CalendarPage.tsx # Monthly calendar view
│   │   │   ├── StatsPage.tsx   # Statistics & graphs
│   │   │   ├── SettingsPage.tsx # Settings & data management
│   │   │   └── NotFoundPage.tsx # 404 page
│   │   │
│   │   ├── services/           # Business logic
│   │   │   └── database.ts     # IndexedDB operations & data layer
│   │   │
│   │   ├── App.tsx             # Root app component
│   │   └── routes.tsx          # React Router configuration
│   │
│   ├── styles/                 # CSS files
│   │   ├── index.css          # Main CSS entry point
│   │   ├── fonts.css          # Font imports
│   │   ├── tailwind.css       # Tailwind directives
│   │   └── theme.css          # Theme variables & base styles
│   │
│   ├── imports/                # User imported images (from Figma)
│   │   └── ... (design reference images)
│   │
│   └── main.tsx                # Application entry point
│
├── index.html                  # HTML template with PWA setup
├── vite.config.ts             # Vite configuration
├── package.json               # Dependencies & scripts
├── postcss.config.mjs         # PostCSS configuration
│
└── Documentation/
    ├── README.md              # Main documentation
    ├── QUICKSTART.md          # Quick start guide for users
    ├── DEPLOY.md              # Deployment instructions
    ├── FEATURES.md            # Complete feature list
    └── PROJECT_STRUCTURE.md   # This file
```

## 🗄️ Database Schema (IndexedDB)

### Object Stores

#### 1. **habits**
Stores all user habits
```typescript
{
  id: string;              // UUID
  name: string;            // "Morning Exercise"
  description?: string;    // Optional description
  color: string;           // Hex color "#8B5CF6"
  icon?: string;           // Future use
  createdAt: string;       // ISO timestamp
  goal: 'daily' | 'weekly' | 'custom';
  targetDays?: number[];   // For weekly/custom goals
  order: number;           // Display order
}
```

#### 2. **completions**
Tracks daily completions
```typescript
{
  id: string;              // UUID
  habitId: string;         // Reference to habit
  date: string;            // "YYYY-MM-DD"
  completed: boolean;      // true/false
  completedAt?: string;    // ISO timestamp when completed
  note?: string;           // Optional note
}
```

#### 3. **settings**
Stores app settings
```typescript
{
  id: 'app-settings';      // Fixed ID
  pin: string;             // 4-digit PIN
  theme: 'light' | 'dark'; // Theme preference
  firstLaunch: boolean;    // Setup status
  reminderTime?: string;   // Future use
}
```

## 🧩 Component Architecture

### Pages
- **LoginPage**: PIN authentication with numeric keypad
- **HabitsPage**: Main tracking interface with checkboxes
- **CalendarPage**: Monthly heatmap view
- **StatsPage**: Charts and statistics
- **SettingsPage**: Data management and app settings
- **NotFoundPage**: 404 error page

### Dialogs
- **AddHabitDialog**: Form to create new habits
- **ManageHabitsDialog**: List to edit/delete habits
- **AlertDialog**: Confirmation dialogs

### Contexts
- **AuthContext**: Manages authentication state and PIN operations

## 🔄 Data Flow

```
User Action
    ↓
Component Handler
    ↓
Database Service (database.ts)
    ↓
IndexedDB
    ↓
State Update
    ↓
UI Re-render
```

## 🎨 Styling System

### Tailwind CSS v4
- Utility-first CSS
- Custom theme in `theme.css`
- Component variants using `class-variance-authority`
- Responsive breakpoints

### Color Palette
- Primary: Purple (#8B5CF6)
- Secondary: Blue (#3B82F6)
- Accent colors: Green, Amber, Red, Pink, Teal, Orange

### Theme Variables
Defined in `/src/styles/theme.css`:
- `--background`, `--foreground`
- `--primary`, `--secondary`
- `--muted`, `--accent`
- `--border`, `--ring`
- Chart colors: `--chart-1` through `--chart-5`

## 🔌 Key Dependencies

### Core
- `react` (18.3.1) - UI framework
- `react-router` (7.13.0) - Routing
- `typescript` - Type safety

### Database
- `idb` (8.0.3) - IndexedDB wrapper

### UI Components
- `@radix-ui/*` - Accessible component primitives
- `lucide-react` - Icons
- `recharts` - Charts and graphs
- `canvas-confetti` - Celebrations

### Utilities
- `date-fns` - Date manipulation
- `clsx` + `tailwind-merge` - Class name utilities
- `sonner` - Toast notifications

## 📱 PWA Configuration

### Manifest (`/public/manifest.json`)
- App name and descriptions
- Icons (192x192, 512x512)
- Theme color: #8B5CF6 (purple)
- Display mode: standalone
- Orientation: portrait

### Service Worker (`/public/service-worker.js`)
- Network-first strategy
- Cache fallback for offline
- Automatic cache updates

## 🚀 Build Process

### Development
```bash
pnpm run dev  # Start dev server
```

### Production
```bash
pnpm run build  # Build to /dist
```

### Output
- Optimized bundle
- Static assets
- Service worker
- Manifest file
- All assets in `/dist`

## 🔐 Security Model

### Data Privacy
- All data stored locally in browser
- No external API calls
- No tracking or analytics
- No cookies

### Authentication
- 4-digit PIN stored in IndexedDB
- Plain text (local only, no transmission)
- App-level protection
- No server validation

## 📊 Statistics Calculations

### Streak Algorithm
1. Start from today
2. Check if habit completed
3. Move backwards day by day
4. Break on first missed day
5. Return consecutive count

### Completion Rate
```
(completed_habits / total_possible_habits) * 100
```

### Perfect Days
Days where all habits were completed (100%)

## 🎯 Performance Optimizations

- **React optimizations:**
  - Proper key usage in lists
  - Memoization where needed
  - Lazy loading for heavy components

- **Database optimizations:**
  - Indexed queries
  - Batch operations
  - Efficient data structures

- **Bundle optimizations:**
  - Code splitting
  - Tree shaking
  - Minification

## 🧪 Development Tips

### Adding a New Feature
1. Update database schema in `database.ts`
2. Create component in `components/`
3. Add route in `routes.tsx` if needed
4. Update documentation

### Debugging
- Check browser console for errors
- Use React DevTools
- Inspect IndexedDB in Application tab
- Test service worker in DevTools

### Testing Offline
1. Build the app
2. Serve from local server
3. Open DevTools
4. Go to Network tab
5. Check "Offline"

## 📦 Deployment Checklist

- [ ] Run `pnpm run build`
- [ ] Test build locally
- [ ] Verify service worker registers
- [ ] Test offline functionality
- [ ] Check PWA installability
- [ ] Validate on mobile device
- [ ] Deploy to HTTPS hosting
- [ ] Test production URL
- [ ] Install as PWA on Android
- [ ] Verify all features work

## 🔧 Configuration Files

### `vite.config.ts`
- React plugin
- Tailwind plugin
- Path aliases
- Asset handling

### `package.json`
- Dependencies
- Scripts
- Build configuration

### `tsconfig.json`
- TypeScript configuration
- Module resolution
- Compiler options

## 📝 Code Style

- TypeScript for type safety
- Functional components with hooks
- Async/await for promises
- Descriptive variable names
- Comments for complex logic
- Error handling with try/catch

## 🎓 Learning Resources

To understand this codebase:
1. React fundamentals
2. React Router
3. IndexedDB API
4. Service Workers
5. PWA concepts
6. Tailwind CSS
7. TypeScript basics

---

**Last Updated:** June 23, 2026
**Version:** 1.0.0
**Status:** Production Ready ✅
