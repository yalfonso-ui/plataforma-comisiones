import { createBrowserRouter, Navigate } from "react-router";
import { DashboardLayout } from "./components/DashboardLayout";
import { Resumen } from "./components/Resumen";
import { Cartera } from "./components/Cartera";
import { Facturar } from "./components/Facturar";
import { Historial } from "./components/Historial";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: DashboardLayout,
    children: [
      { index: true, element: <Navigate to="/resumen" replace /> },
      { path: "resumen", Component: Resumen },
      { path: "cartera", Component: Cartera },
      { path: "facturar", Component: Facturar },
      { path: "historial", Component: Historial },
    ],
  },
]);