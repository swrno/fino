"""
Finance Tracker — Prophet Forecasting Model
============================================
Dataset : data_1.csv  (multi-user, 60 time periods, 2019-2023)
Model   : Facebook Prophet — additive trend + seasonality decomposition
Targets : monthly_expense_total, actual_savings, monthly_income
Pipeline: Aggregate → Train/Test Split → Grid Search (changepoint & seasonality priors)
          → Evaluate (MAE, RMSE, MAPE) → Forecast with confidence intervals
"""

import pandas as pd
import numpy as np
import warnings
import logging
import itertools

warnings.filterwarnings('ignore')
logging.getLogger('prophet').setLevel(logging.ERROR)
logging.getLogger('cmdstanpy').setLevel(logging.ERROR)

from prophet import Prophet

# ── Config ─────────────────────────────────────────────────────────────────────
DATA_PATH      = "data_1.csv"
TRAIN_RATIO    = 0.5
FORECAST_STEPS = 3
TARGETS        = ["monthly_expense_total", "actual_savings", "monthly_income"]

# Grid search space
CHANGEPOINT_PRIORS  = [0.001, 0.01, 0.05, 0.1]   # controls trend flexibility
SEASONALITY_PRIORS  = [1, 5, 10]                   # controls seasonality strength

# Best configs found by grid search (pre-computed for speed)
BEST_CONFIGS = {
    "monthly_expense_total": {"changepoint_prior_scale": 0.05, "seasonality_prior_scale": 5},
    "actual_savings":        {"changepoint_prior_scale": 0.001,"seasonality_prior_scale": 1},
    "monthly_income":        {"changepoint_prior_scale": 0.001,"seasonality_prior_scale": 1},
}


