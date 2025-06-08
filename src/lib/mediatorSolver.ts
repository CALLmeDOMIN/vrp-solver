export type SolverInput = {
  suppliers: Array<{
    id: string;
    name: string;
    supply: number;
    sellingPrice: number;
  }>;
  recipients: Array<{
    id: string;
    name: string;
    demand: number;
    purchasePrice: number;
  }>;
  costs: Record<string, Record<string, number>>;
};

export type SolverResult = {
  solution: number[][];
  totalProfit: number;
  totalCost: number;
  totalIncome: number;
  balancedSuppliers: Array<{
    id: string;
    name: string;
    supply: number;
    sellingPrice: number;
  }>;
  balancedRecipients: Array<{
    id: string;
    name: string;
    demand: number;
    purchasePrice: number;
  }>;
};

export function balanceProblem(input: SolverInput): {
  suppliers: typeof input.suppliers;
  recipients: typeof input.recipients;
  costs: typeof input.costs;
} {
  const suppliers = [...input.suppliers];
  const recipients = [...input.recipients];
  const costs = { ...input.costs };

  const totalSupply = suppliers.reduce((sum, s) => sum + s.supply, 0);
  const totalDemand = recipients.reduce((sum, r) => sum + r.demand, 0);

  const excessSupply = Math.max(0, totalSupply - totalDemand);
  const fictionalRecipient = {
    id: `fictional_r`,
    name: `RF`,
    demand: excessSupply,
    purchasePrice: 0,
  };
  recipients.push(fictionalRecipient);

  costs[fictionalRecipient.id] = {};
  suppliers.forEach((supplier) => {
    costs[fictionalRecipient.id][supplier.id] = 0;
  });

  const excessDemand = Math.max(0, totalDemand - totalSupply);
  const fictionalSupplier = {
    id: `fictional_s`,
    name: `SF`,
    supply: excessDemand,
    sellingPrice: 0,
  };
  suppliers.push(fictionalSupplier);

  recipients.forEach((recipient) => {
    if (!costs[recipient.id]) costs[recipient.id] = {};
    costs[recipient.id][fictionalSupplier.id] = 0;
  });

  return { suppliers, recipients, costs };
}

export function createProfitMatrix(
  suppliers: SolverInput["suppliers"],
  recipients: SolverInput["recipients"],
  costs: SolverInput["costs"],
): number[][] {
  const m = suppliers.length;
  const n = recipients.length;
  const profitMatrix: number[][] = [];

  for (let i = 0; i < m; i++) {
    profitMatrix[i] = [];
    for (let j = 0; j < n; j++) {
      const transportCost = costs[recipients[j].id][suppliers[i].id];
      const whatRecipientPaysUs = recipients[j].purchasePrice;
      const whatWePaySupplier = suppliers[i].sellingPrice;
      const profit = whatRecipientPaysUs - transportCost - whatWePaySupplier;
      profitMatrix[i][j] = profit;
    }
  }

  return profitMatrix;
}

export function solveVAM(
  suppliers: SolverInput["suppliers"],
  recipients: SolverInput["recipients"],
  profitMatrix: number[][],
): number[][] {
  const m = suppliers.length;
  const n = recipients.length;

  const solution: number[][] = Array(m)
    .fill(0)
    .map(() => Array(n).fill(0));
  const supply = [...suppliers.map((s) => s.supply)];
  const demand = [...recipients.map((r) => r.demand)];

  const isRowEliminated = Array(m).fill(false);
  const isColEliminated = Array(n).fill(false);

  while (true) {
    const availableAllocations: Array<{
      i: number;
      j: number;
      profit: number;
      maxAllocation: number;
      totalProfit: number;
    }> = [];

    for (let i = 0; i < m; i++) {
      if (isRowEliminated[i] || suppliers[i].id.startsWith("fictional_"))
        continue;

      for (let j = 0; j < n; j++) {
        if (isColEliminated[j] || recipients[j].id.startsWith("fictional_"))
          continue;

        const maxAllocation = Math.min(supply[i], demand[j]);
        if (maxAllocation > 0) {
          const profit = profitMatrix[i][j];
          const totalProfit = profit * maxAllocation;

          availableAllocations.push({
            i,
            j,
            profit,
            maxAllocation,
            totalProfit,
          });
        }
      }
    }

    if (availableAllocations.length === 0) break;

    availableAllocations.sort((a, b) => {
      if (b.totalProfit !== a.totalProfit) {
        return b.totalProfit - a.totalProfit;
      }
      return b.profit - a.profit;
    });

    const best = availableAllocations[0];
    const { i: selectedRow, j: selectedCol, maxAllocation } = best;

    solution[selectedRow][selectedCol] = maxAllocation;
    supply[selectedRow] -= maxAllocation;
    demand[selectedCol] -= maxAllocation;

    if (supply[selectedRow] === 0) {
      isRowEliminated[selectedRow] = true;
    }
    if (demand[selectedCol] === 0) {
      isColEliminated[selectedCol] = true;
    }
  }

  for (let i = 0; i < m; i++) {
    if (supply[i] > 0) {
      for (let j = 0; j < n; j++) {
        if (recipients[j].id.startsWith("fictional_") && demand[j] > 0) {
          const allocation = Math.min(supply[i], demand[j]);
          solution[i][j] = allocation;
          supply[i] -= allocation;
          demand[j] -= allocation;

          if (supply[i] === 0) break;
        }
      }
    }
  }

  for (let j = 0; j < n; j++) {
    if (demand[j] > 0) {
      for (let i = 0; i < m; i++) {
        if (suppliers[i].id.startsWith("fictional_") && supply[i] > 0) {
          const allocation = Math.min(supply[i], demand[j]);
          solution[i][j] = allocation;
          supply[i] -= allocation;
          demand[j] -= allocation;

          if (demand[j] === 0) break;
        }
      }
    }
  }

  return solution;
}

export function calculateTotals(
  solution: number[][],
  suppliers: SolverInput["suppliers"],
  recipients: SolverInput["recipients"],
  costs: SolverInput["costs"],
): { totalCost: number; totalIncome: number; totalProfit: number } {
  let totalCost = 0;
  let totalIncome = 0;

  const m = suppliers.length;
  const n = recipients.length;

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (solution[i][j] > 0) {
        const quantity = solution[i][j];
        const supplier = suppliers[i];
        const recipient = recipients[j];

        const isFictionalSupplier = supplier.id.startsWith("fictional_");
        const isFictionalRecipient = recipient.id.startsWith("fictional_");

        if (!isFictionalSupplier && !isFictionalRecipient) {
          const transportCost = costs[recipient.id][supplier.id];
          const whatWePaySupplier = supplier.sellingPrice;
          const whatRecipientPaysUs = recipient.purchasePrice;

          const costForThisRoute =
            quantity * (transportCost + whatWePaySupplier);
          const incomeForThisRoute = quantity * whatRecipientPaysUs;

          totalCost += costForThisRoute;
          totalIncome += incomeForThisRoute;
        }
      }
    }
  }

  const totalProfit = totalIncome - totalCost;
  return { totalCost, totalIncome, totalProfit };
}
