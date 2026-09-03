# Plataforma de Gestión de Comisiones

Sistema interno de gestión de comisiones, facturación CFDI 4.0 y dispersión de pagos para la red comercial.

Diseñado originalmente como prototipo Figma: https://www.figma.com/design/jIPOXf29VeCEECmRHl0DK5/Plataforma-de-Gesti%C3%B3n-de-Comisiones

---

## 🚀 Demo en vivo

**https://yalfonso-ui.github.io/plataforma-comisiones/**

> URL relativa al repo; tras configurar GitHub Pages (ver más abajo) queda disponible públicamente.

---

## 🔐 Usuarios de prueba (todos con password `demo`)

| Email | Rol | Identidad |
|---|---|---|
| `maria.garcia@continental.com` | Comercial | María García López (BBVA) |
| `cartera@continental.com` | Cartera | Andrea Ramírez (Bancolombia) |
| `comisiones@continental.com` | Comisiones | Luis Torres (Davivienda) |
| `admin@continental.com` | super_admin | Sistemas Admin (Banorte) |

El `RoleSwitcher` (dentro del menú de usuario) permite alternar entre identidades en la sesión demo.

---

## 🧰 Stack técnico

- **React 18 + TypeScript + Vite 6**
- **Tailwind CSS 4** (design system propio, ver `DESIGN_SYSTEM.md`)
- **React Router 7** (BrowserRouter + 404 fallback para SPA en GitHub Pages)
- **Zustand** (con persistencia en localStorage)
- **lucide-react** (iconografía)

---

## 📂 Estructura de carpetas

```
src/
├── app/
│   ├── components/      Componentes UI principales
│   │   ├── admin/        Módulos super_admin (Agencias, Usuarios, Config)
│   │   ├── cartera/      Módulo rol Cartera (aprobación de facturas)
│   │   ├── comisiones/   Módulo rol Comisiones (dispersión ACH)
│   │   ├── facturar/     Wizard de facturación CFDI 4.0
│   │   └── ui/           Primitivos (shadcn-style)
│   ├── auth/             RBAC, mock users y agencias
│   ├── hooks/            Hooks de React personalizados
│   ├── store/            Estado global (Zustand)
│   ├── types/            Tipos del dominio
│   └── utils/            Helpers (fiscal, fileValidation, dispersion, xlsx)
├── assets/               Recursos estáticos
└── styles/               CSS global y tokens de Tailwind
```

---

## 💻 Desarrollo local

```bash
npm install         # o pnpm install
npm run dev         # arranca Vite en http://localhost:5173
npm run build       # compila para producción en dist/
```

---

## 🌐 Despliegue en GitHub Pages

El repo se despliega automáticamente a GitHub Pages con cada push a `main`.

**Setup inicial (una sola vez):**

1. Ve a **Settings → Pages** del repo en GitHub.
2. En **Source**, selecciona **GitHub Actions** (no "Deploy from a branch").
3. El workflow `.github/workflows/deploy.yml` se ejecuta automáticamente en el primer push a `main`.

**URL pública:** https://yalfonso-ui.github.io/plataforma-comisiones/

**Build size:** ~590 KB minificado / 166 KB gzipped.

**Rutas SPA:** el workflow genera un `404.html` que apunta al bundle para que rutas como `/cartera` o `/facturar` funcionen directamente (no requieren hash).

---

## 🧪 Archivos de prueba

La carpeta `samples/` contiene pares de XML CFDI 4.0 + PDF mínimos válidos para probar el wizard de facturación end-to-end:

- `factura-A-001234.{xml,pdf}` — Persona Jurídica
- `factura-B-005678.{xml,pdf}` — Persona Natural con ISR

Ambos pasan el validador cruzado (`folio` o `UUID` en el nombre del PDF coincide con el del XML).

---

## 📜 Scripts

```bash
npm run dev         # desarrollo
npm run build       # build de producción
```
