module.exports = {
  preset: '@react-native/jest-preset',
  setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|@react-navigation|react-native-screens|react-native-safe-area-context)/',
  ],
  testMatch: ['<rootDir>/__tests__/**/*.test.[jt]s?(x)'],
};
