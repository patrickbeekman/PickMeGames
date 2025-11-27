# ReadyPlayerOne - Quick File Reference

## App Screens (File-based Routing)
```
app/
├── _layout.tsx              # Root layout, navigation setup, PostHog provider
├── index.tsx                # Home screen - game mode selection
├── spinner.tsx               # Classic spinner (empty circle + arrow) ⚠️ Android arrow bug
├── numbered-spinner.tsx     # Numbered spinner (2-20 segments) ⚠️ Android arrow bug
├── finger-tap.tsx           # Multi-touch finger tap game
├── random-number.tsx        # Random number generator
├── prompted.tsx             # Random prompt selector
├── prompt-settings.tsx      # Manage custom prompts
├── about.tsx                # About page
└── +not-found.tsx           # 404 page
```

## Components
```
components/
├── Ripple.tsx               # Ripple animation for finger tap
├── Collapsible.tsx          # Collapsible UI component
├── ExternalLink.tsx         # External link component
├── HapticTab.tsx            # Haptic feedback tab
├── HelloWave.tsx            # Animated wave component
├── ParallaxScrollView.tsx   # Parallax scroll view
├── ThemedText.tsx           # Themed text component
├── ThemedView.tsx           # Themed view component
└── ui/
    ├── IconSymbol.tsx       # Icon component
    ├── IconSymbol.ios.tsx   # iOS-specific icon
    ├── TabBarBackground.tsx # Tab bar background
    └── TabBarBackground.ios.tsx # iOS-specific tab bar
```

## Hooks
```
hooks/
├── useAnalytics.ts          # PostHog analytics wrapper
├── usePrompts.ts            # Prompt management (default + custom)
├── useColorScheme.ts        # Theme detection
├── useColorScheme.web.ts    # Web-specific color scheme
└── useThemeColor.ts         # Theme color hook
```

## Configuration Files
```
├── app.config.js            # Expo app configuration
├── eas.json                 # EAS Build configuration
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── babel.config.js          # Babel configuration
├── metro.config.js          # Metro bundler configuration
├── tamagui.config.ts        # Tamagui UI library configuration
└── eslint.config.js         # ESLint configuration
```

## Assets
```
assets/
├── images/
│   ├── pickmelogo.png              # Main logo
│   ├── pickmelogo_transparent.png  # Transparent logo
│   ├── icon.png                    # App icon
│   ├── adaptive-icon.png           # Android adaptive icon
│   ├── favicon.png                 # Web favicon
│   └── splash-icon.png            # Splash screen icon
├── fonts/
│   └── SpaceMono-Regular.ttf      # Custom font
└── prompts.json                    # Default prompts list
```

## Constants
```
constants/
└── Colors.ts                # Color definitions
```

## Platform-Specific
```
android/                     # Android native code
ios/                         # iOS native code
```

## Key Files by Function

### Navigation & Routing
- `app/_layout.tsx` - Root navigation setup
- `app/index.tsx` - Home/landing screen

### Game Modes
- `app/spinner.tsx` - Classic spinner ⚠️
- `app/numbered-spinner.tsx` - Numbered spinner ⚠️
- `app/finger-tap.tsx` - Finger tap game
- `app/random-number.tsx` - Number generator
- `app/prompted.tsx` - Prompt selector

### Settings & Management
- `app/prompt-settings.tsx` - Custom prompt management
- `app/about.tsx` - About page

### Core Logic
- `hooks/useAnalytics.ts` - Analytics tracking
- `hooks/usePrompts.ts` - Prompt storage/retrieval
- `components/Ripple.tsx` - Touch ripple effect

### Configuration
- `app.config.js` - App metadata, build config
- `eas.json` - EAS Build profiles
- `tamagui.config.ts` - UI theme config

## Files with Known Issues
- ⚠️ `app/spinner.tsx` - Android arrow alignment bug
- ⚠️ `app/numbered-spinner.tsx` - Android arrow alignment bug

## Quick Find Guide

**Need to modify a game mode?**
→ Check `app/[game-mode].tsx`

**Need to fix arrow alignment?**
→ Check `app/spinner.tsx` and `app/numbered-spinner.tsx` styles

**Need to add analytics?**
→ Use `hooks/useAnalytics.ts`

**Need to modify prompts?**
→ Check `hooks/usePrompts.ts` and `app/prompt-settings.tsx`

**Need to change app config?**
→ Check `app.config.js` and `eas.json`

**Need to modify navigation?**
→ Check `app/_layout.tsx`

**Need to add a new screen?**
→ Create file in `app/` directory (Expo Router handles routing)

**Need to modify styling?**
→ Check `tamagui.config.ts` for theme, or individual component files

## Common Edit Locations

### Adding a New Game Mode
1. Create `app/new-game-mode.tsx`
2. Add route to `app/_layout.tsx` Stack.Screen
3. Add button to `app/index.tsx` options array
4. Add analytics tracking with `useAnalytics`

### Fixing Arrow Alignment
1. Open `app/spinner.tsx` or `app/numbered-spinner.tsx`
2. Modify `arrowContainer` style in StyleSheet
3. Ensure `alignItems: 'center'` and proper positioning
4. Test on Android device/emulator

### Modifying Prompts
1. Edit `assets/prompts.json` for defaults
2. Use `app/prompt-settings.tsx` for UI
3. Logic in `hooks/usePrompts.ts`

### Changing Colors/Theme
1. Update `tamagui.config.ts` for global theme
2. Or modify individual component styles
3. Primary color: `#4CAF50`, Background: yellow gradient



