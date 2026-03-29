from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, food, weight

app = FastAPI(title="Diet Planner API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(food.router)
app.include_router(weight.router)
