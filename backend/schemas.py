from pydantic import BaseModel, EmailStr, Field
from datetime import date
from typing import Optional, List
from enum import Enum

class AttendanceStatusEnum(str, Enum):
    PRESENT = "Present"
    ABSENT = "Absent"

# Employee Schemas
class EmployeeBase(BaseModel):
    employee_id: str = Field(..., min_length=1, max_length=50, description="Unique employee ID")
    full_name: str = Field(..., min_length=1, max_length=100, description="Full name of employee")
    email: EmailStr = Field(..., description="Email address")
    department: str = Field(..., min_length=1, max_length=100, description="Department name")

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeResponse(EmployeeBase):
    id: int
    
    class Config:
        from_attributes = True

class EmployeeWithAttendance(EmployeeResponse):
    total_present: int = 0
    total_absent: int = 0

# Attendance Schemas
class AttendanceBase(BaseModel):
    date: date
    status: AttendanceStatusEnum

class AttendanceCreate(AttendanceBase):
    employee_id: str  # Using the employee_id string, not db id

class AttendanceUpdate(BaseModel):
    status: AttendanceStatusEnum

class AttendanceResponse(AttendanceBase):
    id: int
    employee_db_id: int
    
    class Config:
        from_attributes = True

class AttendanceWithEmployee(AttendanceResponse):
    employee: EmployeeResponse

# Dashboard Schema
class DashboardStats(BaseModel):
    total_employees: int
    total_present_today: int
    total_absent_today: int
    attendance_rate: float
