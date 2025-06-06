/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useState } from "react";

type Data = {
  supplierAmount: number | undefined;
  recipientAmount: number | undefined;
  suppliers: Array<{ id: string; name: string; supply: number }>;
  recipients: Array<{ id: string; name: string; demand: number }>;
};

type DataContextType = Data & {
  setSupplierAndRecipientAmounts: (
    supplierAmount: number,
    recipientAmount: number,
  ) => void;
  updateSupplier: (
    id: string,
    updates: Partial<{ name: string; supply: number }>,
  ) => void;
  updateRecipient: (
    id: string,
    updates: Partial<{ name: string; demand: number }>,
  ) => void;
  resetData: () => void;
  step: number;
  nextStep: () => void;
  prevStep: () => void;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Data>({
    supplierAmount: undefined,
    recipientAmount: undefined,
    suppliers: [],
    recipients: [],
  });

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
        })),
        recipients: Array.from({ length: recipientAmount }, (_, i) => ({
          id: `r${i + 1}`,
          name: `R${i + 1}`,
          demand: 0,
        })),
      }));
    },
    [],
  );

  const updateSupplier = useCallback(
    (id: string, updates: Partial<{ name: string; supply: number }>) => {
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
    (id: string, updates: Partial<{ name: string; demand: number }>) => {
      setData((prev) => ({
        ...prev,
        recipients: prev.recipients.map((recipient) =>
          recipient.id === id ? { ...recipient, ...updates } : recipient,
        ),
      }));
    },
    [],
  );

  const resetData = useCallback(() => {
    setData({
      supplierAmount: undefined,
      recipientAmount: undefined,
      suppliers: [],
      recipients: [],
    });
  }, []);

  const [step, setStep] = useState(1);
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
