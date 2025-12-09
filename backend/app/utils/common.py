"""
Utility functions and classes
"""

from typing import Generic, List, Optional, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class PaginationUtil:
    """Pagination utility class"""

    @staticmethod
    def paginate(
        items: List[T],
        page: int = 1,
        limit: int = 10,
    ) -> dict:
        """Paginate a list of items"""
        total = len(items)
        pages = (total + limit - 1) // limit
        skip = (page - 1) * limit
        end = skip + limit

        return {
            "total": total,
            "page": page,
            "limit": limit,
            "pages": pages,
            "data": items[skip:end],
        }


class ResponseUtil:
    """Response utility class"""

    @staticmethod
    def success(data=None, message: str = "Success") -> dict:
        """Format a success response"""
        return {
            "success": True,
            "message": message,
            "data": data,
        }

    @staticmethod
    def error(message: str, error_code: str = "ERROR", status_code: int = 400) -> dict:
        """Format an error response"""
        return {
            "success": False,
            "message": message,
            "error_code": error_code,
            "status_code": status_code,
        }


class ValidationUtil:
    """Validation utility class"""

    @staticmethod
    def validate_date_range(start_date, end_date) -> bool:
        """Validate date range"""
        return start_date <= end_date

    @staticmethod
    def validate_positive_amount(amount: float) -> bool:
        """Validate positive amount"""
        return amount > 0

    @staticmethod
    def validate_percentage(value: float) -> bool:
        """Validate percentage value (0-100)"""
        return 0 <= value <= 100
