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
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'includeDeleted', in: 'query', schema: { type: 'boolean', default: false } },
          { name: 'deletedOnly', in: 'query', schema: { type: 'boolean', default: false } },
        ],
        responses: { 200: { description: 'List of categories', content: { 'application/json': { schema: { $ref: '#/components/schemas/ListResponse' } } } } },
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
    '/categories/{id}': {
      get: {
        tags: ['Categories'],
        summary: 'Get category by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Category details' }, 404: { description: 'Category not found' } },
      },
      patch: {
        tags: ['Categories'],
        summary: 'Update category',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CategoryRequest' } } },
        },
        responses: { 200: { description: 'Category updated' }, 404: { description: 'Category not found' } },
      },
      delete: {
        tags: ['Categories'],
        summary: 'Soft delete category',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Category soft-deleted' }, 404: { description: 'Category not found' } },
      },
    },
    '/categories/{id}/restore': {
      patch: {
        tags: ['Categories'],
        summary: 'Restore soft-deleted category',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Category restored' }, 404: { description: 'Category not found' } },
      },
    },
    '/categories/{id}/force': {
      delete: {
        tags: ['Categories'],
        summary: 'Permanently delete category',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Category permanently deleted' }, 404: { description: 'Category not found' } },
      },
    },
    '/accounts': {
      get: {
        tags: ['Accounts'],
        summary: 'List accounts',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'includeDeleted', in: 'query', schema: { type: 'boolean', default: false } },
          { name: 'deletedOnly', in: 'query', schema: { type: 'boolean', default: false } },
        ],
        responses: { 200: { description: 'List of accounts', content: { 'application/json': { schema: { $ref: '#/components/schemas/ListResponse' } } } } },
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
    '/accounts/{id}': {
      get: {
        tags: ['Accounts'],
        summary: 'Get account by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Account details' }, 404: { description: 'Account not found' } },
      },
      patch: {
        tags: ['Accounts'],
        summary: 'Update account',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          content: { 'application/json': { schema: { $ref: '#/components/schemas/AccountRequest' } } },
        },
        responses: { 200: { description: 'Account updated' }, 404: { description: 'Account not found' } },
      },
      delete: {
        tags: ['Accounts'],
        summary: 'Soft delete account',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Account soft-deleted' }, 404: { description: 'Account not found' } },
      },
    },
    '/accounts/{id}/restore': {
      patch: {
        tags: ['Accounts'],
        summary: 'Restore soft-deleted account',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Account restored' }, 404: { description: 'Account not found' } },
      },
    },
    '/accounts/{id}/force': {
      delete: {
        tags: ['Accounts'],
        summary: 'Permanently delete account',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Account permanently deleted' }, 404: { description: 'Account not found' } },
      },
    },
    '/cards': {
      get: {
        tags: ['Credit Cards'],
        summary: 'List credit cards',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } },
          { name: 'includeDeleted', in: 'query', schema: { type: 'boolean', default: false } },
          { name: 'deletedOnly', in: 'query', schema: { type: 'boolean', default: false } },
        ],
        responses: { 200: { description: 'List of cards', content: { 'application/json': { schema: { $ref: '#/components/schemas/ListResponse' } } } } },
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
          400: { description: 'Validation failed or invalid account type' },
          404: { description: 'Account not found' },
          409: { description: 'Credit card already exists for this account' }
        },
      },
    },
    '/cards/{id}': {
      get: {
        tags: ['Credit Cards'],
        summary: 'Get credit card by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Card details' }, 404: { description: 'Card not found' } },
      },
      patch: {
        tags: ['Credit Cards'],
        summary: 'Update credit card',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CardRequest' } } },
        },
        responses: { 200: { description: 'Card updated' }, 404: { description: 'Card not found' } },
      },
      delete: {
        tags: ['Credit Cards'],
        summary: 'Soft delete credit card',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Card soft-deleted' }, 404: { description: 'Card not found' } },
      },
    },
    '/cards/{id}/restore': {
      patch: {
        tags: ['Credit Cards'],
        summary: 'Restore soft-deleted credit card',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Card restored' }, 404: { description: 'Card not found' } },
      },
    },
    '/cards/{id}/force': {
      delete: {
        tags: ['Credit Cards'],
        summary: 'Permanently delete credit card',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Card permanently deleted' }, 404: { description: 'Card not found' } },
      },
    },
    '/transactions': {
      get: {
        tags: ['Transactions'],
        summary: 'List transactions',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } },
          { name: 'accountId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'categoryId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'includeDeleted', in: 'query', schema: { type: 'boolean', default: false } },
          { name: 'deletedOnly', in: 'query', schema: { type: 'boolean', default: false } },
        ],
        responses: { 200: { description: 'List of transactions', content: { 'application/json': { schema: { $ref: '#/components/schemas/ListResponse' } } } } },
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
    '/transactions/{id}': {
      get: {
        tags: ['Transactions'],
        summary: 'Get transaction by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Transaction details' }, 404: { description: 'Transaction not found' } },
      },
      patch: {
        tags: ['Transactions'],
        summary: 'Update transaction',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          content: { 'application/json': { schema: { $ref: '#/components/schemas/TransactionRequest' } } },
        },
        responses: { 200: { description: 'Transaction updated' }, 404: { description: 'Transaction not found' } },
      },
      delete: {
        tags: ['Transactions'],
        summary: 'Soft delete transaction',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Transaction soft-deleted' }, 404: { description: 'Transaction not found' } },
      },
    },
    '/transactions/{id}/restore': {
      patch: {
        tags: ['Transactions'],
        summary: 'Restore soft-deleted transaction',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Transaction restored' }, 404: { description: 'Transaction not found' } },
      },
    },
    '/transactions/{id}/force': {
      delete: {
        tags: ['Transactions'],
        summary: 'Permanently delete transaction',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Transaction permanently deleted' }, 404: { description: 'Transaction not found' } },
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
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
          data: { type: 'object' },
        },
      },
      ListResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'array', items: { type: 'object' } },
          pagination: {
            type: 'object',
            properties: {
              page: { type: 'integer' },
              limit: { type: 'integer' },
              total: { type: 'integer' },
              hasNext: { type: 'boolean' },
            },
          },
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
