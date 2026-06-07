# Project Status - Credit Expense API

## Current Branch Status
- **Main**: Stable, all CRUD and core business rules implemented.

## Completed Modules
- **Authentication**: JWT-based, Register/Login/Me endpoints. (Implemented)
- **Accounts**: Multi-currency account tracking. (Implemented)
- **Categories**: Transaction categorization. (Implemented)
- **Credit Cards**: Card detail management and linkage. (Implemented)
- **Billing Cycles**: Automatic cycle calculation and tracking. (Implemented)
- **Transactions**: Core financial record keeping. (Implemented)
- **Reports**: Basic transaction reports. (Partially Implemented)

## Completed APIs
- **CRUD**: POST, GET, GET /:id, PATCH, DELETE for all core modules.
- **Lifecycle**: PATCH /restore, DELETE /force for all core modules.
- **Audit**: GET /deleted for all core modules.
- **Specialized**:
    - `POST /api/bills/pay`: Multi-step payment logic.
    - `GET /api/accounts/available-for-card`: Lists eligible accounts for card linking.

## Implemented Business Rules
- ✓ **Account Type Integrity**: Cards cannot link to cash/bank accounts.
- ✓ **Cardinality**: 1:1 relationship between account (type: credit_card) and credit_card record.
- ✓ **Atomic Balances**: Account balances are updated within DB transactions during transaction lifecycle.
- ✓ **State Management**: Prevents double-deletion or double-restoration via 409 Conflict checks.
- ✓ **Auto-Cycle**: Transactions on credit card accounts automatically find or create the correct billing cycle.

## Pending Work / Roadmap
- **Bulk Import**: CSV/OFX import for transactions. (Planned)
- **Advanced Reports**: Category spending trends, monthly budget vs actual. (Planned)
- **Notifications**: Reminders for upcoming credit card due dates. (Planned)

## Known Issues
- Floating point precision: Currently using `decimal` in DB but Javascript `Number` in some service calculations. (Low Risk, recommended refactor to `big.js`).
