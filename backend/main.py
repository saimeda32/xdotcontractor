import uuid
import time
import os
import logging
import pandas as pd
import io
from fastapi import FastAPI, Depends, HTTPException, UploadFile, Response
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from fpdf import FPDF
from database import engine, SessionLocal
from models import Base, User, GDOTMasterFile, ProposalFile, Project, ProjectCreate, VersionModel, UpdateLineItemRequest
from auth import authenticate_user, create_access_token, get_current_user, get_password_hash, verify_password
from schemas import SignupRequest, LoginRequest
import math


# Initialize FastAPI
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Restrict to frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables on startup
@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

# Dependency for database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Utility function to handle floats safely
def safe_float(value):
    try:
        return value if value is not None and not (math.isnan(value) or math.isinf(value)) else None
    except (TypeError, ValueError):
        return None

# User Authentication
@app.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == request.username).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid username or password")
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/signup")
def signup(request: SignupRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.username == request.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken")
    hashed_password = get_password_hash(request.password)
    new_user = User(username=request.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    return {"message": "User created successfully"}

# Project Endpoints
@app.post("/api/projects")
def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    new_project = Project(name=project.name, description=project.description)
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project

@app.get("/api/projects")
def get_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).all()
    return [{"id": project.id, "name": project.name, "description": project.description} for project in projects]

@app.get("/api/projects/{project_id}/files")
def get_project_files(project_id: int, db: Session = Depends(get_db)):
    # Query distinct file names for the given project
    files = db.query(ProposalFile.proposal).filter(ProposalFile.project_id == project_id).distinct().all()
    if not files:
        raise HTTPException(status_code=404, detail="No files found for this project")
    return [{"file_name": file.proposal} for file in files]

@app.get("/api/files/contents/{file_name}")
def get_file_contents(file_name: str, db: Session = Depends(get_db)):
    # Fetch all rows for the selected file
    file_entries = db.query(ProposalFile).filter(ProposalFile.proposal == file_name).all()
    if not file_entries:
        raise HTTPException(status_code=404, detail="File not found")

    return [
        {
            "line": entry.line,
            "item": entry.item,
            "quantity": safe_float(entry.quantity),
            "unit": entry.unit,
            "description": entry.description,
            "price": safe_float(entry.price),
            "proposal": entry.proposal,
            "call_order": entry.call_order,
            "agency_id": entry.agency_id,
            "project_id": entry.project_id,
            "total_price": entry.total_price,
        }
        for entry in file_entries
    ]

# GDOT Master File Upload
@app.post("/upload-gdot")
async def upload_gdot_file(file: UploadFile, db: Session = Depends(get_db)):
    contents = await file.read()
    try:
        # Read and process the file
        df = pd.read_excel(io.BytesIO(contents))
        df.columns = df.columns.str.strip()

        required_columns = {"ITEMCODE", "ITEM DESCRIPTION", "UM", "Rate", "Category"}
        if not required_columns.issubset(df.columns):
            missing_columns = required_columns - set(df.columns)
            raise HTTPException(status_code=400, detail=f"Missing columns: {missing_columns}")

        # Insert rows into the GDOTMasterFile table
        for _, row in df.iterrows():
            gdot_entry = GDOTMasterFile(
                itemcode=row.get("ITEMCODE"),
                item_description=row.get("ITEM DESCRIPTION"),
                um=row.get("UM"),
                rate=safe_float(row.get("Rate")),
                category=row.get("Category") 
            )
            db.add(gdot_entry)

        # Create a version entry
        new_version = VersionModel(
            name=file.filename,
            gdot_file_path=f"gdot_files/{file.filename}",
            file_content=contents
        )
        db.add(new_version)
        db.commit()

        return {"message": "GDOT Master File uploaded and version created successfully"}
    except Exception as e:
        logging.error(f"Error processing GDOT file: {e}")
        raise HTTPException(status_code=500, detail="Failed to process GDOT Master File")

# Proposal File Upload
@app.post("/api/projects/{project_id}/upload-proposal")
async def upload_proposal_file(project_id: int, file: UploadFile, db: Session = Depends(get_db)):
    # Generate a unique file name using UUID and timestamp
    unique_filename = f"{file.filename.split('.')[0]}_{str(uuid.uuid4())}_{int(time.time())}.{file.filename.split('.')[-1]}"

    contents = await file.read()  # Read the file content
    try:
        # Handle file content based on type (CSV or XLSX)
        if file.filename.endswith(".csv"):
            proposal_df = pd.read_csv(io.BytesIO(contents))
        elif file.filename.endswith(".xlsx"):
            proposal_df = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type")

        # Save the proposal data into the ProposalFile table
        for _, row in proposal_df.iterrows():
            proposal = ProposalFile(
                line=row.get("Line"),
                item=row.get("Item"),
                quantity=safe_float(row.get("Quantity")),
                unit=row.get("Unit"),
                description=row.get("Description"),
                price=safe_float(row.get("Price")),
                proposal=unique_filename,  # Use the unique file name here
                call_order=row.get("Call Order"),
                agency_id=row.get("Agency ID"),
                project_id=project_id
            )
            db.add(proposal)
        
        db.commit()  # Commit the data to the database
        return {"message": f"Proposal file '{unique_filename}' uploaded successfully"}

    except Exception as e:
        logging.error(f"Error processing proposal file: {e}")
        raise HTTPException(status_code=500, detail="Failed to process Proposal File")

# Version Handling
@app.get("/api/versions")
def get_versions(db: Session = Depends(get_db)):
    versions = db.query(VersionModel).filter(VersionModel.name.like('%.csv') | VersionModel.name.like('%.xlsx')).all()
    return [{"id": version.id, "name": version.name, "date": version.date} for version in versions]


@app.get("/api/version-content/{version_id}")
async def get_version_content(version_id: int, db: Session = Depends(get_db)):
    version = db.query(VersionModel).filter(VersionModel.id == version_id).first()
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")
    try:
        content = pd.read_excel(io.BytesIO(version.file_content))
        data = content.to_dict(orient="records")
        return {"content": data}
    except Exception as e:
        logging.error(f"Error reading version content: {e}")
        raise HTTPException(status_code=500, detail="Failed to read Version Content")

@app.post("/api/files/populate/{file_name}")
def populate_proposal_file(file_name: str, db: Session = Depends(get_db)):
    try:
        # Fetch the GDOT Master File entries
        latest_gdot_file = db.query(GDOTMasterFile).all()
        if not latest_gdot_file:
            raise HTTPException(status_code=404, detail="No GDOT Master File found")

        # Create a mapping of ITEMCODE to Rate and Category
        gdot_mapping = {gdot.itemcode: {"rate": gdot.rate, "category": gdot.category} for gdot in latest_gdot_file}

        # Get all entries from the selected Proposal File
        proposal_entries = db.query(ProposalFile).filter(ProposalFile.proposal == file_name).all()
        if not proposal_entries:
            raise HTTPException(status_code=404, detail="Proposal File not found")

        # Calculate total sum of all items for percentage calculation
        total_sum = sum(entry.total_price for entry in proposal_entries)

        updated_entries = []
        category_totals = {}

        for entry in proposal_entries:
            # Get corresponding GDOT data for each item
            gdot_data = gdot_mapping.get(entry.item, {"rate": 0, "category": "Unknown"})
            entry.price = gdot_data["rate"]  # Update price from GDOT mapping
            entry.category = gdot_data["category"]  # Update category from GDOT mapping

            # Ensure quantity and price are valid float values (default to 0.0 if invalid)
            quantity = safe_float(entry.quantity)
            price = safe_float(entry.price)

            # Calculate total price as Quantity * Price
            total_price = quantity * price

            # Update the entry with the calculated total price
            entry.total_price = total_price  # Save the calculated total price

            # Add category total for percentage calculation
            if entry.category not in category_totals:
                category_totals[entry.category] = 0
            category_totals[entry.category] += total_price

            updated_entries.append({
                "line": entry.line,
                "item": entry.item,
                "quantity": quantity,
                "unit": entry.unit,
                "description": entry.description,
                "price": price,
                "category": entry.category,
                "total_price": total_price,  # Include total price
                "proposal": entry.proposal,
                "call_order": entry.call_order,
                "agency_id": entry.agency_id,
                "project_id": entry.project_id,
            })

        # Calculate percentages for each category
        for entry in updated_entries:
            total_category_price = category_totals.get(entry['category'], 0)
            percentage = (total_category_price / total_sum) * 100 if total_sum > 0 else 0
            entry["category_percentage"] = round(percentage, 2)

        # Commit changes to save the updated total price in the database
        db.commit()

        return updated_entries

    except Exception as e:
        logging.error(f"Error processing Proposal File: {e}")
        raise HTTPException(status_code=500, detail="Failed to populate Proposal File rates and categories")


# Update Line Item
@app.put("/api/files/update-line-item")
def update_line_item(request: UpdateLineItemRequest, db: Session = Depends(get_db)):
    # Fetch the line item based on file name and line ID
    line_item = (
        db.query(ProposalFile)
        .filter(ProposalFile.proposal == request.file_name, ProposalFile.line == request.line_id)
        .first()
    )
    if not line_item:
        raise HTTPException(status_code=404, detail="Line item not found")

    # Update the price
    line_item.price = request.new_price
    db.commit()
    return {"message": "Line item updated successfully"}

# Download Proposal File in CSV
@app.get("/api/files/download/csv/{file_name}")
def download_csv(file_name: str, db: Session = Depends(get_db)):
    file_entries = db.query(ProposalFile).filter(ProposalFile.proposal == file_name).all()
    if not file_entries:
        raise HTTPException(status_code=404, detail="File not found")

    # Generate CSV
    csv_file = io.StringIO()
    csv_writer = csv.writer(csv_file)
    csv_writer.writerow(["Line", "Item", "Quantity", "Unit", "Description", "Price", "Total Price", "Category"])  # Header row

    for entry in file_entries:
        csv_writer.writerow([
            entry.line, entry.item, entry.quantity, entry.unit, entry.description, entry.price, entry.total_price, entry.category
        ])
    csv_file.seek(0)

    # Return CSV as StreamingResponse
    return StreamingResponse(
        iter([csv_file.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={file_name}.csv"}
    )

# Download Proposal File in PDF
@app.get("/api/files/download/pdf/{file_name}")
def download_pdf(file_name: str, db: Session = Depends(get_db)):
    file_entries = db.query(ProposalFile).filter(ProposalFile.proposal == file_name).all()
    if not file_entries:
        raise HTTPException(status_code=404, detail="File not found")

    # Generate PDF
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)

    pdf.cell(200, 10, txt=f"Proposal File: {file_name}", ln=True, align="C")
    pdf.ln(10)  # Line break

    # Add Table Header
    pdf.set_font("Arial", "B", size=10)
    pdf.cell(20, 10, "Line", 1)
    pdf.cell(30, 10, "Item", 1)
    pdf.cell(20, 10, "Quantity", 1)
    pdf.cell(20, 10, "Unit", 1)
    pdf.cell(60, 10, "Description", 1)
    pdf.cell(30, 10, "Price", 1)
    pdf.cell(30, 10, "Total Price", 1)
    pdf.cell(30, 10, "Category", 1)
    pdf.ln(10)

    # Add Table Data
    pdf.set_font("Arial", size=10)
    for entry in file_entries:
        pdf.cell(20, 10, str(entry.line), 1)
        pdf.cell(30, 10, str(entry.item), 1)
        pdf.cell(20, 10, str(entry.quantity), 1)
        pdf.cell(20, 10, str(entry.unit), 1)
        pdf.cell(60, 10, str(entry.description), 1)
        pdf.cell(30, 10, str(entry.price), 1)
        pdf.cell(30, 10, str(entry.total_price), 1)
        pdf.cell(30, 10, str(entry.category), 1)
        pdf.ln(10)

    # Save PDF to a BytesIO object
    pdf_output = io.BytesIO()
    pdf.output(pdf_output)
    pdf_output.seek(0)

    # Return PDF as StreamingResponse
    return StreamingResponse(
        pdf_output,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={file_name}.pdf"}
    )