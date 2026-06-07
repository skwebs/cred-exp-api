# Business Rules - Credit Expense API

## Global Rules
### State-Aware Lifecycle
- **Soft Delete**: Only allowed on ACTIVE records. If record is already DELETED, return **409 Conflict**.
- **Restore**: Only allowed on DELETED records. If record is already ACTIVE, return **409 Conflict**.
- **Not Found**: If record does not exist (including deleted check), return **404 Not Found**.

## Accounts Module
- **Balance Integrity**: Balance cannot be updated directly via PATCH. It is automatically adjusted based on transaction activity.
- **Filtering**: Supports `includeDeleted` and `deletedOnly` query parameters for list operations.

## Credit Cards Module
- **Account Type Restriction**: A credit card record can ONLY be linked to an account where `account.type = 'credit_card'`. Attempts to link to 'bank' or 'cash' accounts return **400 Bad Request**.
- **One-to-One Account Link**: One account can be linked to exactly one credit card record. Attempts to create a duplicate link return **409 Conflict**.
- **Unlink Safety**: Deleting a credit card record does not delete the account, but unlinks the specific card details.

## Transactions Module
- **Settlement Date Defaulting**: If `settlement_date` is not provided during creation, it is automatically set to the date part (Y-M-D) of the `transaction_datetime`.
- **Atomic Balance Updates**:
    - **Create**: Adjusts account balance (+/- based on direction).
    - **Update**: Reverses old transaction effect and applies new effect. Handles amount, direction, and account changes.
    - **Soft Delete**: Reverses the transaction's effect on account balance.
    - **Restore**: Re-applies the transaction's effect on account balance.
- **Billing Cycle Assignment**: For accounts of type `credit_card`, transactions are automatically linked to a `billing_cycle` based on the card's `billingDay` and `gracePeriodDays`.

## Categories Module
- **Isolation**: Categories are user-specific; one user cannot see or use another user's categories.
