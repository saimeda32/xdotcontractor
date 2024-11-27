# Use Python base image
FROM python:3.9

# Set working directory
WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install -r requirements.txt


# Copy the FastAPI code
COPY . .

# Environment variables for DB connection
ENV DATABASE_URL=postgresql+psycopg2://postgres:password@db/xdotcontractor_db
# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]


COPY run.sh /app/run.sh
RUN chmod +x /app/run.sh
CMD ["/app/run.sh"]
