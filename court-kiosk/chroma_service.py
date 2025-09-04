import os
import openai
import chromadb
from chromadb.config import Settings
from fastapi import FastAPI
from pydantic import BaseModel

openai.api_key = os.getenv("OPENAI_API_KEY")

chroma_client = chromadb.Client(Settings(persist_directory="./chroma_db"))
collection = chroma_client.get_or_create_collection("code_chunks")

app = FastAPI()

class SearchRequest(BaseModel):
    query: str
    top_k: int = 5

def get_embedding(text):
    response = openai.Embedding.create(
        input=text,
        model="text-embedding-ada-002"
    )
    return response["data"][0]["embedding"]

@app.post("/ingest")
async def ingest_code():
    for root, _, files in os.walk("./court-kiosk/backend"):
        for file in files:
            if file.endswith(".js"):
                with open(os.path.join(root, file), "r") as f:
                    code = f.read()
                    lines = code.splitlines()
                    for i in range(0, len(lines), 20):
                        chunk = "\n".join(lines[i:i+20])
                        embedding = get_embedding(chunk)
                        collection.add(
                            documents=[chunk],
                            embeddings=[embedding],
                            metadatas=[{"file": file, "start_line": i+1}]
                        )
    return {"status": "ingested"}

@app.post("/search")
async def search_code(req: SearchRequest):
    embedding = get_embedding(req.query)
    results = collection.query(
        query_embeddings=[embedding],
        n_results=req.top_k
    )
    return results 