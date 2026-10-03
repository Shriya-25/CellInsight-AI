# CellInsight AI

![CellInsight AI](https://img.shields.io/badge/Status-Active-success) ![License](https://img.shields.io/badge/License-MIT-blue)

**CellInsight AI** is an advanced, web-based AI-assisted platform designed to automate the analysis of peripheral blood smear microscopy images. It provides cell counting, classification, and image quality assessment to aid pathologists and lab technicians in diagnosis.

## 🩸 Core Features

*   **Automated Cell Detection**: Detects Red Blood Cells (RBCs), White Blood Cells (WBCs), and Platelets using a custom-trained Ultralytics YOLOv8 model.
*   **WBC Subtyping**: Classifies detected WBCs into 5 specific subtypes (Basophil, Erythroblast, Monocyte, Myeloblast, Segmented Neutrophil) using a fine-tuned TensorFlow EfficientNet model.
*   **Image Quality Assessment**: Automatically assesses uploaded microscopy images for focus (Laplacian Variance) and exposure (Brightness), flagging poor quality inputs.
*   **Intelligent Review Prioritization**: Calculates a unique `reviewPriority` score for each cell and case, automatically flagging anomalous findings (e.g., myeloblasts indicating potential AML) for urgent pathologist review.
*   **End-to-End Workflow**: Complete patient management, case creation, AI analysis, manual review queue, and final clinical report generation (PDF).
*   **Role-Based Access**: Secured via JWT authentication with distinct roles (Technician, Pathologist/Doctor, Admin).

## 🛠️ Technology Stack

*   **Frontend**: React 19, Vite, TailwindCSS
*   **Backend**: Node.js, Express.js 5
*   **Database**: MongoDB (Mongoose ORM)
*   **ML & Inference API**: Python, FastAPI, Ultralytics YOLO, TensorFlow/Keras, OpenCV

## 🚀 Getting Started

Follow these steps to run the complete stack locally.

### Prerequisites
*   Node.js (v18+)
*   Python (3.9+)
*   MongoDB running locally on port 27017

### 1. Start MongoDB
Ensure your MongoDB service is running:
```powershell
# Windows
Start-Service MongoDB
```

### 2. Start the AI / Inference Service
Navigate to the `inference` directory and start the FastAPI server:
```powershell
cd inference
# Ensure your virtual environment (.venv) is activated and dependencies installed
# Start the Uvicorn server:
& ".\.venv\Scripts\uvicorn.exe" main:app --reload --port 8000
```
*Health Check: `http://localhost:8000/health`*

### 3. Start the Node.js Backend
Open a new terminal, navigate to the backend, and start the Express server:
```powershell
cd Blood-Smear-Analysis-backend
# Install dependencies if not done already: npm install
node src/server.js
```
*Health Check: `http://localhost:3001/api/health`*

### 4. Start the React Frontend
Open a new terminal, navigate to the frontend, and start Vite:
```powershell
cd Blood-Smear-Analysis-frontend
# Install dependencies if not done already: npm install
npm run dev
```
*Access UI: `http://localhost:5173`*

## 📁 System Architecture
1.  **Frontend (React)**: Handles user interaction, file selection, and displays results/reports.
2.  **Backend (Express)**: Manages authentication, database operations, and proxies image uploads to the inference service via `multer`.
3.  **Inference (FastAPI)**: Receives images in-memory, processes them through OpenCV (quality), YOLO (detection), and EfficientNet (classification), returning a structured JSON result.
4.  **Database (MongoDB)**: Stores patient metadata, case history, AI analysis results, and system audit logs.

## ⚠️ Disclaimer
**For Research & Demonstration Only.** CellInsight AI is a prototype designed to demonstrate AI-assisted medical workflows. It performs descriptive analysis and provides decision support. It is **not** an autonomous medical diagnostic device. Final interpretation and clinical correlation must always be performed by a qualified healthcare professional.
