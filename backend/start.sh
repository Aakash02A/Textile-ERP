#!/bin/bash
# Textile ERP Backend Startup Script

echo "🚀 Starting Textile ERP Backend Services..."

# Check if running in Docker
if [ -f /.dockerenv ]; then
    echo "✅ Running in Docker container"
    cd /app/backend
else
    echo "📦 Running locally"
    cd backend
fi

# Install dependencies
echo "📥 Installing Python dependencies..."
pip install -q -r requirements.txt

# Run migrations if needed
echo "🗄️ Initializing database..."
python -c "from app.core.database import Base, engine; Base.metadata.create_all(bind=engine); print('✅ Database initialized')"

# Start FastAPI server
echo "🌐 Starting FastAPI server on port 8000..."
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

echo "🔴 Backend shutdown"
