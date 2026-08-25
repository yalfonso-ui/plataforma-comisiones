import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { BTN_PRIMARY, BTN_SECONDARY, TEXT_SECONDARY, BORDER_DEFAULT, alertBg, alertText } from "../utils/ui";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  info?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info);
    this.setState({ info });
  }

  handleReload = () => window.location.reload();
  handleReset = () => {
    try {
      localStorage.removeItem("continental-comisiones");
    } catch {}
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const stack = this.state.info?.componentStack ?? "";
    const message = this.state.error?.message ?? "";

    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-6">
        <div className={`bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full text-center ${BORDER_DEFAULT} border`}>
          <div className="w-16 h-16 mx-auto bg-danger-soft rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-danger" />
          </div>
          <h2 className="text-2xl font-bold text-azul-oscuro mb-2">Algo salió mal</h2>
          <p className={`${TEXT_SECONDARY} mb-6`}>
            La aplicación encontró un error inesperado. Puedes intentar recargar la página o reiniciar los datos de demostración.
          </p>
          {(message || stack) && (
            <details className="mb-6 text-left" open>
              <summary className={`text-xs ${TEXT_SECONDARY} cursor-pointer hover:text-azul-oscuro`}>
                Detalle técnico
              </summary>
              {message && (
                <pre className={`mt-2 text-[10px] text-danger ${alertBg.danger} p-3 rounded overflow-auto max-h-40`}>
                  {message}
                </pre>
              )}
              {stack && (
                <pre className="mt-2 text-[9px] text-text-secondary bg-canvas p-3 rounded overflow-auto max-h-60 whitespace-pre-wrap">
                  {stack}
                </pre>
              )}
            </details>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={this.handleReload}
              className={`${BTN_PRIMARY} px-5 py-2.5 rounded-lg font-medium inline-flex items-center justify-center gap-2`}
            >
              <RotateCcw className="w-4 h-4" />
              Recargar página
            </button>
            <button
              onClick={this.handleReset}
              className={`${BTN_SECONDARY} px-5 py-2.5 rounded-lg font-medium`}
            >
              Reiniciar datos demo
            </button>
          </div>
        </div>
      </div>
    );
  }
}
