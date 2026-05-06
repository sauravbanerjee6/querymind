from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any


@dataclass
class ColumnInfo:
    column_name: str
    data_type: str
    is_nullable: str  # "YES" | "NO"


@dataclass
class TableInfo:
    table_name: str
    columns: list[ColumnInfo]
    row_count: int = 0


@dataclass
class SchemaSnapshot:
    dialect: str
    tables: list[TableInfo]
    introspected_at: str


class BaseConnector(ABC):
    """
    Abstract base every DB connector must implement.
    Provides schema introspection and read-only query execution.
    """

    @abstractmethod
    async def connect(self) -> None:
        """Test connectivity — raise on failure."""

    @abstractmethod
    async def introspect_schema(self) -> SchemaSnapshot:
        """Return full schema: tables, columns, types, row counts."""

    @abstractmethod
    async def execute_query(self, sql: str) -> list[dict[str, Any]]:
        """Run a SELECT query and return rows as dicts."""

    @abstractmethod
    async def disconnect(self) -> None:
        """Release all connections."""

    def _guard_read_only(self, sql: str) -> None:
        """Reject any non-SELECT statement before execution."""
        normalized = sql.strip().upper()
        forbidden = ["INSERT", "UPDATE", "DELETE", "DROP", "TRUNCATE", "ALTER", "CREATE"]
        for keyword in forbidden:
            if normalized.startswith(keyword):
                raise ValueError(
                    f"Write operations are not allowed. Only SELECT queries are permitted."
                )