# Nebtube
Web App designed to integrate Youtube and Nebula RSS feeds seemelessly into one app

# Stack
Python (FastAPI), React.js

# Running Locally
  
# Backend (FastAPI)
 
```powershell
cd backend
venv\Scripts\activate
uvicorn main:app --reload
```
 
Runs at `http://localhost:8000`. Test with `http://localhost:8000/api/feed`.
 
First time only, or after adding new packages:
 
```powershell
pip install -r requirements.txt
```
 
## Frontend (React + Vite)
 
Open a **second terminal** (keep the backend running in the first):
 
```powershell
cd frontend
npm run dev
```
 
Runs at `http://localhost:5173`.
 
First time only:
 
```powershell
npm install
```
 
## Local environment variable
 
In `frontend/.env`:
 
```
VITE_API_URL=http://localhost:8000
```
 
This is separate from the `VITE_API_URL` set in Vercel, which points to the Railway production URL. Locally, it should point at your local backend.
 
---
 
Once both are running, visit `http://localhost:5173` you should see the same feed as production, but talking to your local backend instead of Railway.


