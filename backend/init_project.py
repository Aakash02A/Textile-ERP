#!/usr/bin/env python
import os
import django
from django.core.management import execute_from_command_line
import sys

# Add the backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def main():
    """Initialize the Django project."""
    print("Initializing Textile ERP project...")
    
    # Run migrations
    print("Running migrations...")
    execute_from_command_line(['manage.py', 'makemigrations'])
    execute_from_command_line(['manage.py', 'migrate'])
    
    # Create superuser
    print("Creating superuser...")
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    # Check if superuser already exists
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='admin123',
            role='admin'
        )
        print("Superuser 'admin' created with password 'admin123'")
    else:
        print("Superuser 'admin' already exists")
    
    print("Project initialization complete!")

if __name__ == '__main__':
    main()