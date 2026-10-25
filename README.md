# GridSight frontend

> **Built by me** — Product design, planning, and application logic are my own.
> AI was used as an implementation assistant.

GridSight is a single-screen renewable-generation intelligence dashboard for UK
day-ahead electricity procurement. It visualises the latest eligible wind
forecast against actual generation and presents forecast-accuracy metrics.

## Features

- Automatically refreshes when analysis parameters change.
- Supports all January 2026 data, a custom delivery range, or a next-day view.
- Shows actual and forecast generation with labelled MW and UK-time axes.
- Provides hover details for date, settlement period, actual, forecast, error,
  and forecast publication time.
- Supports mouse-wheel and button-based chart zooming.
- Reports MAE, RMSE, Bias, and MAPE with explanatory tooltips.
- Uses a white-and-purple interface built with shadcn components.

## Prerequisites

- Node.js 20 or newer
- npm
- The FastAPI backend running and accessible to the browser

## Environment

Copy the environment template:

```bash
cp .env.example .env.local
```

Configure the complete backend API base URL:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

There is no hard-coded API URL fallback. The variable must be supplied in every
environment. As a `NEXT_PUBLIC_` variable, it is included in the browser bundle
and must not contain credentials or secrets.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The frontend consumes:

- `GET /generation/metadata` for supported resource options.
- `GET /generation/analysis` for matched generation data and metrics.

## Dashboard operation

The **View** field controls the workflow:

- **All January data** displays the complete January 2026 analysis.
- **Custom date range** displays delivery-date inputs and analyses that range.
- **Next-day forecast** displays a decision-date input and analyses the following
  delivery day.

The **Prior-day cutoff** determines which forecast was available for the buying
decision. Filter changes are briefly debounced and sent to the backend
automatically; there is no submit button.

Hover over the chart to inspect a delivery slot. Use the zoom controls or mouse
wheel to move between 1×, 2×, 4×, and 8× zoom. Keyboard users can focus the
chart and use the left and right arrow keys to inspect points.

## Project structure

The UI follows Atomic Design:

```text
app/                    Next.js entry points and global theme
components/atoms/       Small presentation elements
components/molecules/   Reusable field and metric compositions
components/organisms/   Filter panel and interactive generation chart
components/templates/   Complete dashboard layout and data lifecycle
components/ui/          shadcn UI primitives
lib/api.ts              Environment-configured backend client
lib/types.ts            Frontend API contracts and filter types
```

## Verification

```bash
npm run lint
npx tsc --noEmit
npm run build -- --webpack
```

The webpack flag is useful in restricted environments where Turbopack cannot
open an internal local port. Standard production environments can use
`npm run build`.

## Production

Set `NEXT_PUBLIC_API_URL` to the deployed backend URL before building:

```bash
npm run build
npm run start
```

The backend must allow the deployed frontend origin through its CORS
configuration.
