from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import shutil
from typing import Optional

from services.rag_service import RAGService
from services.agent_service import AgentService

app = FastAPI(title="AI Code Assistant API - Python Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

rag_service = RAGService()
agent_service = AgentService()

class QueryRequest(BaseModel):
    query: str
    context: Optional[str] = None
    
class AgentRequest(BaseModel):
    intent: str
    code: str
    context: Optional[str] = None

@app.get("/")
def health_check():
    return {"status": "up"}

@app.post("/rag/query")
async def rag_query(req: QueryRequest):
    try:
        response = rag_service.query(req.query, req.context)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/agent/execute")
async def agent_execute(req: AgentRequest):
    try:
        response = agent_service.execute(req.intent, req.code, req.context)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/embed")
async def embed_repo(file: UploadFile = File(...)):
    if not file.filename.endswith(".zip"):
        raise HTTPException(status_code=400, detail="Only ZIP files are supported.")
    
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, file.filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        stats = rag_service.embed_repository(file_path)
        return {"message": "Repository embedded successfully", "stats": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
