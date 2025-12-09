"""
Work Order service with business logic
"""

from typing import List, Optional

from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import NotFoundException, ValidationException
from app.models.work_order import WorkOrder, WOStatus
from app.schemas import CreateWorkOrderRequest, UpdateWorkOrderRequest
from app.utils import ValidationUtil


class WorkOrderService:
    """Service class for work order operations"""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_work_order(
        self,
        request: CreateWorkOrderRequest,
        user_id: int = None,
    ) -> WorkOrder:
        """Create a new work order"""
        # Validate quantity
        if not ValidationUtil.validate_positive_amount(request.quantity):
            raise ValidationException("Quantity must be positive")

        # Generate WO number
        wo_number = await self._generate_wo_number()

        # Create work order
        wo = WorkOrder(
            wo_number=wo_number,
            product_name=request.product_name,
            quantity=request.quantity,
            due_date=request.due_date,
            priority=request.priority,
            notes=request.notes,
            created_by=user_id,
            status=WOStatus.DRAFT,
            progress_percentage=0,
        )

        self.session.add(wo)
        await self.session.commit()
        await self.session.refresh(wo)

        return wo

    async def get_work_order(self, wo_id: int) -> WorkOrder:
        """Get work order by ID"""
        wo = await self.session.get(WorkOrder, wo_id)

        if not wo:
            raise NotFoundException("Work order not found")

        return wo

    async def get_all_work_orders(
        self,
        skip: int = 0,
        limit: int = 10,
        status: Optional[str] = None,
    ) -> tuple[List[WorkOrder], int]:
        """Get all work orders with optional filtering"""
        query = select(WorkOrder)

        if status:
            query = query.where(WorkOrder.status == status)

        # Get total count
        count_result = await self.session.execute(select(WorkOrder))
        total = len(count_result.all())

        # Get paginated results
        result = await self.session.execute(
            query.order_by(desc(WorkOrder.created_at))
            .offset(skip)
            .limit(limit)
        )
        wos = result.scalars().all()

        return wos, total

    async def update_work_order(
        self,
        wo_id: int,
        request: UpdateWorkOrderRequest,
    ) -> WorkOrder:
        """Update work order"""
        wo = await self.get_work_order(wo_id)

        if request.status:
            wo.status = request.status
        if request.progress_percentage is not None:
            if not ValidationUtil.validate_percentage(request.progress_percentage):
                raise ValidationException("Progress must be between 0 and 100")
            wo.progress_percentage = request.progress_percentage
        if request.estimated_completion_date:
            wo.estimated_completion_date = request.estimated_completion_date
        if request.notes is not None:
            wo.notes = request.notes

        await self.session.commit()
        await self.session.refresh(wo)

        return wo

    async def delete_work_order(self, wo_id: int) -> None:
        """Delete work order"""
        wo = await self.get_work_order(wo_id)
        await self.session.delete(wo)
        await self.session.commit()

    async def _generate_wo_number(self) -> str:
        """Generate unique WO number"""
        result = await self.session.execute(
            select(WorkOrder).order_by(desc(WorkOrder.id)).limit(1)
        )
        last_wo = result.scalar_one_or_none()

        if last_wo:
            last_number = int(last_wo.wo_number.split("-")[1])
            new_number = last_number + 1
        else:
            new_number = 1

        return f"WO-{str(new_number).zfill(6)}"
