# 🎲 Pick Me – The Fun Way to Choose Who Goes First

Make game nights, parties, and group decisions fun and fair with Pick Me! Whether you need to choose who goes first on board game night or settle any group activity, Pick Me takes the pressure off and lets fate decide. No more arguments, just tap, spin, or prompt and let the app do the work!

Need help deciding who starts? Let Pick Me choose for you!

---

## 🚀 Why Pick Me?

- **No more arguments:** Let the app decide who goes first—randomly and transparently.
- **8 unique game modes:** Choose from finger tap, spinners, color matching, timers, and more!
- **Customizable experience:** Reorder your favorite game modes, customize prompts, and personalize your experience.
- **Party-friendly:** Designed for groups, families, and game nights.
- **Beautiful & simple:** Clean, playful design with custom icons that works on both iOS and Android.
- **Open source:** Fork, contribute, or use as inspiration for your own projects!

---

## 🕹️ Game Modes

- **Multifinger Tap:** Everyone taps, one is crowned the winner!
- **Color Matcher:** Match the target color on the wheel—closest match wins! (Supports 2-6 players)
- **Timer Countdown:** Watch the countdown and tap when it hits zero!
- **Numbered Spinner:** Customizable spinner for any group size with vibrant color segments.
- **Classic Spinner:** Spin the wheel and let fate decide.
- **Random Number:** Quick and fair number picker with notched slider for easy range selection.
- **Prompt to Pick:** Fun prompts to break the ice or add a twist (fully customizable).
- **Coin Flip:** Classic heads or tails decision maker.

---

## ✨ Latest Features (v1.1.0)

- **Drag & Drop Reordering:** Long-press any game mode to enter edit mode and reorder your favorites. Your preferences are saved automatically!
- **Custom Icons:** Beautiful icons for each game mode.
- **Improved Color Matcher:** Enhanced HSL-based color distance calculation for more accurate and visually consistent scoring.
- **Notched Slider:** Easy-to-use slider with visual notches for random number range selection (D6, D8, D10, D12, D20, and custom ranges up to 1M).
- **Enhanced UI/UX:** Improved animations, better spacing, and refined visual design throughout the app.
- **Custom Prompt Management:** Add, remove, and manage your own custom prompts with an intuitive settings interface.

---

<a href="https://www.buymeacoffee.com/pickmegames" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="41" width="174"></a>

---

## Screenshots

<div align="center">

  <img src="https://github.com/user-attachments/assets/a7c93ddb-c1b4-42a6-9ef1-980c8963a49c" alt="home page" width="220"/>
  <img src="https://github.com/user-attachments/assets/76b1cef2-3b52-4c7a-bbd9-75921c722ab6" alt="multifinger tap" width="220"/>
  <img src="https://github.com/user-attachments/assets/ddac3da3-9b39-4ab8-ba22-ddc1f05920c4" alt="spinner" width="220"/>
  <img src="https://github.com/user-attachments/assets/dcac8b6f-dab8-48bb-8f8b-76eb1a86151d" alt="numbered spinner" width="220"/>
  <img src="https://github.com/user-attachments/assets/b620c2c3-80c5-4256-8e93-0649d505c3fe" alt="lucky number" width="220"/>
  <img src="https://github.com/user-attachments/assets/8231deea-106a-4280-a8dd-f315cb853e87" alt="prompter" width="220"/>
  <img src="https://github.com/user-attachments/assets/a811f449-ce70-4cab-9964-0c00271dc8eb" alt="prompter-settings" width="220"/>

</div>

---

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo CLI (installed globally or via npx)
- iOS Simulator (for Mac) or Android Emulator, or Expo Go app on your device

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/patrickbeekman/PickMeGames.git
   cd PickMeGames
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npx expo start
   ```

4. **Run on your device or simulator**
   - **iOS:** Press `i` in the terminal or scan the QR code with your camera (iOS 13+)
   - **Android:** Press `a` in the terminal or scan the QR code with Expo Go app
   - **Web:** Press `w` in the terminal (limited functionality)

---

## 🗂️ Project Structure

```text
ReadyPlayerOne/
├── app/                    # App screens and routes (Expo Router)
│   ├── index.tsx          # Home screen
│   ├── finger-tap.tsx     # Multifinger Tap game mode
│   ├── color-matcher.tsx  # Color Matcher game mode
│   ├── timer-countdown.tsx # Timer Countdown game mode
│   ├── numbered-spinner.tsx # Numbered Spinner game mode
│   ├── spinner.tsx        # Classic Spinner game mode
│   ├── random-number.tsx  # Random Number game mode
│   ├── prompted.tsx        # Prompt to Pick game mode
│   ├── coin-flip.tsx      # Coin Flip game mode
│   └── ...
├── assets/                 # Images, icons, and other assets
├── components/            # Reusable React components
├── constants/             # Design system and constants
├── hooks/                 # Custom React hooks
└── app.config.js         # Expo configuration
```

### Key Technologies

- **[Expo](https://expo.dev/)** - React Native framework
- **[Expo Router](https://docs.expo.dev/router/introduction/)** - File-based navigation
- **[Tamagui](https://tamagui.dev/)** - UI component library
- **[React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)** - Animations
- **[AsyncStorage](https://react-native-async-storage.github.io/async-storage/)** - Local data persistence

---

## 💡 Customization

- **Add your own game modes:** Create new files in the `app/` directory following the existing game mode patterns.
- **Customize prompts:** Use the built-in prompt settings to add, remove, or modify prompts.
- **Update branding:** Replace the logo in `assets/images/pickmelogo_transparent.png`.
- **Modify colors and styling:** Edit the `constants/Design.ts` file to change the app's color scheme and design tokens.

---

## 🤝 Contributing

Pull requests and issues are welcome! If you have a fun new way to pick a player, let us know or submit a PR.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test on both iOS and Android
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

---

## 📱 Building for Production

See `DEVELOPER_GUIDE.md` for detailed instructions on:

- Building development builds
- Creating production builds with EAS
- Submitting to App Store and Google Play Store
- Version management and release process

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

Ready to make game night even better?  
**Download, tap, spin, and let the games begin!**
