from fastapi import FastAPI, File, UploadFile, Request
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from ultralytics import YOLO
import shutil
import os
import uuid
import gdown

app = FastAPI()

# --- Cek dan unduh model jika belum ada ---
model_path = "models/cabcab.pt"
if not os.path.exists(model_path):
    os.makedirs("models", exist_ok=True)
    url = "https://drive.google.com/uc?id=1xpNWtJv-LYAbwqT1ezBbadUiKW8OplNd"
    gdown.download(url, model_path, quiet=False)

# --- Load model YOLO ---
model = YOLO(model_path)

# --- Setup statis dan template ---
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.get("/", response_class=HTMLResponse)
def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/upload/")
async def upload(file: UploadFile = File(...)):
    file_id = str(uuid.uuid4())
    file_path = f"{UPLOAD_FOLDER}/{file_id}_{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    results = model(file_path)
    result_img_path = f"{file_path}_result.jpg"
    results[0].save(filename=result_img_path)

    return FileResponse(result_img_path, media_type="image/jpeg")
