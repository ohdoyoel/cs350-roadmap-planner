from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db.client import close_database, init_database, ping_database
from fastapi_app.routers.courses import router as courses_router
from fastapi_app.routers.examples import router as examples_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_database()
    yield
    await close_database()


app = FastAPI(
    title="Roadmap Planner API",
    version="0.1.0",
    lifespan=lifespan,
)

# 개발 단계에서는 모든 origin 허용. production에서는 좁힐 것.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(courses_router)
app.include_router(examples_router)


@app.get("/")
async def read_root() -> dict[str, str]:
    return {"message": "Roadmap Planner API"}


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/db/health")
async def database_health_check() -> dict[str, str]:
    await ping_database()
    return {"status": "ok"}
