#!/usr/bin/env python3
"""
Backend Setup Script - Automated configuration and database initialization
Run: python setup.py
"""

import os
import sys
import json
import secrets
from pathlib import Path
from typing import Optional


class BackendSetup:
    """Backend setup automation"""

    def __init__(self):
        self.backend_path = Path(__file__).parent
        self.env_example = self.backend_path / ".env.example"
        self.env_file = self.backend_path / ".env"

    def generate_secret_key(self, length: int = 32) -> str:
        """Generate a secure secret key"""
        return secrets.token_urlsafe(length)

    def create_env_file(self, force: bool = False) -> bool:
        """Create .env file from example"""
        if self.env_file.exists() and not force:
            print(f"✓ .env file already exists: {self.env_file}")
            return False

        if not self.env_example.exists():
            print(f"✗ .env.example not found: {self.env_example}")
            return False

        # Read example file
        with open(self.env_example) as f:
            content = f.read()

        # Generate values
        secret_key = self.generate_secret_key()

        # Replace placeholders
        content = content.replace(
            "SECRET_KEY=your-secret-key-change-in-production-min-32-characters",
            f"SECRET_KEY={secret_key}"
        )

        # Write .env file
        with open(self.env_file, "w") as f:
            f.write(content)

        print(f"✓ Created .env file: {self.env_file}")
        return True

    def check_dependencies(self) -> bool:
        """Check if all Python dependencies are installed"""
        required = [
            "fastapi",
            "sqlalchemy",
            "pydantic",
            "asyncpg",
            "bcrypt",
            "jose",
        ]

        missing = []
        for package in required:
            try:
                __import__(package.replace("-", "_"))
            except ImportError:
                missing.append(package)

        if missing:
            print(f"✗ Missing packages: {', '.join(missing)}")
            print(f"\n  Install with: pip install {' '.join(missing)}")
            return False

        print("✓ All dependencies are installed")
        return True

    def check_postgresql(self) -> bool:
        """Check if PostgreSQL is installed"""
        try:
            import psycopg2
            print("✓ PostgreSQL driver (psycopg2) is installed")
            return True
        except ImportError:
            print("✗ PostgreSQL driver (psycopg2) not installed")
            print("  Install with: pip install psycopg2-binary")
            return False

    def check_database_url(self) -> bool:
        """Check if DATABASE_URL is configured"""
        if not self.env_file.exists():
            print("✗ .env file not found")
            return False

        with open(self.env_file) as f:
            for line in f:
                if line.startswith("DATABASE_URL="):
                    url = line.split("=", 1)[1].strip()
                    if url and "localhost" in url:
                        print(f"✓ DATABASE_URL configured: {url[:50]}...")
                        return True

        print("✗ DATABASE_URL not configured in .env")
        return False

    def display_next_steps(self) -> None:
        """Display next steps for user"""
        print("\n" + "="*60)
        print("NEXT STEPS")
        print("="*60)

        steps = [
            ("1. Update Database URL", "Edit .env file and set correct DATABASE_URL"),
            ("2. Ensure PostgreSQL Running", "Start PostgreSQL service or Docker container"),
            ("3. Install Dependencies", "pip install -r requirements.txt"),
            ("4. Start Backend Server", "python -m uvicorn app.main:app --reload"),
            ("5. Access API Documentation", "Open http://localhost:8000/docs in browser"),
            ("6. Register First User", "Use /api/v1/auth/register endpoint"),
            ("7. Login", "Use /api/v1/auth/login to get tokens"),
        ]

        for title, description in steps:
            print(f"\n{title}")
            print(f"  → {description}")

        print("\n" + "="*60)

    def display_config_summary(self) -> None:
        """Display configuration summary"""
        if not self.env_file.exists():
            return

        print("\nCONFIGURATION SUMMARY")
        print("="*60)

        with open(self.env_file) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#"):
                    if "=" in line:
                        key, value = line.split("=", 1)
                        # Mask sensitive values
                        if key in ["SECRET_KEY", "PASSWORD"]:
                            value = value[:10] + "..." if len(value) > 10 else "***"
                        print(f"{key}: {value}")

        print("="*60)

    def run(self) -> bool:
        """Run setup"""
        print("\n" + "="*60)
        print("TEXTILE ERP BACKEND SETUP")
        print("="*60 + "\n")

        # Step 1: Check dependencies
        print("1. Checking Python dependencies...")
        if not self.check_dependencies():
            print("\n✗ Setup failed: Missing dependencies")
            return False

        # Step 2: Check PostgreSQL
        print("\n2. Checking PostgreSQL...")
        self.check_postgresql()

        # Step 3: Create .env file
        print("\n3. Setting up configuration...")
        self.create_env_file()

        # Step 4: Check database URL
        print("\n4. Validating database configuration...")
        self.check_database_url()

        # Display configuration summary
        self.display_config_summary()

        # Display next steps
        self.display_next_steps()

        return True


def main():
    """Main entry point"""
    try:
        setup = BackendSetup()
        success = setup.run()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n✗ Setup error: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()
