from datetime import date, datetime
from typing import List
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import engine, Base, get_db
from app.models import DBConnectionVerify, Employee, Attendance, Task, LeaveRequest
from app.schemas import UserCreate, UserLogin, UserResponse, Token, TaskCreate, TaskUpdate, TaskResponse, EmployeeUpdate, PasswordReset, LeaveCreate, LeaveResponse
from app.auth import (
    verify_password, 
    get_password_hash, 
    create_access_token, 
    get_current_user,
    require_admin
)

app = FastAPI(
    title="Employee Work Tracker API",
    description="API with JWT Authentication for tracking employee work",
    version="1.0.0"
)

# Enable CORS for frontend local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    # Seed the default admin user if not exists
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        admin_email = "raj.2327it1104@kiet.edu"
        admin = db.query(Employee).filter(Employee.email == admin_email).first()
        if not admin:
            hashed_password = get_password_hash("git190904")
            new_admin = Employee(
                name="John",
                email=admin_email,
                password=hashed_password,
                role="Admin",
                department="Management",
                designation="Administrator"
            )
            db.add(new_admin)
            db.commit()
            print("Admin user John seeded successfully.")
    except Exception as e:
        print(f"Error during admin seed: {e}")
    finally:
        db.close()

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "FastAPI App",
        "message": "Backend is running and accessible."
    }

@app.post("/api/verify-db")
def verify_db_connection(db: Session = Depends(get_db)):
    try:
        # Write a verification record
        new_verify = DBConnectionVerify(status="connected")
        db.add(new_verify)
        db.commit()
        db.refresh(new_verify)
        
        # Count existing verification records
        count = db.query(DBConnectionVerify).count()
        
        return {
            "status": "connected",
            "database": "PostgreSQL",
            "write_success": True,
            "total_verifications": count,
            "latest_log_id": new_verify.id,
            "timestamp": new_verify.timestamp.isoformat()
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Database verification failed: {str(e)}"
        )

# --- Authentication API Endpoints ---

