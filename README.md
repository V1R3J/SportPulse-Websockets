# SportPulse Websockets Backend

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)
![Arcjet](https://img.shields.io/badge/Arcjet-FF5C00?style=for-the-badge&logoColor=white)
![CodeRabbit](https://camo.githubusercontent.com/0847e48e58188b0ca47100bc3f1ac2a1d8babcadedcbd6d4d38d7ad316ce704a/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f2d436f64655261626269742d3030303030303f7374796c653d666f722d7468652d6261646765266c6f676f3d436f6465526162626974266c6f676f436f6c6f723d7768697465)

A backend service for live sports coverage. It combines REST endpoints for match and commentary management with WebSockets for real-time broadcasting. Clients can list and create matches, fetch play-by-play commentary, and subscribe over WebSockets to receive live commentary updates the moment they are created.

## Table of Contents

1. [Introduction](#introduction)
2. [Tech Stack](#tech-stack)
3. [Features](#features)
4. [Quick Start](#quick-start)
5. [REST API](#rest-api)
6. [WebSocket Protocol](#websocket-protocol)
7. [Notes](#notes)

## Introduction

SportPulse is a backend service for live sports coverage. Matches and commentary are managed through a REST API, while WebSockets handle real-time delivery of new commentary to subscribed clients. The service includes connection heartbeats to detect dead sockets, a per-socket subscription cap to prevent resource exhaustion, and Arcjet-backed protection on WebSocket upgrade requests.

## Tech Stack

- **Node.js** — JavaScript runtime powering the backend.
- **Express.js** — web framework used for the REST layer (`/matches`, `/matches/:id/commentary`).
- **WS** — WebSocket server implementation used for the real-time layer at `/ws`.
- **PostgreSQL** — relational database storing matches and commentary.
- **Drizzle ORM** — type-safe ORM used for all database queries.
- **Zod** — schema validation library used for REST payloads, route parameters, and WebSocket messages.
- **Arcjet** — middleware that protects WebSocket upgrade requests with rate limiting and access control.
- **Dotenv** — loads environment variables from a `.env` file.

### Dev Tools

- **CodeRabbit** — automated code review on every pull request. Each feature branch is reviewed by CodeRabbit before it is merged into `main`.

## Features

- **Match Management** — list and create matches through REST endpoints.
- **Commentary Management** — fetch commentary for a specific match, and add new entries. Commentary creation checks that the parent match exists before inserting, returning a 404 response instead of creating an orphaned record.
- **Real-Time Broadcasts** — clients subscribe to a specific match ID over WebSockets and receive new commentary as soon as it is posted, without polling.
- **WebSocket Protocol** — a simple subscribe and unsubscribe message format, with an acknowledgement sent back for each.
- **Connection Reliability** — a shared heartbeat check (every 30 seconds) that closes dead connections, a per-socket subscription limit to prevent unbounded memory growth, a 1 MB maximum message size, and Arcjet protection on the WebSocket upgrade step (returns 429 for rate limiting, 403 for access denied).
- **Input Validation** — every REST payload, route parameter, and WebSocket message is validated with Zod. Malformed input is rejected with a clear error response instead of crashing the connection.

## Quick Start

### Prerequisites

- Git
- Node.js
- npm

### Clone the Repository

```bash
git clone https://github.com/V1R3J/SportPulse-Websockets.git
cd SportPulse-Websockets
```

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL=

# Port and Host
PORT=8000
HOST=0.0.0.0

# Arcjet
ARCJET_KEY=""
ARCJET_ENV="development"
```

### Run the Project

```bash
npm run dev
```

The server runs at:

- HTTP: `http://localhost:8000`
- WebSocket: `ws://localhost:8000/ws`

## REST API

**List matches**
```
GET /matches
```

**Create a match**
```
POST /matches
```

**List commentary for a match**
```
GET /matches/:id/commentary?limit=10
```
The `limit` value is capped server-side to prevent oversized queries.

**Create commentary for a match**
```
POST /matches/:id/commentary
```
Returns a 404 response if the match referenced by `:id` does not exist.

## WebSocket Protocol

Connect to:
```
ws://localhost:8000/ws
```

### Client to Server

```json
{ "type": "subscribe", "matchId": 123 }
{ "type": "unsubscribe", "matchId": 123 }
```

### Server to Client

```json
{ "type": "welcome" }
{ "type": "subscribed", "matchId": 123 }
{ "type": "unsubscribed", "matchId": 123 }
{ "type": "commentary", "data": { "id": 1, "matchId": 123, "message": "..." } }
{ "type": "error", "message": "Invalid JSON" }
```

### Limits

- Maximum subscriptions per socket: 100
- Maximum message payload size: 1 MB
- Heartbeat check interval: 30 seconds (stale connections are closed)

## Notes

- Authentication is intentionally left out to keep the focus on WebSocket mechanics.
- Scaling to multiple server instances would require a pub/sub layer, such as Redis, NATS, or Kafka, so that broadcasts reach clients connected to any instance, not just the one that received the write.
