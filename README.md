# 🎲 Pick Me – The Fun Way to Choose Who Goes First!

Make game nights, parties, and group decisions fun and fair with Pick Me! Whether you need to choose who goes first on board game night or settle any group activity, Pick Me takes the pressure off and lets fate decide. No more arguments, just tap, spin, or prompt and let the app do the work!

Need help deciding who starts? Let Pick Me choose for you!
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

  <img src="https://github.com/user-attachments/assets/a7c93ddb-c1b4-42a6-9ef1-980c8963a49c" alt="home page" width="220"/>
  <img src="https://github.com/user-attachments/assets/76b1cef2-3b52-4c7a-bbd9-75921c722ab6" alt="multifinger tap" width="220"/>
  <img src="https://github.com/user-attachments/assets/ddac3da3-9b39-4ab8-ba22-ddc1f05920c4" alt="spinner" width="220"/>
  <img src="https://github.com/user-attachments/assets/dcac8b6f-dab8-48bb-8f8b-76eb1a86151d" alt="numbered spinner" width="220"/>
  <img src="https://github.com/user-attachments/assets/b620c2c3-80c5-4256-8e93-0649d505c3fe" alt="lucky number" width="220"/>
  <img src="https://github.com/user-attachments/assets/8231deea-106a-4280-a8dd-f315cb853e87" alt="prompter" width="220"/>
  <img src="https://github.com/user-attachments/assets/a811f449-ce70-4cab-9964-0c00271dc8eb" alt="prompter-settings" width="220"/>

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
