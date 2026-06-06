import { ApiReference } from '@scalar/nextjs-api-reference';
import { openApiSpec } from '@/core/openapi';

export const GET = ApiReference({
  spec: {
    content: openApiSpec,
  },
});
