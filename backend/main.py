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
    "title": "Bharatanatyam Syllabus (Refined Prototype)",
    "description": "Structured theory and practical lessons for learners, from foundations to pro-level repertoire.",
    "tiers": [
        {
            "id": "foundations",
            "title": "Foundations (Angika Suddhi)",
            "summary": "Posture, Araimandi (half-sitting), Muzhumandi (full sitting), body alignment and balance.",
            "lessons": [
                {
                    "id": "araimandi",
                    "title": "Araimandi — Basic Posture",
                    "notes": "Araimandi is a fundamental half-sitting posture with knees turned out and a straight spine. Keep weight evenly distributed and chin neutral.",
                    "practiceSteps": [
                        "Stand with feet turned out",
                        "Bend knees to form a half-sitting position",
                        "Keep heels on the ground and weight centered",
                        "Hold for 30–60 seconds, repeat 5 times"
                    ],
                    "animationHint": "araimandi_pose"
                },
                {
                    "id": "muzhumandi",
                    "title": "Muzhumandi — Full Sitting",
                    "notes": "Muzhumandi is a deeper squat used in several adavus and performances. Maintain alignment and breathing.",
                    "practiceSteps": ["Slow descent into full squat","Keep knees apart and back straight","Practice rising and settling smoothly"],
                    "animationHint": "muzhumandi_pose"
                }
            ]
        },
        {
            "id": "adavus",
            "title": "Adavu Syllabus",
            "summary": "Basic coordinated footwork sequences grouped by 'adavu' types and tempos (kalam).",
            "lessons": [
                {"id":"tatta_1","title":"Tatta Adavu 1","notes":"Basic Tatta pattern — foundation stamping movement (variation 1).","practiceSteps":["Stand in araimandi","Mark the foot pattern slowly","Keep arms controlled"],"animationHint":"tatta_1"},
                {"id":"tatta_2","title":"Tatta Adavu 2","notes":"Tatta variation 2 with slight change in arms/footwork.","practiceSteps":["Practice counts 1–8","Repeat 16 times slowly","Increase tempo gradually"],"animationHint":"tatta_2"},
                {"id":"tatta_3","title":"Tatta Adavu 3","notes":"Tatta variation 3 emphasizing tempo change.","practiceSteps":["Use tala counting","Maintain posture"],"animationHint":"tatta_3"},
                {"id":"tatta_4","title":"Tatta Adavu 4","notes":"Tatta variation 4 — additional arm motif.","practiceSteps":["Coordinate arms with footwork","Use mirror to check symmetry"],"animationHint":"tatta_4"},
                {"id":"tatta_5","title":"Tatta Adavu 5","notes":"Tatta variation 5 — crossing steps added.","practiceSteps":["Mark crossing foot pattern slowly","Align gaze and hands"],"animationHint":"tatta_5"},
                {"id":"tatta_6","title":"Tatta Adavu 6","notes":"Tatta variation 6 — syncopated stamping.","practiceSteps":["Work on rhythm accuracy","Practice with a metronome"],"animationHint":"tatta_6"},
                {"id":"tatta_7","title":"Tatta Adavu 7","notes":"Tatta variation 7 — dynamic armwork.","practiceSteps":["Emphasize shoulder-stability","Slow practice then speed up"],"animationHint":"tatta_7"},
                {"id":"tatta_8","title":"Tatta Adavu 8","notes":"Tatta variation 8 — combined elements from previous tattas.","practiceSteps":["Sequence all previous tattas","Practice transitions smoothly"],"animationHint":"tatta_8"},
                {"id":"kuditta_mettu","title":"Kuditta Mettu (Kuditta Metta)","notes":"A variant with jumping and stamping — used in many adavu sequences.","practiceSteps":["Warm up ankles","Start slow jumps in 1 kalam","Maintain araimandi"],"animationHint":"kuditta_mettu"},
                {"id":"paraval","title":"Paraval Adavu","notes":"Paraval style adavu — lateral movements and rhythmic accents.","practiceSteps":["Practice lateral steps","Sync with hand gestures"],"animationHint":"paraval_adavu"},
                {"id":"natta_adavu","title":"Natta Adavu","notes":"Natta — quick stamping patterns often used as linking sequences.","practiceSteps":["Keep tempo steady","Coordinate head and eye movements"],"animationHint":"natta_adavu"},
                {"id":"tatta_mettu","title":"Tatta Mettu","notes":"Combined Tatta and Mettu elements — used in medium-tempo sequences.","practiceSteps":["Alternate between tatta and mettu","Count tala carefully"],"animationHint":"tatta_mettu"},
                {"id":"kudittamettu_variant","title":"Kudittamettu Variant","notes":"Another common mettu variant with hop and stamp.","practiceSteps":["Practice hop-land mechanics","Keep knees soft on landing"],"animationHint":"kudittamettu_variant"},
                {"id":"samyuta_adavus","title":"Samyuta-style adavus","notes":"Adavus that use combined hand gestures and footwork (Samyuta influences).","practiceSteps":["Combine hastas and foot patterns","Practice slowly then speed up"],"animationHint":"samyuta_adavus"},
                {"id":"mukha_adavu","title":"Mukha adavu (face-oriented)","notes":"Adavus focusing on expressions with accompanying footwork.","practiceSteps":["Practice facial expressions separately","Integrate with footwork"],"animationHint":"mukha_adavu"},
                {"id":"theerthaka_adavu","title":"Theerthaka/Chari Adavu","notes":"Traveling steps and chari movements used to traverse the stage.","practiceSteps":["Measure stage distance","Practice smooth transitions"],"animationHint":"chari_adavu"},
                {"id":"kuthu_adavu","title":"Kuthu/Tempo Adavu","notes":"High-energy rhythmic adavu with strong stamping.","practiceSteps":["Build stamina","Practice with percussion accompaniment"],"animationHint":"kuthu_adavu"},
                {"id":"other_common_adavus","title":"Other common adavus","notes":"Includes Mandi, Kudutta, Nattu variants, Chari, Kaaladi, etc. — multiple school-specific names.","practiceSteps":["Consult guru/school syllabus for local names","Practice each slowly"],"animationHint":"adavus_misc"}
            ]
        },
        {
            "id": "mudras",
            "title": "Mudra Dictionary",
            "summary": "Asamyuta (single-hand) and Samyuta (double-hand) hastas with meanings and common usages.",
            "lessons": [
                {"id":"pataka","title":"Pataka","notes":"Flat hand with fingers together — base for many gestures.","practiceSteps":["Hold fingers straight and together","Keep thumb slightly bent"],"animationHint":"mudra_pataka"},
                {"id":"tripataka","title":"Tripataka","notes":"Pataka with ring finger bent — denotes crown, tree, arrow.","practiceSteps":["Bend the ring finger while holding others straight"],"animationHint":"mudra_tripataka"},
                {"id":"ardhapataka","title":"Ardhapataka","notes":"Half-Pataka — little finger bent to form a partial flat hand.","practiceSteps":["Bend the little finger while keeping other fingers straight"],"animationHint":"mudra_ardhapataka"},
                {"id":"kartarimukha","title":"Kartarimukha","notes":"Scissor-like hand used for separation, lightning, corner.","practiceSteps":["Spread index and middle finger like scissors"],"animationHint":"mudra_kartarimukha"},
                {"id":"mayura","title":"Mayura","notes":"Peacock — ring finger touches thumb creating a beak-like shape.","practiceSteps":["Touch ring finger tip to thumb"],"animationHint":"mudra_mayura"},
                {"id":"ardhachandra","title":"Ardhachandra","notes":"Half-moon shape used for moon, crown, or receptacle.","practiceSteps":["Curve the thumb away from fingers to form a crescent"],"animationHint":"mudra_ardhachandra"},
                {"id":"arala","title":"Arala","notes":"Bent hand — a gentle bend of index finger to show drinking, picking.","practiceSteps":["Bend the index finger from the base knuckle"],"animationHint":"mudra_arala"},
                {"id":"shikhara","title":"Shikhara","notes":"Fist with extended thumb — roof, mountain, or holding objects.","practiceSteps":["Make a fist and keep thumb extended upright"],"animationHint":"mudra_shikhara"},
                {"id":"mushti","title":"Mushti","notes":"Closed fist — strength, anger, holding.","practiceSteps":["Clench a relaxed, firm fist"],"animationHint":"mudra_mushti"},
                {"id":"kapitta","title":"Kapitta","notes":"Index and middle finger slightly joined — holding a garland or a flower.","practiceSteps":["Touch tips of index and middle fingers to thumb lightly"],"animationHint":"mudra_kapitta"},
                {"id":"katakamukha","title":"Katakamukha","notes":"Three-finger pinch used for holding a bracelet or plucking flowers.","practiceSteps":["Bring index, middle and thumb together to form a small bowl"],"animationHint":"mudra_katakamukha"},
                {"id":"suchi","title":"Suchi","notes":"Pointing finger — used for precise indication.","practiceSteps":["Keep the index finger straight and other fingers closed"],"animationHint":"mudra_suchi"},
                {"id":"chandrakala","title":"Chandrakala","notes":"Moon's crescent formed by bending the thumb at the base — used for moon, ornament.","practiceSteps":["Place thumb across the palm creating a crescent gap"],"animationHint":"mudra_chandrakala"},
                {"id":"padma","title":"Padma (Alapadma)","notes":"Lotus — fingers spread and curved gracefully.","practiceSteps":["Spread fingers and curl slightly to form a blossom"],"animationHint":"mudra_padma"},
                {"id":"chatura","title":"Chatura","notes":"Four-fingered shape used for counting or offering.","practiceSteps":["Extend four fingers together with thumb closed"],"animationHint":"mudra_chatura"},
                {"id":"bhramara","title":"Bhramara","notes":"Bee — used for small insect or delicate actions.","practiceSteps":["Touch tip of thumb to tip of middle finger while other fingers curl"],"animationHint":"mudra_bhramara"},
                {"id":"hamsasya","title":"Hamsasya","notes":"Swan's beak — fine pinching gesture for delicate actions.","practiceSteps":["Touch tip of thumb to tip of index finger"],"animationHint":"mudra_hamsasya"},
                {"id":"hamsapaksha","title":"Hamsapaksha","notes":"Swan's wing — used for wings or movement.","practiceSteps":["Extend little and ring fingers while folding others slightly"],"animationHint":"mudra_hamsapaksha"},
                {"id":"karkata","title":"Karkata","notes":"Interlocked fingers — used for holding or pulling actions.","practiceSteps":["Interlock fingers of both hands or curl fingers together"],"animationHint":"mudra_karkata"},
                {"id":"mrigashirsha","title":"Mrigashirsha","notes":"Deer-head — tip of index and middle finger joined with thumb.","practiceSteps":["Create a soft hooked shape with index and middle fingers"],"animationHint":"mudra_mrigashirsha"},
                {"id":"simhamukha","title":"Simhamukha","notes":"Lion face — used for roaring or ferocity.","practiceSteps":["Open mouth gesture with thumb and fingers forming wide shape"],"animationHint":"mudra_simhamukha"},
                {"id":"alamkar","title":"Alamkar","notes":"Ornament-holding variations used in decoration gestures.","practiceSteps":["Practice small decorative finger adjustments"],"animationHint":"mudra_alamkar"},
                {"id":"srivatsa","title":"Srivatsa","notes":"Conventional decorative variation used in iconography.","practiceSteps":["Form compound shapes by combining fingers"],"animationHint":"mudra_srivatsa"},
                {"id":"trishula","title":"Trishula","notes":"Trident-shaped configuration used symbolically.","practiceSteps":["Form three-pronged shapes using fingers"],"animationHint":"mudra_trishula"},
                {"id":"kunkuma","title":"Kunkuma","notes":"Applying vermilion — used in worship actions.","practiceSteps":["Mimic applying a small dot with ring finger"],"animationHint":"mudra_kunkuma"},
                {"id":"samyuta_hint","title":"Samyuta (two-hand) hint","notes":"Examples of combined two-hand gestures are part of Samyuta Hastas.","practiceSteps":["Combine single-hand forms on both hands to create Samyuta shapes"],"animationHint":"mudra_samyuta_hint"}
            ]
        },
        {
            "id": "abhinaya",
            "title": "Abhinaya & Navarasas",
            "summary": "Facial expression, eye movements, neck exercises, and the nine rasas used in storytelling.",
            "lessons": [
                {"id":"navarasa","title":"Navarasa Overview","notes":"The nine emotions: Shringara, Hasya, Karuna, Raudra, Veera, Bhayanaka, Bibhatsa, Adbhuta, Shanta.","practiceSteps":["Practice each rasa with minimal movement","Record and compare"],"animationHint":"expression_idle"}
            ]
        },
        {
            "id": "repertoire",
            "title": "Repertoire (Margam)",
            "summary": "Typical concert structure: Alarippu, Jatiswaram, Shabdam, Varnam, Padam, Tillana.",
            "lessons": [
                {"id":"alarippu","title":"Alarippu","notes":"Opening invocatory item emphasizing posture and footwork.","practiceSteps":[],"animationHint":"alarippu"},
                {"id":"tillana","title":"Tillana","notes":"Fast rhythmic finale with strong nritta (pure dance).","practiceSteps":[],"animationHint":"tillana"}
            ]
        }
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
