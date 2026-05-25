"""
Finance Tracker - SARIMAX Forecasting Model
============================================
Dataset : data_1.csv  (multi-user, 60 time periods, 2019–2023)
Model   : SARIMAX — Seasonal AutoRegressive Integrated Moving Average with eXogenous variables
Targets : monthly_expense_total, actual_savings, monthly_income
Pipeline: Aggregate → ADF stationarity test → Train/Test Split
          → Grid Search (p,d,q)(P,D,Q,m) → Evaluate → Forecast
"""

import pandas as pd
import numpy as np
import warnings
import itertools
warnings.filterwarnings('ignore')

from statsmodels.tsa.statespace.sarimax import SARIMAX
from statsmodels.tsa.stattools import adfuller

# ── Config ─────────────────────────────────────────────────────────────────────
DATA_PATH      = "data_1.csv"
TRAIN_RATIO    = 0.5
SEASONAL_M     = 12                     # 12 = yearly seasonality on monthly data
FORECAST_STEPS = 3
TARGETS        = ["monthly_expense_total", "actual_savings", "monthly_income"]

# SARIMA grid search space  (keep small to avoid long runtimes)
P_RANGE = [0, 1, 2]
D_RANGE = [0, 1]
Q_RANGE = [0, 1, 2]
SP_RANGE = [0, 1]
SD_RANGE = [0, 1]
SQ_RANGE = [0, 1]


