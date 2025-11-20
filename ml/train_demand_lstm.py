import pandas as pd
import numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from sklearn.preprocessing import MinMaxScaler
import joblib
import os

def create_lstm_model(input_shape):
    """Create LSTM model for demand forecasting."""
    model = Sequential([
        LSTM(50, return_sequences=True, input_shape=input_shape),
        Dropout(0.2),
        LSTM(50, return_sequences=False),
        Dropout(0.2),
        Dense(25),
        Dense(1)
    ])
    
    model.compile(optimizer='adam', loss='mean_squared_error')
    return model

def prepare_data(data, lookback=60):
    """Prepare data for LSTM training."""
    # Scale the data
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(data)
    
    # Create training data
    X, y = [], []
    for i in range(lookback, len(scaled_data)):
        X.append(scaled_data[i-lookback:i])
        y.append(scaled_data[i, 0])
    
    X, y = np.array(X), np.array(y)
    return X, y, scaler

def train_demand_forecast_model(csv_file_path, model_save_path):
    """Train LSTM model for demand forecasting."""
    # Load data
    df = pd.read_csv(csv_file_path)
    
    # Assume the first column is date and second is demand
    data = df.iloc[:, 1:2].values
    
    # Prepare data
    X, y, scaler = prepare_data(data)
    
    # Split data
    split = int(0.8 * len(X))
    X_train, X_test = X[:split], X[split:]
    y_train, y_test = y[:split], y[split:]
    
    # Create and train model
    model = create_lstm_model((X_train.shape[1], 1))
    model.fit(X_train, y_train, batch_size=32, epochs=20, validation_data=(X_test, y_test))
    
    # Save model and scaler
    model.save(model_save_path)
    joblib.dump(scaler, model_save_path.replace('.h5', '_scaler.pkl'))
    
    print(f"Model saved to {model_save_path}")
    return model, scaler

if __name__ == "__main__":
    # Example usage
    csv_file = "demand_data.csv"  # Replace with actual path
    model_path = "../backend/ml_models/demand_lstm_v1.h5"
    
    # Create sample data if file doesn't exist
    if not os.path.exists(csv_file):
        print("Creating sample data...")
        dates = pd.date_range('2020-01-01', periods=500, freq='D')
        demand = np.random.randint(100, 1000, size=500) + np.sin(np.arange(500) * 0.1) * 100
        sample_df = pd.DataFrame({'date': dates, 'demand': demand})
        sample_df.to_csv(csv_file, index=False)
    
    # Train model
    train_demand_forecast_model(csv_file, model_path)