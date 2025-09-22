# Use Python 3.12 slim image for smaller size
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Copy requirements first for better layer caching
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir --trusted-host pypi.org --trusted-host pypi.python.org --trusted-host files.pythonhosted.org -r requirements.txt

# Copy application files
COPY . .

# Expose the port
EXPOSE 9082

# Command to run the application
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "9082", "--reload"]