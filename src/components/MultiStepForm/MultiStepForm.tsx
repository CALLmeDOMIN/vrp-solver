import CapacitySupplyForm from "@/components/CapacitySupplyForm/CapacitySupplyForm";
import CostsForm from "@/components/CostsForm/CostsForm";
import InitialForm from "@/components/InitialForm/InitialForm";
import SolutionDisplay from "@/components/SolutionDisplay/SolutionDisplay";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDataContext } from "@/context/DataContext";

export default function MultiStepForm() {
  const { step } = useDataContext();

  return (
    <Card className="max-w-4xl min-w-96">
      <CardHeader>
        <CardTitle>Mediator Problem Solver</CardTitle>
        <CardDescription>
          Maximize profit in your transportation problem
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 1 ? (
          <InitialForm />
        ) : step === 2 ? (
          <CapacitySupplyForm />
        ) : step === 3 ? (
          <CostsForm />
        ) : (
          <SolutionDisplay />
        )}
      </CardContent>
    </Card>
  );
}
