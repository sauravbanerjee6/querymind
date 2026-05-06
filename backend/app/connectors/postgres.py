import psycopg2
import psycopg2.extras
from datetime import datetime, timezone
from typing import Any

from .base import BaseConnector, SchemaSnapshot, TableInfo, ColumnInfo


class PostgresConnector(BaseConnector):
    def __init__(self, host: str, port: int, database: str, user: str, password: str):
        self._config = dict(host=host, port=port, dbname=database, user=user, password=password)
        self._conn = None

    async def connect(self) -> None:
        # psycopg2 is synchronous; wrap in try for clean error messages
        self._conn = psycopg2.connect(**self._config)
        with self._conn.cursor() as cur:
            cur.execute("SELECT 1")

    async def introspect_schema(self) -> SchemaSnapshot:
        tables: list[TableInfo] = []

        with self._conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            # Fetch all user-defined tables in the public schema
            cur.execute("""
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
                ORDER BY table_name
            """)
            table_names = [row["table_name"] for row in cur.fetchall()]

            for table_name in table_names:
                # Column metadata
                cur.execute("""
                    SELECT column_name, data_type, is_nullable
                    FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = %s
                    ORDER BY ordinal_position
                """, (table_name,))
                columns = [
                    ColumnInfo(
                        column_name=row["column_name"],
                        data_type=row["data_type"],
                        is_nullable=row["is_nullable"],
                    )
                    for row in cur.fetchall()
                ]

                # Fast approximate row count via pg_class (no seq scan)
                cur.execute(
                    "SELECT reltuples::bigint AS estimate FROM pg_class WHERE relname = %s",
                    (table_name,),
                )
                row_count = cur.fetchone()
                tables.append(TableInfo(
                    table_name=table_name,
                    columns=columns,
                    row_count=int(row_count["estimate"]) if row_count else 0,
                ))

        return SchemaSnapshot(
            dialect="postgresql",
            tables=tables,
            introspected_at=datetime.now(timezone.utc).isoformat(),
        )

    async def execute_query(self, sql: str) -> list[dict[str, Any]]:
        self._guard_read_only(sql)
        with self._conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(sql)
            return [dict(row) for row in cur.fetchall()]

    async def disconnect(self) -> None:
        if self._conn:
            self._conn.close()
            self._conn = None