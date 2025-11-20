#!/usr/bin/env python
import os
from pathlib import Path

def verify_project_structure():
    """Verify that the project structure matches the required specification."""
    
    # Define expected directories and files
    expected_structure = {
        'backend': {
            'config': ['__init__.py', 'settings.py', 'urls.py', 'wsgi.py'],
            'apps': {
                'users': ['__init__.py', 'models.py', 'serializers.py', 'views.py', 'urls.py'],
                'procurement': ['__init__.py', 'models.py', 'serializers.py', 'views.py', 'urls.py'],
                'inventory': ['__init__.py', 'models.py', 'serializers.py', 'views.py', 'urls.py'],
                'production': ['__init__.py', 'models.py', 'serializers.py', 'views.py', 'urls.py'],
                'quality': ['__init__.py', 'models.py', 'serializers.py', 'views.py', 'urls.py'],
                'sales': ['__init__.py', 'models.py', 'serializers.py', 'views.py', 'urls.py'],
                'ml_service': ['__init__.py', 'models.py', 'trainers.py', 'infer.py', 'serializers.py', 'views.py', 'urls.py'],
            },
            'core': ['__init__.py', 'permissions.py', 'utils.py', 'tasks.py'],
            'ml_models': ['README.md'],
            'requirements.txt': None,
            'Dockerfile': None,
            'compose.dev.yml': None,
            'manage.py': None,
        },
        'frontend': {
            'src': {
                'routes': {
                    'auth': ['Login.jsx'],
                    'dashboard': ['Dashboard.jsx'],
                    'procurement': [],
                    'inventory': [],
                    'production': [],
                    'quality': [],
                    'sales': [],
                },
                'components': {
                    'layout': ['Navbar.jsx'],
                    'forms': [],
                    'tables': [],
                },
                'stores': ['authStore.js'],
                'api': ['api.js'],
                'main.jsx': None,
                'App.jsx': None,
                'index.css': None,
            },
            'package.json': None,
            'vite.config.js': None,
        },
        'docs': ['architecture.md', 'api_spec.md', 'ml_plan.md'],
        'tests': {
            'backend': [],
            'frontend': [],
        },
        'ml': ['train_demand_lstm.py', 'train_inventory_rf.py'],
        'README.md': None,
        '.gitignore': None,
    }
    
    project_root = Path(__file__).parent
    
    def check_structure(base_path, structure, path_prefix=""):
        """Recursively check the structure."""
        all_good = True
        
        for name, contents in structure.items():
            item_path = base_path / name
            
            if contents is None:
                # This is a file
                if not item_path.exists():
                    print(f"❌ Missing file: {path_prefix}{name}")
                    all_good = False
                else:
                    print(f"✅ Found file: {path_prefix}{name}")
            else:
                # This is a directory
                if not item_path.exists():
                    print(f"❌ Missing directory: {path_prefix}{name}")
                    all_good = False
                else:
                    print(f"✅ Found directory: {path_prefix}{name}")
                    # Check contents if it's a dict
                    if isinstance(contents, dict):
                        if not check_structure(item_path, contents, f"{path_prefix}{name}/"):
                            all_good = False
                    elif isinstance(contents, list):
                        # Check for specific files in directory
                        for file_name in contents:
                            file_path = item_path / file_name
                            if not file_path.exists():
                                print(f"❌ Missing file: {path_prefix}{name}/{file_name}")
                                all_good = False
                            else:
                                print(f"✅ Found file: {path_prefix}{name}/{file_name}")
        
        return all_good
    
    print("Verifying project structure...")
    print("=" * 50)
    
    success = check_structure(project_root, expected_structure)
    
    print("=" * 50)
    if success:
        print("✅ All required files and directories are present!")
    else:
        print("❌ Some files or directories are missing!")
    
    return success

if __name__ == "__main__":
    verify_project_structure()