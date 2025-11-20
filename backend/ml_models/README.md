# ML Models Directory

This directory contains trained machine learning models used by the Textile ERP system.

## Model Types

- **LSTM**: Used for demand forecasting
- **Random Forest Regression**: Used for inventory optimization
- **Logistic Regression / CNN**: Used for defect detection/classification
- **SVM**: Used for supplier performance scoring

## File Naming Convention

Models are stored with the following naming convention:
`{model_type}_{version}.{extension}`

Where:
- `model_type` is one of: lstm, rf, lr, cnn, svm
- `version` is the model version (e.g., v1, v2)
- `extension` is the file format (.pkl for sklearn, .h5 for Keras/TensorFlow)

## Versioning

Each model type maintains its own version history. New versions should be created when:
- Model is retrained with new data
- Model architecture is changed
- Significant performance improvements are made

## Important Notes

- Large model files (.h5, .pt) are gitignored and should be stored separately
- Model metadata is tracked in the database via the ml_service app
- Always update the model registry when adding/updating models