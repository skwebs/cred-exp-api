import { pgTable, uuid, text, timestamp, varchar, decimal, pgEnum, index, foreignKey } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// Enums
export const accountTypeEnum = pgEnum('account_type', ['cash', 'bank', 'credit_card']);
export const transactionKindEnum = pgEnum('transaction_kind', ['expense', 'income', 'transfer', 'payment', 'refund']);
export const transactionDirectionEnum = pgEnum('transaction_direction', ['inflow', 'outflow']);

// Users Table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

// Accounts Table
export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  type: accountTypeEnum('type').notNull(),
  balance: decimal('balance', { precision: 15, scale: 2 }).default('0').notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  userIdIdx: index('accounts_user_id_idx').on(table.userId),
}));

// Credit Cards Table
export const creditCards = pgTable('credit_cards', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  accountId: uuid('account_id').references(() => accounts.id).notNull().unique(),
  cardName: text('card_name').notNull(),
  shortCode: varchar('short_code', { length: 10 }).notNull(),
  bankName: text('bank_name').notNull(),
  lastFourDigits: varchar('last_four_digits', { length: 4 }).notNull(),
  billingDay: decimal('billing_day', { precision: 2, scale: 0 }).notNull(),
  gracePeriodDays: decimal('grace_period_days', { precision: 2, scale: 0 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  userIdIdx: index('credit_cards_user_id_idx').on(table.userId),
  accountIdIdx: index('credit_cards_account_id_idx').on(table.accountId),
}));

// Categories Table
export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  icon: text('icon'),
  color: varchar('color', { length: 7 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  userIdIdx: index('categories_user_id_idx').on(table.userId),
}));

// Billing Cycles Table
export const billingCycles = pgTable('billing_cycles', {
  id: uuid('id').primaryKey().defaultRandom(),
  creditCardId: uuid('credit_card_id').references(() => creditCards.id).notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  billDate: timestamp('bill_date').notNull(),
  dueDate: timestamp('due_date').notNull(),
  status: varchar('status', { length: 20 }).default('open').notNull(), // open, billed, paid, partial
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  cardIdIdx: index('billing_cycles_card_id_idx').on(table.creditCardId),
}));

// Transactions Table
export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  accountId: uuid('account_id').references(() => accounts.id).notNull(),
  categoryId: uuid('category_id').references(() => categories.id),
  billingCycleId: uuid('billing_cycle_id').references(() => billingCycles.id),
  kind: transactionKindEnum('kind').notNull(),
  direction: transactionDirectionEnum('direction').notNull(),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  transactionDatetime: timestamp('transaction_datetime').notNull(),
  settlementDate: timestamp('settlement_date').notNull(),
  merchantName: text('merchant_name'),
  particulars: text('particulars'),
  cardStatementReference: text('card_statement_reference'),
  referenceNumber: text('reference_number'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  userIdIdx: index('transactions_user_id_idx').on(table.userId),
  accountIdIdx: index('transactions_account_id_idx').on(table.accountId),
  categoryIdIdx: index('transactions_category_id_idx').on(table.categoryId),
  billingCycleIdIdx: index('transactions_billing_cycle_id_idx').on(table.billingCycleId),
  transactionDatetimeIdx: index('transactions_datetime_idx').on(table.transactionDatetime),
}));

// Transaction Links Table (for transfers or payments)
export const transactionLinks = pgTable('transaction_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  sourceTransactionId: uuid('source_transaction_id').references(() => transactions.id).notNull(),
  targetTransactionId: uuid('target_transaction_id').references(() => transactions.id).notNull(),
  linkType: varchar('link_type', { length: 50 }).notNull(), // e.g., 'transfer', 'credit_card_payment'
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  sourceIdx: index('transaction_links_source_idx').on(table.sourceTransactionId),
  targetIdx: index('transaction_links_target_idx').on(table.targetTransactionId),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  categories: many(categories),
  creditCards: many(creditCards),
  transactions: many(transactions),
}));

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
  creditCards: many(creditCards),
  transactions: many(transactions),
}));

export const creditCardsRelations = relations(creditCards, ({ one, many }) => ({
  user: one(users, { fields: [creditCards.userId], references: [users.id] }),
  account: one(accounts, { fields: [creditCards.accountId], references: [accounts.id] }),
  billingCycles: many(billingCycles),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, { fields: [categories.userId], references: [users.id] }),
  transactions: many(transactions),
}));

export const billingCyclesRelations = relations(billingCycles, ({ one, many }) => ({
  creditCard: one(creditCards, { fields: [billingCycles.creditCardId], references: [creditCards.id] }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
  account: one(accounts, { fields: [transactions.accountId], references: [accounts.id] }),
  category: one(categories, { fields: [transactions.categoryId], references: [categories.id] }),
  billingCycle: one(billingCycles, { fields: [transactions.billingCycleId], references: [billingCycles.id] }),
}));
