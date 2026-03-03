module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: "src",
  testRegex: "\\.(spec|integration)\\.ts$",
  moduleFileExtensions: ["js", "json", "ts"],
  collectCoverageFrom: [
    "**/*.(t|j)s",
    "!**/*.module.ts",
    "!**/main.ts",
    "!**/*.dto.ts",
    "!**/*.entity.ts"
  ],
  coverageDirectory: "../coverage",
  coverageReporters: ["text", "text-summary", "html", "json"],
  coveragePathIgnorePatterns: ["/node_modules/", "\\.module\\.ts$", "main\\.ts$"],
  transform: { "^.+\\.(t|j)s$": "ts-jest" }
};
