# 🎲 Pick Me – The Ultimate Player Picker App!

Welcome to **Pick Me**, the fun, fast, and fair way to pick who goes first! Whether you’re starting a board game, party game, or just need to settle who’s up, Pick Me makes the process exciting and interactive for everyone.

---

## 🚀 Why Pick Me?

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


<a href="https://www.buymeacoffee.com/pickmegames" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="41" width="174"></a>
---

## Screenshots

<div align="center">

  <img src="https://github.com/user-attachments/assets/5061e6d2-49b7-42a3-9b18-d30d57cc78b1" alt="home page" width="220"/>
  <img src="https://github.com/user-attachments/assets/99be12cf-eca1-40e8-8100-08ce8ec4f46a" alt="multifinger tap" width="220"/>
  <img src="https://github.com/user-attachments/assets/e7953353-8659-4cc5-9619-dda6de939350" alt="random number" width="220"/>
  <img src="https://github.com/user-attachments/assets/2fa4771d-6e47-43bf-a538-56db80b665ba" alt="numbered spinner" width="220"/>
  <img src="https://github.com/user-attachments/assets/73cb5c7d-471b-4e23-8196-ff005cd31bd4" alt="prompter" width="220"/>

</div>

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
