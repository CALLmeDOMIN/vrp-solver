/* eslint-disable react-refresh/only-export-components */
import {
  balanceProblem,
  calculateTotals,
  createProfitMatrix,
  solveVAM,
  type SolverInput,
} from "@/lib/mediatorSolver";
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
      return null;
    }

    const input: SolverInput = {
      suppliers: data.suppliers,
      recipients: data.recipients,
      costs: data.costs,
    };

    const { suppliers, recipients, costs } = balanceProblem(input);

    const profitMatrix = createProfitMatrix(suppliers, recipients, costs);

    const solution = solveVAM(suppliers, recipients, profitMatrix);

    const { totalCost, totalIncome, totalProfit } = calculateTotals(
      solution,
      suppliers,
      recipients,
      costs,
    );

    return {
      solution,
      totalProfit,
      totalCost,
      totalIncome,
      balancedSuppliers: suppliers,
      balancedRecipients: recipients,
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
