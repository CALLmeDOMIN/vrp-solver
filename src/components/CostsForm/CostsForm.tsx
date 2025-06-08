import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDataContext } from "@/context/DataContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { createCostsFormSchema, type CostsFormData } from "./CostsForm.utils";

export default function CostsForm() {
  const { suppliers, recipients, costs, setCosts, prevStep, nextStep } =
    useDataContext();

  const formSchema = useMemo(
    () => createCostsFormSchema(suppliers, recipients),
    [suppliers, recipients],
  );

  const form = useForm<CostsFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      costs: costs || undefined,
    },
  });

  const onSubmit = (values: CostsFormData) => {
    const costsForContext: Record<string, Record<string, number>> = {};

    Object.entries(values.costs).forEach(([recipientId, supplierCosts]) => {
      costsForContext[recipientId] = {};
      Object.entries(supplierCosts).forEach(([supplierId, cost]) => {
        costsForContext[recipientId][supplierId] = cost;
      });
    });

    setCosts(costsForContext);
    nextStep();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Table>
          <TableCaption>
            Transportation costs from suppliers to recipients
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">From \ To</TableHead>
              {recipients.map((recipient) => (
                <TableHead key={recipient.id} className="w-[100px] text-center">
                  {recipient.name}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell className="font-medium">{supplier.name}</TableCell>
                {recipients.map((recipient) => (
                  <TableCell key={recipient.id} className="text-center">
                    <FormField
                      control={form.control}
                      name={`costs.${recipient.id}.${supplier.id}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0.00"
                              step="0.01"
                              min="0"
                              className="text-center"
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-4 flex justify-between">
          <Button type="button" variant="secondary" onClick={prevStep}>
            Back
          </Button>

          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Form>
  );
}
