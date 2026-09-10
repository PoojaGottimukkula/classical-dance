# Classical Dance Tutor (Bharatanatyam) — Prototype

This prototype is a minimal Python-based web application (FastAPI) with a simple static frontend showcasing a 3D model viewer, interactive syllabus, and basic gamification endpoints (progress & achievements).

Quick start

1. Create a virtual environment and install dependencies:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. Run the server:

```bash
uvicorn backend.main:app --reload --port 8000
```

3. Open http://localhost:8000 in your browser.

Notes
- Uploads are saved to `backend/uploads`.
- This is a starter prototype. Replace the sample glTF with Bharatanatyam motion-captured models for accurate teaching.
