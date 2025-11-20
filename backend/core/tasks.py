from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings


@shared_task
def send_notification_email(subject, message, recipient_list):
    """Send notification email asynchronously."""
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipient_list,
            fail_silently=False,
        )
        return f"Email sent successfully to {', '.join(recipient_list)}"
    except Exception as e:
        return f"Failed to send email: {str(e)}"


@shared_task
def perform_ml_training(model_name, training_params):
    """Perform ML model training asynchronously."""
    # This is a placeholder for actual ML training logic
    # In a real implementation, this would call the appropriate training functions
    return f"Training started for model: {model_name} with params: {training_params}"


@shared_task
def perform_ml_inference(model_name, input_data):
    """Perform ML inference asynchronously."""
    # This is a placeholder for actual ML inference logic
    # In a real implementation, this would call the appropriate inference functions
    return f"Inference performed for model: {model_name} with input: {input_data}"