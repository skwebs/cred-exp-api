import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { users, accounts, creditCards, categories, billingCycles, transactions, transactionLinks } from './schema';

// Users
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

// Accounts
export const insertAccountSchema = createInsertSchema(accounts);
export const selectAccountSchema = createSelectSchema(accounts);

// Credit Cards
export const insertCreditCardSchema = createInsertSchema(creditCards);
export const selectCreditCardSchema = createSelectSchema(creditCards);

// Categories
export const insertCategorySchema = createInsertSchema(categories);
export const selectCategorySchema = createSelectSchema(categories);

// Billing Cycles
export const insertBillingCycleSchema = createInsertSchema(billingCycles);
export const selectBillingCycleSchema = createSelectSchema(billingCycles);

// Transactions
export const insertTransactionSchema = createInsertSchema(transactions);
export const selectTransactionSchema = createSelectSchema(transactions);

// Transaction Links
export const insertTransactionLinkSchema = createInsertSchema(transactionLinks);
export const selectTransactionLinkSchema = createSelectSchema(transactionLinks);
