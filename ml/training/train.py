import os
import pickle
import numpy as np
from sklearn.linear_model import LinearRegression

def main():
    print("Starting ML Model Training...")
    
    # 1. Mock training data
    print("Generating mock training data...")
    X = np.array([[1], [2], [3], [4], [5]])
    y = np.array([2.0, 4.0, 6.0, 8.0, 10.0]) # relationship: y = 2*x
    
    # 2. Initialize and train model
    print("Training model (Linear Regression)...")
    model = LinearRegression()
    model.fit(X, y)
    
    # 3. Ensure models directory exists
    models_dir = os.path.join(os.path.dirname(__file__), "../models")
    os.makedirs(models_dir, exist_ok=True)
    
    # 4. Save trained model
    model_path = os.path.join(models_dir, "model.pkl")
    print(f"Saving trained model to {model_path}...")
    with open(model_path, "wb") as f:
        pickle.dump(model, f)
        
    print("Model training complete and saved successfully!")

if __name__ == "__main__":
    main()