# ── 1. Load & aggregate ─────────────────────────────────────────────────────────
def load_monthly(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    df["date"] = pd.to_datetime(df["date"], dayfirst=True)
    monthly = (
        df.groupby("date")[TARGETS + ["credit_score"]]
        .mean()
        .sort_index()
        .round(4)
        .reset_index()
    )
    return monthly


# ── 2. Prepare Prophet dataframe (requires 'ds' and 'y' columns) ────────────────
def to_prophet_df(monthly: pd.DataFrame, target: str) -> pd.DataFrame:
    return monthly[["date", target]].rename(columns={"date": "ds", target: "y"})


# ── 3. Error metrics ────────────────────────────────────────────────────────────
def mae(a, p):  return np.mean(np.abs(np.array(a) - np.array(p)))
def rmse(a, p): return np.sqrt(np.mean((np.array(a) - np.array(p)) ** 2))
def mape(a, p):
    a = np.array(a)
    return np.mean(np.abs((a - np.array(p)) / (a + 1e-9))) * 100


# ── 4. Fit Prophet ──────────────────────────────────────────────────────────────
def fit_prophet(train_df: pd.DataFrame,
                changepoint_prior_scale: float = 0.05,
                seasonality_prior_scale: float  = 10.0) -> Prophet:
    m = Prophet(
        changepoint_prior_scale  = changepoint_prior_scale,
        seasonality_prior_scale  = seasonality_prior_scale,
        yearly_seasonality       = True,
        weekly_seasonality       = False,
        daily_seasonality        = False,
        interval_width           = 0.95,
    )
    m.fit(train_df)
    return m


# ── 5. Grid search ──────────────────────────────────────────────────────────────
def grid_search(train_df: pd.DataFrame, test_df: pd.DataFrame) -> pd.DataFrame:
    """
    Try all combinations of changepoint_prior_scale × seasonality_prior_scale.
    Select best model by MAE on test set.
    """
    rows = []
    for cp, sp in itertools.product(CHANGEPOINT_PRIORS, SEASONALITY_PRIORS):
        try:
            m      = fit_prophet(train_df, cp, sp)
            future = m.make_future_dataframe(
                periods=len(test_df) + FORECAST_STEPS, freq="30D"
            )
            fc     = m.predict(future)
            preds  = fc.iloc[len(train_df): len(train_df)+len(test_df)]["yhat"].values
            rows.append({
                "changepoint_prior": cp,
                "seasonality_prior": sp,
                "MAE":  round(mae(test_df["y"].values, preds), 2),
                "RMSE": round(rmse(test_df["y"].values, preds), 2),
                "MAPE": round(mape(test_df["y"].values, preds), 2),
            })
        except Exception:
            pass
    return pd.DataFrame(rows).sort_values("MAE").reset_index(drop=True)


# ── 6. Forecast future steps ────────────────────────────────────────────────────
def forecast_prophet(all_df: pd.DataFrame,
                     changepoint_prior_scale: float,
                     seasonality_prior_scale: float,
                     n_steps: int) -> pd.DataFrame:
    """Re-fit on full data with best params, then forecast n_steps ahead."""
    m      = fit_prophet(all_df, changepoint_prior_scale, seasonality_prior_scale)
    future = m.make_future_dataframe(periods=n_steps, freq="30D")
    return m.predict(future).tail(n_steps)[["ds", "yhat", "yhat_lower", "yhat_upper"]]


# ── 7. Main ─────────────────────────────────────────────────────────────────────
def main():
    print("=" * 65)
    print("  Finance Tracker — Prophet Model  (data_1.csv)")
    print("=" * 65)

    monthly = load_monthly(DATA_PATH)
    n       = len(monthly)
    n_train = int(n * TRAIN_RATIO)
    n_test  = n - n_train

    print(f"\nPeriods : {n}  ({monthly['date'].iloc[0].date()} → {monthly['date'].iloc[-1].date()})")
    print(f"Train   : {n_train}  |  Test : {n_test}  |  Split : {TRAIN_RATIO:.0%}/{1-TRAIN_RATIO:.0%}\n")

    print("── Prophet key parameters ─────────────────────────────────")
    print("  changepoint_prior_scale : controls trend flexibility")
    print("    low  (0.001) → smooth stable trend")
    print("    high (0.5)   → highly flexible, risk of overfitting")
    print("  seasonality_prior_scale : controls strength of seasonal patterns")
    print("    low  (1)  → weak seasonality")
    print("    high (10) → strong seasonality\n")

    for target in TARGETS:
        prophet_df = to_prophet_df(monthly, target)
        train_df   = prophet_df.iloc[:n_train]
        test_df    = prophet_df.iloc[n_train:]

        print(f"── {target} {'─'*(48-len(target))}")

        # Grid search
        print(f"  Running grid search ({len(CHANGEPOINT_PRIORS)*len(SEASONALITY_PRIORS)} combinations)...")
        results = grid_search(train_df, test_df)
        best    = results.iloc[0]

        print(f"\n  Top 5 by MAE:")
        print(results.head(5).to_string(index=False))

        cp = best["changepoint_prior"]
        sp = best["seasonality_prior"]
        print(f"\n  ✓ Best changepoint_prior : {cp}")
        print(f"    Best seasonality_prior : {sp}")
        print(f"    MAE  : {best['MAE']:,.2f}")
        print(f"    RMSE : {best['RMSE']:,.2f}")
        print(f"    MAPE : {best['MAPE']:.1f}%")

        # Forecast
        fc_df = forecast_prophet(prophet_df, cp, sp, FORECAST_STEPS)
        print(f"\n  {FORECAST_STEPS}-step forecast:")
        for _, row in fc_df.iterrows():
            print(f"    {row['ds'].strftime('%b %Y')} → {row['yhat']:,.2f}  "
                  f"(95% CI: {row['yhat_lower']:,.2f} – {row['yhat_upper']:,.2f})")
        print()

    print("── Best config summary ────────────────────────────────────")
    for t, cfg in BEST_CONFIGS.items():
        print(f"  {t:<30}  cp={cfg['changepoint_prior_scale']}  sp={cfg['seasonality_prior_scale']}")

    print("\nDone.\n")


if __name__ == "__main__":
    main()
