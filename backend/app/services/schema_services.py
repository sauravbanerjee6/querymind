from app.connectors.base import SchemaSnapshot


def build_schema_context(schema: SchemaSnapshot) -> str:
    """
    Convert a SchemaSnapshot into a compact, token-efficient text block
    that Gemini can consume as context for SQL generation.

    Example output:
        DATABASE SCHEMA (postgresql) — 3 tables
        Introspected at: 2024-01-01T00:00:00Z

        Table: users (~10,000 rows)
          - id: uuid NOT NULL
          - email: character varying NOT NULL
    """
    lines = [
        f"DATABASE SCHEMA ({schema.dialect}) — {len(schema.tables)} tables",
        f"Introspected at: {schema.introspected_at}",
        "",
    ]

    for table in schema.tables:
        lines.append(f"Table: {table.table_name} (~{table.row_count:,} rows)")
        for col in table.columns:
            nullable = "nullable" if col.is_nullable == "YES" else "NOT NULL"
            lines.append(f"  - {col.column_name}: {col.data_type} {nullable}")
        lines.append("")

    return "\n".join(lines)