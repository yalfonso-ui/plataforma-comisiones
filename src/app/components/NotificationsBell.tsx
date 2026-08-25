import { useEffect, useRef, useState } from "react";
import { Bell, Check, Info, AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAppStore, Notification } from "../store/appStore";
import { useNavigate } from "react-router";
import { formatDistanceToNow } from "../utils/date";
import { TEXT_SECONDARY, BORDER_DEFAULT, BG_CANVAS } from "../utils/ui";

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const notifications = useAppStore((s) => s.notifications);
  const markRead = useAppStore((s) => s.markNotificationRead);
  const markAllRead = useAppStore((s) => s.markAllNotificationsRead);

  const unread = notifications.filter(n => !n.leida).length;

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", handle);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleClick = (n: Notification) => {
    markRead(n.id);
    setOpen(false);
    if (n.href) navigate(n.href);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label={`Notificaciones${unread > 0 ? ` (${unread} sin leer)` : ""}`}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`relative p-2 rounded-lg transition-colors text-azul-oscuro ${open ? "bg-canvas" : "hover:bg-canvas"}`}
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white"
            title={`${unread} sin leer`}
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Notificaciones"
          className={`absolute right-0 mt-2 w-80 sm:w-96 bg-white text-azul-oscuro rounded-xl shadow-2xl ${BORDER_DEFAULT} border z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200`}
        >
          <div className={`flex items-center justify-between p-4 border-b ${BORDER_DEFAULT}`}>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Notificaciones</h3>
              {unread > 0 && (
                <span className="text-[10px] bg-celeste text-azul-oscuro px-1.5 py-0.5 rounded-full font-bold">
                  {unread} nueva{unread > 1 ? "s" : ""}
                </span>
              )}
            </div>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-azul-oscuro hover:text-celeste inline-flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                Marcar todas
              </button>
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className={`p-8 text-center ${TEXT_SECONDARY} text-sm`}>
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                Sin notificaciones
              </div>
            ) : (
              notifications.map(n => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onClick={() => handleClick(n)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const notificationVariant = {
  info: { icon: Info, bg: "bg-info-soft", text: "text-info", border: "border-info-border/30" },
  success: { icon: CheckCircle2, bg: "bg-success-soft", text: "text-success", border: "border-success-border/30" },
  warning: { icon: AlertTriangle, bg: "bg-warning-soft", text: "text-warning", border: "border-warning-border/30" },
  error: { icon: AlertCircle, bg: "bg-danger-soft", text: "text-danger", border: "border-danger-border/30" },
} as const;

function NotificationItem({ notification, onClick }: { notification: Notification; onClick: () => void }) {
  const variant = notificationVariant[notification.tipo];
  const Icon = variant.icon;

  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={`w-full text-left px-4 py-3 flex gap-3 items-start hover:bg-canvas transition-colors border-b border-border-base ${
        !notification.leida ? "bg-celeste-soft" : ""
      }`}
    >
      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${variant.bg} ${variant.text} border ${variant.border}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm ${!notification.leida ? "font-semibold" : "font-medium"} text-azul-oscuro`}>
            {notification.titulo}
          </p>
          {!notification.leida && (
            <span className="w-2 h-2 bg-celeste rounded-full flex-shrink-0 mt-1.5" aria-label="Sin leer" />
          )}
        </div>
        <p className={`text-xs ${TEXT_SECONDARY} line-clamp-2 mt-0.5`}>{notification.mensaje}</p>
        <p className={`text-[10px] ${TEXT_SECONDARY} opacity-70 mt-1`}>{formatDistanceToNow(notification.fecha)}</p>
      </div>
    </button>
  );
}
