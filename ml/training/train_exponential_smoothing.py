"""
Finance Tracker - Exponential Smoothing Model
==============================================
Dataset : data_1.csv  (multi-user, 60 time periods, 2019–2023)
Targets : monthly_expense_total, actual_savings, monthly_income
Pipeline: Aggregate → Train/Test Split → Grid Search → Evaluate → Forecast
"""

import pandas as pd
import numpy as np

# ── Config ────────────────────────────────────────────────────────────────────
DATA_PATH      = "data 1.csv"
TRAIN_RATIO    = 0.8
ALPHA_RANGE    = np.round(np.arange(0.1, 1.0, 0.1), 1)
FORECAST_STEPS = 3
TARGETS        = ["monthly_expense_total", "actual_savings", "monthly_income"]


# ── 1. Load & aggregate monthly averages ─────────────────────────────────────
def load_monthly(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    df["date"] = pd.to_datetime(df["date"], dayfirst=True)
    monthly = (
        df.groupby("date")[TARGETS]
        .mean()
        .sort_index()
        .round(2)
    )
    return monthly


# ── 2. Core exponential smoothing ────────────────────────────────────────────
def exp_smooth(series: np.ndarray, alpha: float) -> np.ndarray:
    """
    Single Exponential Smoothing
        S(t) = α·X(t) + (1−α)·S(t−1)

    α → 1 : reacts fast to recent values
    α → 0 : smooths heavily, slow to change
    """
    s = np.zeros(len(series))
    s[0] = series[0]
    for t in range(1, len(series)):
        s[t] = alpha * series[t] + (1 - alpha) * s[t - 1]
    return s


# ── 3. Predict on test (seed from last train smoothed value) ─────────────────
def predict_test(train: np.ndarray, n_test: int, alpha: float) -> np.ndarray:
    smoothed = exp_smooth(train, alpha)
    return np.full(n_test, smoothed[-1])


# ── 4. Error metrics ──────────────────────────────────────────────────────────
def mae(actual, pred):
    return np.mean(np.abs(actual - pred))

def rmse(actual, pred):
    return np.sqrt(np.mean((actual - pred) ** 2))

def mape(actual, pred):
    return np.mean(np.abs((actual - pred) / (actual + 1e-9))) * 100


# ── 5. Grid search best alpha per target ─────────────────────────────────────
def grid_search(train: np.ndarray, test: np.ndarray) -> pd.DataFrame:
    rows = []
    for alpha in ALPHA_RANGE:
        preds = predict_test(train, len(test), alpha)
        rows.append({
            "alpha": alpha,
            "MAE":   round(mae(test, preds), 2),
            "RMSE":  round(rmse(test, preds), 2),
            "MAPE":  round(mape(test, preds), 2),
        })
    return pd.DataFrame(rows).sort_values("MAE").reset_index(drop=True)


# ── 6. Forecast future steps ─────────────────────────────────────────────────
def forecast(all_data: np.ndarray, alpha: float, n: int) -> np.ndarray:
    """Re-train on full data with best alpha, then project n steps ahead."""
    smoothed = exp_smooth(all_data, alpha)
    s = smoothed[-1]
    preds = []
    for _ in range(n):
        s = alpha * s + (1 - alpha) * s
        preds.append(s)
    return np.array(preds)


# ── 7. Main ───────────────────────────────────────────────────────────────────
def main():
    print("=" * 60)
    print("  Finance Tracker — Exponential Smoothing (data_1.csv)")
    print("=" * 60)

    monthly = load_monthly(DATA_PATH)
    n = len(monthly)
    n_train = int(n * TRAIN_RATIO)
    n_test  = n - n_train

    print(f"\nPeriods loaded : {n}  ({monthly.index[0].date()} → {monthly.index[-1].date()})")
    print(f"Train          : {n_train}  |  Test : {n_test}  |  Split : {TRAIN_RATIO:.0%}/{1-TRAIN_RATIO:.0%}")
    print(f"Targets        : {TARGETS}\n")

    best_alphas = {}

    for target in TARGETS:
        values = monthly[target].values.astype(float)
        train, test = values[:n_train], values[n_train:]

        results = grid_search(train, test)
        best    = results.iloc[0]
        best_alphas[target] = best["alpha"]

        print(f"── {target} ──────────────────────────────────")
        print(results.to_string(index=False))
        print(f"\n  Best α : {best['alpha']}  |  MAE : {best['MAE']:,.2f}  |  RMSE : {best['RMSE']:,.2f}  |  MAPE : {best['MAPE']:.1f}%")

        future = forecast(values, best["alpha"], FORECAST_STEPS)
        last   = monthly.index[-1]
        future_idx = pd.date_range(start=last + pd.offsets.Day(30),
                                   periods=FORECAST_STEPS, freq="30D")
        print(f"\n  {FORECAST_STEPS}-step forecast:")
        for idx, val in zip(future_idx, future):
            print(f"    {idx.strftime('%b %Y')} → {val:,.2f}")
        print()

    print("── Best alpha summary ────────────────────────────────")
    for t, a in best_alphas.items():
        print(f"  {t:<30} α = {a}")

    print("\nDone.\n")
    return best_alphas


if __name__ == "__main__":
    main()

# ── 8. Save model to ml/models ──────────────────────────────────────────────
def save_model(best_alphas, output_path="ml/models/exponential_smoothing_model.pkl"):
    """Save best alphas and model info"""
    import os
    import pickle
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    model_info = {
        'best_alphas': best_alphas,
        'alpha_range': ALPHA_RANGE.tolist(),
        'forecast_steps': FORECAST_STEPS,
        'targets': TARGETS
    }
    
    with open(output_path, 'wb') as f:
        pickle.dump(model_info, f)
    
    print(f"\n Model saved to: {output_path}")
    return output_path

# ── Add after print("Done.\n") in main() ────────────────────────────────────
    print("\nDone.\n")
    # Save model
    save_model(best_alphas)

    return best_alphas
