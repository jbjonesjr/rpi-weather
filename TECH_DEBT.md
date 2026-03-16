# Tech Debt & Known Issues

This file tracks known bugs, security gaps, code-quality issues, and tech-debt items discovered across the codebase. Items are grouped by severity. Address 🔴 items first.

---

## 🔴 Bugs / Correctness

| # | Location | Issue |
|---|----------|-------|
| 1 | `src/server/src/fetchService.js` | **Hardcoded `sensor_id = 1` in hourly-rain sub-query.** The env-var-driven `SENSOR_ID` is applied to the outer `WHERE` clause but the nested sub-query that computes `hourly_rain` is still hardcoded to `sensor_id = 1`. Produces wrong (always-zero) rain totals for any sensor other than ID 1. |
| 2 | `src/server/src/fetchService.js`, `conditions.sql` | **Duplicate `hourly_rain` column alias + `obsered_rainfall` typo.** Two conflicting `SELECT` aliases for the same column; the second silently wins. The internal alias `obsered_rainfall` (missing the `v`) is misspelled in four places. |
| 3 | `src/rtl-publish/rtl_process.js` | **`parseFloat(x) \|\| null` does not guard NaN.** `parseFloat("abc") \|\| null` returns `NaN`, not `null`. All sensor-field parsing should use an explicit `isNaN()` guard: `const n = parseFloat(x); return isNaN(n) ? null : n;`. |
| 4 | `src/rtl-publish/tests/db_mocks.js` | **Mock `SELECT` response missing `rowCount`.** Mock returns `{ rows: [...] }` without `rowCount`. Production code checks `sensor_res.rowCount == 0`, so `undefined == 0` is always falsy — the "found sensor" branch never executes under test. |
| 5 | `src/rtl-publish/tests/tests.js` | **`__dirname` used in an ES module.** `__dirname` is undefined in ESM context, causing `ReferenceError` at runtime. Needs `fileURLToPath(import.meta.url)` + `path.dirname`. |
| 6 | `src/app/package.json` | **`build` script is broken.** `"build": "NODE_OPTIONS=react-scripts build"` sets `NODE_OPTIONS` to the literal string `react-scripts build` instead of running anything. |
| 7 | `src/app/src/App.test.js` | **Test scans for CRA boilerplate text that doesn't exist.** Looks for `/learn react/i`; app renders weather data. Test fails on every run. |
| 8 | `src/rtl-publish/rtl_process.js` line 66 | **`battery_ok` flag is silently dropped.** `// TODO: Actually do something with the battery_ok flag` — low-battery conditions are never acted on. |
| 9 | `src/app/src/Weather.js`, `Wrapper.js` | **`currentDate` always `undefined` in `Wrapper`.** `Weather.js` computes `currentDate` in state but the `states` object passed to `Wrapper` contains only `{ weather }` — `states.currentDate` is always `undefined`. |
| 10 | `src/server/src/schema.sql` lines 71–72 | **Schema syntax error in `hourly_reports`.** Missing comma between `max_pressure_mb` and `min_pressure_mb` — `CREATE TABLE` won't execute. |
| 11 | `src/server/src/schema.sql` | **`sensors` table `NOT NULL` columns never populated.** `wx_conditions` and `precipitation` are `NOT NULL` in schema, but `rtl_process.js` never provides values — new sensor `INSERT`s fail at the DB level. |
| 12 | `src/server/src/views.sql` | **View definitions reference renamed views.** `vw_alamanc_rainfall_daily` / `vw_almanac_reports_daily` reference `vw_hourly_almanac_rainfall` / `vw_hourly_almanac_reports`, but the views in the same file are named `vw_almanac_rainfall_hourly` / `vw_almanac_reports_hourly`. |
| 13 | `src/app/src/fetchHelpers.js` | **Wind, humidity, and rainfall discarded before reaching UI.** API returns `wind_speed_mph`, `humidity_perc`, and `rainfall_rate_in` but `fetchHelpers.js` strips all three — they are never displayed. |
| 14 | `src/app/src/fetchHelpers.js` | **`weatherMain` hardcoded to `"unk"` in UI.** The `<h2>` element always renders "unk". Either populate it or remove the element. |

---

## 🟠 Security

