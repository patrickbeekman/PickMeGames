const { withAppBuildGradle } = require('@expo/config-plugins');

// Excludes Fresco's animated-GIF native decoder, which React Native bundles
// by default on Android regardless of whether the app has any .gif assets
// (this one doesn't) and which is not yet built with 16 KB page alignment
// upstream. See https://github.com/facebook/fresco/issues/2784.
const EXCLUSION_BLOCK = `
configurations.all {
    exclude group: 'com.facebook.fresco', module: 'animated-gif'
}
`;

module.exports = function withFrescoAlignmentFix(config) {
  return withAppBuildGradle(config, (config) => {
    if (!config.modResults.contents.includes("module: 'animated-gif'")) {
      config.modResults.contents += EXCLUSION_BLOCK;
    }
    return config;
  });
};
