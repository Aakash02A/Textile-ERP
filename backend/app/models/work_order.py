"""
Work Order model
"""

from enum import Enum

from sqlalchemy import Column, String, Integer, Float, Date, Enum as SQLEnum, ForeignKey, Index, Text
from sqlalchemy.orm import relationship

from app.db.base import Base, BaseModel


class WOStatus(str, Enum):
    """Work Order statuses"""

    DRAFT = "draft"
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class WorkOrder(Base, BaseModel):
    """Work Order model"""

    __tablename__ = "work_orders"

    wo_number = Column(String(100), unique=True, nullable=False, index=True)
    product_name = Column(String(255), nullable=False)
    quantity = Column(Integer, nullable=False)
    due_date = Column(Date, nullable=False)
    priority = Column(String(50), default="normal", nullable=False)
    status = Column(SQLEnum(WOStatus), default=WOStatus.DRAFT, nullable=False)
    
    # Progress tracking
    progress_percentage = Column(Float, default=0, nullable=False)
    estimated_completion_date = Column(Date, nullable=True)
    
    # Metadata
    notes = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    created_by_user = relationship("User", foreign_keys=[created_by])

    __table_args__ = (
        Index("idx_wo_number", "wo_number"),
        Index("idx_wo_status", "status"),
        Index("idx_wo_created_by", "created_by"),
    )

    def __repr__(self) -> str:
        return f"<WorkOrder(id={self.id}, wo_number={self.wo_number}, status={self.status})>"
