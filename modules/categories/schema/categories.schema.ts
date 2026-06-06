import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1),
  icon: z.string().optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
});

export const updateCategorySchema = createCategorySchema.partial();