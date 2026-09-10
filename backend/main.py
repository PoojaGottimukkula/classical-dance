from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
import json
from typing import Optional

BASE_DIR = os.path.dirname(__file__)
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
DATA_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

PROGRESS_FILE = os.path.join(DATA_DIR, "progress.json")
ACHIEVEMENTS_FILE = os.path.join(DATA_DIR, "achievements.json")
MAPPINGS_FILE = os.path.join(DATA_DIR, "mappings.json")

def _read_json_or_empty(path):
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def _write_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

app = FastAPI(title="Classical Dance Tutor - Prototype")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static frontend
app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

SYLLABUS = {
    "title": "Bharatanatyam Syllabus (Prototype)",
    "tiers": [
        {"id": "foundations", "title": "Foundations (Angika Suddhi)", "summary": "Posture, Araimandi, Muzhumandi, balance"},
        {"id": "adavus", "title": "Adavu Syllabus", "summary": "Basic footwork groups across 3 kalams"},
        {"id": "mudras", "title": "Mudra Dictionary", "summary": "Asamyuta & Samyuta hastas with meanings"},
        {"id": "abhinaya", "title": "Abhinaya & Navarasas", "summary": "Expression, eye & neck exercises"},
        {"id": "repertoire", "title": "Repertoire (Margam)", "summary": "Alarippu through Tillana"}
    ]
}


@app.get("/", response_class=HTMLResponse)
def index():
    html_path = os.path.join(BASE_DIR, "static", "index.html")
    if os.path.exists(html_path):
        return FileResponse(html_path)
    return HTMLResponse("<h1>Classical Dance Tutor</h1><p>Upload a frontend to /backend/static</p>")


@app.get("/api/syllabus")
def get_syllabus():
    return JSONResponse(SYLLABUS)


@app.get("/api/syllabus/{tier_id}")
def get_tier(tier_id: str):
    for t in SYLLABUS["tiers"]:
        if t["id"] == tier_id:
            return JSONResponse(t)
    raise HTTPException(status_code=404, detail="Tier not found")


@app.post("/api/upload-gltf")
async def upload_gltf(file: UploadFile = File(...)):
    filename = os.path.basename(file.filename)
    save_path = os.path.join(UPLOAD_DIR, filename)
    with open(save_path, "wb") as out:
        shutil.copyfileobj(file.file, out)
    url = f"/uploads/{filename}"
    return {"url": url}


@app.post("/api/mappings")
async def save_mapping(model_url: str = Form(...), mapping_json: str = Form(...)):
    mappings = _read_json_or_empty(MAPPINGS_FILE)
    mappings[model_url] = json.loads(mapping_json)
    _write_json(MAPPINGS_FILE, mappings)
    return {"ok": True, "mappings": mappings}


@app.get("/api/mappings")
def get_mappings():
    return _read_json_or_empty(MAPPINGS_FILE)


@app.post("/api/progress")
def save_progress(user_id: str = Form(...), lesson: str = Form(...), progress: float = Form(...)):
    data = _read_json_or_empty(PROGRESS_FILE)
    user = data.get(user_id, {})
    user[lesson] = {"progress": float(progress)}
    data[user_id] = user
    _write_json(PROGRESS_FILE, data)
    return {"ok": True, "progress": data[user_id]}


@app.get("/api/progress/{user_id}")
def get_progress(user_id: str):
    data = _read_json_or_empty(PROGRESS_FILE)
    return data.get(user_id, {})


@app.post("/api/achievements")
def add_achievement(user_id: str = Form(...), achievement: str = Form(...)):
    data = _read_json_or_empty(ACHIEVEMENTS_FILE)
    arr = data.get(user_id, [])
    if achievement not in arr:
        arr.append(achievement)
    data[user_id] = arr
    _write_json(ACHIEVEMENTS_FILE, data)
    return {"ok": True, "achievements": arr}


@app.get("/api/achievements/{user_id}")
def get_achievements(user_id: str):
    data = _read_json_or_empty(ACHIEVEMENTS_FILE)
    return data.get(user_id, [])
