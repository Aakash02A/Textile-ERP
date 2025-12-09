"""
Sales Order model
"""

from enum import Enum

from sqlalchemy import Column, String, Integer, Float, Date, Enum as SQLEnum, ForeignKey, Index, Text
from sqlalchemy.orm import relationship

from app.db.base import Base, BaseModel


class SOStatus(str, Enum):
    """Sales Order statuses"""

    DRAFT = "draft"
    PENDING = "pending"
    CONFIRMED = "confirmed"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class SalesOrder(Base, BaseModel):
    """Sales Order model"""

    __tablename__ = "sales_orders"

    so_number = Column(String(100), unique=True, nullable=False, index=True)
    customer_id = Column(Integer, nullable=False, index=True)
    customer_name = Column(String(255), nullable=False)
    order_date = Column(Date, nullable=False)
    due_date = Column(Date, nullable=False)
    status = Column(SQLEnum(SOStatus), default=SOStatus.DRAFT, nullable=False)
    
    # Amounts
    subtotal = Column(Float, default=0, nullable=False)
    tax_amount = Column(Float, default=0, nullable=False)
    tax_rate = Column(Float, default=0, nullable=False)
    total_amount = Column(Float, default=0, nullable=False)
    
    # Metadata
    notes = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    created_by_user = relationship("User", foreign_keys=[created_by])
    line_items = relationship("SOLineItem", back_populates="sales_order", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_so_number", "so_number"),
        Index("idx_so_status", "status"),
        Index("idx_so_customer_id", "customer_id"),
        Index("idx_so_created_by", "created_by"),
    )

    def __repr__(self) -> str:
        return f"<SalesOrder(id={self.id}, so_number={self.so_number}, status={self.status})>"


class SOLineItem(Base, BaseModel):
    """Sales Order Line Item"""

    __tablename__ = "so_line_items"

    sales_order_id = Column(Integer, ForeignKey("sales_orders.id", ondelete="CASCADE"), nullable=False)
    product_code = Column(String(100), nullable=False)
    product_name = Column(String(255), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    amount = Column(Float, nullable=False)

    # Relationships
    sales_order = relationship("SalesOrder", back_populates="line_items")

    __table_args__ = (
        Index("idx_so_line_item_so_id", "sales_order_id"),
    )

    def __repr__(self) -> str:
        return f"<SOLineItem(id={self.id}, product={self.product_name}, quantity={self.quantity})>"
