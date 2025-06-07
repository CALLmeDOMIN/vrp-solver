/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useState } from "react";

type Data = {
  supplierAmount: number | undefined;
  recipientAmount: number | undefined;
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
  costs: Record<string, Record<string, number>> | undefined;
};

type DataContextType = Data & {
  setSupplierAndRecipientAmounts: (
    supplierAmount: number,
    recipientAmount: number,
  ) => void;
  updateSupplier: (
    id: string,
    updates: Partial<{ name: string; supply: number; sellingPrice: number }>,
  ) => void;
  updateRecipient: (
    id: string,
    updates: Partial<{ name: string; demand: number; purchasePrice: number }>,
  ) => void;
  resetData: () => void;
  step: number;
  nextStep: () => void;
  prevStep: () => void;
  setCosts: (costs: Record<string, Record<string, number>>) => void;
  solveMediatorProblem: () => {
    solution: number[][];
    totalProfit: number;
    totalCost: number;
    totalIncome: number;
  } | null;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Data>({
    supplierAmount: undefined,
    recipientAmount: undefined,
    suppliers: [],
    recipients: [],
    costs: undefined,
  });

  const [step, setStep] = useState(1);

  const setSupplierAndRecipientAmounts = useCallback(
    (supplierAmount: number, recipientAmount: number) => {
      setData((prev) => ({
        ...prev,
        supplierAmount,
        recipientAmount,
        suppliers: Array.from({ length: supplierAmount }, (_, i) => ({
          id: `s${i + 1}`,
          name: `S${i + 1}`,
          supply: 0,
          sellingPrice: 0,
        })),
        recipients: Array.from({ length: recipientAmount }, (_, i) => ({
          id: `r${i + 1}`,
          name: `R${i + 1}`,
          demand: 0,
          purchasePrice: 0,
        })),
      }));
    },
    [],
  );

  const updateSupplier = useCallback(
    (
      id: string,
      updates: Partial<{ name: string; supply: number; sellingPrice: number }>,
    ) => {
      setData((prev) => ({
        ...prev,
        suppliers: prev.suppliers.map((supplier) =>
          supplier.id === id ? { ...supplier, ...updates } : supplier,
        ),
      }));
    },
    [],
  );

  const updateRecipient = useCallback(
    (
      id: string,
      updates: Partial<{ name: string; demand: number; purchasePrice: number }>,
    ) => {
      setData((prev) => ({
        ...prev,
        recipients: prev.recipients.map((recipient) =>
          recipient.id === id ? { ...recipient, ...updates } : recipient,
        ),
      }));
    },
    [],
  );

  const setCosts = useCallback(
    (costs: Record<string, Record<string, number>>) => {
      setData((prev) => ({ ...prev, costs }));
    },
    [],
  );

  const solveMediatorProblem = useCallback(() => {
    if (
      !data.costs ||
      data.suppliers.length === 0 ||
      data.recipients.length === 0
    ) {
      console.log("Missing data:", {
        costs: !!data.costs,
        suppliers: data.suppliers.length,
        recipients: data.recipients.length,
      });
      return null;
    }

    const m = data.suppliers.length;
    const n = data.recipients.length;

    const solution: number[][] = Array(m)
      .fill(0)
      .map(() => Array(n).fill(0));

    const supply = [...data.suppliers.map((s) => s.supply)];
    const demand = [...data.recipients.map((r) => r.demand)];

    console.log("Initial supply:", supply);
    console.log("Initial demand:", demand);
    console.log("Costs:", data.costs);

    const profitMatrix: number[][] = [];
    for (let i = 0; i < m; i++) {
      profitMatrix[i] = [];
      for (let j = 0; j < n; j++) {
        const transportCost =
          data.costs[data.recipients[j].id][data.suppliers[i].id];
        const sellingPrice = data.suppliers[i].sellingPrice;
        const purchasePrice = data.recipients[j].purchasePrice;
        const profit = sellingPrice - transportCost - purchasePrice;
        profitMatrix[i][j] = profit;
        console.log(
          `Profit[${i}][${j}] = ${sellingPrice} - ${transportCost} - ${purchasePrice} = ${profit}`,
        );
      }
    }

    const allocations: Array<{ i: number; j: number; profit: number }> = [];
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        allocations.push({ i, j, profit: profitMatrix[i][j] });
      }
    }

    allocations.sort((a, b) => b.profit - a.profit);
    console.log("Sorted allocations:", allocations);

    for (const allocation of allocations) {
      const { i, j } = allocation;
      const maxAllocation = Math.min(supply[i], demand[j]);

      if (maxAllocation > 0) {
        solution[i][j] = maxAllocation;
        supply[i] -= maxAllocation;
        demand[j] -= maxAllocation;
        console.log(`Allocated ${maxAllocation} from S${i + 1} to R${j + 1}`);
      }

      const totalSupplyLeft = supply.reduce((sum, s) => sum + s, 0);
      const totalDemandLeft = demand.reduce((sum, d) => sum + d, 0);
      if (totalSupplyLeft === 0 || totalDemandLeft === 0) {
        break;
      }
    }

    console.log("Final solution matrix:", solution);

    let totalCost = 0;
    let totalIncome = 0;

    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        if (solution[i][j] > 0) {
          const quantity = solution[i][j];
          const transportCost =
            data.costs[data.recipients[j].id][data.suppliers[i].id];
          const purchasePrice = data.recipients[j].purchasePrice;
          const sellingPrice = data.suppliers[i].sellingPrice;

          const costForThisRoute = quantity * (transportCost + purchasePrice);
          const incomeForThisRoute = quantity * sellingPrice;

          totalCost += costForThisRoute;
          totalIncome += incomeForThisRoute;

          console.log(
            `Route S${i + 1}->R${j + 1}: qty=${quantity}, cost=${costForThisRoute}, income=${incomeForThisRoute}`,
          );
        }
      }
    }

    const totalProfit = totalIncome - totalCost;

    console.log("Final totals:", { totalCost, totalIncome, totalProfit });

    return {
      solution,
      totalProfit,
      totalCost,
      totalIncome,
    };
  }, [data]);

  const resetData = useCallback(() => {
    setData({
      supplierAmount: undefined,
      recipientAmount: undefined,
      suppliers: [],
      recipients: [],
      costs: undefined,
    });
    setStep(1);
  }, []);

  const nextStep = useCallback(() => setStep((prev) => prev + 1), []);
  const prevStep = useCallback(
    () => setStep((prev) => Math.max(prev - 1, 1)),
    [],
  );

  const value = {
    ...data,
    setSupplierAndRecipientAmounts,
    updateSupplier,
    updateRecipient,
    resetData,
    step,
    nextStep,
    prevStep,
    setCosts,
    solveMediatorProblem,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useDataContext() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useDataContext must be used within a DataProvider");
  }
  return context;
}
