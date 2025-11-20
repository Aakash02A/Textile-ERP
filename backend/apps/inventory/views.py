from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from .models import RawMaterial, StockLot
from .serializers import RawMaterialSerializer, StockLotSerializer, StockLotReceiveSerializer, StockTransferSerializer


class RawMaterialViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Raw Materials.
    """
    queryset = RawMaterial.objects.all()
    serializer_class = RawMaterialSerializer


class StockLotViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Stock Lots.
    """
    queryset = StockLot.objects.all()
    serializer_class = StockLotSerializer
    
    @action(detail=False, methods=['post'])
    def receive(self, request):
        """
        Receive stock lot into inventory.
        """
        serializer = StockLotReceiveSerializer(data=request.data)
        
        if serializer.is_valid():
            stock_lot = serializer.save()
            response_serializer = StockLotSerializer(stock_lot)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def transfer(self, request):
        """
        Transfer stock between locations.
        """
        serializer = StockTransferSerializer(data=request.data)
        
        if serializer.is_valid():
            data = serializer.validated_data
            rawmaterial_id = data['rawmaterial_id']
            batch_no = data['batch_no']
            from_location = data['from_location']
            to_location = data['to_location']
            quantity = data['quantity']
            
            try:
                with transaction.atomic():
                    # Find the source stock lot
                    source_lot = StockLot.objects.get(
                        rawmaterial_id=rawmaterial_id,
                        batch_no=batch_no,
                        location=from_location
                    )
                    
                    # Check if sufficient quantity is available
                    if source_lot.quantity_on_hand < quantity:
                        return Response(
                            {'error': 'Insufficient quantity in source location'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    
                    # Reduce quantity in source location
                    source_lot.quantity_on_hand -= quantity
                    source_lot.save()
                    
                    # Check if destination lot already exists
                    dest_lot, created = StockLot.objects.get_or_create(
                        rawmaterial_id=rawmaterial_id,
                        batch_no=batch_no,
                        location=to_location,
                        defaults={
                            'received_date': source_lot.received_date,
                            'expiry_date': source_lot.expiry_date,
                            'unit_cost': source_lot.unit_cost,
                            'quantity_on_hand': 0
                        }
                    )
                    
                    # Increase quantity in destination location
                    dest_lot.quantity_on_hand += quantity
                    dest_lot.save()
                    
                    return Response({
                        'message': f'Successfully transferred {quantity} units from {from_location} to {to_location}'
                    }, status=status.HTTP_200_OK)
                    
            except StockLot.DoesNotExist:
                return Response(
                    {'error': 'Source stock lot not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            except Exception as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)