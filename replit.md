# StockAI — AI Stock Price Predictor

A full-stack ML-powered stock market prediction platform. Retail investors get institutional-grade forecasting using multiple machine learning algorithms.

## Run & Operate

- **Frontend**: `pnpm --filter @workspace/stock-predictor run dev` (port $PORT, auto-managed)
- **Backend**: `python /home/runner/workspace/artifacts/api-server/app.py` (port 8080, at `/api`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks from OpenAPI spec

## Stack

- **Frontend**: React + Vite + Tailwind CSS, Framer Motion, Recharts, Wouter routing
- **Backend**: Python Flask (replaces original Node.js Express), in-memory storage
- **ML**: scikit-learn (Linear Regression, Decision Tree, Random Forest, SVR, KNN), XGBoost, optional LSTM
- **Data**: yfinance for real-time + historical stock data
- **API codegen**: Orval (from OpenAPI spec in `lib/api-spec/openapi.yaml`)

## Where things live

- `artifacts/stock-predictor/` — React frontend (all pages, components, charts)
- `artifacts/stock-predictor/src/pages/` — Landing, Dashboard, Predict, Portfolio, Compare, Indicators, About, News, Login, Register, Profile, Admin
- `artifacts/stock-predictor/src/lib/auth-context.tsx` — JWT auth context (token in localStorage as `stockai_token`)
- `artifacts/api-server/app.py` — Python Flask ML backend (all routes)
- `artifacts/api-server/requirements.txt` — Python dependencies
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth)
- `lib/api-client-react/src/generated/` — Generated React Query hooks (do not edit)
- `lib/api-zod/src/generated/` — Generated Zod schemas (do not edit)

## Auth

- Demo login: `demo@stockai.com` / `demo123`
- Admin login: `admin@stockai.com` / `admin123`
- JWT stored in `localStorage` as `stockai_token`, injected via `setAuthTokenGetter` from `@workspace/api-client-react`

## Architecture decisions

- **Python Flask instead of Node.js**: ML libraries (scikit-learn, yfinance, xgboost) require Python. The api-server artifact.toml run command was updated to `python /home/runner/workspace/artifacts/api-server/app.py`.
- **In-memory storage**: Users, watchlists, prediction history, and trained models are stored in Python dicts. Add SQLAlchemy + PostgreSQL for persistence in production.
- **Background training jobs**: `threading.Thread` for async ML training. `GET /api/ml/train/{jobId}/status` is polled from the frontend (1.5s interval).
- **`setAuthTokenGetter` export**: Re-exported from `lib/api-client-react/src/index.ts` (main package), not a sub-path — avoids Vite package export resolution issues.
- **No LSTM by default**: TensorFlow is large; LSTM falls back to `sklearn.neural_network.MLPRegressor` if TensorFlow is unavailable.

## Product

- **Landing Page**: Animated stock chart hero, feature cards, ML model overview, live market ticker
- **Dashboard**: Market overview (9 indices/crypto/commodities), watchlist, news feed
- **Predict**: 4-step workflow — symbol select → model config → live training progress → results with charts
- **Technical Indicators**: RSI, MACD, Bollinger Bands, SMA/EMA, Volume, ATR, ADX
- **Model Compare**: Side-by-side accuracy/performance comparison across all models
- **Portfolio Simulator**: ROI calculator with historical growth chart
- **About**: ML model explanations, feature engineering, evaluation metrics
- **News**: Market news with sentiment badges
- **Auth**: Register/Login/Profile with prediction history and saved models
- **Admin**: User management, server stats, active jobs

## User preferences

_Populate as you build._

## Gotchas

- After any `lib/api-spec/openapi.yaml` change, always run codegen before editing backend routes.
- The Python Flask app uses threading for training jobs; production should use Celery + Redis.
- `yfinance` has rate limits — rapid consecutive calls for many symbols may fail; add caching in production.
- Restart `artifacts/api-server: API Server` after changing `app.py`.
- Restart `artifacts/stock-predictor: web` after changing frontend source files (Vite HMR handles most cases automatically).

## Pointers

- See `pnpm-workspace` skill for workspace structure details
- OpenAPI spec naming rules in `.local/skills/pnpm-workspace/references/openapi.md`
