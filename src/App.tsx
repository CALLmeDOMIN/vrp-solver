import MultiStepForm from "./components/MultiStepForm/MultiStepForm";
import { DataProvider } from "./context/DataContext";

function App() {
  return (
    <DataProvider>
      <div className="flex min-h-screen items-center justify-center">
        <MultiStepForm />
      </div>
    </DataProvider>
  );
}

export default App;
