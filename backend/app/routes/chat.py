from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.routes.connect import sessions, get_gemini
from app.services.query_services import run_query_from_response

router = APIRouter()


class ChatBody(BaseModel):
    session_id: str
    message: str


@router.post("/")
async def chat(body: ChatBody):
    """
    RAG pipeline:
      1. Send user question to Gemini (with schema context) → may return SQL
      2. Execute any SQL found against the real DB
      3. Feed results back to Gemini → natural language analysis
    """
    session = sessions.get(body.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found. Please reconnect.")

    connector = session["connector"]
    chat_session = session["chat_session"]
    gemini = get_gemini()

    # Step 1: Ask Gemini — it will likely generate a SQL query
    initial_response = await gemini.chat(chat_session, body.message)

    # Step 2: Extract and execute any SQL from the response
    query_results, executed_sql = await run_query_from_response(connector, initial_response)

    final_response = initial_response

    # Step 3: If SQL was executed, feed results back for analysis
    if query_results is not None:
        final_response = await gemini.chat(
            chat_session,
            body.message,
            query_results=query_results,
        )

    return {
        "response": final_response,
        "executed_sql": executed_sql,
        "row_count": len(query_results) if query_results is not None else None,
    }