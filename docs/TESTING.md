# Testing guide

## Automated checks

Run from the project root with Node.js 20+; no dependencies or running server are needed.

```sh
npm run check
npm test
npm run test:datasets
```

| Command | Checks |
| --- | --- |
| `npm run check` | Syntax of the server, analytics, browser script and dataset generator. |
| `npm test` | Four tests covering deterministic data, food mass conservation, filtered aggregation, hand-calculated forecasts, invalid CSV values/dates and anomaly detection. |
| `npm run test:datasets` | Regenerates all four CSV fixtures and expected results, parses them with the app's importer, checks the hotspot and anomaly dates, verifies quick-check arithmetic, and confirms rejection of the invalid fixture. |

The dataset command overwrites generated fixtures with their deterministic contents; it does not upload anything or change a running dashboard. On an unchanged checkout, `git diff -- datasets/` should be empty afterward.

The GitHub Actions workflow runs these checks on Node.js 20 and 22 for pushes to `main` and pull requests. A manual workflow trigger is also available. Workflow availability does not imply a successful run; inspect the repository's Actions tab for results.

## Manual acceptance checklist

Start the server using `npm start` and open the dashboard.

1. **Initial state:** default source is Synthetic dataset with 120,000 records and five venue options.
2. **Import:** import `datasets/presentation-data.csv`; the record count becomes 36,000.
3. **Totals:** with Last 30 days / All venues / All meals, verify 17.72 tonnes served, 3.09 tonnes wasted and 17.4% waste.
4. **Venue filtering:** choose Hostel Kitchen. Waste explorer should show only that venue; counts and forecast should change.
5. **Anomalies:** all venues/meals flag October 18. Hostel Kitchen + Dinner flags October 18 and October 26.
6. **Time window:** Last 7 days covers October 24–30 for the presentation dataset. With all venues/meals there are 8,400 records.
7. **Forecast:** restore the full 30-day view and all categories. Demand forecast should be 603.4 kg.
8. **Scenario:** at 20% reduction, potential food saved is about 618 kg and assumed CO₂e avoided is 1.55 tonnes.
9. **Small check:** import `datasets/quick-check.csv`: 4 records, 100 kg served, 20 kg waste and 20% waste. Forecast is 38.3 kg.
10. **Boundary values:** import `datasets/valid-boundaries.csv`; all three records should be accepted.
11. **Invalid import:** import `datasets/invalid-waste.csv`; expect a Row 2 error. Existing data must remain unchanged.
12. **Export:** export downloads all current source records, regardless of filters. Reimporting that CSV should reproduce its totals.
13. **Reset:** Data pipeline → Reset demo data restores 120,000 synthetic records.
14. **Interface:** verify navigation, daily chart value disclosure, keyboard focus, about-dialog close, mobile layout and reduced-motion behavior.

Use [expected-results.json](../datasets/expected-results.json) for unrounded presentation metrics and [PRESENTATION-GUIDE.md](../datasets/PRESENTATION-GUIDE.md) for the viva walkthrough.

## Scope of verification

Automated tests cover the analytics and dataset fixtures. The current workflow does not automate browser or HTTP integration checks. Manual acceptance steps above cover the complete app. No throughput benchmark, distributed cluster test or forecast accuracy evaluation is included.
