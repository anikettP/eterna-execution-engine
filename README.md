# Eterna Order Execution Engine

**High-performance trading infrastructure for Solana DEXs.**

Eterna is a backend system designed to simulate institutional-grade order execution. It handles **Market Orders** by intelligently routing trades between **Raydium** and **Meteora** to ensure the best execution price, utilizing a high-concurrency queue architecture.



## 🏗 Architecture

The system follows an **Event-Driven Architecture** to ensure **non-blocking execution**, **high throughput**, and **real-time updates**.
```mermaid
graph TD
    Client[Client / Dashboard] -->|1. POST Order| API[Fastify API]
    API -->|2. Enqueue Job| Redis[(Redis Queue)]
    API -.->|3. Order ID| Client   
    subgraph "Execution Engine"
        Worker[BullMQ Worker] -->|4. Process Job| Router[DEX Router]
        Router -->|5. Fetch Quotes| DEXs{Raydium / Meteora}
        DEXs -->|6. Return Prices| Router
        Router -->|7. Execute Swap| Blockchain[Solana Mock]
    end
    Worker -->|8. Persist State| DB[(PostgreSQL)]
    Worker -.->|9. Stream Updates| WebSocket[WebSocket Gateway]
    WebSocket -.->|10. Live Status| Client

### Execution Flow Summary

1. Client submits an order via HTTP.
2. API validates the request and enqueues the job in Redis.
3. A BullMQ worker processes the order asynchronously.
4. The DEX Router fetches quotes from Raydium and Meteora.
5. The best execution route is selected.
6. The swap is executed (mocked).
7. Order state is persisted in PostgreSQL.
8. Real-time status updates are streamed back to the client via WebSockets.


---

##  Key Features

* ** Market Order Execution:** Immediate processing at the best available price.
* ** Smart DEX Routing:** Queries Raydium & Meteora quotes in real-time to select the optimal venue.
* ** Real-Time Updates:** WebSocket streaming for live status feedback:
    * `pending` → `routing` → `building` → `submitted` → `confirmed`
* ** High Concurrency:** BullMQ + Redis architecture handling concurrent orders with exponential backoff retries.
* ** Audit & Reliability:** Full order history and execution logs persisted in PostgreSQL.

---

##  Tech Stack

* **Runtime:** Node.js, TypeScript
* **API:** Fastify (HTTP + WebSockets)
* **Queue:** BullMQ + Redis
* **Database:** PostgreSQL (Prisma ORM)
* **Infrastructure:** Docker

---

##  Getting Started

### Prerequisites
* Node.js (v18+)
* Docker Desktop (Must be running)

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
Ensure the server is running.

Open the file test-client.html in your browser.

Click "Confirm Transaction" to see the full lifecycle.

Option B: Postman / API
POST http://localhost:3000/api/orders/execute

WebSocket ws://localhost:3000/ws/orders/{orderId}
