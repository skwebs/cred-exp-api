export const openApiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'Credit Expense API',
    version: '1.0.0',
    description: 'API for tracking credit card expenses, billing cycles, and payments.',
  },
  servers: [
    {
      url: '/api',
      description: 'Main API',
    },
  ],
  paths: {
    '/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user',
        requestBody: {
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } },
        },
        responses: { 201: { description: 'User registered' } },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login user',
        requestBody: {
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } },
        },
        responses: { 200: { description: 'Login successful' } },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get current user profile',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'User profile' } },
      },
    },
    '/categories': {
      get: {
        tags: ['Categories'],
        summary: 'List categories',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'offset', in: 'query', schema: { type: 'integer' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'List of categories' } },
      },
      post: {
        tags: ['Categories'],
        summary: 'Create category',
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CategoryRequest' } } },
        },
        responses: { 201: { description: 'Category created' } },
      },
    },
    '/accounts': {
      get: {
        tags: ['Accounts'],
        summary: 'List accounts',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'List of accounts' } },
      },
      post: {
        tags: ['Accounts'],
        summary: 'Create account',
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: { 'application/json': { schema: { $ref: '#/components/schemas/AccountRequest' } } },
        },
        responses: { 201: { description: 'Account created' } },
      },
    },
    '/accounts/available-for-card': {
      get: {
        tags: ['Accounts'],
        summary: 'List accounts available for credit card link',
        description: 'Returns accounts of type "credit_card" that are not yet linked to any credit card detail.',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'List of available accounts' } },
      },
    },
    '/cards': {
      get: {
        tags: ['Credit Cards'],
        summary: 'List credit cards',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'List of cards' } },
      },
      post: {
        tags: ['Credit Cards'],
        summary: 'Create credit card',
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CardRequest' } } },
        },
        responses: { 
          201: { description: 'Card created' },
          400: { 
            description: 'Validation failed or invalid account type',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
          },
          404: { 
            description: 'Account not found',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
          },
          409: { 
            description: 'Credit card already exists for this account',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
          }
        },
      },
    },
    '/transactions': {
      get: {
        tags: ['Transactions'],
        summary: 'List transactions',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'List of transactions' } },
      },
      post: {
        tags: ['Transactions'],
        summary: 'Create transaction',
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: { 'application/json': { schema: { $ref: '#/components/schemas/TransactionRequest' } } },
        },
        responses: { 201: { description: 'Transaction created' } },
      },
    },
    '/reports/transactions': {
      get: {
        tags: ['Reports'],
        summary: 'Transaction timeline report',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Timeline report' } },
      },
    },
    '/dashboard/monthly': {
      get: {
        tags: ['Dashboard'],
        summary: 'Monthly dashboard summary',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Monthly summary' } },
      },
    },
    '/bills/upcoming': {
      get: {
        tags: ['Bills'],
        summary: 'Upcoming credit card bills',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'List of upcoming bills' } },
      },
    },
    '/bills/history': {
      get: {
        tags: ['Bills'],
        summary: 'Billing cycle history',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Bill history' } },
      },
    },
    '/bills/pay': {
      post: {
        tags: ['Bills'],
        summary: 'Pay a credit card bill',
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: { 'application/json': { schema: { $ref: '#/components/schemas/PaymentRequest' } } },
        },
        responses: { 201: { description: 'Payment successful' } },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password', 'name'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          name: { type: 'string' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
      },
      CategoryRequest: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' },
          icon: { type: 'string' },
          color: { type: 'string' },
        },
      },
      AccountRequest: {
        type: 'object',
        required: ['name', 'type'],
        properties: {
          name: { type: 'string' },
          type: { type: 'string', enum: ['cash', 'bank', 'credit_card'] },
          balance: { type: 'string' },
          currency: { type: 'string' },
        },
      },
      CardRequest: {
        type: 'object',
        required: ['accountId', 'cardName', 'shortCode', 'bankName', 'lastFourDigits', 'billingDay', 'gracePeriodDays'],
        properties: {
          accountId: { type: 'string', format: 'uuid' },
          cardName: { type: 'string' },
          shortCode: { type: 'string' },
          bankName: { type: 'string' },
          lastFourDigits: { type: 'string' },
          billingDay: { type: 'integer' },
          gracePeriodDays: { type: 'integer' },
        },
      },
      TransactionRequest: {
        type: 'object',
        required: ['accountId', 'kind', 'direction', 'amount', 'transactionDatetime'],
        properties: {
          accountId: { type: 'string', format: 'uuid' },
          categoryId: { type: 'string', format: 'uuid' },
          kind: { type: 'string', enum: ['expense', 'income', 'transfer', 'payment', 'refund'] },
          direction: { type: 'string', enum: ['inflow', 'outflow'] },
          amount: { type: 'string' },
          transactionDatetime: { type: 'string', format: 'date-time' },
          merchantName: { type: 'string' },
          notes: { type: 'string' },
        },
      },
      PaymentRequest: {
        type: 'object',
        required: ['sourceAccountId', 'creditCardId', 'billingCycleId', 'amount', 'transactionDatetime'],
        properties: {
          sourceAccountId: { type: 'string', format: 'uuid' },
          creditCardId: { type: 'string', format: 'uuid' },
          billingCycleId: { type: 'string', format: 'uuid' },
          amount: { type: 'number' },
          transactionDatetime: { type: 'string', format: 'date-time' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
          errors: {
            type: 'object',
            additionalProperties: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
      },
    },
  },
};
