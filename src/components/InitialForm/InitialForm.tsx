import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { formSchema } from "./InitialForm.utils";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useDataContext } from "@/context/DataContext";

export default function InitialForm() {
  const {
    supplierAmount,
    recipientAmount,
    setSupplierAndRecipientAmounts,
    nextStep,
  } = useDataContext();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      supplierAmount: supplierAmount ?? undefined,
      recipientAmount: recipientAmount ?? undefined,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setSupplierAndRecipientAmounts(
      values.supplierAmount,
      values.recipientAmount,
    );
    nextStep();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="supplierAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Supplier Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="3"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>Enter the number of suppliers.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="recipientAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recipient Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="3"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>Enter the number of recipients.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="float-right" type="submit">
          Next
        </Button>
      </form>
    </Form>
  );
}
