import { z } from "zod";

export const createCostsFormSchema = (
  suppliers: Array<{ id: string; name: string; supply: number }>,
  recipients: Array<{ id: string; name: string; demand: number }>,
) => {
  const costsSchema = recipients.reduce(
    (recipientAcc, recipient) => {
      recipientAcc[recipient.id] = z.object(
        suppliers.reduce(
          (supplierAcc, supplier) => {
            supplierAcc[supplier.id] = z.coerce
              .number()
              .min(0, "Cost must be non-negative");
            return supplierAcc;
          },
          {} as Record<string, z.ZodNumber>,
        ),
      );
      return recipientAcc;
    },
    {} as Record<string, z.ZodObject<Record<string, z.ZodNumber>>>,
  );

  return z.object({
    costs: z.object(costsSchema),
  });
};

export type CostsFormData = z.infer<ReturnType<typeof createCostsFormSchema>>;

export const createDefaultCosts = (
  suppliers: Array<{ id: string; name: string; supply: number }>,
  recipients: Array<{ id: string; name: string; demand: number }>,
) => {
  return recipients.reduce(
    (recipientAcc, recipient) => {
      recipientAcc[recipient.id] = suppliers.reduce(
        (supplierAcc, supplier) => {
          supplierAcc[supplier.id] = undefined;
          return supplierAcc;
        },
        {} as Record<string, number | undefined>,
      );
      return recipientAcc;
    },
    {} as Record<string, Record<string, number | undefined>>,
  );
};

export const convertToCostMatrix = (
  formData: CostsFormData,
  suppliers: Array<{ id: string; name: string; supply: number }>,
  recipients: Array<{ id: string; name: string; demand: number }>,
): number[][] => {
  return recipients.map((recipient) =>
    suppliers.map((supplier) => formData.costs[recipient.id][supplier.id]),
  );
};
