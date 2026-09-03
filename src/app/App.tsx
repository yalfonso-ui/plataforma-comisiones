import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Toaster } from "sonner";
import { ErrorBoundary } from "./components/ErrorBoundary";

/**
 * NOTA: ScrollToTop se movió DENTRO del árbol del router (routes.tsx)
 * como parte de RootLayout. Si se renderiza como hermano de RouterProvider,
 * el hook que usa useLocation() crashea porque necesita el contexto
 * del router activo.
 */
export default function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4500,
          className: "!rounded-xl !shadow-lg",
          style: {
            background: "white",
            color: "var(--color-azul-oscuro)",
            border: "1px solid var(--color-border-base)",
          },
        }}
      />
    </ErrorBoundary>
  );
}