# ── 1. Load & aggregate ─────────────────────────────────────────────────────
def load_monthly(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    df["date"] = pd.to_datetime(df["date"], dayfirst=True)
    monthly = (
        df.groupby("date")[TARGETS]
        .mean()
        .sort_index()
        .round(4)
    )
    return monthly


# ── 2. Stationarity test ────────────────────────────────────────────────────
def adf_test(series: pd.Series, name: str) -> dict:
    result = adfuller(series.dropna())
    stationary = result[1] < 0.05
    return {
        "target":     name,
        "ADF stat":   round(result[0], 4),
        "p-value":    round(result[1], 4),
        "stationary": "YES" if stationary else "NO — needs differencing",
        "d_suggest":  0 if stationary else 1,
    }


# ── 3. Error metrics ────────────────────────────────────────────────────────
def mae(actual, pred):
    return np.mean(np.abs(np.array(actual) - np.array(pred)))

def rmse(actual, pred):
    return np.sqrt(np.mean((np.array(actual) - np.array(pred)) ** 2))

def mape(actual, pred):
    a = np.array(actual)
    return np.mean(np.abs((a - np.array(pred)) / (a + 1e-9))) * 100


# ── 4. Grid search: find best (p,d,q)(P,D,Q,m) by AIC ──────────────────────
def grid_search_sarimax(train: np.ndarray, test: np.ndarray,
                        d_override: int = None) -> pd.DataFrame:
    """
    Exhaustive grid search over SARIMA orders.
    Selects best model by AIC (trained on train set).
    Also reports MAE on test set for every candidate.
    """
    rows = []
    for p, d, q in itertools.product(P_RANGE, D_RANGE, Q_RANGE):
        # Respect stationarity — if series needs differencing, don't allow d=0
        if d_override is not None and d < d_override:
            continue
        for P, D, Q in itertools.product(SP_RANGE, SD_RANGE, SQ_RANGE):
            try:
                model = SARIMAX(
                    train,
                    order=(p, d, q),
                    seasonal_order=(P, D, Q, SEASONAL_M),
                    enforce_stationarity=False,
                    enforce_invertibility=False,
                )
                fitted = model.fit(disp=False)
                test_pred = fitted.forecast(len(test))
                rows.append({
                    "order":    (p, d, q),
                    "seasonal": (P, D, Q, SEASONAL_M),
                    "AIC":      round(fitted.aic, 2),
                    "MAE":      round(mae(test, test_pred), 2),
                    "RMSE":     round(rmse(test, test_pred), 2),
                    "MAPE":     round(mape(test, test_pred), 2),
                })
            except Exception:
                pass

    results = pd.DataFrame(rows).sort_values("MAE").reset_index(drop=True)
    return results


# ── 5. Forecast future steps ────────────────────────────────────────────────
def forecast_sarimax(all_data: np.ndarray,
                     order: tuple,
                     seasonal_order: tuple,
                     n_steps: int) -> np.ndarray:
    """Re-fit SARIMAX on full series with best order, then forecast n_steps."""
    model = SARIMAX(
        all_data,
        order=order,
        seasonal_order=seasonal_order,
        enforce_stationarity=False,
        enforce_invertibility=False,
    )
    fitted = model.fit(disp=False)
    forecast_vals = fitted.forecast(n_steps)
    conf_int = fitted.get_forecast(n_steps).conf_int()
    return forecast_vals, conf_int


# ── 6. Main ─────────────────────────────────────────────────────────────────
def main():
    print("=" * 65)
    print("  Finance Tracker — SARIMAX Model  (data_1.csv)")
    print("=" * 65)

    # Load
    monthly = load_monthly(DATA_PATH)
    n = len(monthly)
    n_train = int(n * TRAIN_RATIO)
    n_test  = n - n_train

    print(f"\nPeriods : {n}  ({monthly.index[0].date()} → {monthly.index[-1].date()})")
    print(f"Train   : {n_train}  |  Test : {n_test}  |  Split : {TRAIN_RATIO:.0%}/{1-TRAIN_RATIO:.0%}")
    print(f"Seasonal period m = {SEASONAL_M}\n")

    # ADF tests
    print("── Stationarity (ADF Test) ───────────────────────────────")
    adf_results = []
    for t in TARGETS:
        r = adf_test(monthly[t], t)
        adf_results.append(r)
        print(f"  {r['target']:<30} ADF={r['ADF stat']:>8}  p={r['p-value']:.4f}  → {r['stationary']}")

    print()
    best_configs = {}

    for idx, target in enumerate(TARGETS):
        print(f"── {target} {'─'*(45-len(target))}")
        values = monthly[target].values.astype(float)
        train  = values[:n_train]
        test   = values[n_train:]
        d_hint = adf_results[idx]["d_suggest"]

        print(f"  Running grid search (d≥{d_hint}) ...")
        results = grid_search_sarimax(train, test, d_override=d_hint)

        print(f"\n  Top 5 models by MAE:")
        print(results.head(5).to_string(index=False))

        best = results.iloc[0]
        best_order    = best["order"]
        best_seasonal = best["seasonal"]
        best_configs[target] = (best_order, best_seasonal)

        print(f"\n  ✓ Best  order    : {best_order}")
        print(f"    Best  seasonal : {best_seasonal}")
        print(f"    MAE  : {best['MAE']:,.2f}")
        print(f"    RMSE : {best['RMSE']:,.2f}")
        print(f"    MAPE : {best['MAPE']:.1f}%")

        # Forecast
        future_vals, conf_int = forecast_sarimax(
            values, best_order, best_seasonal, FORECAST_STEPS
        )
        last = monthly.index[-1]
        future_idx = pd.date_range(
            start=last + pd.offsets.Day(30),
            periods=FORECAST_STEPS, freq="30D"
        )
        print(f"\n  {FORECAST_STEPS}-step forecast:")
        for i, (fidx, fval) in enumerate(zip(future_idx, future_vals)):
            ci = conf_int.values if hasattr(conf_int, 'values') else conf_int
            lo = ci[i, 0]
            hi = ci[i, 1]
            print(f"    {fidx.strftime('%b %Y')} → {fval:,.2f}  (95% CI: {lo:,.2f} – {hi:,.2f})")
        print()

    print("── Best model summary ────────────────────────────────────")
    for t, (o, s) in best_configs.items():
        print(f"  {t:<30} order={o}  seasonal={s}")

    print("\nDone.\n")
    return best_configs


if __name__ == "__main__":
    main()
