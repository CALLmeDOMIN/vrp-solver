import { z } from "zod";

export const createFormSchema = (
  suppliers: Array<{ id: string; name: string; supply: number }>,
  recipients: Array<{ id: string; name: string; demand: number }>,
) => {
  const suppliersSchema = suppliers.reduce(
    (acc, supplier) => {
      acc[supplier.id] = z.object({
        supply: z.coerce.number().min(0, "Supply must be non-negative"),
        sellingPrice: z.coerce
          .number()
          .min(0, "Selling price must be non-negative"),
      });
      return acc;
    },
    {} as Record<
      string,
      z.ZodObject<{ supply: z.ZodNumber; sellingPrice: z.ZodNumber }>
    >,
  );

  const recipientsSchema = recipients.reduce(
    (acc, recipient) => {
      acc[recipient.id] = z.object({
        demand: z.coerce.number().min(0, "Demand must be non-negative"),
        purchasePrice: z.coerce
          .number()
          .min(0, "Purchase price must be non-negative"),
      });
      return acc;
    },
    {} as Record<
      string,
      z.ZodObject<{ demand: z.ZodNumber; purchasePrice: z.ZodNumber }>
    >,
  );

  return z.object({
    suppliers: z.object(suppliersSchema),
    recipients: z.object(recipientsSchema),
  });
};

export type FormData = z.infer<ReturnType<typeof createFormSchema>>;
