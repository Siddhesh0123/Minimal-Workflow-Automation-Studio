# Flowline

> A minimal visual workflow automation studio (lightweight Zapier/n8n).

Flowline is a beautiful, intuitive drag-and-drop workflow builder. It allows you to connect triggers (schedules, webhooks, manual triggers) to actions (HTTP requests, data transformations, emails) and apply logic like conditional branching and delays.

## Features

- **Drag-and-Drop Canvas**: Built on React Flow for seamless node management and animated connecting edges.
- **Node Types**:
  - **Triggers**: Schedule (cron), Webhook, Manual.
  - **Actions**: HTTP Request, Send Email, Transform Data (JS execution), Write to CSV/JSON.
  - **Logic**: Condition, Delay.
- **Inspector Panel**: Context-aware configuration for any selected node.
- **Execution Engine**: Topological sort and Directed Acyclic Graph (DAG) execution.
- **Live Run Visualization**: Edges pulse and nodes glow as data flows through them during execution (using Server-Sent Events).
- **Run History**: Detailed per-node execution logs, durations, and status tracking.
- **Templates Gallery**: Pre-built workflow templates you can instantly clone.
- **Command Palette**: Press `Cmd+K` (or `Ctrl+K`) for fast node addition and navigation.
- **Design System**: Minimalist aesthetics, calm colors, Inter typeface, dark mode support.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS v4, React Flow, Framer Motion, Zustand.
- **Backend**: Node.js, Express, TypeScript.
- **Database**: SQLite with Prisma ORM.
- **Scheduling**: node-cron.

## Setup Instructions

1. **Install Dependencies**
   From the root folder (frontend):
   ```bash
   npm install
   ```
   From the `server/` folder (backend):
   ```bash
   cd server
   npm install
   ```

2. **Initialize Database**
   In the `server/` folder:
   ```bash
   npx prisma generate
   npx prisma db push
   npx ts-node prisma/seed.ts
   ```

3. **Start the Development Servers**
   Terminal 1 (Backend):
   ```bash
   cd server
   npm run dev
   ```
   Terminal 2 (Frontend):
   ```bash
   npm run dev
   ```

4. **Open the App**
   Navigate to `http://localhost:5173` in your browser.

## Architecture & End-to-End Flow

Flowline operates via a split client-server architecture. Here is the end-to-end flow of how data moves from building a workflow to executing it:

### 1. Building the Workflow (Frontend)
- **Canvas (React Flow)**: When you drag a node onto the canvas, the `workflowStore` (Zustand) tracks the node's position, type, and connections (`edges`).
- **Configuration (Inspector Panel)**: Selecting a node opens the Inspector. Any changes made here are instantly synced to the node's `data.config` object in the Zustand store.
- **Saving**: Clicking "Save" triggers an API call (`POST` or `PUT`) to the backend, serializing the React Flow `nodes` and `edges` arrays into JSON strings and saving them to the SQLite database via Prisma.

### 2. Triggering Execution (Backend)
- **Manual Trigger**: Clicking "Run" hits the `/api/workflows/:id/run` endpoint.
- **Background Execution**: The Express server receives the request, fetches the saved JSON workflow from the database, and passes it to the `WorkflowEngine`. The API immediately responds with a `202 Accepted` while execution continues asynchronously.

### 3. Engine Processing (DAG Execution)
- **Topological Sort**: The `WorkflowEngine` parses the nodes and edges, building an adjacency list to determine the dependency graph (Directed Acyclic Graph).
- **Execution Loop**: Nodes with zero dependencies (in-degree of 0) start executing first (usually Triggers).
- **Data Passing**: When a node completes, its output is mapped and passed as the `input` to any child nodes connected via edges.
- **Logging**: Before and after a node executes, the engine creates/updates a `NodeLog` record in the database, tracking status, inputs, outputs, duration, and errors.

### 4. Real-Time Feedback (SSE)
- **Server-Sent Events (SSE)**: When you click "Run", the frontend also subscribes to a live SSE stream (`/api/runs/:id/stream`).
- **Live Updates**: As the `WorkflowEngine` traverses the graph, it broadcasts events (`node_status: running`, `node_status: success`). The frontend receives these events and updates the visual state of the nodes on the canvas (adding glowing borders and checkmarks) in real time.

### 5. Reviewing Results
- **History Page**: Fetches all `WorkflowRun` records and their associated `NodeLog` children from the database, allowing you to inspect the exact JSON input/output passing between every step of the workflow.

## Using Flowline

1. **Create a Workflow**: Start from scratch or use a Template.
2. **Add Nodes**: Drag from the left palette or use `Cmd+K`.
3. **Connect Nodes**: Drag from the bottom handle of one node to the top handle of another.
4. **Configure Nodes**: Click a node to open the Inspector and configure its settings.
5. **Run**: Click the "Run" button in the toolbar. Watch the nodes execute!
6. **Check History**: Go to the History page to view detailed logs and outputs.
