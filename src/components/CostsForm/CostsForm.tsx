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
import {
  convertToCostMatrix,
  createCostsFormSchema,
  createDefaultCosts,
  type CostsFormData,
} from "./CostsForm.utils";

export default function CostsForm() {
  const { suppliers, recipients, prevStep } = useDataContext();

  const formSchema = useMemo(
    () => createCostsFormSchema(suppliers, recipients),
    [suppliers, recipients],
  );

  const form = useForm<CostsFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      costs: createDefaultCosts(suppliers, recipients),
    },
  });

  const onSubmit = (values: CostsFormData) => {
    console.log("Form submitted with values:", values);

    const costMatrix = convertToCostMatrix(values, suppliers, recipients);
    console.log("Cost matrix:", costMatrix);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Table>
          <TableCaption>
            Insert costs for each supplier-recipient pair
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">{"</>"}</TableHead>
              {suppliers.map((supplier) => (
                <TableHead key={supplier.id} className="w-[100px] text-center">
                  {supplier.name}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {recipients.map((recipient) => (
              <TableRow key={recipient.id}>
                <TableCell className="font-medium">{recipient.name}</TableCell>
                {suppliers.map((supplier) => (
                  <TableCell key={supplier.id} className="text-right">
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
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
}
