import os
import joblib
import numpy as np
from django.conf import settings
from .models import ModelMeta
from tensorflow.keras.models import load_model


class ModelInference:
    """
    Class to handle inference using trained ML models.
    """
    
    def __init__(self, model_meta):
        self.model_meta = model_meta
        self.model = None
        self.load_model()
        
    def load_model(self):
        """
        Load the trained model from disk.
        """
        model_path = self.model_meta.path_on_disk
        
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found: {model_path}")
            
        if self.model_meta.model_type in ['lstm', 'cnn']:
            # For Keras models
            self.model = load_model(model_path)
        else:
            # For sklearn models
            self.model = joblib.load(model_path)
            
    def predict(self, input_data):
        """
        Make predictions using the loaded model.
        """
        if self.model_meta.model_type == 'lstm':
            return self._predict_lstm(input_data)
        elif self.model_meta.model_type == 'cnn':
            return self._predict_cnn(input_data)
        else:
            return self._predict_sklearn(input_data)
            
    def _predict_sklearn(self, input_data):
        """
        Make predictions using sklearn models.
        """
        # Convert input data to numpy array
        if isinstance(input_data, list):
            input_array = np.array(input_data)
        else:
            input_array = input_data
            
        # Reshape if needed
        if len(input_array.shape) == 1:
            input_array = input_array.reshape(1, -1)
            
        # Make prediction
        prediction = self.model.predict(input_array)
        
        # Get probability scores if available
        probabilities = None
        if hasattr(self.model, 'predict_proba'):
            probabilities = self.model.predict_proba(input_array)
            
        return {
            'prediction': prediction.tolist(),
            'probabilities': probabilities.tolist() if probabilities is not None else None
        }
        
    def _predict_lstm(self, input_data):
        """
        Make predictions using LSTM model.
        """
        # Convert input data to numpy array
        if isinstance(input_data, list):
            input_array = np.array(input_data)
        else:
            input_array = input_data
            
        # Reshape for LSTM (batch_size, timesteps, features)
        if len(input_array.shape) == 2:
            input_array = input_array.reshape((input_array.shape[0], input_array.shape[1], 1))
        elif len(input_array.shape) == 1:
            input_array = input_array.reshape((1, len(input_array), 1))
            
        # Make prediction
        prediction = self.model.predict(input_array)
        
        return {
            'prediction': prediction.tolist()
        }
        
    def _predict_cnn(self, input_data):
        """
        Make predictions using CNN model.
        """
        # For image-based models, input would typically be preprocessed images
        # This is a placeholder implementation
        return {
            'prediction': [0.95],  # Placeholder confidence score
            'class': 'defect_detected'
        }