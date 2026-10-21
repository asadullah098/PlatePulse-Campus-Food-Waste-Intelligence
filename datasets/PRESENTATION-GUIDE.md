# PlatePulse test datasets

All records are synthetic, deliberately designed for classroom testing. They do not describe a real campus. Dates cover October 1–30, 2026, including simulated future dates relative to creation on October 21.

## Main presentation dataset

Import `presentation-data.csv` using **Import dataset**. Select **Last 30 days → All venues → All meals**.

- 36,000 individual meal transactions: 30 dates × 5 venues × 3 meals × 80 records.
- Each row represents one meal transaction; `served_kg` and `waste_kg` are kilograms for that transaction.
- Header and encoding match the application's importer (UTF-8).
- Meal portions vary with venue, meal, day of week and a demand cycle.
- The same number of transactions is generated per venue/meal/day. Demand variation is modeled through served weight, not attendance count.

### Expected dashboard results

| Measure | Expected value |
| --- | --- |
| Meal records | 36,000 |
| Food served | 17,724.223 kg / 17.72 tonnes |
| Food wasted | 3,091.958 kg / 3.09 tonnes |
| Waste rate | 17.4% (17.444815% before rounding) |
| Next-day demand forecast | 603.4 kg |
| Potential food saved at 20% reduction | 618 kg displayed (618.3916 kg underlying) |
| Estimated CO₂e avoided at 20% reduction | 1.55 tonnes, using the app's illustrative factor |
| Highest total waste venue | Hostel Kitchen: 1,098.907 kg |
| Lowest waste-rate venue | The Green Bowl: about 9.1% |

Values can differ in display precision. `expected-results.json` stores the unrounded computed results. The chart and KPI units differ: chart uses kg; headline mass cards use tonnes.

### A five-minute presentation

1. **Introduce the problem.** “PlatePulse helps a campus understand when and where food is being wasted.” State that this is synthetic transaction data.
2. **Import and inspect.** Load the main dataset with all filters reset. Explain food wasted ÷ food served × 100, using the expected metrics above.
3. **Find the hotspot.** Open Waste explorer. Hostel Kitchen has the largest total waste. The Green Bowl has the lowest waste rate. Distinguish total waste from efficiency: volumes affect rankings.
4. **Reveal a campus-wide event.** In Waste explorer, the unusual-day list flags **October 18**. The generator models a hypothetical attendance shock by increasing waste rates. Explain that anomaly detection signals something to investigate; the data alone cannot establish its cause.
5. **Find a local incident.** Select **Hostel Kitchen → Dinner**, keeping **Last 30 days**. Unusual days should include **October 18 and October 26**. October 26 models a local dinner overproduction incident. Switch back to all venues/meals afterward.
6. **Explain forecasting.** Open Demand forecast. The next-day estimate is **603.4 kg**, computed from the last seven daily totals with recency weights. This is an educational baseline, not a validated production forecast.
7. **Explore the scenario.** Return to Overview and move the reduction slider to 20%. Explain the potential saving of about **618 kg**. The emissions estimate is assumption-based, not measured.
8. **Discuss improvement.** The generator simulates smaller cooking batches from October 21. First 20 dates have a 19.48% waste rate; final 10 have 13.51%. This is a designed scenario, not evidence of a causal intervention. Selecting Last 7 days narrows the chart to October 24–30 and changes all filtered metrics.

## Small numerical check

Import `quick-check.csv`. Choose Last 30 days / All venues / All meals. It has only four records and is easy to verify manually.

| Measure | Expected value |
| --- | --- |
| Records | 4 |
| Served | 100 kg (0.10 tonnes) |
| Wasted | 20 kg (0.02 tonnes) |
| Waste rate | 20% |
| Daily served totals | October 1: 10 kg; October 2: 50 kg; October 3: 40 kg |
| Forecast | (10 × 1 + 50 × 2 + 40 × 3) ÷ 6 = 38.3 kg |
| Central Canteen filter | 2 records; 30 kg served; 5 kg wasted; 16.7% waste |
| Hostel Kitchen filter | 2 records; 70 kg served; 15 kg wasted; 21.4% waste |

## Boundary and validation tests

- `valid-boundaries.csv`: 3 records; zero waste, 100% waste and a 0.001 kg portion. Import should succeed. Total served 2.001 kg, total waste 1.001 kg. Tiny values can round to 0.00 tonnes in the headline cards; inspect Waste explorer for kg values.
- `invalid-waste.csv`: deliberately invalid; waste 0.8 kg exceeds served 0.5 kg. Import should show a validation error mentioning Row 2 and leave the previous dataset unchanged. This file is only for testing rejection; do not use it as presentation data.

Imports replace the current dataset, rather than appending to it. Use Data pipeline → Reset demo data to restore the original 120,000 generated records, or reimport the presentation file to restore this scenario. Uploaded data is held in memory and is lost on server restart.

## Reproducibility

Run `node datasets/generate.cjs` from the project root to regenerate all four CSV fixtures and expected results. The fixed seed produces the same records. The script validates each file with the application's parser and checks the intended hotspot, anomaly dates and quick-check arithmetic. It creates files only; it does not change the dashboard's current dataset.
