"""
Sales Order service with business logic
"""

from typing import List, Optional

from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core import NotFoundException, ValidationException
from app.models.sales_order import SalesOrder, SOLineItem, SOStatus
from app.schemas import CreateSalesOrderRequest, UpdateSalesOrderRequest
from app.utils import ValidationUtil


class SalesOrderService:
    """Service class for sales order operations"""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_sales_order(
        self,
        request: CreateSalesOrderRequest,
        user_id: int = None,
    ) -> SalesOrder:
        """Create a new sales order"""
        # Validate dates
        if not ValidationUtil.validate_date_range(request.order_date, request.due_date):
            raise ValidationException("Order date must be before due date")

        # Validate tax rate
        if not ValidationUtil.validate_percentage(request.tax_rate):
            raise ValidationException("Tax rate must be between 0 and 100")

        # Calculate amounts
        subtotal = sum(
            item.quantity * item.unit_price for item in request.line_items
        )
        tax_amount = subtotal * (request.tax_rate / 100)
        total_amount = subtotal + tax_amount

        # Generate SO number
        so_number = await self._generate_so_number()

        # Create sales order
        so = SalesOrder(
            so_number=so_number,
            customer_id=request.customer_id,
            customer_name=request.customer_name,
            order_date=request.order_date,
            due_date=request.due_date,
            subtotal=subtotal,
            tax_amount=tax_amount,
            tax_rate=request.tax_rate,
            total_amount=total_amount,
            notes=request.notes,
            created_by=user_id,
            status=SOStatus.DRAFT,
        )

        # Add line items
        for item in request.line_items:
            line_item = SOLineItem(
                product_code=item.product_code,
                product_name=item.product_name,
                quantity=item.quantity,
                unit_price=item.unit_price,
                amount=item.quantity * item.unit_price,
            )
            so.line_items.append(line_item)

        self.session.add(so)
        await self.session.commit()
        await self.session.refresh(so)

        return so

    async def get_sales_order(self, so_id: int) -> SalesOrder:
        """Get sales order by ID"""
        result = await self.session.execute(
            select(SalesOrder)
            .where(SalesOrder.id == so_id)
            .options(selectinload(SalesOrder.line_items))
        )
        so = result.scalar_one_or_none()

        if not so:
            raise NotFoundException("Sales order not found")

        return so

    async def get_all_sales_orders(
        self,
        skip: int = 0,
        limit: int = 10,
        status: Optional[str] = None,
    ) -> tuple[List[SalesOrder], int]:
        """Get all sales orders with optional filtering"""
        query = select(SalesOrder).options(selectinload(SalesOrder.line_items))

        if status:
            query = query.where(SalesOrder.status == status)

        # Get total count
        count_result = await self.session.execute(select(SalesOrder))
        total = len(count_result.all())

        # Get paginated results
        result = await self.session.execute(
            query.order_by(desc(SalesOrder.created_at))
            .offset(skip)
            .limit(limit)
        )
        sos = result.scalars().all()

        return sos, total

    async def update_sales_order(
        self,
        so_id: int,
        request: UpdateSalesOrderRequest,
    ) -> SalesOrder:
        """Update sales order"""
        so = await self.get_sales_order(so_id)

        if request.due_date and request.due_date < so.order_date:
            raise ValidationException("Due date must be after order date")

        if request.customer_name:
            so.customer_name = request.customer_name
        if request.due_date:
            so.due_date = request.due_date
        if request.tax_rate is not None:
            so.tax_rate = request.tax_rate
            so.tax_amount = so.subtotal * (request.tax_rate / 100)
            so.total_amount = so.subtotal + so.tax_amount
        if request.notes is not None:
            so.notes = request.notes
        if request.status:
            so.status = request.status

        await self.session.commit()
        await self.session.refresh(so)

        return so

    async def delete_sales_order(self, so_id: int) -> None:
        """Delete sales order"""
        so = await self.get_sales_order(so_id)
        await self.session.delete(so)
        await self.session.commit()

    async def _generate_so_number(self) -> str:
        """Generate unique SO number"""
        result = await self.session.execute(
            select(SalesOrder).order_by(desc(SalesOrder.id)).limit(1)
        )
        last_so = result.scalar_one_or_none()

        if last_so:
            last_number = int(last_so.so_number.split("-")[1])
            new_number = last_number + 1
        else:
            new_number = 1

        return f"SO-{str(new_number).zfill(6)}"
