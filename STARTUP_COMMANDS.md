# CELLINSIGHT — Startup & Testing Commands

## Project Root

```powershell
cd D:\ALLProjects\Cellinsight
🟦 Terminal 1 — MongoDB

MongoDB runs as a Windows service.

Check status
Get-Service MongoDB

Expected:

Status : Running
If MongoDB is stopped
Start-Service MongoDB
MongoDB connection
mongodb://localhost:27017/cellinsight

Keep MongoDB running.

🟩 Terminal 2 — AI / FastAPI

Open a new terminal.

cd D:\ALLProjects\Cellinsight\inference

Start the AI service:

& "D:\ALLProjects\Cellinsight\.venv\Scripts\uvicorn.exe" main:app --reload --port 8000
AI URLs

Health:

http://localhost:8000/health

Swagger:

http://localhost:8000/docs

Keep this terminal running.

🟨 Terminal 3 — Backend / Node.js

Open a new terminal.

cd D:\ALLProjects\Cellinsight\Blood-Smear-Analysis-backend

Start backend:

node src/server.js
Backend URL
http://localhost:3001

Health check:

Invoke-RestMethod http://localhost:3001/api/health

Expected:

status : ok

Keep this terminal running.

IMPORTANT:
npm run dev is NOT currently available in this backend.
Use node src/server.js.

🟪 Terminal 4 — Frontend / React

Open a new terminal.

cd D:\ALLProjects\Cellinsight\Blood-Smear-Analysis-frontend

Start frontend:

npm run dev

Open:

http://localhost:5173

Keep this terminal running.

🟥 Terminal 5 — Testing

Use this terminal for health checks and testing.

Check MongoDB
Get-Service MongoDB

Expected:

Running
Check Backend
Invoke-RestMethod http://localhost:3001/api/health

Expected:

status : ok
Check AI
Invoke-RestMethod http://localhost:8000/health

Expected:

status : ok
Normal Startup Order

Always start in this order:

🟦 MongoDB
🟩 AI / FastAPI
🟨 Backend / Node.js
🟪 Frontend / React
🟥 Testing