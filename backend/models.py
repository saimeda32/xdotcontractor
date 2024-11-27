from sqlalchemy import Column, Integer, String, Float, DateTime, LargeBinary, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from database import Base
from pydantic import BaseModel
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

# class GDOTMasterFile(Base):
#     __tablename__ = "gdot_master_files"
#     id = Column(Integer, primary_key=True, index=True)
#     itemcode = Column(String, nullable=False)
#     rate = Column(Float, nullable=False)

class GDOTMasterFile(Base):
    __tablename__ = "gdot_master_files"
    id = Column(Integer, primary_key=True, index=True)
    itemcode = Column(String, nullable=False)
    item_description = Column(String, nullable=True)
    um = Column(String, nullable=True)
    rate = Column(Float, nullable=True)
    category = Column(String, nullable=True)

# class ProposalFile(Base):
#     __tablename__ = "proposal_files"
#     id = Column(Integer, primary_key=True, index=True)
#     item = Column(String, index=True)
#     rate = Column(Float)

class ProposalFile(Base):
    __tablename__ = "proposal_files"
    id = Column(Integer, primary_key=True, index=True)
    line = Column(Integer)  # Line number
    item = Column(String, index=True)
    quantity = Column(Float)  # Quantity as a float for decimal values
    unit = Column(String)  # Unit of measurement
    description = Column(String)  # Description of the item
    price = Column(Float)  # Price, allowing for decimal values
    category = Column(String, nullable=True)
    total_price = Column(Float)  # Store the calculated total price
    proposal = Column(String)  # Proposal identifier
    call_order = Column(Integer)  # Call Order
    agency_id = Column(String)  # Agency ID
    project_id = Column(Integer, ForeignKey('projects.id'))  # Foreign key to Project
    project = relationship("Project", back_populates="proposal_files")



class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    proposal_files = relationship("ProposalFile", back_populates="project")

# class Project(Base):
#     __tablename__ = "projects"
#     id = Column(Integer, primary_key=True, index=True)
#     name = Column(String, index=True)
#     description = Column(String)


class ProjectCreate(BaseModel):
    name: str
    description: str


class VersionModel(Base):
    __tablename__ = "versions"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    gdot_file_path = Column(String, nullable=False)
    date = Column(DateTime(timezone=True), server_default=func.now())
    file_content = Column(LargeBinary, nullable=True)  # Store the file contents


class UpdateLineItemRequest(BaseModel):
    file_name: str
    line_id: int
    new_price: float

