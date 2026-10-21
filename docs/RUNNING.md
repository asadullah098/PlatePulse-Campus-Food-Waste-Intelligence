# Setup and run guide

## Prerequisites

- Node.js 20 or newer, including npm.
- Git to clone the repository.
- A modern browser such as Chrome, Edge or Firefox.

Check your tools:

```sh
node --version
npm --version
git --version
```

## Download and start

```sh
git clone https://github.com/asadullah098/PlatePulse-Campus-Food-Waste-Intelligence.git
cd PlatePulse-Campus-Food-Waste-Intelligence
npm start
```

Open **http://localhost:3000**. Keep the terminal open while using the dashboard. Stop the server with **Ctrl+C**.

No `npm install`, `.env`, API key, database, Python installation or build step is needed. The project uses Node.js built-in modules. The initial dataset is generated automatically in server memory. Google Fonts are optional; local font fallbacks work offline.

Opening `public/index.html` directly will not work: the dashboard needs the Node API.

## Change the port

PowerShell:

```powershell
$env:PORT = '3001'
npm start
```

Windows Command Prompt:

```bat
set PORT=3001
npm start
```

macOS / Linux:

```sh
PORT=3001 npm start
```

Then visit **http://localhost:3001**. The server binds to `127.0.0.1` for a local classroom demo.

## Import the presentation data

1. Select **Import dataset** in the dashboard.
2. Choose `datasets/presentation-data.csv`.
3. Set **Last 30 days → All venues → All meals**.
4. Verify **36,000 records**, **17.72 tonnes served**, **3.09 tonnes wasted**, and **17.4% waste rate**.
5. Follow [the presentation guide](../datasets/PRESENTATION-GUIDE.md) to demonstrate anomalies, forecasts and scenarios.

Importing replaces the current dataset. Imported data lives in memory and disappears on server restart. **Data pipeline → Reset demo data** restores the default 120,000 synthetic records, not the presentation dataset. To restore the presentation scenario, import its CSV again.

## Common issues

| Symptom | Fix |
| --- | --- |
| `node` or `npm` is not recognized | Install Node.js 20+ and open a new terminal. |
| `EADDRINUSE` / address already in use | Stop the other project server or choose another port. |
| PowerShell blocks `npm.ps1` | Run `npm.cmd start`, `npm.cmd test`, or `node server.js`; no execution-policy change is necessary. |
| Page cannot connect | Keep the server running and use its port. Try `http://127.0.0.1:3000`. |
| CSV import fails | Use the required header, valid ISO dates, accepted meal names and weights satisfying `0 ≤ waste ≤ served`, with served > 0. Limit: 15 MB. |
| Metrics differ from the guide | Reimport the correct dataset and reset all three filters. The default 120,000-record dataset differs from the 36,000-record presentation dataset. |
| Tiny masses display as 0.00 tonnes | Inspect Waste explorer or daily values for kilogram-level detail. |

Personal datasets can be kept in `private-data/`, which Git ignores. Files committed to this repository are synthetic fixtures only.
