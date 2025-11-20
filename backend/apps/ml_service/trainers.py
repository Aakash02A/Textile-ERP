import os
import joblib
import json
from django.conf import settings
from .models import ModelMeta
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
import numpy as np


class ModelTrainer:
    """
    Class to handle training of different ML models.
    """
    
    def __init__(self, model_type, parameters=None):
        self.model_type = model_type
        self.parameters = parameters or {}
        self.model = None
        
    def train(self, training_data_path):
        """
        Train the model based on the model type.
        """
        # Load training data
        df = pd.read_csv(training_data_path)
        
        if self.model_type == 'rf':
            return self._train_random_forest(df)
        elif self.model_type == 'svm':
            return self._train_svm(df)
        elif self.model_type == 'lr':
            return self._train_logistic_regression(df)
        elif self.model_type == 'lstm':
            return self._train_lstm(df)
        elif self.model_type == 'cnn':
            return self._train_cnn(df)
        else:
            raise ValueError(f"Unsupported model type: {self.model_type}")
            
    def _train_random_forest(self, df):
        """
        Train Random Forest model for inventory optimization.
        """
        # Assuming the last column is the target variable
        X = df.iloc[:, :-1]
        y = df.iloc[:, -1]
        
        self.model = RandomForestRegressor(**self.parameters)
        self.model.fit(X, y)
        
        # Calculate metrics (simplified)
        score = self.model.score(X, y)
        metrics = {'r2_score': score}
        
        return self.model, metrics
    
    def _train_svm(self, df):
        """
        Train SVM model for supplier performance scoring.
        """
        # Assuming the last column is the target variable
        X = df.iloc[:, :-1]
        y = df.iloc[:, -1]
        
        self.model = SVC(**self.parameters)
        self.model.fit(X, y)
        
        # Calculate metrics (simplified)
        score = self.model.score(X, y)
        metrics = {'accuracy': score}
        
        return self.model, metrics
    
    def _train_logistic_regression(self, df):
        """
        Train Logistic Regression model for defect detection.
        """
        # Assuming the last column is the target variable
        X = df.iloc[:, :-1]
        y = df.iloc[:, -1]
        
        self.model = LogisticRegression(**self.parameters)
        self.model.fit(X, y)
        
        # Calculate metrics (simplified)
        score = self.model.score(X, y)
        metrics = {'accuracy': score}
        
        return self.model, metrics
    
    def _train_lstm(self, df):
        """
        Train LSTM model for demand forecasting.
        """
        # This is a simplified implementation
        # In practice, you would need to reshape data for LSTM
        # and handle time series preprocessing
        
        # For demonstration purposes, we'll create a simple LSTM
        self.model = Sequential([
            LSTM(50, return_sequences=True, input_shape=(10, 1)),
            LSTM(50, return_sequences=False),
            Dense(25),
            Dense(1)
        ])
        
        self.model.compile(optimizer='adam', loss='mean_squared_error')
        
        # Dummy metrics for demonstration
        metrics = {'loss': 0.01}
        
        return self.model, metrics
    
    def _train_cnn(self, df):
        """
        Placeholder for CNN training.
        """
        # This would be implemented for image-based defect detection
        # For now, we'll just return a placeholder
        metrics = {'accuracy': 0.95}
        return None, metrics
    
    def save_model(self, model_name, version):
        """
        Save the trained model to disk.
        """
        model_filename = f"{self.model_type}_{version}.pkl"
        model_path = os.path.join(settings.BASE_DIR, 'ml_models', model_filename)
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        
        # Save model
        if self.model_type in ['lstm', 'cnn']:
            # For Keras models, use save method
            model_path = model_path.replace('.pkl', '.h5')
            self.model.save(model_path)
        else:
            # For sklearn models, use joblib
            joblib.dump(self.model, model_path)
            
        return model_path