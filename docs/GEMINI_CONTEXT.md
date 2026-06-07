# Gemini Context - Credit Expense API

## Project Purpose
Finance backend for tracking credit card expenses, billing cycles, payments, and account balances using a single-entry model with transaction links for transfers.

## Tech Stack
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Database**: Neon PostgreSQL
- **ORM**: Drizzle ORM (neon-serverless driver via WebSockets)
- **Validation**: Zod
- **Documentation**: OpenAPI 3.1 (Scalar)

## Architecture Constraints
- **Single-Entry**: Not a double-entry system. Use `transaction_links` for related entries.
- **Driver**: Must use `drizzle-orm/neon-serverless` with `Pool` for transaction support. Avoid `neon-http` for multi-step logic.
- **Soft Delete**: Global `deleted_at` pattern. ACTIVE (null), DELETED (timestamp), NOT_FOUND (404).

## Completed Features
- Full CRUD for Accounts, Categories, Credit Cards, Transactions.
- State-aware Soft Delete, Restore, and Hard Delete.
- Dedicated `/deleted` endpoints for all modules.
- Account balance management (auto-updates on creation, update, and deletion).
- Credit Card linkage rules (type check, unique account).
- Automatic billing cycle assignment for credit card transactions.
- Transaction settlement date defaulting.
- Standardized API responses and error handling.

## Business Rules Summary
1. Cards link ONLY to accounts of type `credit_card`.
2. One account ↔ One credit card record (Unique constraint).
3. `settlement_date` defaults to date part of `transaction_datetime`.
4. Delete/Restore returns 409 Conflict if already in target state.

## Current Priorities
- Ensuring data integrity during complex transfers.
- Expanding reporting capabilities.
