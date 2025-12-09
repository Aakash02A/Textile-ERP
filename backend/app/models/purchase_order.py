"""
Purchase Order model
"""

from enum import Enum

from sqlalchemy import Column, String, Integer, Float, Date, Enum as SQLEnum, ForeignKey, Index, Text
from sqlalchemy.orm import relationship

from app.db.base import Base, BaseModel


class POStatus(str, Enum):
    """Purchase Order statuses"""

    DRAFT = "draft"
    PENDING = "pending"
    APPROVED = "approved"
    RECEIVED = "received"
    CANCELLED = "cancelled"


class PurchaseOrder(Base, BaseModel):
    """Purchase Order model"""

    __tablename__ = "purchase_orders"

    po_number = Column(String(100), unique=True, nullable=False, index=True)
    supplier_id = Column(Integer, nullable=False, index=True)
    supplier_name = Column(String(255), nullable=False)
    po_date = Column(Date, nullable=False)
    due_date = Column(Date, nullable=False)
    status = Column(SQLEnum(POStatus), default=POStatus.DRAFT, nullable=False)
    
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
    line_items = relationship("POLineItem", back_populates="purchase_order", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_po_number", "po_number"),
        Index("idx_po_status", "status"),
        Index("idx_po_supplier_id", "supplier_id"),
        Index("idx_po_created_by", "created_by"),
    )

    def __repr__(self) -> str:
        return f"<PurchaseOrder(id={self.id}, po_number={self.po_number}, status={self.status})>"


class POLineItem(Base, BaseModel):
    """Purchase Order Line Item"""

    __tablename__ = "po_line_items"

    purchase_order_id = Column(Integer, ForeignKey("purchase_orders.id", ondelete="CASCADE"), nullable=False)
    material_code = Column(String(100), nullable=False)
    material_name = Column(String(255), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    amount = Column(Float, nullable=False)

    # Relationships
    purchase_order = relationship("PurchaseOrder", back_populates="line_items")

    __table_args__ = (
        Index("idx_po_line_item_po_id", "purchase_order_id"),
    )

    def __repr__(self) -> str:
        return f"<POLineItem(id={self.id}, material={self.material_name}, quantity={self.quantity})>"