@app.post("/api/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if email is already taken
    existing_user = db.query(Employee).filter(Employee.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )
    
    # Check if email is a fake placeholder
    email_check = user_in.email.strip().lower()
    local_part = email_check.split('@')[0] if '@' in email_check else email_check
    blocked_locals = {"abc", "xyz", "test", "example", "placeholder", "fake", "temp"}
    if local_part in blocked_locals or email_check in ["abc@gmail.com", "xyz@gmail.com"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please use a valid email address. Placeholder emails (e.g., abc@gmail.com or xyz@gmail.com) are not allowed."
        )
    
    # Validate role type
    if user_in.role not in ["Admin", "Employee"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be either 'Admin' or 'Employee'."
        )

    # Hash the password
    hashed_password = get_password_hash(user_in.password)

    # Create new Employee
    new_employee = Employee(
        name=user_in.name,
        email=user_in.email,
        password=hashed_password,
        role=user_in.role,
        department=user_in.department,
        designation=user_in.designation
    )

    try:
        db.add(new_employee)
        db.commit()
        db.refresh(new_employee)
        return new_employee
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@app.post("/api/auth/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    # Retrieve user
    user = db.query(Employee).filter(Employee.email == login_in.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not verify_password(login_in.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Generate token
    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@app.post("/api/auth/logout")
def logout(current_user: Employee = Depends(get_current_user)):
    return {
        "status": "success",
        "message": f"Successfully logged out employee: {current_user.email}. Please clear your access token on the client."
    }

@app.get("/api/auth/profile", response_model=UserResponse)
def get_profile(current_user: Employee = Depends(get_current_user)):
    return current_user

# --- Attendance API Endpoints ---

@app.get("/api/attendance/today")
def get_today_attendance(current_user: Employee = Depends(get_current_user), db: Session = Depends(get_db)):
    today = date.today()
    attendance = db.query(Attendance).filter(
        Attendance.employee_id == current_user.id,
        Attendance.date == today
    ).first()
    
    if not attendance:
        return None
        
    return {
        "id": attendance.id,
        "employee_id": attendance.employee_id,
        "date": attendance.date.isoformat(),
        "login_time": attendance.login_time.isoformat(),
        "logout_time": attendance.logout_time.isoformat() if attendance.logout_time else None,
        "working_hours": attendance.working_hours
    }

@app.post("/api/attendance/clock-in")
def clock_in(current_user: Employee = Depends(get_current_user), db: Session = Depends(get_db)):
    today = date.today()
    # Check if already clocked in today
    existing = db.query(Attendance).filter(
        Attendance.employee_id == current_user.id,
        Attendance.date == today
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already clocked in for today."
        )
    
    new_attendance = Attendance(
        employee_id=current_user.id,
        date=today
    )
    
    try:
        db.add(new_attendance)
        db.commit()
        db.refresh(new_attendance)
        return {
            "id": new_attendance.id,
            "employee_id": new_attendance.employee_id,
            "date": new_attendance.date.isoformat(),
            "login_time": new_attendance.login_time.isoformat(),
            "logout_time": None,
            "working_hours": None
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Clock in failed: {str(e)}"
        )

@app.post("/api/attendance/clock-out")
def clock_out(current_user: Employee = Depends(get_current_user), db: Session = Depends(get_db)):
    from datetime import datetime
    today = date.today()
    # Find today's check-in
    attendance = db.query(Attendance).filter(
        Attendance.employee_id == current_user.id,
        Attendance.date == today
    ).first()
    
    if not attendance:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must clock in first before clocking out."
        )
    
    if attendance.logout_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already clocked out for today."
        )
    
    try:
        attendance.logout_time = datetime.utcnow()
        # Calculate working hours (difference in seconds, divided by 3600)
        duration = attendance.logout_time - attendance.login_time
        attendance.working_hours = round(duration.total_seconds() / 3600.0, 2)
        
        db.commit()
        db.refresh(attendance)
        
        return {
            "id": attendance.id,
            "employee_id": attendance.employee_id,
            "date": attendance.date.isoformat(),
            "login_time": attendance.login_time.isoformat(),
            "logout_time": attendance.logout_time.isoformat(),
            "working_hours": attendance.working_hours
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Clock out failed: {str(e)}"
        )

# --- Task Management API Endpoints ---

@app.get("/api/tasks", response_model=List[TaskResponse])
def get_tasks(current_user: Employee = Depends(get_current_user), db: Session = Depends(get_db)):
    tasks = db.query(Task).filter(Task.employee_id == current_user.id).order_by(Task.created_at.desc()).all()
    return tasks

@app.post("/api/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(task_in: TaskCreate, current_user: Employee = Depends(get_current_user), db: Session = Depends(get_db)):
    new_task = Task(
        employee_id=current_user.id,
        title=task_in.title,
        description=task_in.description,
        priority=task_in.priority,
        status=task_in.status,
        start_time=task_in.start_time,
        end_time=task_in.end_time
    )
    
    try:
        db.add(new_task)
        db.commit()
        db.refresh(new_task)
        return new_task
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create task: {str(e)}"
        )

@app.put("/api/tasks/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, task_in: TaskUpdate, current_user: Employee = Depends(get_current_user), db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id, Task.employee_id == current_user.id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or unauthorized access."
        )
        
    update_data = task_in.model_dump(exclude_unset=True)
    
    # Automatically set end_time if status changes to Completed and not set
    if "status" in update_data and update_data["status"] == "Completed":
        if not task.end_time and not update_data.get("end_time"):
            update_data["end_time"] = datetime.utcnow()
            
    for field, value in update_data.items():
        setattr(task, field, value)
        
    try:
        db.commit()
        db.refresh(task)
        return task
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update task: {str(e)}"
        )

@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: int, current_user: Employee = Depends(get_current_user), db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id, Task.employee_id == current_user.id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or unauthorized access."
        )
        
    try:
        db.delete(task)
        db.commit()
        return {
            "status": "success",
            "message": "Task deleted successfully."
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete task: {str(e)}"
        )

@app.patch("/api/tasks/{task_id}/complete", response_model=TaskResponse)
def complete_task(task_id: int, current_user: Employee = Depends(get_current_user), db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id, Task.employee_id == current_user.id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or unauthorized access."
        )
        
    try:
        task.status = "Completed"
        task.end_time = datetime.utcnow()
        db.commit()
        db.refresh(task)
        return task
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to complete task: {str(e)}"
        )

# --- Attendance History API Endpoint ---

