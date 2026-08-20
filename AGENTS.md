# AGENTS.md — ReadyPlayerOne (PickMe Games)

## Project Identity
PickMe Games is a React Native/Expo mobile app that helps friends decide who goes first on board game night. It provides multiple fun "game modes" for random selection.

## Tech Stack
- **Framework**: React Native 0.79.4 + Expo SDK 53
- **Navigation**: Expo Router 5 (file-based routing)
- **UI Library**: Tamagui + StyleSheet for complex positioning
- **Analytics**: PostHog (React Native SDK); keys come from `.env` via `app.config.js` `extra`
- **Storage**: AsyncStorage
- **Animations**: React Native Animated API, react-native-confetti-cannon
- **Build**: EAS Build (iOS + Android), `appVersionSource: "remote"` + `autoIncrement` — never hardcode versionCode/buildNumber locally
- **Config**: `app.config.js`, `eas.json`, `.env` (PostHog credentials, untracked)

## Key Files
| Path | Contents |
|-----------|----------|
| `app/` | Screens: `index` (home grid), 8 game modes (`finger-tap`, `spinner`, `numbered-spinner`, `random-number`, `prompted`, `coin-flip`, `timer-countdown`, `color-matcher`), `prompt-settings`, `about` |
| `components/` | `Ripple.tsx`, `SpinnerArrow.tsx` (SVG arrow — use this, never CSS border-triangles) |
| `hooks/` | `useAnalytics`, `usePrompts`, `useGameModeOrder`, `useGameScreenHeader`, `useEntranceAnimation` |
| `utils/haptics.ts` | `impact()`/`notify()`/`selection()` — ALWAYS use these, never call `Haptics.*Async` directly (they swallow rejections on devices without haptics) |
| `constants/Design.ts` | The design system: spacing, radius, shadows, typography, colors, animation timings, pressScale. Single source of truth for theme colors |
| `assets/` | `images/`, `fonts/`, `prompts.json` |
| `docs/` | Planning/brainstorm docs (moved from root in v1.2.0) |
| `scripts/split_icons.py` | Icon sprite-sheet splitter (one-off dev tool) |
| `index.html` | Privacy-policy page linked from the app stores — DO NOT move or rename |

## Coding Conventions
- Use `useAnalytics()`'s `capture` for user actions. Event names are load-bearing (PostHog dashboards) — never rename existing events.
- New screens: `useGameScreenHeader('Title')` for the header, `useEntranceAnimation()` for fade/slide entrances. Don't hand-roll `navigation.setOptions` blocks.
- Colors: import from `Design.colors`; raw hex only for colors with no token.
- Animations/timers: every `Animated.loop` and `setTimeout` must be stored in a ref and stopped/cleared in an unmount cleanup effect; guard async completion callbacks with an `isMounted` ref. (This class of leak was fixed across every screen in v1.2.0 — don't reintroduce it.)
- Absolute-positioned overlays placed at touch coordinates must clamp against the container measured via `onLayout` on the SAME view that receives the touches — not `Dimensions.get('window')` (coordinates are container-relative; the container sits below the nav header).
- Home screen: two-column grid in normal mode; edit mode uses `NestableDraggableFlatList` + `NestableScrollContainer` (DraggableFlatList does not support multi-column, and plain-ScrollView nesting is unsupported).
- The app is light-mode only (`userInterfaceStyle: "light"`); no dark-theme branches.

## Quick Commands
```bash
npm start          # Start Expo dev server
npm run ios        # Run on iOS
npm run android    # Run on Android
npm run lint       # Lint (baseline has pre-existing warnings; add none)
npx tsc --noEmit   # Type-check — MUST stay at zero errors
```

## Release
1. Bump marketing version in `package.json` + `app.config.js` (versionCode/buildNumber are EAS-remote).
2. `npx tsc --noEmit` zero errors, `npm run lint` no new problems, simulator smoke test of all 8 modes.
3. `eas build --platform all --profile production`, then `eas submit`.

## Known Quirks
- `@tamagui/input` (1.126.x) ships a broken `onChangeText` type on all platforms — `prompt-settings.tsx` carries a documented `as any` cast for it. Remove when Tamagui fixes upstream.
- `posthog-react-native` 4.x logs expo-file-system deprecation warnings in dev. Do NOT suppress with console monkey-patches; use targeted `LogBox.ignoreLogs` if it becomes disruptive.
- Numbered-spinner wheel geometry: local angle 0 = 3 o'clock, clockwise-positive; the arrow sits at screen angle 270° (12 o'clock). The a11y announcement formula in `numbered-spinner.tsx` documents the derivation — verify against it before touching rotation math.
- Color-matcher targets must be generated FROM a wheel position (radius→saturation/lightness are coupled); the formulas in `generateTargetColor` and `handleColorPick` must stay literally identical.
