export default {
  expo: {
    scheme: "readyplayerone",
    extra: {
      POSTHOG_API_KEY: process.env.POSTHOG_API_KEY,
      POSTHOG_HOST: process.env.POSTHOG_HOST,
    },
    // ...other config
  }
};