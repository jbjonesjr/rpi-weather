# rpi-weather Architecture

## Project Purpose

**rpi-weather** is a personal weather station system built around a Raspberry Pi. It uses an RTL-SDR USB dongle to receive radio transmissions from wireless weather sensors (LaCrosse wind/temp/rain, Fineoffset soil moisture), stores readings in a cloud PostgreSQL database, and displays them through a React web dashboard hosted on Heroku.

---

## Data Flow

```
RTL-433 CLI → Node.js child_process → CSV → Parser → PostgreSQL (Heroku/Azure)
                                                              ↓
                                               Express REST API (Heroku)
                                                              ↓
                                               React Dashboard (browser)
```

---

## Languages & Frameworks

| Component     | Language   | Key Libraries                                              |
|---------------|------------|------------------------------------------------------------|
| rtl-publish   | Node.js 18 | `pg`, `dotenv`, `line-by-line`, `@rauschma/stringio`       |
| server        | Node.js 18 | `express`, `pg`                                            |
| services      | Node.js 18 | `pg`                                                       |
| app           | React 17   | `chart.js`, `react-chartjs-2`, `styled-components`         |
| Deployment    | Heroku     | Multi-Procfile buildpack, Node.js buildpack                |
| Hardware      | RTL-433 CLI| RTL-SDR Linux kernel module (external binary)              |

---

## Directory & File Structure

```
/
├── package.json               # Root workspace
├── README.md                  # Project overview
├── architecture.md            # This file
├── db-settings.json           # DB connection templates (no credentials)
├── notes.md                   # Personal setup notes
├── step-by-step.md            # OS + hardware setup guide
├── .devcontainer/             # VS Code dev container (Node 18, Heroku CLI)
└── src/
    ├── services/              # Shared DB query layer
    │   └── src/fetchService.js     # 5 query functions (current, almanac, extremes)
    ├── server/                # Express API backend
    │   ├── index.js                # Server bootstrap (port 5000)
    │   ├── src/routes.js           # 6 REST routes + static React serving
    │   └── Procfile                # Heroku: `web: npm start`
    ├── app/                   # React web dashboard
    │   ├── src/
    │   │   ├── components/         # Weather, WeatherDisplay, Temp-chart, Wrapper
    │   │   ├── styles/             # Styled-components (background changes by time of day)
    │   │   └── utils/fetchHelpers.js # API calls (hardcoded Heroku URLs)
    │   └── Procfile                # Heroku: `web: npm run start:client`
    └── rtl-publish/           # Raspberry Pi data collector
        ├── index.js                # Spawns rtl_433, monitors 3 sensor models
        ├── src/rtl_process.js      # CSV parsing, DB persistence (~172 lines)
        └── tests/                  # Minimal test harness with mock DB
```

---

## Component Descriptions

### `rtl-publish`
Runs permanently on the Pi. Spawns `rtl_433` as a child process, reads its CSV output line-by-line, upserts sensor records, and inserts observation rows into `reports` or `moisture_report` tables.

Handles 3 sensor models:
- **LaCrosse-BreezePro** (Model 166) — wind speed/direction, temperature, humidity
- **LaCrosse-R3** (Model 175) — rainfall gauge
- **Fineoffset-WH51** (Model 142) — soil moisture + battery voltage

### `services`
Shared query module. Five functions wrapping parameterized SQL for:
- Current conditions
- Daily almanac (today / yesterday / arbitrary date)
- Hourly temperature extremes

All connections use `DATABASE_URL` + TLS.

### `server`
Thin Express layer. Mounts 6 REST routes, sets CORS to `*`, serves the pre-built React app as static files from `../app/build`, and listens on `PORT || 5000`.

### `app`
React 17 SPA. `Weather.js` fetches on mount and passes data to:
- **WeatherDisplay** — current temp + daily min/max
- **Temp-chart** — bar chart of hourly temperature ranges

Background image changes based on time of day (night / day / dusk).

---

## Tests, CI/CD & Documentation

### Tests
- `src/app/src/App.test.js` — single placeholder smoke test (renders without crashing)
- `src/rtl-publish/tests/tests.js` — ~30 lines with a mock `pg` client; simulates incoming sensor data but does not verify full CSV parsing or DB logic
- No server or services tests

### CI/CD
No `.github/workflows`. Deployment is manual via `git push heroku`.

### Documentation
- `README.md` — architecture overview, hardware specs, local run commands
- `step-by-step.md` — detailed Raspberry Pi OS + RTL-SDR build guide
- `notes.md` — personal implementation notes (VNC, Azure DB, RTL-433 model codes)

---

## Deployment

Heroku multi-Procfile setup with separate `Procfile`s for `server` and `app`:

| Dyno   | Directory     | Command                  |
|--------|---------------|--------------------------|
| web    | `src/server`  | `npm start`              |
| web    | `src/app`     | `npm run start:client`   |

Database is either **Heroku Postgres** or **Azure Database for PostgreSQL**, configured via the `DATABASE_URL` environment variable.

---

## External APIs & Hardware Interfaces

### Hardware

| Device | Purpose |
|--------|---------|
| RTL-SDR USB dongle (Realtek RTL2832U, 915 MHz ISM band) | Receives RF transmissions from sensors |
| LaCrosse-BreezePro (Model 166) | Wind speed/direction, temperature, humidity |
| LaCrosse-R3 (Model 175) | Rainfall gauge |
| Fineoffset-WH51 (Model 142) | Soil moisture + battery voltage |

### External Services

| Service | Role |
|---------|------|
| PostgreSQL (Heroku Postgres or Azure) | Persistent storage; requires `DATABASE_URL` env var |
| Heroku | Hosting for `server` and `app` components |
