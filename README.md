# 🎲 Ready Player One – The Ultimate Player Picker App!

Welcome to **Ready Player One**, the fun, fast, and fair way to pick who goes first! Whether you’re starting a board game, party game, or just need to settle who’s up, Ready Player One makes the process exciting and interactive for everyone.

---

## 🚀 Why Ready Player One?

- **No more arguments:** Let the app decide who goes first—randomly and transparently.
- **Multiple minigames:** Choose from finger tap, spinners, random numbers, and more!
- **Party-friendly:** Designed for groups, families, and game nights.
- **Beautiful & simple:** Clean, playful design that works on both iOS and Android.
- **Open source:** Fork, contribute, or use as inspiration for your own projects!

---

## 🕹️ Features

- **Multifinger Tap:** Everyone taps, one is crowned the winner!
- **Classic Spinner:** Spin the wheel and let fate decide.
- **Numbered Spinner:** Customizable for any group size.
- **Random Number:** Quick and fair number picker.
- **Prompted:** Fun prompts to break the ice or add a twist.
- **About & Donate:** Learn more or support the project.

---

## 🛠️ Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the app**

   ```bash
   npx expo start
   ```

3. **Open on your device or simulator**
   - Scan the QR code with Expo Go, or launch on an emulator/simulator.

---

## 🗂️ Project Structure

- All app screens and logic are in the **app/** directory.
- Uses [Expo Router](https://docs.expo.dev/router/introduction) for file-based navigation.
- Analytics powered by [PostHog](https://posthog.com/).

---

## 💡 Customization

- Add your own minigames or tweak the look by editing files in the **app/** directory.
- Update branding by replacing the logo in `assets/images/pickmelogo_transparent.png`.

---

## 🤝 Contributing

Pull requests and issues are welcome! If you have a fun new way to pick a player, let us know or submit a PR.

---

## 📚 Learn More

- [Expo documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [PostHog for analytics](https://posthog.com/)

---

## 💬 Join the Community

- [Expo on GitHub](https://github.com/expo/expo)
- [Expo Discord](https://chat.expo.dev)

---

Ready to make game night even better?  
**Download, tap, spin, and let the games begin!**

---

import { usePostHog } from 'posthog-react-native'

const MyComponent = () => {
    const posthog = usePostHog()

    useEffect(() => {
        posthog.capture("MyComponent loaded", { foo: "bar" })
    }, [])
}