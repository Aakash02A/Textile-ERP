import uuid
from django.utils import timezone


def generate_uuid():
    """Generate a UUID4 string."""
    return str(uuid.uuid4())


def get_current_timestamp():
    """Get current timestamp."""
    return timezone.now()


def calculate_percentage(part, whole):
    """Calculate percentage."""
    if whole == 0:
        return 0
    return (part / whole) * 100