import { useEffect, useState } from "react";
import { useNavigate, useLocation, Navigate, useSearchParams } from "react-router";
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowRight, Shield, KeyRound, AlertCircle } from "lucide-react";
import logoContinental from "../../assets/Logo continental.png";
import { useAppStore } from "../store/appStore";
import { MOCK_USERS } from "../auth/mockUsers";
import { ROLE_META, type AppRole } from "../auth/permissions";
import {
  isValidInviteToken,
  isInviteValidated,
  setInviteValidated as persistInviteValidated,
} from "../auth/inviteTokens";
import { toast } from "sonner";

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const login = useAppStore((s) => s.login);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteToken, setInviteToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inviteValidated, setInviteValidated] = useState<boolean>(() => isInviteValidated());

  // Si la URL trae ?token=XXX y es válido, lo aceptamos automáticamente.
  useEffect(() => {
    const urlToken = searchParams.get("token");
    if (urlToken && isValidInviteToken(urlToken)) {
      persistInviteValidated(true);
      setInviteValidated(true);
      // Limpiar el token de la URL para no exponerlo en el historial.
      searchParams.delete("token");
      navigate({ pathname: location.pathname, search: searchParams.toString() }, { replace: true });
      toast.success("Acceso concedido", {
        description: "Token de invitación validado. Ingresa con tus credenciales.",
      });
    }
  }, [searchParams, location.pathname, navigate]);

  // Si el usuario YA está autenticado y entra a /login, lo mandamos
  // al dashboard. Asi /login siempre es la puerta de entrada
  // para sesiones nuevas y nunca queda atrapado.
  if (isAuthenticated) {
    const from = (location.state as { from?: string } | null)?.from;
    return <Navigate to={from && from !== "/login" ? from : "/resumen"} replace />;
  }

  // ── Pantalla 1: Validar token de invitación ──
  if (!inviteValidated) {
    const handleInviteSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (isValidInviteToken(inviteToken)) {
        persistInviteValidated(true);
        setInviteValidated(true);
        toast.success("Acceso concedido", {
          description: "Ahora ingresa con tus credenciales.",
        });
      } else {
        toast.error("Código de invitación inválido", {
          description: "Verifica el código con quien te invitó a la demo.",
        });
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-azul-oscuro via-azul-oscuro to-[#002a6e] p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 sm:p-10">
          {/* Header */}
          <div className="flex justify-center mb-6">
            <img src={logoContinental} alt="Continental" className="h-10" />
          </div>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-celeste-soft rounded-2xl mb-4">
              <KeyRound className="w-7 h-7 text-azul-oscuro" />
            </div>
            <h1 className="text-2xl font-bold text-azul-oscuro">Acceso restringido</h1>
            <p className="text-text-secondary mt-2 text-sm">
              Esta demo es privada. Ingresa el código de invitación que te compartieron.
            </p>
          </div>

          <form onSubmit={handleInviteSubmit} className="space-y-5">
            <div>
              <label htmlFor="invite" className="block text-sm font-medium text-azul-oscuro mb-2">
                Código de invitación
              </label>
              <input
                id="invite"
                type="text"
                required
                autoFocus
                autoComplete="off"
                value={inviteToken}
                onChange={(e) => setInviteToken(e.target.value)}
                placeholder="CC-2026-..."
                className="w-full px-4 py-3 border border-border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-celeste focus:border-celeste transition-colors font-mono text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 bg-azul-oscuro text-white rounded-lg hover:bg-azul-oscuro-hover transition-all font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <Shield className="w-4 h-4" />
              Validar acceso
            </button>
          </form>

          <div className="mt-6 flex items-start gap-2 text-xs text-text-secondary bg-canvas rounded-lg p-3">
            <AlertCircle className="w-4 h-4 text-text-secondary flex-shrink-0 mt-0.5" />
            <p>
              ¿No tienes un código? Esta demo es interna. Pídele el enlace de invitación
              a quien te la compartió.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Pantalla 2: Credenciales ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const ok = await login(email, password);
    setIsLoading(false);
    if (ok) {
      toast.success("Sesión iniciada correctamente");
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from && from !== "/login" ? from : "/resumen", { replace: true });
    } else {
      toast.error("Credenciales inválidas", {
        description: "Verifica tu correo y contraseña. Revisa los usuarios demo disponibles.",
      });
    }
  };

  const quickLogin = (mockEmail: string) => {
    setEmail(mockEmail);
    setPassword("demo");
  };

  const handleLogoutInvite = () => {
    persistInviteValidated(false);
    setInviteValidated(false);
    setInviteToken("");
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
            <Stat number="4" label="Roles claros" />
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
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-azul-oscuro">Iniciar sesión</h2>
              <button
                type="button"
                onClick={handleLogoutInvite}
                className="text-xs text-text-secondary hover:text-azul-oscuro underline"
                title="Cerrar el acceso de invitación y volver a pedir código"
              >
                Cambiar código de invitación
              </button>
            </div>
            <p className="text-text-secondary text-sm">
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

          {/* Quick login por rol */}
          <div className="pt-4 border-t border-border-base">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-celeste" />
              <span className="text-xs font-semibold text-azul-oscuro uppercase tracking-wider">
                Acceso rápido por rol
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {MOCK_USERS.map((mock) => {
                const meta = ROLE_META[mock.rol];
                return (
                  <button
                    key={mock.email}
                    type="button"
                    onClick={() => quickLogin(mock.email)}
                    className={`text-left px-3 py-2.5 rounded-lg border border-border-base hover:border-celeste hover:bg-celeste-soft transition-all text-sm group`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-celeste-soft text-azul-oscuro rounded-full flex items-center justify-center text-[10px] font-bold group-hover:bg-celeste">
                        {mock.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-azul-oscuro text-xs truncate">{meta.label}</p>
                        <p className="text-[10px] text-text-secondary truncate">{mock.name.split(" ")[0]}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
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
