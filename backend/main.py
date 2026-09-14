from fastapi import FastAPI
from routes import ingredients, preferences, recipes

app = FastAPI(
    title="Jood AI API",
    version="1.0.0"
)

app.include_router(ingredients.router)
app.include_router(preferences.router)
app.include_router(recipes.router)


@app.get("/")
def root():
    return {
        "status": "running",
        "message": "Jood AI backend is running"
    }