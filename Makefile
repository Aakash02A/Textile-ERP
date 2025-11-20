# Makefile for Textile ERP Project

# Backend commands
.PHONY: backend-install backend-migrate backend-run backend-test

backend-install:
	cd backend && pip install -r requirements.txt

backend-migrate:
	cd backend && python manage.py migrate

backend-run:
	cd backend && python manage.py runserver

backend-test:
	cd backend && pytest

# Frontend commands
.PHONY: frontend-install frontend-run frontend-build frontend-test

frontend-install:
	cd frontend && npm install

frontend-run:
	cd frontend && npm run dev

frontend-build:
	cd frontend && npm run build

frontend-test:
	cd frontend && npm test

# Docker commands
.PHONY: docker-up docker-down docker-build

docker-up:
	cd backend && docker-compose -f compose.dev.yml up

docker-down:
	cd backend && docker-compose -f compose.dev.yml down

docker-build:
	cd backend && docker-compose -f compose.dev.yml up --build

# ML commands
.PHONY: ml-demand ml-inventory

ml-demand:
	cd ml && python train_demand_lstm.py

ml-inventory:
	cd ml && python train_inventory_rf.py

# Setup commands
.PHONY: setup setup-backend setup-frontend

setup: setup-backend setup-frontend

setup-backend: backend-install backend-migrate

setup-frontend: frontend-install

# Help
.PHONY: help

help:
	@echo "Textile ERP Makefile Commands:"
	@echo ""
	@echo "Backend:"
	@echo "  make backend-install    - Install backend dependencies"
	@echo "  make backend-migrate    - Run database migrations"
	@echo "  make backend-run        - Run backend development server"
	@echo "  make backend-test       - Run backend tests"
	@echo ""
	@echo "Frontend:"
	@echo "  make frontend-install   - Install frontend dependencies"
	@echo "  make frontend-run       - Run frontend development server"
	@echo "  make frontend-build     - Build frontend for production"
	@echo "  make frontend-test      - Run frontend tests"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-up          - Start Docker services"
	@echo "  make docker-down        - Stop Docker services"
	@echo "  make docker-build       - Build and start Docker services"
	@echo ""
	@echo "ML:"
	@echo "  make ml-demand          - Train demand forecasting model"
	@echo "  make ml-inventory       - Train inventory optimization model"
	@echo ""
	@echo "Setup:"
	@echo "  make setup              - Setup both frontend and backend"
	@echo "  make setup-backend      - Setup backend"
	@echo "  make setup-frontend     - Setup frontend"