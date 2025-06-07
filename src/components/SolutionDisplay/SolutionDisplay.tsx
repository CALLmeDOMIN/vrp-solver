import { useDataContext } from "@/context/DataContext";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

export default function SolutionDisplay() {
  const { suppliers, recipients, solveMediatorProblem, prevStep, resetData } =
    useDataContext();

  console.log("SolutionDisplay - Suppliers:", suppliers);
  console.log("SolutionDisplay - Recipients:", recipients);

  const result = solveMediatorProblem();

  console.log("SolutionDisplay - Result:", result);

  if (!result) {
    return (
      <div className="py-8 text-center">
        <p className="text-red-500">
          Unable to solve the problem. Please check your input data.
        </p>
        <Button onClick={prevStep} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const { solution, totalProfit, totalCost, totalIncome } = result;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 text-xl font-semibold">
          Optimal Transport Solution
        </h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Supplier/Recipient</TableHead>
              {recipients.map((recipient) => (
                <TableHead key={recipient.id} className="text-center">
                  {recipient.name}
                </TableHead>
              ))}
              <TableHead className="text-center">Supply</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((supplier, i) => (
              <TableRow key={supplier.id}>
                <TableCell className="font-medium">{supplier.name}</TableCell>
                {recipients.map((_, j) => (
                  <TableCell key={j} className="text-center">
                    {solution[i][j] > 0 ? solution[i][j].toFixed(1) : "0"}
                  </TableCell>
                ))}
                <TableCell className="text-center font-medium">
                  {supplier.supply}
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell className="font-medium">Demand</TableCell>
              {recipients.map((recipient) => (
                <TableCell
                  key={recipient.id}
                  className="text-center font-medium"
                >
                  {recipient.demand}
                </TableCell>
              ))}
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded bg-blue-50 p-4 dark:bg-blue-950">
          <h3 className="font-semibold">Total Cost</h3>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            ${totalCost.toFixed(2)}
          </p>
        </div>
        <div className="rounded bg-green-50 p-4 dark:bg-green-950">
          <h3 className="font-semibold">Total Income</h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            ${totalIncome.toFixed(2)}
          </p>
        </div>
        <div className="rounded bg-purple-50 p-4 dark:bg-purple-950">
          <h3 className="font-semibold">Total Profit</h3>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            ${totalProfit.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="flex justify-between">
        <Button onClick={prevStep} variant="secondary">
          Back to Costs
        </Button>
        <Button onClick={resetData} variant="outline">
          Start Over
        </Button>
      </div>
    </div>
  );
}
