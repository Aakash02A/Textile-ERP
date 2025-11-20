import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import joblib
import os

def create_sample_inventory_data():
    """Create sample inventory data for training."""
    np.random.seed(42)
    n_samples = 1000
    
    # Generate synthetic features
    historical_consumption = np.random.uniform(10, 1000, n_samples)
    lead_time = np.random.uniform(1, 30, n_samples)
    seasonal_factor = np.random.uniform(0.5, 2.0, n_samples)
    supplier_reliability = np.random.uniform(0.7, 1.0, n_samples)
    
    # Generate target variable (optimal reorder point) based on features
    optimal_reorder_point = (
        historical_consumption * lead_time * seasonal_factor * (2 - supplier_reliability)
        + np.random.normal(0, 10, n_samples)  # Add some noise
    )
    
    # Ensure non-negative values
    optimal_reorder_point = np.maximum(optimal_reorder_point, 0)
    
    # Create DataFrame
    df = pd.DataFrame({
        'historical_consumption': historical_consumption,
        'lead_time': lead_time,
        'seasonal_factor': seasonal_factor,
        'supplier_reliability': supplier_reliability,
        'optimal_reorder_point': optimal_reorder_point
    })
    
    return df

def train_inventory_optimization_model(data, model_save_path):
    """Train Random Forest model for inventory optimization."""
    # Prepare features and target
    feature_columns = ['historical_consumption', 'lead_time', 'seasonal_factor', 'supplier_reliability']
    X = data[feature_columns]
    y = data['optimal_reorder_point']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Create and train model
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluate model
    y_pred = model.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print(f"Model Performance:")
    print(f"Mean Squared Error: {mse:.2f}")
    print(f"R² Score: {r2:.4f}")
    
    # Save model
    joblib.dump(model, model_save_path)
    print(f"Model saved to {model_save_path}")
    
    return model

if __name__ == "__main__":
    # Create sample data
    print("Creating sample inventory data...")
    df = create_sample_inventory_data()
    
    # Save sample data
    sample_data_path = "inventory_data.csv"
    df.to_csv(sample_data_path, index=False)
    print(f"Sample data saved to {sample_data_path}")
    
    # Train model
    model_path = "../backend/ml_models/inventory_rf_v1.pkl"
    train_inventory_optimization_model(df, model_path)