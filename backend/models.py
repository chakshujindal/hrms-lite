from sqlalchemy import Column, Integer, String, Date, Enum, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from database import Base
import enum

class AttendanceStatus(str, enum.Enum):
    PRESENT = "Present"
    ABSENT = "Absent"

class Employee(Base):
    __tablename__ = "employees"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String(50), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    department = Column(String(100), nullable=False)
    
    # Relationship with attendance
    attendance_records = relationship("Attendance", back_populates="employee", cascade="all, delete-orphan")

class Attendance(Base):
    __tablename__ = "attendance"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_db_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    status = Column(String(20), nullable=False)
    
    # Unique constraint: one attendance record per employee per day
    __table_args__ = (
        UniqueConstraint('employee_db_id', 'date', name='unique_employee_date'),
    )
    
    employee = relationship("Employee", back_populates="attendance_records")
