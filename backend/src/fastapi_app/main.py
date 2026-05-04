from contextlib import asynccontextmanager

from fastapi import FastAPI

from db.client import close_database, init_database, ping_database
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
