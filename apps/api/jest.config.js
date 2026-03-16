const path = require("path");

/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: ".",
  testRegex: "src/.*\\.spec\\.ts$",
  moduleFileExtensions: ["js", "json", "ts"],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: path.join(__dirname, "tsconfig.json"),
      },
    ],
  },
  moduleNameMapper: {
    "^@agency/db$": path.join(__dirname, "../../packages/db/src/index.ts"),
    "^@agency/orchestrator$": path.join(
      __dirname,
      "../../packages/orchestrator/src/index.ts",
    ),
    "^@agency/events$": path.join(
      __dirname,
      "../../packages/events/src/index.ts",
    ),
    "^@agency/config$": path.join(
      __dirname,
      "../../packages/config/src/index.ts",
    ),
    "^@agency/logger$": path.join(
      __dirname,
      "../../packages/logger/src/index.ts",
    ),
    "^@agency/types$": path.join(
      __dirname,
      "../../packages/types/src/index.ts",
    ),
  },
  coverageDirectory: "./coverage",
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.spec.ts"],
};
