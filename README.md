# Trackly

Trackly is a full-stack team task management application.

## Tech Stack

- Next.js
- React
- TypeScript
- Express.js
- Prisma
- PostgreSQL
- Zod
- JWT
- bcrypt
- pnpm workspaces

## Project Structure

- `apps/web` � Next.js frontend
- `apps/api` � Express backend and Prisma
- `packages/shared` � shared schemas and types
- `packages/config` � shared configuration
- `docker-compose.yml` � local PostgreSQL database

## Current Status

Initial project setup and backend/database foundation are complete.

## Environment Setup

The API requires the following environment variables:

- `DATABASE_URL`: PostgreSQL connection string.
- `PORT`: API port (default: `5000`).
- `JWT_SECRET`: A long, random secret used to sign and verify authentication tokens.

For local development, configure these variables in `apps/api/.env`.
Use `.env.example` as a reference. Replace the example `JWT_SECRET` placeholder with a real secret in your local environment. Never commit `.env` or use the placeholder in production.

## Authentication API

Base URL: `http://localhost:5000`

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Log in |
| POST | `/api/auth/logout` | Log out |
| GET | `/api/auth/me` | Get the authenticated user's details |

The API intentionally mounts authentication routes under `/api/auth`. Use the full URLs above when testing locally.

### Authentication Verification

1. Register a new user using `POST /api/auth/register`.
2. Log in using `POST /api/auth/login`.
3. Use the authentication credential returned by login to call `GET /api/auth/me`.
4. Register the same email again and verify that the response is HTTP `409` with error code `EMAIL_ALREADY_EXISTS`.