@app.get("/api/attendance")
def get_attendance_history(
    page: int = 1,
    size: int = 10,
    start_date: str = None,
    end_date: str = None,
    current_user: Employee = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Base query for logged-in employee
    query = db.query(Attendance).filter(Attendance.employee_id == current_user.id)
    
    # Date filters parsing
    if start_date:
        try:
            s_date = date.fromisoformat(start_date)
            query = query.filter(Attendance.date >= s_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid start_date format. Use YYYY-MM-DD.")
            
    if end_date:
        try:
            e_date = date.fromisoformat(end_date)
            query = query.filter(Attendance.date <= e_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid end_date format. Use YYYY-MM-DD.")
            
    # Calculate count prior to slice pagination
    total_count = query.count()
    
    # Slice offset query ordered descending by date
    records = query.order_by(Attendance.date.desc()).offset((page - 1) * size).limit(size).all()
    
    # Map results to serialization payload
    result = []
    for r in records:
        result.append({
            "id": r.id,
            "employee_id": r.employee_id,
            "date": r.date.isoformat(),
            "login_time": r.login_time.isoformat(),
            "logout_time": r.logout_time.isoformat() if r.logout_time else None,
            "working_hours": r.working_hours
        })
        
    return {
        "records": result,
        "total_count": total_count,
        "page": page,
        "size": size
    }

# --- Employee Reports API Endpoint ---

@app.get("/api/reports/summary")
def get_reports_summary(current_user: Employee = Depends(get_current_user), db: Session = Depends(get_db)):
    from datetime import timedelta, date
    
    today = date.today()
    
    # 1. Weekly hours (last 7 calendar days)
    seven_days_ago = today - timedelta(days=6)
    weekly_att = db.query(Attendance).filter(
        Attendance.employee_id == current_user.id,
        Attendance.date >= seven_days_ago
    ).all()
    weekly_hours = round(sum(r.working_hours for r in weekly_att if r.working_hours), 2)
    
    # 2. Monthly hours (last 30 calendar days)
    thirty_days_ago = today - timedelta(days=29)
    monthly_att = db.query(Attendance).filter(
        Attendance.employee_id == current_user.id,
        Attendance.date >= thirty_days_ago
    ).all()
    monthly_hours = round(sum(r.working_hours for r in monthly_att if r.working_hours), 2)
    
    # 3. Attendance rate (clocked days vs total weekdays in last 30 days)
    # Total weekdays in last 30 days
    weekdays_count = 0
    temp_date = thirty_days_ago
    while temp_date <= today:
        if temp_date.weekday() < 5:  # Mon-Fri
            weekdays_count += 1
        temp_date += timedelta(days=1)
        
    # Clocked days in last 30 days
    clocked_days = db.query(Attendance).filter(
        Attendance.employee_id == current_user.id,
        Attendance.date >= thirty_days_ago
    ).count()
    
    attendance_percentage = 0.0
    if weekdays_count > 0:
        attendance_percentage = round(min((clocked_days / weekdays_count) * 100.0, 100.0), 2)
        
    # 4. Tasks counts
    completed_tasks = db.query(Task).filter(
        Task.employee_id == current_user.id,
        Task.status == "Completed"
    ).count()
    
    pending_tasks = db.query(Task).filter(
        Task.employee_id == current_user.id,
        Task.status != "Completed"
    ).count()
    
    # 5. Daily hours bar chart list
    daily_hours_week = []
    for i in range(7):
        d = seven_days_ago + timedelta(days=i)
        record = db.query(Attendance).filter(
            Attendance.employee_id == current_user.id,
            Attendance.date == d
        ).first()
        hours = record.working_hours if (record and record.working_hours) else 0.0
        daily_hours_week.append({
            "day": d.strftime("%a"),
            "date": d.isoformat(),
            "hours": hours
        })
        
    return {
        "weekly_hours": weekly_hours,
        "monthly_hours": monthly_hours,
        "attendance_percentage": attendance_percentage,
        "completed_tasks": completed_tasks,
        "pending_tasks": pending_tasks,
        "daily_hours_week": daily_hours_week
    }

# --- Admin Dashboard Summary Endpoint ---

@app.get("/api/admin/summary")
def get_admin_summary(current_user: Employee = Depends(require_admin), db: Session = Depends(get_db)):
    from datetime import timedelta, date
    
    today = date.today()
    
    # 1. Total count of Employees
    total_employees = db.query(Employee).filter(Employee.role == 'Employee').count()
    
    # 2. Present Today (checked in)
    present_today = db.query(Attendance).filter(Attendance.date == today).count()
    
    # 3. Absent Today
    absent_today = max(0, total_employees - present_today)
    
    # 4. Currently Working (checked in today but not checked out)
    currently_working = db.query(Attendance).filter(
        Attendance.date == today,
        Attendance.logout_time == None
    ).count()
    
    # 5. Total working hours today
    today_records = db.query(Attendance).filter(Attendance.date == today).all()
    total_hours_today = round(sum(r.working_hours for r in today_records if r.working_hours), 2)
    
    # 6. Company daily hours split for past 7 days (including today)
    seven_days_ago = today - timedelta(days=6)
    daily_hours_company = []
    for i in range(7):
        d = seven_days_ago + timedelta(days=i)
        daily_att = db.query(Attendance).filter(Attendance.date == d).all()
        hours = sum(r.working_hours for r in daily_att if r.working_hours)
        daily_hours_company.append({
            "day": d.strftime("%a"),
            "date": d.isoformat(),
            "hours": round(hours, 2)
        })
        
    # 7. Live Staff status logs list
    employees = db.query(Employee).filter(Employee.role == 'Employee').all()
    staff_list = []
    for emp in employees:
        att = db.query(Attendance).filter(Attendance.employee_id == emp.id, Attendance.date == today).first()
        status_str = "Offline"
        if att:
            status_str = "Active" if not att.logout_time else "Completed"
        staff_list.append({
            "id": emp.id,
            "name": emp.name,
            "email": emp.email,
            "department": emp.department or 'Operations',
            "designation": emp.designation or 'Staff Lead',
            "status": status_str,
            "clock_in": att.login_time.isoformat() if att else None,
            "clock_out": att.logout_time.isoformat() if (att and att.logout_time) else None,
            "hours": att.working_hours if (att and att.working_hours) else None
        })
        
    return {
        "total_employees": total_employees,
        "present_today": present_today,
        "absent_today": absent_today,
        "currently_working": currently_working,
        "total_hours_today": total_hours_today,
        "daily_hours_company": daily_hours_company,
        "staff_list": staff_list
    }

# --- Employee Management API Endpoints ---

@app.get("/api/admin/employees", response_model=List[UserResponse])
def get_employees_admin(
    search: str = None, 
    department: str = None, 
    current_user: Employee = Depends(require_admin), 
    db: Session = Depends(get_db)
):
    query = db.query(Employee).filter(Employee.role == "Employee")
    
    if search:
        query = query.filter(
            (Employee.name.ilike(f"%{search}%")) | 
            (Employee.email.ilike(f"%{search}%"))
        )
        
    if department:
        query = query.filter(Employee.department == department)
        
    return query.order_by(Employee.name.asc()).all()

@app.post("/api/admin/employees", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def add_employee_admin(
    emp_in: UserCreate, 
    current_user: Employee = Depends(require_admin), 
    db: Session = Depends(get_db)
):
    # Check if duplicate email
    existing = db.query(Employee).filter(Employee.email == emp_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )
        
    new_employee = Employee(
        name=emp_in.name,
        email=emp_in.email,
        password=get_password_hash(emp_in.password),
        role="Employee",
        department=emp_in.department,
        designation=emp_in.designation
    )
    
    try:
        db.add(new_employee)
        db.commit()
        db.refresh(new_employee)
        return new_employee
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add employee: {str(e)}"
        )

@app.put("/api/admin/employees/{emp_id}", response_model=UserResponse)
def edit_employee_admin(
    emp_id: int, 
    emp_in: EmployeeUpdate, 
    current_user: Employee = Depends(require_admin), 
    db: Session = Depends(get_db)
):
    employee = db.query(Employee).filter(Employee.id == emp_id, Employee.role == "Employee").first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found."
        )
        
    update_data = emp_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(employee, field, value)
        
    try:
        db.commit()
        db.refresh(employee)
        return employee
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update employee: {str(e)}"
        )

@app.delete("/api/admin/employees/{emp_id}")
def delete_employee_admin(
    emp_id: int, 
    current_user: Employee = Depends(require_admin), 
    db: Session = Depends(get_db)
):
    employee = db.query(Employee).filter(Employee.id == emp_id, Employee.role == "Employee").first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found."
        )
        
    try:
        db.delete(employee)
        db.commit()
        return {
            "status": "success",
            "message": "Employee deleted successfully."
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete employee: {str(e)}"
        )

