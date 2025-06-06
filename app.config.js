export default {
  expo: {
    name: "PickMe Games",
    slug: "readyplayerone",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "light",
    scheme: "readyplayerone",
    plugins: [
      "expo-router"
    ],
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#F3E889"
    },
    ios: {
      bundleIdentifier: "com.pattar.readyplayerone",
      supportsTablet: true
    },
    android: {
      package: "com.pattar.readyplayerone",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#F3E889"
      }
    },
    web: {
      favicon: "./assets/images/favicon.png"
    },
    extra: {
      eas: {
        projectId: "6a2464bb-6122-4c32-96d7-4b4b58a7f612"
      },
      POSTHOG_API_KEY: process.env.POSTHOG_API_KEY,
      POSTHOG_HOST: process.env.POSTHOG_HOST,
    },
  }
};