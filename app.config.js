// Load environment variables from .env file
require('dotenv').config();

export default {
  expo: {
    name: "PickMe Games",
    slug: "readyplayerone",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/pickmelogo.png",
    userInterfaceStyle: "light",
    scheme: "readyplayerone",
    newArchEnabled: true,
    experiments: {
      typedRoutes: true
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/pickmelogo.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#F3E889"
        }
      ]
    ],
    splash: {
      image: "./assets/images/pickmelogo.png",
      resizeMode: "contain",
      backgroundColor: "#F3E889"
    },
    android: {
      package: "com.pattar.readyplayerone",
      adaptiveIcon: {
        foregroundImage: "./assets/images/pickmelogo.png",
        backgroundColor: "#F3E889"
      }
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/pickmelogo.png"
    },
    extra: {
      router: {
        origin: false
      },
      eas: {
        projectId: "6a2464bb-6122-4c32-96d7-4b4b58a7f612"
      },
      // Safely pass environment variables to the app
      POSTHOG_API_KEY: process.env.POSTHOG_API_KEY || null,
      POSTHOG_HOST: process.env.POSTHOG_HOST || null,
    },
  }
};
