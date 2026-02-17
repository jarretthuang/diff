module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"],
  modulePathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
};
