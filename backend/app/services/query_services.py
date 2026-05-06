import re
from typing import Any
from app.connectors.base import BaseConnector


def extract_sql(text: str) -> str | None:
    """
    Extract a SQL query from a Gemini response that may contain
    markdown code fences, explanations, etc.
    Matches: ```sql ... ``` blocks.
    """
    match = re.search(r"```sql\s*([\s\S]*?)```", text, re.IGNORECASE)
    return match.group(1).strip() if match else None


async def run_query_from_response(
    connector: BaseConnector,
    gemini_response: str,
) -> tuple[list[dict[str, Any]] | None, str | None]:
    """
    Extract and execute any SQL found in a Gemini response.
    Returns (rows, sql) — both None if no SQL was found.
    """
    sql = extract_sql(gemini_response)
    if not sql:
        return None, None

    rows = await connector.execute_query(sql)
    return rows, sql