@app.post("/api/admin/employees/{emp_id}/reset-password")
def reset_password_admin(
    emp_id: int, 
    reset_in: PasswordReset, 
    current_user: Employee = Depends(require_admin), 
    db: Session = Depends(get_db)
):
    employee = db.query(Employee).filter(Employee.id == emp_id, Employee.role == "Employee").first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found."
        )
        
    try:
        employee.password = get_password_hash(reset_in.password)
        db.commit()
        return {
            "status": "success",
            "message": "Employee password reset successfully."
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reset password: {str(e)}"
        )

# --- Admin Attendance Monitoring Endpoint ---

@app.get("/api/admin/attendance")
def get_admin_attendance_logs(
    page: int = 1,
    size: int = 10,
    start_date: str = None,
    end_date: str = None,
    search: str = None,
    current_user: Employee = Depends(require_admin),
    db: Session = Depends(get_db)
):
    # Perform SQL Join between Attendance and Employee
    query = db.query(Attendance).join(Employee, Attendance.employee_id == Employee.id)
    
    # Filter only general Employee roles
    query = query.filter(Employee.role == "Employee")
    
    # Search employee name or email
    if search:
        query = query.filter(
            (Employee.name.ilike(f"%{search}%")) | 
            (Employee.email.ilike(f"%{search}%"))
        )
        
    # Date filters parsing
    if start_date:
        try:
            s_date = date.fromisoformat(start_date)
            query = query.filter(Attendance.date >= s_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid start_date format. Use YYYY-MM-DD.")
            
    if end_date:
        try:
            e_date = date.fromisoformat(end_date)
            query = query.filter(Attendance.date <= e_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid end_date format. Use YYYY-MM-DD.")
            
    total_count = query.count()
    
    # Fetch paginated logs ordered descending by date and check-in time
    records = query.order_by(Attendance.date.desc(), Attendance.login_time.desc()).offset((page - 1) * size).limit(size).all()
    
    result = []
    for r in records:
        status_str = "Active" if not r.logout_time else "Completed"
        result.append({
            "id": r.id,
            "employee_id": r.employee_id,
            "employee_name": r.employee.name,
            "employee_email": r.employee.email,
            "date": r.date.isoformat(),
            "login_time": r.login_time.isoformat(),
            "logout_time": r.logout_time.isoformat() if r.logout_time else None,
            "working_hours": r.working_hours,
            "status": status_str
        })
        
    return {
        "records": result,
        "total_count": total_count,
        "page": page,
        "size": size
    }

# --- Admin Task Monitoring Endpoints ---

@app.get("/api/admin/tasks/summary")
def get_admin_tasks_summary(
    search: str = None,
    current_user: Employee = Depends(require_admin),
    db: Session = Depends(get_db)
):
    # Query all Employees
    query = db.query(Employee).filter(Employee.role == "Employee")
    
    if search:
        query = query.filter(
            (Employee.name.ilike(f"%{search}%")) | 
            (Employee.email.ilike(f"%{search}%"))
        )
        
    employees = query.order_by(Employee.name.asc()).all()
    
    summary = []
    for emp in employees:
        assigned_tasks = db.query(Task).filter(Task.employee_id == emp.id).count()
        completed_tasks = db.query(Task).filter(Task.employee_id == emp.id, Task.status == "Completed").count()
        pending_tasks = db.query(Task).filter(Task.employee_id == emp.id, Task.status != "Completed").count()
        
        summary.append({
            "employee_id": emp.id,
            "employee_name": emp.name,
            "employee_email": emp.email,
            "department": emp.department or "Operations",
            "designation": emp.designation or "Staff Lead",
            "assigned_tasks": assigned_tasks,
            "completed_tasks": completed_tasks,
            "pending_tasks": pending_tasks
        })
        
    return summary

@app.get("/api/admin/tasks/employee/{emp_id}", response_model=List[TaskResponse])
def get_admin_employee_tasks(
    emp_id: int,
    current_user: Employee = Depends(require_admin),
    db: Session = Depends(get_db)
):
    # Check if employee exists and is an Employee
    employee = db.query(Employee).filter(Employee.id == emp_id, Employee.role == "Employee").first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found."
        )
        
    tasks = db.query(Task).filter(Task.employee_id == emp_id).order_by(Task.created_at.desc()).all()
    return tasks

# --- Weekly Reports API Endpoints ---

def calculate_weekly_metrics(db: Session, employee_id: int, s_date: date):
    from datetime import timedelta, datetime, time
    
    e_date = s_date + timedelta(days=6)
    s_datetime = datetime.combine(s_date, time.min)
    e_datetime = datetime.combine(e_date, time.max)
    
    # Query logs
    attendance_records = db.query(Attendance).filter(
        Attendance.employee_id == employee_id,
        Attendance.date >= s_date,
        Attendance.date <= e_date
    ).all()
    
    total_hours = round(sum(r.working_hours for r in attendance_records if r.working_hours), 2)
    days_present = len(attendance_records)
    attendance_percentage = round(min(100.0, (days_present / 5.0) * 100.0), 1)
    
    # Query tasks
    tasks = db.query(Task).filter(
        Task.employee_id == employee_id,
        Task.created_at >= s_datetime,
        Task.created_at <= e_datetime
    ).all()
    
    total_tasks = len(tasks)
    completed_tasks = sum(1 for t in tasks if t.status == "Completed")
    pending_tasks = total_tasks - completed_tasks
    
    # Daily breakdown details
    daily_details = []
    for i in range(7):
        current_day = s_date + timedelta(days=i)
        
        # Check presence
        day_att = next((r for r in attendance_records if r.date == current_day), None)
        presence_status = "Absent"
        if day_att:
            presence_status = "Present" if day_att.logout_time else "Active Shift"
            
        hours_worked = round(day_att.working_hours, 2) if (day_att and day_att.working_hours) else 0.0
        
        # Check tasks completed on this day
        tasks_done = sum(1 for t in tasks if t.status == "Completed" and t.end_time and t.end_time.date() == current_day)
        
        daily_details.append({
            "date": current_day.isoformat(),
            "day": current_day.strftime("%a"),
            "status": presence_status,
            "hours": hours_worked,
            "tasks_completed": tasks_done
        })
        
    return {
        "total_hours": total_hours,
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "pending_tasks": pending_tasks,
        "attendance_percentage": attendance_percentage,
        "daily_details": daily_details
    }

@app.get("/api/admin/reports/weekly")
def get_admin_weekly_reports(
    start_date: str,
    employee_id: int = None,
    current_user: Employee = Depends(require_admin),
    db: Session = Depends(get_db)
):
    from datetime import date
    try:
        s_date = date.fromisoformat(start_date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid start_date format. Use YYYY-MM-DD.")
        
    if employee_id is not None:
        # Get report for single employee
        emp = db.query(Employee).filter(Employee.id == employee_id, Employee.role == "Employee").first()
        if not emp:
            raise HTTPException(status_code=404, detail="Employee not found.")
            
        metrics = calculate_weekly_metrics(db, employee_id, s_date)
        return {
            "employee_id": emp.id,
            "employee_name": emp.name,
            "employee_email": emp.email,
            "department": emp.department or "Operations",
            "designation": emp.designation or "Staff Lead",
            "start_date": start_date,
            **metrics
        }
    else:
        # Return summary list for all employees
        employees = db.query(Employee).filter(Employee.role == "Employee").order_by(Employee.name.asc()).all()
        summary_list = []
        for emp in employees:
            metrics = calculate_weekly_metrics(db, emp.id, s_date)
            summary_list.append({
                "employee_id": emp.id,
                "employee_name": emp.name,
                "employee_email": emp.email,
                "department": emp.department or "Operations",
                "designation": emp.designation or "Staff Lead",
                "total_hours": metrics["total_hours"],
                "total_tasks": metrics["total_tasks"],
                "completed_tasks": metrics["completed_tasks"],
                "attendance_percentage": metrics["attendance_percentage"]
            })
        return summary_list

@app.get("/api/reports/weekly")
def get_employee_weekly_report(
    start_date: str,
    current_user: Employee = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from datetime import date
    try:
        s_date = date.fromisoformat(start_date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid start_date format. Use YYYY-MM-DD.")
        
    # Verify current user is an Employee
    if current_user.role != "Employee":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only employees can access their reports.")
        
    metrics = calculate_weekly_metrics(db, current_user.id, s_date)
    return {
        "employee_id": current_user.id,
        "employee_name": current_user.name,
        "employee_email": current_user.email,
        "department": current_user.department or "Operations",
        "designation": current_user.designation or "Staff Lead",
        "start_date": start_date,
        **metrics
    }

# --- Notifications Engine Endpoints ---

@app.get("/api/notifications")
def get_employee_notifications(
    current_user: Employee = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from datetime import date, timedelta
    
    # Verify current user is an Employee
    if current_user.role != "Employee":
        return []
        
    today = date.today()
    notifications = []
    
    # 1. Forgot Clock In
    today_att = db.query(Attendance).filter(
        Attendance.employee_id == current_user.id,
        Attendance.date == today
    ).first()
    
    if not today_att:
        notifications.append({
            "id": "forgot-clock-in",
            "type": "warning",
            "category": "clock_in",
            "message": "Forgot to Clock In: You have not registered a check-in today yet.",
            "date": today.isoformat()
        })
        
    # 2. Forgot Clock Out (previous days open shifts)
    open_shifts = db.query(Attendance).filter(
        Attendance.employee_id == current_user.id,
        Attendance.date < today,
        Attendance.logout_time == None
    ).all()
    
    for shift in open_shifts:
        notifications.append({
            "id": f"forgot-clock-out-{shift.id}",
            "type": "warning",
            "category": "clock_out",
            "message": f"Forgot to Clock Out: Active check-in session found on {shift.date.isoformat()} lacking clock-out.",
            "date": shift.date.isoformat()
        })
        
    # 3. Daily Task Incomplete
    incomplete_tasks_count = db.query(Task).filter(
        Task.employee_id == current_user.id,
        Task.status != "Completed"
    ).count()
    
    if incomplete_tasks_count > 0:
        notifications.append({
            "id": "incomplete-tasks",
            "type": "info",
            "category": "tasks",
            "message": f"Incomplete Tasks: You have {incomplete_tasks_count} pending checklist item(s) to complete today.",
            "date": today.isoformat()
        })
        
    # 4. Weekly Report Available
    # Check if there are logs in the previous week (Monday to Sunday)
    last_monday = today - timedelta(days=today.weekday() + 7)
    last_sunday = last_monday + timedelta(days=6)
    
    prev_week_att = db.query(Attendance).filter(
        Attendance.employee_id == current_user.id,
        Attendance.date >= last_monday,
        Attendance.date <= last_sunday
    ).first()
    
    if prev_week_att:
        notifications.append({
            "id": f"weekly-report-{last_monday.isoformat()}",
            "type": "info",
            "category": "reports",
            "message": f"Weekly Report Available: Logs for the week of {last_monday.isoformat()} are ready for audit.",
            "date": today.isoformat()
        })
        
    return notifications

# --- Leave Management API Endpoints ---

@app.post("/api/leaves", response_model=LeaveResponse, status_code=status.HTTP_201_CREATED)
def apply_leave(
    leave_in: LeaveCreate, 
    current_user: Employee = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    if current_user.role != "Employee":
        raise HTTPException(status_code=403, detail="Only Employees can apply for leaves.")
        
    # Check date range sanity
    if leave_in.start_date > leave_in.end_date:
        raise HTTPException(status_code=400, detail="Start date must be before or equal to End date.")
        
    new_leave = LeaveRequest(
        employee_id=current_user.id,
        start_date=leave_in.start_date,
        end_date=leave_in.end_date,
        reason=leave_in.reason,
        status="Pending"
    )
    
    try:
        db.add(new_leave)
        db.commit()
        db.refresh(new_leave)
        return new_leave
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit leave request: {str(e)}"
        )

@app.get("/api/leaves", response_model=List[LeaveResponse])
def get_employee_leaves(
    current_user: Employee = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    if current_user.role != "Employee":
        raise HTTPException(status_code=403, detail="Only Employees can access their leave requests.")
        
    leaves = db.query(LeaveRequest).filter(
        LeaveRequest.employee_id == current_user.id
    ).order_by(LeaveRequest.created_at.desc()).all()
    return leaves

@app.get("/api/admin/leaves", response_model=List[LeaveResponse])
def get_admin_leaves(
    status_filter: str = None, 
    current_user: Employee = Depends(require_admin), 
    db: Session = Depends(get_db)
):
    query = db.query(LeaveRequest).join(Employee, LeaveRequest.employee_id == Employee.id)
    
    if status_filter:
        query = query.filter(LeaveRequest.status == status_filter)
        
    records = query.order_by(LeaveRequest.created_at.desc()).all()
    
    result = []
    for r in records:
        result.append({
            "id": r.id,
            "employee_id": r.employee_id,
            "employee_name": r.employee.name,
            "employee_email": r.employee.email,
            "start_date": r.start_date,
            "end_date": r.end_date,
            "reason": r.reason,
            "status": r.status,
            "created_at": r.created_at
        })
    return result

@app.post("/api/admin/leaves/{leave_id}/approve")
def approve_leave(
    leave_id: int, 
    current_user: Employee = Depends(require_admin), 
    db: Session = Depends(get_db)
):
    leave = db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found.")
        
    try:
        leave.status = "Approved"
        db.commit()
        return {
            "status": "success",
            "message": "Leave request approved successfully."
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to approve leave request: {str(e)}"
        )

@app.post("/api/admin/leaves/{leave_id}/reject")
def reject_leave(
    leave_id: int, 
    current_user: Employee = Depends(require_admin), 
    db: Session = Depends(get_db)
):
    leave = db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found.")
        
    try:
        leave.status = "Rejected"
        db.commit()
        return {
            "status": "success",
            "message": "Leave request rejected successfully."
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to reject leave request: {str(e)}"
        )

# --- Analytics Dashboard Aggregations Endpoint ---

@app.get("/api/admin/analytics")
def get_admin_analytics(
    current_user: Employee = Depends(require_admin),
    db: Session = Depends(get_db)
):
    from datetime import date, timedelta
    from sqlalchemy import func
    
    # 1. Total Employee count for calculations
    total_employees = db.query(Employee).filter(Employee.role == "Employee").count()
    
    # 2. Attendance Trend (Last 14 days)
    attendance_trend = []
    today = date.today()
    for i in range(13, -1, -1):
        target_date = today - timedelta(days=i)
        present_count = db.query(Attendance).filter(
            Attendance.date == target_date
        ).count()
        absent_count = max(0, total_employees - present_count)
        attendance_trend.append({
            "date": target_date.strftime("%b %d"),
            "Present": present_count,
            "Absent": absent_count
        })
        
    # 3. Employee Working Hours (Last 30 days)
    employee_hours = []
    start_30 = today - timedelta(days=30)
    employees = db.query(Employee).filter(Employee.role == "Employee").all()
    for emp in employees:
        hours_sum = db.query(func.sum(Attendance.working_hours)).filter(
            Attendance.employee_id == emp.id,
            Attendance.date >= start_30
        ).scalar()
        employee_hours.append({
            "name": emp.name,
            "hours": round(hours_sum or 0, 1)
        })
    # Sort by hours descending
    employee_hours = sorted(employee_hours, key=lambda x: x["hours"], reverse=True)[:8]
    
    # 4. Department Productivity
    # Group by employee department
    department_stats = {}
    # Fetch all employees
    all_emps = db.query(Employee).filter(Employee.role == "Employee").all()
    for emp in all_emps:
        dept = emp.department or "Operations"
        if dept not in department_stats:
            department_stats[dept] = {"hours": 0.0, "tasks": 0}
            
        # Sum hours for the last 30 days
        hours_sum = db.query(func.sum(Attendance.working_hours)).filter(
            Attendance.employee_id == emp.id,
            Attendance.date >= start_30
        ).scalar()
        
        # Count completed tasks
        tasks_count = db.query(Task).filter(
            Task.employee_id == emp.id,
            Task.status == "Completed",
            Task.created_at >= datetime.combine(start_30, datetime.min.time())
        ).count()
        
        department_stats[dept]["hours"] += float(hours_sum or 0.0)
        department_stats[dept]["tasks"] += tasks_count
        
    department_productivity = []
    for dept, stats in department_stats.items():
        department_productivity.append({
            "department": dept,
            "hours": round(stats["hours"], 1),
            "tasks": stats["tasks"]
        })
        
    # 5. Task Completion Status
    completed_tasks = db.query(Task).filter(Task.status == "Completed").count()
    in_progress_tasks = db.query(Task).filter(Task.status == "In Progress").count()
    todo_tasks = db.query(Task).filter(Task.status == "To Do").count()
    
    task_completion = [
        {"name": "Completed", "value": completed_tasks},
        {"name": "In Progress", "value": in_progress_tasks},
        {"name": "To Do", "value": todo_tasks}
    ]
    
    # 6. Weekly Performance (Last 4 weeks)
    weekly_performance = []
    # weekday number (0 for Mon)
    current_weekday = today.weekday()
    current_monday = today - timedelta(days=current_weekday)
    for i in range(3, -1, -1):
        mon = current_monday - timedelta(days=7 * i)
        sun = mon + timedelta(days=6)
        
        hours = db.query(func.sum(Attendance.working_hours)).filter(
            Attendance.date >= mon,
            Attendance.date <= sun
        ).scalar()
        
        tasks = db.query(Task).filter(
            Task.status == "Completed",
            Task.created_at >= datetime.combine(mon, datetime.min.time()),
            Task.created_at <= datetime.combine(sun, datetime.max.time())
        ).count()
        
        weekly_performance.append({
            "week": mon.strftime("%d %b"),
            "hours": round(hours or 0, 1),
            "tasks": tasks
        })
        
    # 7. Monthly Performance (Last 6 months)
    monthly_performance = []
    for i in range(5, -1, -1):
        # Approximate month offsets (30 days)
        start_m = today - timedelta(days=30 * (i + 1))
        end_m = today - timedelta(days=30 * i)
        
        hours = db.query(func.sum(Attendance.working_hours)).filter(
            Attendance.date > start_m,
            Attendance.date <= end_m
        ).scalar()
        
        tasks = db.query(Task).filter(
            Task.status == "Completed",
            Task.created_at > datetime.combine(start_m, datetime.max.time()),
            Task.created_at <= datetime.combine(end_m, datetime.max.time())
        ).count()
        
        # Month string label
        month_label = end_m.strftime("%b")
        monthly_performance.append({
            "month": month_label,
            "hours": round(hours or 0, 1),
            "tasks": tasks
        })
        
    return {
        "attendance_trend": attendance_trend,
        "employee_working_hours": employee_hours,
        "department_productivity": department_productivity,
        "task_completion": task_completion,
        "weekly_performance": weekly_performance,
        "monthly_performance": monthly_performance
    }
