import { useDataContext } from "@/context/DataContext";
import { createProfitMatrix } from "@/lib/mediatorSolver";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

export default function SolutionDisplay() {
  const { solveMediatorProblem, prevStep, resetData, costs } = useDataContext();

  const result = solveMediatorProblem();

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

  const {
    solution,
    totalProfit,
    totalCost,
    totalIncome,
    balancedSuppliers,
    balancedRecipients,
  } = result;

  const fictionalSupplier = balancedSuppliers.find((s) =>
    s.id.startsWith("fictional_"),
  );
  const fictionalRecipient = balancedRecipients.find((r) =>
    r.id.startsWith("fictional_"),
  );

  const extendedCosts: Record<string, Record<string, number>> = { ...costs };

  balancedRecipients.forEach((recipient) => {
    if (!extendedCosts[recipient.id]) {
      extendedCosts[recipient.id] = {};
      balancedSuppliers.forEach((supplier) => {
        extendedCosts[recipient.id][supplier.id] = 0;
      });
    }
  });

  balancedSuppliers.forEach((supplier) => {
    balancedRecipients.forEach((recipient) => {
      if (!extendedCosts[recipient.id][supplier.id]) {
        extendedCosts[recipient.id][supplier.id] = 0;
      }
    });
  });

  const profitMatrix = createProfitMatrix(
    balancedSuppliers,
    balancedRecipients,
    extendedCosts,
  );

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
              {balancedRecipients.map((recipient) => (
                <TableHead key={recipient.id} className="text-center">
                  <div className="flex flex-col">
                    <span
                      className={
                        recipient.id.startsWith("fictional_")
                          ? "text-gray-500 italic"
                          : ""
                      }
                    >
                      {recipient.name}
                    </span>
                  </div>
                </TableHead>
              ))}
              <TableHead className="text-center">Supply</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {balancedSuppliers.map((supplier, i) => (
              <TableRow key={supplier.id}>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span
                      className={
                        supplier.id.startsWith("fictional_")
                          ? "text-gray-500 italic"
                          : ""
                      }
                    >
                      {supplier.name}
                    </span>
                  </div>
                </TableCell>
                {balancedRecipients.map((_, j) => (
                  <TableCell key={j} className="text-center">
                    <span
                      className={
                        balancedSuppliers[i].id.startsWith("fictional_") ||
                        balancedRecipients[j].id.startsWith("fictional_")
                          ? "text-gray-500 italic"
                          : ""
                      }
                    >
                      {solution[i] && solution[i][j] !== undefined
                        ? solution[i][j].toFixed(1)
                        : "0.0"}
                    </span>
                  </TableCell>
                ))}
                <TableCell className="text-center font-medium">
                  <span
                    className={
                      supplier.id.startsWith("fictional_")
                        ? "text-gray-500 italic"
                        : ""
                    }
                  >
                    {supplier.supply}
                  </span>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell className="font-medium">Demand</TableCell>
              {balancedRecipients.map((recipient) => (
                <TableCell
                  key={recipient.id}
                  className="text-center font-medium"
                >
                  <span
                    className={
                      recipient.id.startsWith("fictional_")
                        ? "text-gray-500 italic"
                        : ""
                    }
                  >
                    {recipient.demand}
                  </span>
                </TableCell>
              ))}
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="bg-muted/50 rounded-lg border p-4">
        <h3 className="mb-2 font-semibold">Problem Balance Status</h3>
        {fictionalSupplier && fictionalSupplier.supply > 0 ? (
          <p className="text-sm text-gray-600">
            <span className="font-medium text-orange-600">Unbalanced:</span>{" "}
            Total demand exceeds supply by {fictionalSupplier.supply}. Added
            fictional supplier <span className="italic">SF</span> to provide the
            shortage.
          </p>
        ) : fictionalRecipient && fictionalRecipient.demand > 0 ? (
          <p className="text-sm text-gray-600">
            <span className="font-medium text-orange-600">Unbalanced:</span>{" "}
            Total supply exceeds demand by {fictionalRecipient.demand}. Added
            fictional recipient <span className="italic">RF</span> to absorb the
            excess.
          </p>
        ) : (
          <p className="text-sm text-gray-600">
            <span className="font-medium text-green-600">Balanced:</span> Total
            supply equals total demand. Fictional entities shown with zero
            values.
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded bg-blue-50 p-4 dark:bg-red-950">
          <h3 className="font-semibold">Total Cost</h3>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            ${totalCost.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Transport + Purchase costs
          </p>
        </div>
        <div className="rounded bg-green-50 p-4 dark:bg-green-950">
          <h3 className="font-semibold">Total Income</h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            ${totalIncome.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-gray-500">Revenue from recipients</p>
        </div>
        <div className="rounded bg-purple-50 p-4 dark:bg-blue-950">
          <h3 className="font-semibold">Total Profit</h3>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            ${totalProfit.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-gray-500">Income - Costs</p>
        </div>
      </div>

      <div className="flex justify-between">
        <Button onClick={prevStep} variant="secondary">
          Back to Costs
        </Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button>View Profit Matrix</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Profit Matrix</DialogTitle>
              <DialogDescription>
                Profit per unit for each supplier-recipient combination
                (Recipient Purchase Price - Transport Cost - Supplier Selling
                Price)
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier/Recipient</TableHead>
                    {balancedRecipients
                      .filter(
                        (recipient) => !recipient.id.startsWith("fictional_"),
                      )
                      .map((recipient) => (
                        <TableHead key={recipient.id} className="text-center">
                          {recipient.name}
                        </TableHead>
                      ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {balancedSuppliers
                    .filter((supplier) => !supplier.id.startsWith("fictional_"))
                    .map((supplier) => {
                      const supplierIndex = balancedSuppliers.findIndex(
                        (s) => s.id === supplier.id,
                      );
                      return (
                        <TableRow key={supplier.id}>
                          <TableCell className="font-medium">
                            {supplier.name}
                          </TableCell>
                          {balancedRecipients
                            .filter(
                              (recipient) =>
                                !recipient.id.startsWith("fictional_"),
                            )
                            .map((recipient) => {
                              const recipientIndex =
                                balancedRecipients.findIndex(
                                  (r) => r.id === recipient.id,
                                );
                              return (
                                <TableCell
                                  key={recipient.id}
                                  className="text-center"
                                >
                                  <span
                                    className={
                                      profitMatrix[supplierIndex][
                                        recipientIndex
                                      ] >= 0
                                        ? "font-medium text-green-600"
                                        : "font-medium text-red-600"
                                    }
                                  >
                                    $
                                    {profitMatrix[supplierIndex][
                                      recipientIndex
                                    ].toFixed(2)}
                                  </span>
                                </TableCell>
                              );
                            })}
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </Dialog>

        <Button onClick={resetData} variant="outline">
          Start Over
        </Button>
      </div>
    </div>
  );
}
