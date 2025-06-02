# Enviroshake Inventory

This repository provides a simple inventory system composed of a **FastAPI** backend and a **React** frontend. The backend exposes a small REST API while the frontend is built with Create React App.

## Purpose

The project demonstrates how to combine a Python API with a React user interface. The backend stores status checks in MongoDB and the frontend communicates with these endpoints. The included Dockerfile bundles the two services so they can be run together or individually during development.

## Prerequisites

* **Python 3.11**
* **Node.js** (with npm or yarn)
* **Docker** (optional but recommended for running both services together)
* **MongoDB** instance accessible by the backend

## Environment Variables

The backend expects a few variables for MongoDB connectivity. Copy `backend/.env` as a starting point or set the following in your environment:

```bash
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"
```

You can place these in `backend/.env` or export them before starting the backend service.

## Running with Docker

A multi‑stage `Dockerfile` is provided. Build and run the container with:

```bash
docker build -t enviroshake .
docker run -p 8080:8080 -e MONGO_URL -e DB_NAME enviroshake
```

This starts the FastAPI backend on port `8001` and serves the React app through nginx on port `8080`.

## Running Services Individually

If you prefer to run each service manually:

1. **Backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn server:app --reload --port 8001
   ```
2. **Frontend**
   ```bash
   cd frontend
   yarn install
   yarn start
   ```
   The frontend proxies API requests to the backend during development.

## API Usage

### `GET /api/`
Returns a simple greeting to confirm the server is running.

### `POST /api/status`
Creates a status record. Example:

```bash
curl -X POST http://localhost:8001/api/status \
     -H "Content-Type: application/json" \
     -d '{"client_name": "My Client"}'
```

### `GET /api/status`
Retrieves all stored status records.

## Testing the API

Run `backend_test.py` to exercise the endpoints:

```bash
python backend_test.py
```

It sends requests to `/api` and `/api/status` and prints the results.

## Repository Structure

```
backend/            # FastAPI application
frontend/           # React application
Dockerfile          # Build instructions for combined image
nginx.conf          # Nginx configuration for serving frontend and backend
backend_test.py     # Simple script to test API endpoints
scripts/            # Helper scripts
tests/              # Placeholder for test suite
```

This overview should help you get started developing or running the inventory system.
