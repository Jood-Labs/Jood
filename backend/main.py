from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import (
    ingredients,
    preferences,
    recipes,
    auth,
    bookmarks,
    profile,
    shopping_list,
)


app = FastAPI(
    title="Jood AI API",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(preferences.router)
app.include_router(ingredients.router)
app.include_router(recipes.router)
app.include_router(bookmarks.router)
app.include_router(shopping_list.router)


@app.get("/")
def root():
    return {
        "status": "running",
        "message": "Jood AI backend is running"
    }