import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowRight } from "lucide-react";
import logoContinental from "../../assets/Logo continental.png";
import { useAppStore } from "../store/appStore";
import { toast } from "sonner";

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAppStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const ok = await login(email, password);
    setIsLoading(false);
    if (ok) {
      toast.success("Sesión iniciada correctamente");
      // Si veníamos de una ruta protegida, volvemos allí
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from && from !== "/login" ? from : "/resumen", { replace: true });
    } else {
      toast.error("Credenciales inválidas", {
        description: "Verifica tu correo y que la contraseña tenga al menos 4 caracteres.",
      });
    }
  };

  const fillDemo = () => {
    setEmail("maria.garcia@continental.com");
    setPassword("demo1234");
  };

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-azul-oscuro text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
          backgroundSize: "32px 32px"
        }} />
        <div className="relative z-10">
          <img src={logoContinental} alt="Continental" className="h-12" />
        </div>
        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Gestiona tus comisiones
            <br />
            <span className="text-celeste">sin complicaciones</span>
          </h1>
          <p className="text-white/80 text-lg max-w-md">
            Confirma pagos, factura tus comisiones y consulta el historial desde un solo lugar, con la confianza de Continental.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-6 max-w-md">
            <Stat number="24h" label="Procesamiento" />
            <Stat number="100%" label="Trazabilidad" />
            <Stat number="4" label="Estados claros" />
          </div>
        </div>
        <div className="relative z-10 text-sm text-white/50">
          © {new Date().getFullYear()} Continental. Todos los derechos reservados.
        </div>
      </div>

      {/* Panel derecho - formulario */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-canvas">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex justify-center">
            <img src={logoContinental} alt="Continental" className="h-12" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-azul-oscuro">Iniciar sesión</h2>
            <p className="text-text-secondary mt-1 text-sm">
              Ingresa tus credenciales para acceder a tu portal de comisiones.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-azul-oscuro mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu.correo@continental.com"
                  className="w-full pl-10 pr-4 py-3 border border-border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-celeste focus:border-celeste transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-azul-oscuro mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={4}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 border border-border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-celeste focus:border-celeste transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-secondary hover:text-azul-oscuro"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-azul-oscuro" />
                <span className="text-text-secondary">Recordarme</span>
              </label>
              <a href="#" className="text-azul-oscuro hover:text-celeste font-medium">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-azul-oscuro text-white rounded-lg hover:bg-azul-oscuro-hover transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 shadow-md hover:shadow-lg"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Ingresar
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-4 border-t border-border-base">
            <button
              type="button"
              onClick={fillDemo}
              className="text-xs text-azul-oscuro hover:text-celeste inline-flex items-center gap-1"
            >
              Probar con datos demo
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
      <p className="text-2xl font-bold text-celeste">{number}</p>
      <p className="text-xs text-white/70">{label}</p>
    </div>
  );
}
