import { z } from "zod";

export const createFormSchema = (
  suppliers: Array<{ id: string; name: string; supply: number }>,
  recipients: Array<{ id: string; name: string; demand: number }>,
) => {
  const suppliersSchema = suppliers.reduce(
    (acc, supplier) => {
      acc[supplier.id] = z.object({
        supply: z.number().min(0, "Supply must be non-negative"),
      });
      return acc;
    },
    {} as Record<string, z.ZodObject<any>>,
  );

  const recipientsSchema = recipients.reduce(
    (acc, recipient) => {
      acc[recipient.id] = z.object({
        demand: z.number().min(0, "Demand must be non-negative"),
      });
      return acc;
    },
    {} as Record<string, z.ZodObject<any>>,
  );

  return z.object({
    suppliers: z.object(suppliersSchema),
    recipients: z.object(recipientsSchema),
  });
};

export type FormData = z.infer<ReturnType<typeof createFormSchema>>;
