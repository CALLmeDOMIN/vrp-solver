import InitialForm from "@/components/InitialForm/InitialForm";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDataContext } from "@/context/DataContext";
import CapacitySupplyForm from "../CapacitySupplyForm/CapacitySupplyForm";
import CostsForm from "../CostsForm/CostsForm";

export default function MultiStepForm() {
  const { step } = useDataContext();

  return (
    <Card className="min-w-96">
      <CardHeader>
        <CardTitle>VRP Solver</CardTitle>
        <CardDescription>Optimize your vehicle routing problem</CardDescription>
        <CardAction>Get Started</CardAction>
      </CardHeader>
      <CardContent>
        {step === 1 ? (
          <InitialForm />
        ) : step === 2 ? (
          <CapacitySupplyForm />
        ) : (
          <CostsForm />
        )}
      </CardContent>
    </Card>
  );
}
