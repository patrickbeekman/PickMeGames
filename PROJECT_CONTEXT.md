# ReadyPlayerOne (PickMe Games) - Project Context

## Overview


A React Native/Expo mobile app designed to help friends decide who goes first on board game night. The app provides multiple fun "game modes" for random selection, making decision-making fair and entertaining.


## App Purpose

The app solves the common problem of "who goes first?" in board games by providing multiple engaging ways to randomly select a player or make decisions.


## Tech Stack

- **Framework**: React Native 0.79.4 with Expo SDK 53
- **Navigation**: Expo Router 5.1.1 (file-based routing)
- **UI Library**: Tamagui (component library)
- **Analytics**: PostHog (React Native SDK)
- **Storage**: AsyncStorage for local data persistence
- **Animations**: React Native Animated API
- **Build**: EAS Build for iOS/Android


## Project Structure

### Core Directories

- `app/` - All screen components (file-based routing)
  - `index.tsx` - Home screen with game mode selection
  - `spinner.tsx` - Classic spinner (empty circle with rotating arrow)
  - `numbered-spinner.tsx` - Spinner with numbered segments
  - `finger-tap.tsx` - Multi-touch finger tap game
  - `random-number.tsx` - Random number generator
  - `prompted.tsx` - Random prompt selector
  - `prompt-settings.tsx` - Manage custom prompts
  - `about.tsx` - About page
  - `_layout.tsx` - Root layout with navigation setup

- `components/` - Reusable components
  - `Ripple.tsx` - Ripple effect for finger tap game
  - `ThemedText.tsx`, `ThemedView.tsx` - Themed components
  - `ui/` - UI components (IconSymbol, TabBarBackground)

- `hooks/` - Custom React hooks
  - `useAnalytics.ts` - PostHog analytics wrapper
  - `usePrompts.ts` - Prompt management (default + custom)
  - `useColorScheme.ts` - Theme detection

- `assets/` - Static assets
  - `images/` - App icons, logos, splash screens
  - `fonts/` - Custom fonts
  - `prompts.json` - Default prompts list

- `constants/` - App constants
  - `Colors.ts` - Color definitions


## Game Modes

### 1. Multifinger Tap (`finger-tap.tsx`)

- Players place fingers on screen

- 4-second countdown
- Randomly selects one finger as winner
- Visual feedback with ripples and confetti

### 2. Classic Spinner (`spinner.tsx`)


- Empty circular spinner with rotating arrow
- Players position themselves around phone
- Arrow points to winner after spin
- **KNOWN ISSUE**: Arrow alignment on Android needs fixing

### 3. Numbered Spinner (`numbered-spinner.tsx`)


- Spinner with numbered segments (2-20 players)
- Slider to adjust player count
- Arrow points to winning number
- **KNOWN ISSUE**: Arrow alignment on Android needs fixing


### 4. Random Number (`random-number.tsx`)

- Generates random number in configurable range (10 to 1M)
- Players guess closest number
- Animated reveal with confetti


### 5. Prompted (`prompted.tsx`)

- Displays random prompts for decision-making
- Supports custom prompts
- Tracks used prompts to avoid repeats


## Key Features

### Analytics

- PostHog integration for user behavior tracking

- Events tracked: screen views, game actions, settings changes
- Gracefully handles missing PostHog credentials

### Custom Prompts

- Users can add custom prompts
- Default prompts can be hidden (not deleted)
- Prompts stored in AsyncStorage
- Settings page for management


### Design System

- **Primary Color**: `#4CAF50` (green)
- **Background**: Yellow gradient `['#F3E889', '#FFE082', '#FFF9C4']`
- **UI Library**: Tamagui for most components

- **Animations**: React Native Animated API
- **Confetti**: react-native-confetti-cannon

## Identified Issues & Bugs

### Critical Issues

1. **Android Arrow Alignment** (spinner.tsx, numbered-spinner.tsx)
   - Red/green arrows not properly centered on Android

   - Arrow container positioning needs adjustment
   - Fix: Use proper centering with `alignItems: 'center'` and correct transform origin

### Medium Priority Issues

2. **Animation Cleanup**
   - Some animations may not clean up properly on unmount
   - Fix: Ensure all timers and animations are stopped in cleanup

3. **Type Safety**
   - Some `any` types in touch event handlers
   - Could be improved with proper TypeScript types

### Low Priority / Improvements


4. **Code Organization**
   - Some duplicate styling patterns
   - Could extract common spinner styles

5. **Accessibility**
   - Missing accessibility labels on some buttons
   - Could add more screen reader support


6. **Error Handling**
   - Some async operations lack error handling
   - Could add user-friendly error messages

## Development Workflow


### Running the App

```bash

npm start          # Start Expo dev server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on web
```

### Building

- Uses EAS Build for production builds
- Configuration in `eas.json`

- App config in `app.config.js`

### Environment Variables

- PostHog credentials in `.env` file (not committed)

- Loaded via `dotenv` in `app.config.js`

## Dependencies Highlights

- `expo-router` - File-based routing

- `@tamagui/*` - UI component library
- `posthog-react-native` - Analytics
- `react-native-confetti-cannon` - Confetti effects
- `@react-native-community/slider` - Slider component
- `react-native-svg` - SVG rendering for numbered spinner

## Platform-Specific Notes

### iOS

- Bundle ID: `com.pattar.readyplayerone`
- Generally handles shadows and borders well

- No major known issues

### Android

- Package: `com.pattar.readyplayerone`
- Arrow alignment issues (needs fixing)
- Use both `elevation` and `shadow` properties for cross-platform compatibility

## Future Enhancement Ideas

1. Add more game modes (coin flip, dice roll, etc.)
2. History of selections
3. Sound effects
4. Dark mode support
5. Share results feature
6. Customizable spinner colors
7. Team selection mode
8. Tournament bracket generator


## Code Patterns to Follow

### Screen Component Pattern

```typescript

export default function MyScreen() {
  const navigation = useNavigation();
  const { capture, isReady } = useAnalytics();
  
  useEffect(() => {
    navigation.setOptions({ /* header config */ });
  
  useEffect(() => {
    if (isReady) capture('entered_my_screen');
  }, [capture, isReady]);
  
  // Component logic
}
```

### Arrow Positioning Pattern (for spinners)

- Use absolute positioning
- Center with `alignItems: 'center'` and `justifyContent: 'center'`
- Position relative to spinner center
- Use border triangles for arrow shape

## Notes for AI Assistants

- Always test arrow alignment on Android when modifying spinner components
- Use Tamagui components when possible, StyleSheet for complex positioning
- Follow existing patterns for consistency
- Check for animation cleanup on component unmount
- Use `useAnalytics` hook for all user actions


