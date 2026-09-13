from fastapi import FastAPI

app = FastAPI(
    title="Jood AI API",
    version="1.0.0"
)

@app.get("/")
def root():
    return {
        "status": "running",
        "message": "Jood AI backend is running"
    }