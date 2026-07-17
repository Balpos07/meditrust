FROM python:3.10-slim

WORKDIR /app

# Install system dependencies (required for psycopg2/asyncpg sometimes)
RUN apt-get update && apt-get install -y gcc libpq-dev && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Expose the port
EXPOSE 8000

# Run Uvicorn via Alembic migrations first if needed (usually handled via bash script, but here we just run server)
# In production, you might want to run alembic upgrade head BEFORE starting uvicorn.
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000 --proxy-headers"]
