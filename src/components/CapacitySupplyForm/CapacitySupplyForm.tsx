import { useDataContext } from "@/context/DataContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { createFormSchema } from "./CapacitySupplyForm.utils";

export default function CapacitySupplyForm() {
  const {
    suppliers,
    recipients,
    updateSupplier,
    updateRecipient,
    prevStep,
    nextStep,
  } = useDataContext();

  const formSchema = useMemo(
    () => createFormSchema(suppliers, recipients),
    [suppliers, recipients],
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      suppliers: suppliers.reduce(
        (acc, supplier) => {
          acc[supplier.id] = {
            supply: supplier.supply,
            sellingPrice: supplier.sellingPrice,
          };
          return acc;
        },
        {} as Record<string, { supply: number; sellingPrice: number }>,
      ),
      recipients: recipients.reduce(
        (acc, recipient) => {
          acc[recipient.id] = {
            demand: recipient.demand,
            purchasePrice: recipient.purchasePrice,
          };
          return acc;
        },
        {} as Record<string, { demand: number; purchasePrice: number }>,
      ),
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    Object.entries(values.suppliers).forEach(([id, supplierData]) => {
      updateSupplier(id, supplierData);
    });

    Object.entries(values.recipients).forEach(([id, recipientData]) => {
      updateRecipient(id, recipientData);
    });

    nextStep();
    console.log("Form submitted with values:", values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <h2 className="mb-4 text-xl font-semibold">Suppliers' Supply</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between gap-4">
                <div className="w-5" />
                <div className="w-1/2 text-sm font-medium">Supply</div>
                <div className="w-1/2 text-sm font-medium">Selling Price</div>
              </div>
            </div>
            {suppliers.map((supplier) => (
              <div key={supplier.id} className="flex items-center gap-4">
                <div className="text-sm font-medium">{supplier.name}</div>
                <FormField
                  control={form.control}
                  name={`suppliers.${supplier.id}.supply`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          min="0"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`suppliers.${supplier.id}.sellingPrice`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          min="0"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-xl font-semibold">Recipients' Demand</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between gap-4">
                <div className="w-5" />
                <div className="w-1/2 text-sm font-medium">Demand</div>
                <div className="w-1/2 text-sm font-medium">Purchase Price</div>
              </div>
            </div>
            {recipients.map((recipient) => (
              <div key={recipient.id} className="flex items-center gap-4">
                <div className="text-sm font-medium">{recipient.name}</div>
                <FormField
                  control={form.control}
                  name={`recipients.${recipient.id}.demand`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          min="0"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`recipients.${recipient.id}.purchasePrice`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <Button
            type="button"
            variant="secondary"
            className="float-left"
            onClick={prevStep}
          >
            Back
          </Button>

          <Button type="submit" className="float-right">
            Next
          </Button>
        </div>
      </form>
    </Form>
  );
}
