const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const { runInNewContext } = require("node:vm");

const apiSource = readFileSync(path.join(__dirname, "../api.js"), "utf8");

function loadApi(location, configuredApiUrl) {
  const window = {
    location,
    MUSCLE_RECOVERY_API_URL: configuredApiUrl,
  };
  runInNewContext(apiSource, { window, fetch: () => {} });
  return window.MuscleRecoveryApi;
}

test("API client defaults to the current hosted origin", () => {
  assert.equal(
    loadApi({ protocol: "https:", origin: "https://bodycomp.example" })
      .apiBaseUrl,
    "https://bodycomp.example",
  );
});

test("API client supports an explicit API origin", () => {
  assert.equal(
    loadApi(
      { protocol: "https:", origin: "https://bodycomp.example" },
      "https://api.example/",
    ).apiBaseUrl,
    "https://api.example",
  );
});

test("API client keeps the localhost fallback for file URLs", () => {
  assert.equal(
    loadApi({ protocol: "file:", origin: "null" }).apiBaseUrl,
    "http://localhost:3000",
  );
});
