from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Enum, Date, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.database import Base
import enum



class Users(Base):
    __tablename__ = "users"
    username = Column(String,primary_key=True, index=True)
    password = Column(String)
 
    created_at = Column(DateTime, default=datetime.utcnow())
    is_active = Column(Boolean, default=False)
    
# This can be temporary, but it is necessary for
# entitlement testing this week / next week
class TypesOfEmployees(enum.Enum):
    CUSTOMER_SUPPORT = "CUSTOMER_SUPPORT"
    LOT_SPECIALIST = "LOT_SPECIALIST"
    ADVERTISING_SPECIALIST = "ADVERTISING_SPECIALIST"
    ACCOUNTANT = "ACCOUNTANT"
    
class Employees(Base):
    __tablename__ = "employees"
    id = Column(Integer, primary_key=True, index=True)
    type = Column(Enum(TypesOfEmployees))
    full_name = Column(String)
    phone_no = Column(String)
    email = Column(String, ForeignKey("users.username"), unique=True)
    address =Column(String, nullable=True)
    joining_date = Column(DateTime, default=datetime.utcnow())
    resign_date = Column(DateTime, nullable=True)
    
class Department(Base):
    __tablename__ = "department"
    id = Column(Integer, primary_key=True, index=True)
    dept_name = Column(String, index=True, unique=True)
    
    
class EmployeeDepartment(Base):
    __tablename__ = "employee_department"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    department_id = Column(Integer, ForeignKey("department.id"))
    employee = relationship("Employees", primaryjoin="Employees.id == EmployeeDepartment.employee_id")
    department = relationship("Department", primaryjoin="Department.id == EmployeeDepartment.department_id")
    UniqueConstraint( employee_id, department_id)
    
class TypesOfBusiness(enum.Enum):
    ADVERTISERS = "ADVERTISERS"
    BUSINESS = "BUSINESS"
   
class Business(Base):
    __tablename__ = "business"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, ForeignKey("users.username"), unique=True)
    stripe_customer_id = Column(String, index=True)
    name = Column(String, unique=True)
    address = Column(String)
    phone_no = Column(String, unique=True, index=True)
    date_joined = Column(DateTime, default=datetime.utcnow())
    is_active = Column(Boolean, default=True)
    type = Column(Enum(TypesOfBusiness))
    business_user = relationship("Users", primaryjoin="Users.username == Business.email")
    user = relationship("ExternalUsers", back_populates="business")
    lots = relationship("LotMetadata", back_populates="owner")


class ExternalUsers(Base):
    __tablename__ = "external_users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, ForeignKey("users.username"), unique=True)
    phone_no = Column(String, unique=True, index=True)
    business_id = Column(Integer, ForeignKey("business.id"))
    business = relationship("Business", back_populates="user")
    user = relationship("Users", primaryjoin="Users.username == ExternalUsers.email")

class CamImage(Base):
    __tablename__ = "camimage"
    
    id = Column(Integer, primary_key=True, index=True)
    image = Column(String) 
    timestamp = Column(DateTime, default=datetime.utcnow())
    camera_name = Column(String)
    human_labels = Column(String, nullable=True) 
    model_labels = Column(String, nullable=True) 

class LotMetadata(Base):
    __tablename__ = "lotmetadata"
    
    id = Column(String, primary_key=True)
    name = Column(String)
    owner_id = Column(Integer, ForeignKey('business.id'), nullable=True)  
    gps_coordinates = Column(String, nullable=True)
    state = Column(String(2), nullable=True)
    zip = Column(String(5), nullable=True)  
    city = Column(String, nullable=True)
    
    owner = relationship("Business", back_populates="lots")
    cameras = relationship("CamMetadata", back_populates="lot")
    lprs = relationship("LPRMetadata", back_populates="lot")

class CamMetadata(Base):
    __tablename__ = "cammetadata" 
    name = Column(String, primary_key=True)
    lot_id = Column(String, ForeignKey('lotmetadata.id'))
    lot = relationship("LotMetadata", back_populates="cameras") 
    

class LPRMetadata(Base):
    __tablename__ = "lprmetadata"
    
    name = Column(String, primary_key=True)
    lot_id = Column(String, ForeignKey('lotmetadata.id'))
    passcode = Column(String)
    lot = relationship("LotMetadata", back_populates="lprs")
    readings = relationship("LicensePlateReading", back_populates="lpr")

class LicensePlateReading(Base):
    __tablename__ = "licenseplatereading"
    
    id = Column(Integer, primary_key=True, index=True)
    lpr_id = Column(String, ForeignKey('lprmetadata.name'))
    timestamp = Column(DateTime, default=datetime.utcnow())
    plate_number = Column(String(10)) 
    lpr = relationship("LPRMetadata", back_populates="readings")
    