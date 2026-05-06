import sqlite3
from datetime import datetime, timezone
from typing import Any

from .base import BaseConnector, SchemaSnapshot, TableInfo, ColumnInfo


class SQLiteConnector(BaseConnector):
    def __init__(self, file_path: str):
        self._file_path = file_path
        self._conn: sqlite3.Connection | None = None

    async def connect(self) -> None:
        # Open in read-only URI mode — safety at the driver level
        self._conn = sqlite3.connect(
            f"file:{self._file_path}?mode=ro",
            uri=True,
            check_same_thread=False,
        )
        self._conn.row_factory = sqlite3.Row
        self._conn.execute("SELECT 1")

    async def introspect_schema(self) -> SchemaSnapshot:
        tables: list[TableInfo] = []
        cur = self._conn.cursor()

        # sqlite_master holds the schema for all user tables
        cur.execute("""
            SELECT name AS table_name FROM sqlite_master
            WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
            ORDER BY name
        """)
        table_names = [row["table_name"] for row in cur.fetchall()]

        for table_name in table_names:
            # PRAGMA table_info returns column metadata
            cur.execute(f"PRAGMA table_info({table_name})")
            columns = [
                ColumnInfo(
                    column_name=row["name"],
                    data_type=row["type"] or "TEXT",
                    is_nullable="NO" if row["notnull"] else "YES",
                )
                for row in cur.fetchall()
            ]

            cur.execute(f'SELECT COUNT(*) AS cnt FROM "{table_name}"')
            row_count = cur.fetchone()["cnt"]

            tables.append(TableInfo(
                table_name=table_name,
                columns=columns,
                row_count=row_count,
            ))

        return SchemaSnapshot(
            dialect="sqlite",
            tables=tables,
            introspected_at=datetime.now(timezone.utc).isoformat(),
        )

    async def execute_query(self, sql: str) -> list[dict[str, Any]]:
        self._guard_read_only(sql)
        cur = self._conn.cursor()
        cur.execute(sql)
        return [dict(row) for row in cur.fetchall()]

    async def disconnect(self) -> None:
        if self._conn:
            self._conn.close()
            self._conn = None