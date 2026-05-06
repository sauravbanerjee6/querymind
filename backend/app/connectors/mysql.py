import mysql.connector
import mysql.connector.cursor
from datetime import datetime, timezone
from typing import Any

from .base import BaseConnector, SchemaSnapshot, TableInfo, ColumnInfo


class MySQLConnector(BaseConnector):
    def __init__(self, host: str, port: int, database: str, user: str, password: str):
        self._config = dict(host=host, port=port, database=database, user=user, password=password)
        self._database = database
        self._conn = None

    async def connect(self) -> None:
        self._conn = mysql.connector.connect(**self._config)
        cur = self._conn.cursor()
        cur.execute("SELECT 1")
        cur.close()

    async def introspect_schema(self) -> SchemaSnapshot:
        tables: list[TableInfo] = []
        cur = self._conn.cursor(dictionary=True)

        # Fetch table names and estimated row counts
        cur.execute("""
            SELECT TABLE_NAME AS table_name, TABLE_ROWS AS row_count
            FROM information_schema.TABLES
            WHERE TABLE_SCHEMA = %s AND TABLE_TYPE = 'BASE TABLE'
            ORDER BY TABLE_NAME
        """, (self._database,))
        table_rows = cur.fetchall()

        for row in table_rows:
            table_name = row["table_name"]

            cur.execute("""
                SELECT COLUMN_NAME AS column_name,
                       DATA_TYPE   AS data_type,
                       IS_NULLABLE AS is_nullable
                FROM information_schema.COLUMNS
                WHERE TABLE_SCHEMA = %s AND TABLE_NAME = %s
                ORDER BY ORDINAL_POSITION
            """, (self._database, table_name))

            columns = [
                ColumnInfo(
                    column_name=c["column_name"],
                    data_type=c["data_type"],
                    is_nullable=c["is_nullable"],
                )
                for c in cur.fetchall()
            ]
            tables.append(TableInfo(
                table_name=table_name,
                columns=columns,
                row_count=int(row["row_count"] or 0),
            ))

        cur.close()
        return SchemaSnapshot(
            dialect="mysql",
            tables=tables,
            introspected_at=datetime.now(timezone.utc).isoformat(),
        )

    async def execute_query(self, sql: str) -> list[dict[str, Any]]:
        self._guard_read_only(sql)
        cur = self._conn.cursor(dictionary=True)
        cur.execute(sql)
        rows = cur.fetchall()
        cur.close()
        return rows

    async def disconnect(self) -> None:
        if self._conn:
            self._conn.close()
            self._conn = None