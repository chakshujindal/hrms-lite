from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import date

from database import engine, get_db, Base
from models import Employee, Attendance
from schemas import (
    EmployeeCreate, EmployeeResponse, EmployeeWithAttendance,
    AttendanceCreate, AttendanceResponse, AttendanceUpdate,
    DashboardStats
)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="HRMS Lite API",
    description="A lightweight Human Resource Management System",
    version="1.0.0"
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== EMPLOYEE ENDPOINTS ====================

@app.get("/api/employees/next-id")
def get_next_employee_id(db: Session = Depends(get_db)):
    """Get the next available employee ID in format EMP-XXXX"""
    # Find the highest employee ID number
    employees = db.query(Employee).all()
    max_num = 0
    
    for emp in employees:
        # Extract number from EMP-XXXX format
        if emp.employee_id and emp.employee_id.startswith("EMP-"):
            try:
                num = int(emp.employee_id[4:])
                if num > max_num:
                    max_num = num
            except ValueError:
                continue
    
    # Return next ID
    next_num = max_num + 1
    next_id = f"EMP-{next_num:04d}"
    return {"next_id": next_id}

@app.post("/api/employees", response_model=EmployeeResponse, status_code=201)
def create_employee(employee: EmployeeCreate, db: Session = Depends(get_db)):
    """Create a new employee"""
    # Check for duplicate employee_id
    existing_emp = db.query(Employee).filter(Employee.employee_id == employee.employee_id).first()
    if existing_emp:
        raise HTTPException(status_code=400, detail=f"Employee ID '{employee.employee_id}' already exists")
    
    # Check for duplicate email
    existing_email = db.query(Employee).filter(Employee.email == employee.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail=f"Email '{employee.email}' already exists")
    
    db_employee = Employee(**employee.model_dump())
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee

@app.get("/api/employees", response_model=List[EmployeeWithAttendance])
def get_employees(db: Session = Depends(get_db)):
    """Get all employees with attendance summary"""
    employees = db.query(Employee).all()
    result = []
    
    for emp in employees:
        present_count = db.query(Attendance).filter(
            Attendance.employee_db_id == emp.id,
            Attendance.status == "Present"
        ).count()
        
        absent_count = db.query(Attendance).filter(
            Attendance.employee_db_id == emp.id,
            Attendance.status == "Absent"
        ).count()
        
        emp_dict = {
            "id": emp.id,
            "employee_id": emp.employee_id,
            "full_name": emp.full_name,
            "email": emp.email,
            "department": emp.department,
            "total_present": present_count,
            "total_absent": absent_count
        }
        result.append(emp_dict)
    
    return result

@app.get("/api/employees/{employee_id}", response_model=EmployeeWithAttendance)
def get_employee(employee_id: str, db: Session = Depends(get_db)):
    """Get a specific employee by employee_id"""
    employee = db.query(Employee).filter(Employee.employee_id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail=f"Employee with ID '{employee_id}' not found")
    
    present_count = db.query(Attendance).filter(
        Attendance.employee_db_id == employee.id,
        Attendance.status == "Present"
    ).count()
    
    absent_count = db.query(Attendance).filter(
        Attendance.employee_db_id == employee.id,
        Attendance.status == "Absent"
    ).count()
    
    return {
        "id": employee.id,
        "employee_id": employee.employee_id,
        "full_name": employee.full_name,
        "email": employee.email,
        "department": employee.department,
        "total_present": present_count,
        "total_absent": absent_count
    }

@app.delete("/api/employees/{employee_id}", status_code=204)
def delete_employee(employee_id: str, db: Session = Depends(get_db)):
    """Delete an employee"""
    employee = db.query(Employee).filter(Employee.employee_id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail=f"Employee with ID '{employee_id}' not found")
    
    db.delete(employee)
    db.commit()
    return None

# ==================== ATTENDANCE ENDPOINTS ====================

@app.post("/api/attendance", response_model=AttendanceResponse, status_code=201)
def mark_attendance(attendance: AttendanceCreate, db: Session = Depends(get_db)):
    """Mark attendance for an employee"""
    # Find employee
    employee = db.query(Employee).filter(Employee.employee_id == attendance.employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail=f"Employee with ID '{attendance.employee_id}' not found")
    
    # Check if attendance already marked for this date
    existing = db.query(Attendance).filter(
        Attendance.employee_db_id == employee.id,
        Attendance.date == attendance.date
    ).first()
    
    if existing:
        # Update existing attendance
        existing.status = attendance.status.value
        db.commit()
        db.refresh(existing)
        return existing
    
    # Create new attendance record
    db_attendance = Attendance(
        employee_db_id=employee.id,
        date=attendance.date,
        status=attendance.status.value
    )
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance

@app.get("/api/attendance", response_model=List[AttendanceResponse])
def get_all_attendance(
    employee_id: Optional[str] = Query(None, description="Filter by employee ID"),
    start_date: Optional[date] = Query(None, description="Filter from date"),
    end_date: Optional[date] = Query(None, description="Filter to date"),
    db: Session = Depends(get_db)
):
    """Get attendance records with optional filters"""
    query = db.query(Attendance)
    
    if employee_id:
        employee = db.query(Employee).filter(Employee.employee_id == employee_id).first()
        if not employee:
            raise HTTPException(status_code=404, detail=f"Employee with ID '{employee_id}' not found")
        query = query.filter(Attendance.employee_db_id == employee.id)
    
    if start_date:
        query = query.filter(Attendance.date >= start_date)
    
    if end_date:
        query = query.filter(Attendance.date <= end_date)
    
    return query.order_by(Attendance.date.desc()).all()

@app.get("/api/employees/{employee_id}/attendance", response_model=List[AttendanceResponse])
def get_employee_attendance(
    employee_id: str,
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db)
):
    """Get attendance records for a specific employee"""
    employee = db.query(Employee).filter(Employee.employee_id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail=f"Employee with ID '{employee_id}' not found")
    
    query = db.query(Attendance).filter(Attendance.employee_db_id == employee.id)
    
    if start_date:
        query = query.filter(Attendance.date >= start_date)
    
    if end_date:
        query = query.filter(Attendance.date <= end_date)
    
    return query.order_by(Attendance.date.desc()).all()

# ==================== DASHBOARD ENDPOINT ====================

@app.get("/api/dashboard", response_model=DashboardStats)
def get_dashboard(db: Session = Depends(get_db)):
    """Get dashboard statistics"""
    today = date.today()
    
    total_employees = db.query(Employee).count()
    
    present_today = db.query(Attendance).filter(
        Attendance.date == today,
        Attendance.status == "Present"
    ).count()
    
    absent_today = db.query(Attendance).filter(
        Attendance.date == today,
        Attendance.status == "Absent"
    ).count()
    
    attendance_rate = 0.0
    if total_employees > 0:
        attendance_rate = (present_today / total_employees) * 100
    
    return DashboardStats(
        total_employees=total_employees,
        total_present_today=present_today,
        total_absent_today=absent_today,
        attendance_rate=round(attendance_rate, 2)
    )

@app.get("/api/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "HRMS Lite API is running"}

@app.get("/")
def root():
    """Root endpoint"""
    return {"message": "Welcome to HRMS Lite API", "docs": "/docs"}
