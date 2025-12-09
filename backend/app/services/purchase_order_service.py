"""
Purchase Order service with business logic
"""

from datetime import datetime
from typing import List, Optional

from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core import NotFoundException, ValidationException
from app.models.purchase_order import PurchaseOrder, POLineItem, POStatus
from app.schemas import CreatePurchaseOrderRequest, UpdatePurchaseOrderRequest
from app.utils import ValidationUtil


class PurchaseOrderService:
    """Service class for purchase order operations"""

    def __init__(self, session: AsyncSession):
        self.session = session
        self.po_counter = 0  # For generating PO numbers

    async def create_purchase_order(
        self,
        request: CreatePurchaseOrderRequest,
        user_id: int = None,
    ) -> PurchaseOrder:
        """Create a new purchase order"""
        # Validate dates
        if not ValidationUtil.validate_date_range(request.po_date, request.due_date):
            raise ValidationException("PO date must be before due date")

        # Validate tax rate
        if not ValidationUtil.validate_percentage(request.tax_rate):
            raise ValidationException("Tax rate must be between 0 and 100")

        # Calculate amounts
        subtotal = sum(
            item.quantity * item.unit_price for item in request.line_items
        )
        tax_amount = subtotal * (request.tax_rate / 100)
        total_amount = subtotal + tax_amount

        # Generate PO number
        po_number = await self._generate_po_number()

        # Create purchase order
        po = PurchaseOrder(
            po_number=po_number,
            supplier_id=request.supplier_id,
            supplier_name=request.supplier_name,
            po_date=request.po_date,
            due_date=request.due_date,
            subtotal=subtotal,
            tax_amount=tax_amount,
            tax_rate=request.tax_rate,
            total_amount=total_amount,
            notes=request.notes,
            created_by=user_id,
            status=POStatus.DRAFT,
        )

        # Add line items
        for item in request.line_items:
            line_item = POLineItem(
                material_code=item.material_code,
                material_name=item.material_name,
                quantity=item.quantity,
                unit_price=item.unit_price,
                amount=item.quantity * item.unit_price,
            )
            po.line_items.append(line_item)

        self.session.add(po)
        await self.session.commit()
        await self.session.refresh(po)

        return po

    async def get_purchase_order(self, po_id: int) -> PurchaseOrder:
        """Get purchase order by ID"""
        result = await self.session.execute(
            select(PurchaseOrder)
            .where(PurchaseOrder.id == po_id)
            .options(selectinload(PurchaseOrder.line_items))
        )
        po = result.scalar_one_or_none()

        if not po:
            raise NotFoundException("Purchase order not found")

        return po

    async def get_all_purchase_orders(
        self,
        skip: int = 0,
        limit: int = 10,
        status: Optional[str] = None,
    ) -> tuple[List[PurchaseOrder], int]:
        """Get all purchase orders with optional filtering"""
        query = select(PurchaseOrder).options(selectinload(PurchaseOrder.line_items))

        if status:
            query = query.where(PurchaseOrder.status == status)

        # Get total count
        count_result = await self.session.execute(select(PurchaseOrder))
        total = len(count_result.all())

        # Get paginated results
        result = await self.session.execute(
            query.order_by(desc(PurchaseOrder.created_at))
            .offset(skip)
            .limit(limit)
        )
        pos = result.scalars().all()

        return pos, total

    async def update_purchase_order(
        self,
        po_id: int,
        request: UpdatePurchaseOrderRequest,
    ) -> PurchaseOrder:
        """Update purchase order"""
        po = await self.get_purchase_order(po_id)

        # Validate dates if provided
        if request.due_date and request.due_date < po.po_date:
            raise ValidationException("Due date must be after PO date")

        # Update fields
        if request.supplier_name:
            po.supplier_name = request.supplier_name
        if request.due_date:
            po.due_date = request.due_date
        if request.tax_rate is not None:
            po.tax_rate = request.tax_rate
            # Recalculate amounts
            po.tax_amount = po.subtotal * (request.tax_rate / 100)
            po.total_amount = po.subtotal + po.tax_amount
        if request.notes is not None:
            po.notes = request.notes
        if request.status:
            po.status = request.status

        await self.session.commit()
        await self.session.refresh(po)

        return po

    async def delete_purchase_order(self, po_id: int) -> None:
        """Delete purchase order"""
        po = await self.get_purchase_order(po_id)
        await self.session.delete(po)
        await self.session.commit()

    async def _generate_po_number(self) -> str:
        """Generate unique PO number"""
        result = await self.session.execute(
            select(PurchaseOrder).order_by(desc(PurchaseOrder.id)).limit(1)
        )
        last_po = result.scalar_one_or_none()

        if last_po:
            # Extract number from PO-XXXX format
            last_number = int(last_po.po_number.split("-")[1])
            new_number = last_number + 1
        else:
            new_number = 1

        return f"PO-{str(new_number).zfill(6)}"
