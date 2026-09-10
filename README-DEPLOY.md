Deployment notes — frontend on Vercel, backend on Render/Railway

1) Frontend (Vercel)
- This repo contains the static frontend under `backend/static`.
- Vercel config is `vercel.json`. Before deploying, replace the placeholder
  `https://YOUR_BACKEND_HOST` in `vercel.json` with your backend's public URL
  (for example, `https://classical-backend.onrender.com`).
- Steps:
  - Push this repo to GitHub.
  - In Vercel dashboard, Create New Project → Import Git Repository.
  - Set `Root Directory` to the repository root (no change needed) — `vercel.json`
    tells Vercel how to serve `backend/static`.
  - After first deploy, add the custom domain `learn-classical.com` in Vercel
    and follow the DNS setup steps.

2) Backend (Render / Railway)
- The FastAPI backend lives in `backend/main.py` and uses `requirements.txt`.
- Two simple options:
  A) Render (recommended)
    - Create a new Web Service on Render and connect GitHub repo.
    - Build Command: `pip install -r requirements.txt`
    - Start Command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
  B) Docker
    - Use the provided `Dockerfile` in the repo (optional) and deploy to any
      container host.

3) Make the frontend call the backend
- Option 1 (recommended): Keep `vercel.json`'s `/api/*` rewrite pointing to
  your backend URL — frontend code can call `/api/syllabus` and Vercel will
  proxy to the backend.
- Option 2: Set `window.API_BASE` in `backend/static/index.html` (before any
  calls to `app.js`) to the backend absolute URL to bypass proxying.

4) Domain: `learn-classical.com`
- Add the custom domain in Vercel dashboard for the frontend project and
  follow Vercel's DNS verification steps.

If you want, I can add a `render.yaml` and `Dockerfile` now and push the
changes so you can run a one-click deploy on Render or use `docker build`.
