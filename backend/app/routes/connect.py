import uuid
from typing import Literal, Annotated
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.connectors.base import BaseConnector, SchemaSnapshot
from app.connectors.postgres import PostgresConnector
from app.connectors.mysql import MySQLConnector
from app.connectors.sqlite import SQLiteConnector
from app.services.gemini_services import GeminiService

router = APIRouter()

# In-memory session store: session_id → {connector, chat_session, schema}
# In production, replace with Redis or a proper session backend.
sessions: dict[str, dict] = {}


# ── Pydantic models for request validation ──────────────────────────────────

class PostgresConfig(BaseModel):
    dialect: Literal["postgresql"]
    host: str
    port: int = 5432
    database: str
    user: str
    password: str

class MySQLConfig(BaseModel):
    dialect: Literal["mysql"]
    host: str
    port: int = 3306
    database: str
    user: str
    password: str

class SQLiteConfig(BaseModel):
    dialect: Literal["sqlite"]
    file_path: str

# Use a union — FastAPI will validate against the correct model via `dialect`
from pydantic import RootModel
ConnectBody = Annotated[
    PostgresConfig | MySQLConfig | SQLiteConfig,
    Field(discriminator="dialect"),
]


# ── Routes ───────────────────────────────────────────────────────────────────

_gemini: GeminiService | None = None

def get_gemini() -> GeminiService:
    global _gemini
    if _gemini is None:
        import os
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY is not set in environment")
        _gemini = GeminiService(api_key)
    return _gemini


@router.post("/")
async def connect(body: ConnectBody):  # type: ignore[valid-type]
    """Connect to a database, introspect its schema, start a Gemini session."""
    connector: BaseConnector

    if body.dialect == "postgresql":
        connector = PostgresConnector(
            host=body.host, port=body.port,
            database=body.database, user=body.user, password=body.password,
        )
    elif body.dialect == "mysql":
        connector = MySQLConnector(
            host=body.host, port=body.port,
            database=body.database, user=body.user, password=body.password,
        )
    else:
        connector = SQLiteConnector(file_path=body.file_path)

    try:
        await connector.connect()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Connection failed: {str(e)}")

    schema: SchemaSnapshot = await connector.introspect_schema()
    chat_session = get_gemini().start_session(schema)

    session_id = str(uuid.uuid4())
    sessions[session_id] = {
        "connector": connector,
        "chat_session": chat_session,
        "schema": schema,
    }

    return {
        "session_id": session_id,
        "schema": {
            "dialect": schema.dialect,
            "tables": [
                {
                    "table_name": t.table_name,
                    "row_count": t.row_count,
                    "columns": [
                        {"column_name": c.column_name, "data_type": c.data_type, "is_nullable": c.is_nullable}
                        for c in t.columns
                    ],
                }
                for t in schema.tables
            ],
            "introspected_at": schema.introspected_at,
        },
        "message": f"Connected to {body.dialect}. Found {len(schema.tables)} tables.",
    }


@router.delete("/{session_id}")
async def disconnect(session_id: str):
    """Disconnect and clean up a session."""
    session = sessions.pop(session_id, None)
    if session:
        await session["connector"].disconnect()
    return {"message": "Disconnected"}