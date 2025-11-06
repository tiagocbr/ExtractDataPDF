from dotenv import load_dotenv
load_dotenv()  # 👈 primeiro de tudo!

from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from app.routes.extract import router as extract_router

app = FastAPI(title="Enter AI Fellowship - PDF Extractor")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(extract_router, prefix="/api")

@app.get("/")
def root():
    return {"message": "API running. Use /api/extract to extract data."}
