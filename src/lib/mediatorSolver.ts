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
  const costs = JSON.parse(JSON.stringify(input.costs));

  const totalSupply = suppliers.reduce((sum, s) => sum + s.supply, 0);
  const totalDemand = recipients.reduce((sum, r) => sum + r.demand, 0);

  if (totalSupply < totalDemand) {
    const fictionalSupplier = {
      id: `fictional_s`,
      name: `SF`,
      supply: totalDemand - totalSupply,
      sellingPrice: 0,
    };
    suppliers.push(fictionalSupplier);

    recipients.forEach((recipient) => {
      if (!costs[recipient.id]) costs[recipient.id] = {};
      costs[recipient.id][fictionalSupplier.id] = 0;
    });
  } else if (totalSupply > totalDemand) {
    const fictionalRecipient = {
      id: `fictional_r`,
      name: `RF`,
      demand: totalSupply - totalDemand,
      purchasePrice: 0,
    };
    recipients.push(fictionalRecipient);

    costs[fictionalRecipient.id] = {};
    suppliers.forEach((supplier) => {
      costs[fictionalRecipient.id][supplier.id] = 0;
    });
  }

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
  const solution = solveMaximumProfitMethod(
    suppliers,
    recipients,
    profitMatrix,
  );
  return optimizeWithMODI(solution, suppliers, recipients, profitMatrix);
}

function solveMaximumProfitMethod(
  suppliers: SolverInput["suppliers"],
  recipients: SolverInput["recipients"],
  profitMatrix: number[][],
): number[][] {
  const m = suppliers.length;
  const n = recipients.length;
  const solution: number[][] = Array(m)
    .fill(0)
    .map(() => Array(n).fill(0));
  const supply = suppliers.map((s) => s.supply);
  const demand = recipients.map((r) => r.demand);

  const allocatedCells = new Set<string>();
  const eliminatedRows = new Set<number>();
  const eliminatedCols = new Set<number>();

  while (eliminatedRows.size < m && eliminatedCols.size < n) {
    let maxProfit = -Infinity;
    let bestI = -1;
    let bestJ = -1;

    for (let i = 0; i < m; i++) {
      if (eliminatedRows.has(i)) continue;

      for (let j = 0; j < n; j++) {
        if (eliminatedCols.has(j)) continue;

        if (supply[i] > 0 && demand[j] > 0) {
          const currentProfit = profitMatrix[i][j];

          const isFictionalSupplier = suppliers[i].id.startsWith("fictional_");
          const isFictionalRecipient =
            recipients[j].id.startsWith("fictional_");

          if (!isFictionalSupplier && !isFictionalRecipient) {
            if (currentProfit > maxProfit) {
              maxProfit = currentProfit;
              bestI = i;
              bestJ = j;
            }
          }
        }
      }
    }

    if (bestI === -1 || bestJ === -1) {
      for (let i = 0; i < m; i++) {
        if (eliminatedRows.has(i)) continue;

        for (let j = 0; j < n; j++) {
          if (eliminatedCols.has(j)) continue;

          if (supply[i] > 0 && demand[j] > 0) {
            const currentProfit = profitMatrix[i][j];
            if (currentProfit > maxProfit) {
              maxProfit = currentProfit;
              bestI = i;
              bestJ = j;
            }
          }
        }
      }
    }

    if (bestI === -1 || bestJ === -1) break;

    const allocation = Math.min(supply[bestI], demand[bestJ]);
    solution[bestI][bestJ] = allocation;
    allocatedCells.add(`${bestI},${bestJ}`);

    supply[bestI] -= allocation;
    demand[bestJ] -= allocation;

    if (supply[bestI] === 0) {
      eliminatedRows.add(bestI);
    }
    if (demand[bestJ] === 0) {
      eliminatedCols.add(bestJ);
    }
  }

  ensureBasicSolution(solution, suppliers, recipients, allocatedCells);
  return solution;
}

function ensureBasicSolution(
  solution: number[][],
  suppliers: SolverInput["suppliers"],
  recipients: SolverInput["recipients"],
  allocatedCells: Set<string>,
): void {
  const m = suppliers.length;
  const n = recipients.length;
  const requiredCells = m + n - 1;

  if (allocatedCells.size < requiredCells) {
    const epsilon = 0.0001;

    for (let i = 0; i < m && allocatedCells.size < requiredCells; i++) {
      for (let j = 0; j < n && allocatedCells.size < requiredCells; j++) {
        if (!allocatedCells.has(`${i},${j}`) && solution[i][j] === 0) {
          solution[i][j] = epsilon;
          allocatedCells.add(`${i},${j}`);
        }
      }
    }
  }
}

