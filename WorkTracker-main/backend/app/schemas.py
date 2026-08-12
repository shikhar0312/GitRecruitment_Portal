from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime, date
from typing import Optional

class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., max_length=100)
    password: str = Field(..., min_length=6, max_length=100)
    role: str = Field("Employee", description="Must be either 'Admin' or 'Employee'")
    department: Optional[str] = Field(None, max_length=100)
    designation: Optional[str] = Field(None, max_length=100)

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    department: Optional[str] = None
    designation: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# --- Task Schemas ---

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    priority: str = Field("Medium", description="Low, Medium, High")
    status: str = Field("To Do", description="To Do, In Progress, Completed")
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None

class TaskResponse(BaseModel):
    id: int
    employee_id: int
    title: str
    description: Optional[str] = None
    priority: str
    status: str
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Employee Management Schemas ---

class EmployeeUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[str] = Field(None, max_length=100)
    department: Optional[str] = Field(None, max_length=100)
    designation: Optional[str] = Field(None, max_length=100)

class PasswordReset(BaseModel):
    password: str = Field(..., min_length=6, max_length=100)

# --- Leave Management Schemas ---

class LeaveCreate(BaseModel):
    start_date: date
    end_date: date
    reason: str

class LeaveResponse(BaseModel):
    id: int
    employee_id: int
    employee_name: Optional[str] = None
    employee_email: Optional[str] = None
    start_date: date
    end_date: date
    reason: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
