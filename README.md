# QueryMind

> AI-powered natural language interface for databases — ask questions in plain English, get SQL, results, and charts. Powered by Gemini.

QueryMind lets you connect any PostgreSQL, MySQL, or SQLite database and chat with your data. It introspects your schema, generates SQL via Gemini 2.0, executes it read-only, and automatically renders interactive charts — no SQL knowledge required.

---

## Features

- **Natural language to SQL** — describe what you want, Gemini writes the query
- **Auto-generated charts** — bar, line, area, and pie charts rendered automatically from query results
- **Schema-aware context** — Gemini understands your tables, columns, and types before you ask anything
- **Multi-turn chat** — ask follow-up questions, Gemini remembers the conversation
- **Read-only safety** — `INSERT`, `UPDATE`, `DELETE`, `DROP` and all write operations are blocked at the connector level
- **Multi-database support** — PostgreSQL, MySQL, and SQLite out of the box
- **Collapsible schema sidebar** — browse all tables and columns while you chat

---

## Tech Stack

| Layer     | Technology                                            |
|-----------|-------------------------------------------------------|
| Frontend  | React 19, TypeScript, Vite, Tailwind CSS v4, Recharts |
| Backend   | Python 3.12, FastAPI, Uvicorn, Pydantic               |
| AI        | Google Gemini 3.1 Pro                                 |
| Databases | PostgreSQL, MySQL, SQLite                             |

---

## Prerequisites

- **Node.js** v18+ — [nodejs.org](https://nodejs.org)
- **Python** 3.11+ — [python.org](https://python.org)
- **Git** — [git-scm.com](https://git-scm.com)
- A **Gemini API key** — free at [aistudio.google.com](https://aistudio.google.com)
- A running database (PostgreSQL, MySQL, or a SQLite `.db` file)

---

## Project Structure

```
querymind/
├── backend/
│   ├── app/
│   │   ├── connectors/     # DB connectors (postgres, mysql, sqlite)
│   │   ├── services/       # Gemini, schema, query logic
│   │   ├── routes/         # FastAPI route handlers
│   │   └── main.py
│   ├── .env                # You create this
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # useChat hook
│   │   ├── api/            # Axios client
│   │   └── App.tsx
│   ├── .env                # You create this
│   └── package.json
│
├── init_querymind.sh       # Creates sample DB schema + seed data
├── populate_orders.sh      # Populates 5500+ sample orders
└── README.md
```

---

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/your-username/querymind.git
cd querymind
```

### 2. Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

Create `backend/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
FRONTEND_URL=http://localhost:5173
PORT=3001
```

Start the server:

```bash
uvicorn app.main:app --reload --port 3001
```

API runs at `http://localhost:3001` · Swagger docs at `http://localhost:3001/docs`

---

### 3. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3001/api
```

Start the dev server:

```bash
npm run dev
```

App runs at `http://localhost:5174`

---

### 4. Connect and chat

1. Open `http://localhost:5174`
2. Select your database engine
3. Enter connection details and click **Connect →**
4. Start asking questions

---

## Sample Questions

```
Show monthly revenue trend from Jan 2024 to May 2026
Which product category drives the most revenue?
Who are the top 10 customers by lifetime spend?
What is the refund rate per category?
Compare average order value by region
How did May 2026 sales compare to April?
Which products are most frequently bought together?
```

---

## Environment Variables

**`backend/.env`**

| Variable         | Required | Default                 | Description                |
|------------------|----------|-------------------------|----------------------------|
| `GEMINI_API_KEY` | Yes      | —                       | Google Gemini API key      |
| `FRONTEND_URL`   | No       | `http://localhost:5173` | Allowed CORS origin        |
| `PORT`           | No       | `3001`                  | Backend port               |

**`frontend/.env`**

| Variable       | Required | Default                     | Description          |
|----------------|----------|-----------------------------|----------------------|
| `VITE_API_URL` | No       | `http://localhost:3001/api` | Backend API base URL |

---

## How It Works

```
Your question
     │
     ▼
Gemini gets your question + full DB schema as context
     │
     ▼
Gemini generates a read-only SQL SELECT query
     │
     ▼
Backend executes it against your database
     │
     ▼
Results fed back to Gemini for analysis
     │
     ▼
Plain-English response + auto-rendered chart
```

---

## Security

- All write operations (`INSERT`, `UPDATE`, `DELETE`, `DROP`, `TRUNCATE`, `ALTER`, `CREATE`) are rejected at the connector level before execution
- Database credentials are never persisted or logged — memory only, cleared on disconnect
- Gemini API key stays in `backend/.env` and is never sent to the frontend
- Sessions are in-memory — restarting the backend clears everything

---