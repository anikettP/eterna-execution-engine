# 🚀 Eterna Order Execution Engine

**High-performance trading infrastructure for Solana DEXs.**

Eterna is a backend system designed to simulate institutional-grade order execution. It handles **Market Orders** by intelligently routing trades between **Raydium** and **Meteora** to ensure the best execution price, managing high concurrency with robust queue systems.

---

## ✨ Key Features

* **⚡ Market Order Execution:** Immediate processing at the best available price.
* **🔀 Smart DEX Routing:** Queries Raydium & Meteora quotes in real-time to select the optimal venue.
* **📡 Real-Time Updates:** WebSocket streaming for live status feedback:
    * `pending` → `routing` → `building` → `submitted` → `confirmed`
* **🛡 High Concurrency:** BullMQ + Redis architecture handling concurrent orders with exponential backoff retries.
* **💾 Audit & Reliability:** Full order history and execution logs persisted in PostgreSQL.

---

## 🧠 Why Market Orders?
I chose **Market Orders** to focus on the core engineering challenges of low-latency execution and optimal routing logic. This foundational engine can easily be extended:
* **Limit Orders:** By adding a price-monitoring cron job.
* **Sniper Orders:** By replacing the HTTP trigger with a mempool event listener.

---

## 🛠 Tech Stack

* **Runtime:** Node.js, TypeScript
* **API:** Fastify (HTTP + WebSockets)
* **Queue:** BullMQ + Redis
* **Database:** PostgreSQL (Prisma ORM)
* **Infrastructure:** Docker

---

## ⚙️ Architecture Flow

1.  **POST /api/orders/execute** → Validates request & returns `orderId`.
2.  **Order Queued** → Job added to BullMQ (Redis).
3.  **Worker Processor** →
    * Fetches quotes from Mock DEXs.
    * Selects best route.
    * Simulates on-chain transaction.
4.  **WebSocket Stream** → Pushes real-time status updates to the client.
5.  **Persistence** → Saves final execution data to Postgres.

---

## 🚀 Getting Started

Follow these steps to run the engine locally.

### Prerequisites
* Node.js (v18+)
* Docker Desktop (Running)

### 1. Installation
```bash
git clone [https://github.com/anikettP/eterna-execution-engine.git](https://github.com/anikettP/eterna-execution-engine.git)
cd eterna-execution-engine
npm install


2. Start Infrastructure (DB & Queue)
Bash

docker compose up -d
3. Setup Database
Bash

npx prisma migrate dev --name init
4. Run the Engine
Bash

npm run dev
The server will start at http://localhost:3000.

🧪 How to Test
Option A: The Dashboard (Recommended)
I have included a custom HTML dashboard to visualize the order flow easily.

Ensure the server is running.

Open the file test-client.html in your browser.

Click "Confirm Transaction" to see the full lifecycle (Pending → Routing → Confirmed).

Option B: Postman / API
1. Submit Order

URL: http://localhost:3000/api/orders/execute

Method: POST

Body:

JSON

{
  "pair": "SOL-USDC",
  "amount": 10,
  "side": "buy"
}
2. Listen for Updates

URL: ws://localhost:3000/ws/orders/{orderId}

Method: WebSocket