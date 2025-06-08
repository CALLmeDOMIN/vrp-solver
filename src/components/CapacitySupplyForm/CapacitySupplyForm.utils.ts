import { z } from "zod";

export const createFormSchema = (
  suppliers: Array<{ id: string; name: string; supply: number }>,
  recipients: Array<{ id: string; name: string; demand: number }>,
) => {
  const supplierFieldSchema = z.object({
    supply: z.coerce
      .number({ invalid_type_error: "Please enter a valid supply" })
      .min(0, "Supply cannot be negative"),
    sellingPrice: z.coerce
      .number({ invalid_type_error: "Please enter a valid price" })
      .min(0, "Price cannot be negative"),
  });

  const recipientFieldSchema = z.object({
    demand: z.coerce
      .number({ invalid_type_error: "Please enter a valid demand" })
      .min(0, "Demand cannot be negative"),
    purchasePrice: z.coerce
      .number({ invalid_type_error: "Please enter a valid price" })
      .min(0, "Price cannot be negative"),
  });

  const suppliersSchema = suppliers.reduce(
    (acc, supplier) => {
      acc[supplier.id] = supplierFieldSchema;
      return acc;
    },
    {} as Record<string, typeof supplierFieldSchema>,
  );

  const recipientsSchema = recipients.reduce(
    (acc, recipient) => {
      acc[recipient.id] = recipientFieldSchema;
      return acc;
    },
    {} as Record<string, typeof recipientFieldSchema>,
  );

  return z.object({
    suppliers: z.object(suppliersSchema),
    recipients: z.object(recipientsSchema),
  });
};

export type FormData = z.infer<ReturnType<typeof createFormSchema>>;
