import { z } from "zod";

export const formSchema = z.object({
  supplierAmount: z.coerce.number().min(1, {
    message: "Supplier amount must be a positive number",
  }),
  recipientAmount: z.coerce.number().min(1, {
    message: "Supplier amount must be a positive number",
  }),
});
