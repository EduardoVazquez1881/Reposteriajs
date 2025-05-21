import { Suspense } from "react";
import InventarioPage from "./InventarioPage";

export default function Page() {
  return (
    <Suspense fallback={<div>Cargando inventario...</div>}>
      <InventarioPage />
    </Suspense>
  );
}