function optimizeWithMODI(
  initialSolution: number[][],
  suppliers: SolverInput["suppliers"],
  recipients: SolverInput["recipients"],
  profitMatrix: number[][],
): number[][] {
  let solution = initialSolution.map((row) => [...row]);
  let iterations = 0;
  const maxIterations = 100;

  while (iterations < maxIterations) {
    iterations++;

    const dualVars = calculateDualVariables(solution, profitMatrix);
    if (!dualVars) break;

    const { u, v } = dualVars;

    let maxImprovement = 0;
    let enteringI = -1;
    let enteringJ = -1;

    for (let i = 0; i < suppliers.length; i++) {
      for (let j = 0; j < recipients.length; j++) {
        if (solution[i][j] === 0 || solution[i][j] < 0.001) {
          const opportunity = profitMatrix[i][j] - u[i] - v[j];
          if (opportunity > maxImprovement + 0.001) {
            maxImprovement = opportunity;
            enteringI = i;
            enteringJ = j;
          }
        }
      }
    }

    if (maxImprovement <= 0.001) break;

    const cycle = findSteppingStone(solution, enteringI, enteringJ);
    if (cycle.length < 4) break;

    const theta = calculateMinTheta(solution, cycle);
    if (theta <= 0) break;

    reallocateAlongCycle(solution, cycle, theta);
  }

  return solution;
}

function calculateDualVariables(
  solution: number[][],
  profitMatrix: number[][],
): { u: number[]; v: number[] } | null {
  const m = solution.length;
  const n = solution[0].length;
  const u: number[] = Array(m).fill(NaN);
  const v: number[] = Array(n).fill(NaN);

  u[0] = 0;

  const basicCells: Array<{ i: number; j: number }> = [];
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (solution[i][j] > 0.0001) {
        basicCells.push({ i, j });
      }
    }
  }

  let changed = true;
  let iterations = 0;

  while (changed && iterations < 200) {
    changed = false;
    iterations++;

    for (const { i, j } of basicCells) {
      if (!isNaN(u[i]) && isNaN(v[j])) {
        v[j] = profitMatrix[i][j] - u[i];
        changed = true;
      } else if (isNaN(u[i]) && !isNaN(v[j])) {
        u[i] = profitMatrix[i][j] - v[j];
        changed = true;
      }
    }
  }

  if (u.some(isNaN) || v.some(isNaN)) {
    return null;
  }

  return { u, v };
}

function findSteppingStone(
  solution: number[][],
  startI: number,
  startJ: number,
): Array<{ i: number; j: number }> {
  const m = solution.length;
  const n = solution[0].length;

  function findLoop(
    path: Array<{ i: number; j: number }>,
    horizontal: boolean,
  ): Array<{ i: number; j: number }> | null {
    const current = path[path.length - 1];

    if (path.length > 1 && current.i === startI && current.j === startJ) {
      return path;
    }

    if (path.length > 20) return null;

    if (horizontal) {
      for (let j = 0; j < n; j++) {
        if (j !== current.j && solution[current.i][j] > 0.0001) {
          const next = { i: current.i, j };
          if (!path.some((p) => p.i === next.i && p.j === next.j)) {
            const result = findLoop([...path, next], false);
            if (result) return result;
          }
        }
      }
    } else {
      for (let i = 0; i < m; i++) {
        if (i !== current.i && solution[i][current.j] > 0.0001) {
          const next = { i, j: current.j };
          if (!path.some((p) => p.i === next.i && p.j === next.j)) {
            const result = findLoop([...path, next], true);
            if (result) return result;
          }
        }
      }
    }

    return null;
  }

  const loop = findLoop([{ i: startI, j: startJ }], true);
  return loop || [];
}

function calculateMinTheta(
  solution: number[][],
  cycle: Array<{ i: number; j: number }>,
): number {
  let minTheta = Infinity;

  for (let k = 1; k < cycle.length; k += 2) {
    const { i, j } = cycle[k];
    if (solution[i][j] > 0.0001) {
      minTheta = Math.min(minTheta, solution[i][j]);
    }
  }

  return minTheta === Infinity ? 0 : minTheta;
}

function reallocateAlongCycle(
  solution: number[][],
  cycle: Array<{ i: number; j: number }>,
  theta: number,
): void {
  for (let k = 0; k < cycle.length; k++) {
    const { i, j } = cycle[k];
    if (k % 2 === 0) {
      solution[i][j] += theta;
    } else {
      solution[i][j] = Math.max(0, solution[i][j] - theta);
    }
  }
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
      if (solution[i][j] > 0.0001) {
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