| # | Location | Issue |
|---|----------|-------|
| 15 | `db-settings.json` | **Production DB hostnames and usernames committed.** Azure Postgres hostname, AWS RDS endpoint, and production DB username are hardcoded. Passwords are blank but the file is not in `.gitignore`. Should be moved to environment variables and added to `.gitignore`. |
| 16 | `src/server/src/routes.js` | **CORS wildcard (`*`) with no authentication or rate limiting.** Every route manually sets `Access-Control-Allow-Origin: *`. No API keys, JWT, or rate-limiting middleware. |
| 17 | `src/server/src/index.js` | **No environment variable validation at startup.** Server starts successfully even if `DATABASE_URL` is missing — the error only surfaces at the first DB query. Required env vars should be validated at boot. |

---

## 🟡 Code Quality

| # | Location | Issue |
|---|----------|-------|
| 18 | Codebase-wide | **72+ `console.log` statements, no log levels, no structured logging.** Debug noise pollutes production output. Consider `winston` or `pino` with severity levels (`debug`, `info`, `warn`, `error`). |
| 19 | `src/app/src/index.js` | **Deprecated React API: `ReactDOM.render()` instead of `createRoot()`.** React 18 requires `createRoot`. App pins React 17, but leaving `render()` blocks any future React upgrade. |
| 20 | `src/rtl-publish/rtl_process.js` | **Commented-out code blocks never cleaned up.** Multiple large commented-out sections add noise and confusion. |
| 21 | `src/rtl-publish/index.js` | **Unused variable `debug` and undefined `allModels`.** `const debug = []` is never used. The `else` branch references `allModels` which is never defined — would throw `ReferenceError` if `mode` were ever not `'weather'`. |
| 22 | `src/rtl-publish/package.json` | **`jest` listed under `dependencies` instead of `devDependencies`.** Installs ~200 MB of test tooling in production on the Pi. |
| 23 | `src/rtl-publish/tests/db_mocks.js` | **`jest-mock` imported without being an explicit dependency.** Only a transitive dependency of `jest` — fragile on clean installs. |
| 24 | `src/server/src/routes.js` | **Manual CORS headers duplicated on every route.** Should use the `cors` npm middleware applied once at the app level. |
| 25 | `src/server/src/fetchService.js` | **Inconsistent Promise style.** Mix of `.then()` chains and `async/await`; the outer `try/catch` does not catch errors thrown inside `.then()` callbacks. |
| 26 | `src/app/package.json` | **`react-scripts 4.0.3` severely outdated; requires `--openssl-legacy-provider` workaround.** Pinned to a 2021 release. The `start` script disables OpenSSL security hardening as a workaround. Current is 5.x. |

---

## 🔵 Tech Debt / Missing Features

| # | Location | Issue |
|---|----------|-------|
| 27 | `src/server/src/schema.sql` | **No database migrations — schema management is fully manual.** `schema.sql` uses `DROP TABLE` + `CREATE TABLE` rather than incremental migrations. Any schema change destroys all data. Consider `node-pg-migrate` or `Flyway`. |
| 28 | `src/server/src/routes.js` | **No API versioning on routes.** All routes are flat `/api/*`. A `/api/v1/` prefix would allow future breaking changes to be rolled out safely. |
| 29 | Codebase-wide | **No TypeScript.** Runtime type errors are possible, especially with API responses. Adding TypeScript (or at minimum JSDoc types) would catch many of the above bugs at compile time. |
| 30 | `src/app/README.md` | **React app `README.md` is the unmodified CRA template.** Contains no project-specific content — replace with actual setup and usage documentation. |
| 31 | `src/server/src/schema.sql` | **Columns defined but never written** (`rain_rate`, `pressure_mb`, `hourly_reports` table). Represent planned but entirely unimplemented features. |
| 32 | `README.md` | **`npm run test-receiver` documented but doesn't exist.** The README references this command, which is absent from `package.json`. Actual command is `npm test` or `node ./tests/tests.js`. |

---

## 📝 Documentation / Typos

| # | Location | Issue |
|---|----------|-------|
| 33 | `src/app/src/WeatherDisplay.js`, SQL aliases, log messages | **"Alamanac" typo visible in the UI and throughout the codebase.** Correct spelling is "Almanac". |
| 34 | `README.md`, `.devcontainer/devcontainer.json` | **Architecture docs still describe Heroku as deployment target.** "Key Heroku design components" section and Heroku CLI in devcontainer remain despite migration away from Heroku. |
| 35 | `step-by-step.md` | **Three unresolved hardware TODOs from original Pi setup.** SSH hardening, X Windows/VNC decision, and RTL-SDR install instructions are all marked TODO. |

---

*Last updated: 2026-03-16. Add new items as they are discovered; remove (or link to the closing PR/commit) when resolved.*
