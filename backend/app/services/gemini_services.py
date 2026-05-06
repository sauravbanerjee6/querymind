import google.generativeai as genai
from google.generativeai import GenerativeModel
from app.connectors.base import SchemaSnapshot
from app.services.schema_services import build_schema_context


class GeminiService:
    """
    Manages Gemini chat sessions with schema context injected at start.
    Each DB connection gets its own chat session (history preserved).
    """

    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self._model = GenerativeModel("models/gemini-3.1-pro-preview")

    def start_session(self, schema: SchemaSnapshot):
        """
        Start a new multi-turn chat session pre-primed with the DB schema.
        Returns a ChatSession object — store this per user/connection.
        """
        schema_context = build_schema_context(schema)

        system_prompt = f"""
You are DataLens, an expert database analyst AI assistant.

You have access to the following database schema:

{schema_context}

Your capabilities:
1. Answer questions about the data by generating SQL queries
2. Identify trends and patterns from query results
3. Summarize and explain data in plain English
4. Suggest useful analyses the user might not have thought of

Rules:
- Always generate valid, read-only SELECT queries for the {schema.dialect} dialect
- When generating SQL, wrap it in a ```sql code block
- After generating SQL, wait for query results before drawing conclusions
- Be concise but insightful in your analysis
- If a question cannot be answered from the schema, say so clearly
        """.strip()

        return self._model.start_chat(history=[
            {
                "role": "user",
                "parts": [system_prompt],
            },
            {
                "role": "model",
                "parts": [
                    f"I'm ready to analyze your database. "
                    f"I can see {len(schema.tables)} tables. What would you like to know?"
                ],
            },
        ])

    async def chat(
        self,
        session,
        user_message: str,
        query_results: list[dict] | None = None,
    ) -> str:
        """
        Send a message (optionally with query results appended) and
        return the model's text response.
        """
        full_message = user_message

        # Append executed query results so Gemini can analyze them
        if query_results is not None:
            if len(query_results) == 0:
                full_message += "\n\n[Query returned 0 rows]"
            else:
                import json
                # Cap at 100 rows to stay within token limits
                preview = query_results[:100]
                full_message += (
                    f"\n\nQuery results ({len(query_results)} rows):\n"
                    f"```json\n{json.dumps(preview, indent=2, default=str)}\n```"
                )

        response = session.send_message(full_message)
        return response.text