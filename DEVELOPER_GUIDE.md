# 🛠️ Developer Quick Reference

Quick reference for common Expo/React Native commands for PickMe Games.

---

## 🚀 Development

### Start Development Server

```bash
npm start
# or
npx expo start
```

### Start with Options

```bash
npm start -- --clear          # Clear cache and start
npm start -- --tunnel         # Use tunnel (for testing on physical devices)
npm start -- --lan            # Use LAN connection
```

### Open on Device/Simulator

- Press `i` in Metro terminal → Opens iOS simulator
- Press `a` in Metro terminal → Opens Android emulator
- Press `r` → Reload app
- Press `m` → Toggle dev menu

---

## 📱 Local Builds (Development)

### iOS Simulator

```bash
npx expo run:ios
# or
npm run ios
```

### Android Emulator

```bash
npx expo run:android
# or
npm run android
```

### Build for Physical Device

```bash
npx expo run:ios --device      # iOS device
npx expo run:android --device  # Android device
```

---

## ☁️ Cloud Builds (EAS Build) - Recommended

### Prerequisites

```bash
npm install -g eas-cli
eas login
```

### Development Builds

```bash
# Android development build
eas build --platform android --profile development

# iOS development build
eas build --platform ios --profile development

# Both platforms
eas build --platform all --profile development
```

### Preview Builds (TestFlight/Internal Testing)

```bash
# Android preview (APK for internal testing)
eas build --platform android --profile preview

# iOS preview (TestFlight)
eas build --platform ios --profile preview

# Both platforms
eas build --platform all --profile preview
```

### Production Builds

```bash
# Android production (AAB for Play Store)
eas build --platform android --profile production

# iOS production (App Store)
eas build --platform ios --profile production

# Both platforms
eas build --platform all --profile production
```

### Build Status & Download

```bash
eas build:list                 # List all builds
eas build:view [BUILD_ID]     # View specific build
```

---

## 🏪 App Store Release

### iOS (App Store)

1. **Build for Production**

   ```bash
   eas build --platform ios --profile production
   ```

2. **Submit to App Store**

   ```bash
   eas submit --platform ios
   ```

   - Follow prompts to select build
   - EAS will handle App Store Connect submission

3. **Or Manual Submission**
   - Download `.ipa` from EAS dashboard
   - Use Transporter app or Xcode to upload
   - Complete submission in App Store Connect

### Android (Google Play Store)

1. **Build for Production**

   ```bash
   eas build --platform android --profile production
   ```

2. **Submit to Play Store**

   ```bash
   eas submit --platform android
   ```

   - Follow prompts to select build
   - EAS will handle Play Console submission

3. **Or Manual Submission**
   - Download `.aab` from EAS dashboard
   - Upload to Google Play Console
   - Complete release process

---

## 🔧 Common Tasks

### Clear Cache

```bash
npm run clear                  # Clear Metro cache
npm run clear:all              # Clear all caches
npx expo start --clear         # Start with cleared cache
```

### Update Dependencies

```bash
npm install                    # Install dependencies
npx expo install --fix         # Fix dependency versions for Expo SDK
```

### Check Build Configuration

```bash
eas build:configure           # Configure build profiles
cat eas.json                   # View build configuration
```

### View Logs

```bash
npm run logs:ios              # iOS simulator logs
npm run logs:device           # Physical iOS device logs
```

---

## 📋 Build Profiles (eas.json)

Common profiles you'll use:

- **development**: For testing with dev client
- **preview**: For TestFlight/internal testing
- **production**: For App Store/Play Store release

---

## 🐛 Troubleshooting

### Build Fails

```bash
eas build --platform android --clear-cache
eas build --platform ios --clear-cache
```

### Metro Bundler Issues

```bash
npm run clear:all
rm -rf node_modules
npm install
npm start -- --clear
```

### EAS CLI Issues

```bash
npm install -g eas-cli@latest
eas logout
eas login
```

---

## 📚 Useful Links

- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [EAS Submit Docs](https://docs.expo.dev/submit/introduction/)
- [Expo CLI Reference](https://docs.expo.dev/workflow/expo-cli/)
- [App Store Connect](https://appstoreconnect.apple.com/)
- [Google Play Console](https://play.google.com/console/)

---

## 💡 Pro Tips

1. **Always test preview builds** before submitting production
2. **Use `--clear-cache`** if builds behave unexpectedly
3. **Check `eas.json`** for build profile settings
4. **Monitor build status** in EAS dashboard or via CLI
5. **Keep EAS CLI updated**: `npm install -g eas-cli@latest`

---

*Last updated: 2024*
