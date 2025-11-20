from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """
    Custom permission to only allow admins to access the view.
    """
    def has_permission(self, request, view):
        return request.user and request.user.role == 'admin'


class IsPlanner(permissions.BasePermission):
    """
    Custom permission to only allow planners to access the view.
    """
    def has_permission(self, request, view):
        return request.user and request.user.role == 'planner'


class IsQC(permissions.BasePermission):
    """
    Custom permission to only allow QC staff to access the view.
    """
    def has_permission(self, request, view):
        return request.user and request.user.role == 'qc'


class IsProcurement(permissions.BasePermission):
    """
    Custom permission to only allow procurement staff to access the view.
    """
    def has_permission(self, request, view):
        return request.user and request.user.role == 'procurement'


class IsWarehouse(permissions.BasePermission):
    """
    Custom permission to only allow warehouse staff to access the view.
    """
    def has_permission(self, request, view):
        return request.user and request.user.role == 'warehouse'


class IsSales(permissions.BasePermission):
    """
    Custom permission to only allow sales staff to access the view.
    """
    def has_permission(self, request, view):
        return request.user and request.user.role == 'sales'