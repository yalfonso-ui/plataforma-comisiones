# 🎨 Sistema de Diseño - Plataforma Fintech Comisiones

## 📋 Resumen
Sistema de diseño para aplicaciones fintech internas con enfoque en gestión de comisiones, pagos y facturación. Diseño minimalista, moderno y funcional.

---

## 🎨 Paleta de Colores

### Colores Principales
```css
--color-primary-dark: #00184C;      /* Header, navegación, títulos */
--color-secondary-cyan: #43D3FF;    /* Estados activos, highlights, hover */
--color-cta-yellow: #F9D35A;        /* CTAs primarios, botones de acción */
```

### Colores de Estado
```css
/* Success/Confirmado */
--color-green-bg: #dcfce7;
--color-green-border: #86efac;
--color-green-text: #166534;

/* Warning/Pendiente */
--color-orange-bg: #ffedd5;
--color-orange-border: #fed7aa;
--color-orange-text: #c2410c;

/* Info/Disponible */
--color-blue-bg: #dbeafe;
--color-blue-border: #93c5fd;
--color-blue-text: #1e40af;

/* Error/Rechazado */
--color-red-bg: #fee2e2;
--color-red-border: #fca5a5;
--color-red-text: #991b1b;
```

### Colores Base
```css
--background: #F8F9FB;              /* Fondo principal */
--white: #ffffff;                   /* Cards, modales */
--border: #e5e7eb;                  /* Bordes generales */
--text-primary: #00184C;            /* Texto principal */
--text-secondary: #6b7280;          /* Texto secundario */
```

---

## 🔤 Tipografía

### Fuente
```css
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap');

font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```
**Nota:** Manrope es usado como alternativa web a Galano Grotesque.

### Jerarquía
```css
/* Títulos */
h1: font-size: 32px; font-weight: 500;
h2: font-size: 24px; font-weight: 500;
h3: font-size: 20px; font-weight: 500;
h4: font-size: 16px; font-weight: 500;

/* Texto */
p:  font-size: 16px; font-weight: 400;
small: font-size: 14px;
xs: font-size: 12px;

/* Labels y botones */
label: font-weight: 500;
button: font-weight: 500;
```

---

## 📐 Espaciado y Bordes

```css
/* Border Radius */
--radius-sm: 6px;   /* Inputs pequeños, badges */
--radius-md: 8px;   /* Botones, tags */
--radius-lg: 10px;  /* Inputs, selects */
--radius-xl: 12px;  /* Cards, modales */

/* Spacing Scale */
space-2: 8px
space-3: 12px
space-4: 16px
space-5: 20px
space-6: 24px
space-8: 32px
```

---

## 🧩 Componentes Principales

### 1. **Header / Navegación**
```tsx
<header className="bg-[#00184C] text-white sticky top-0 z-50 shadow-lg">
  <nav className="flex gap-1">
    <NavLink className={({ isActive }) => 
      isActive 
        ? 'bg-[#43D3FF] text-[#00184C] font-semibold px-6 py-3 rounded-lg'
        : 'text-white/80 hover:bg-white/10 px-6 py-3 rounded-lg'
    }>
      Sección
    </NavLink>
  </nav>
</header>
```

**Características:**
- Fondo `#00184C`
- Sticky con z-index 50
- Navegación activa con background `#43D3FF`
- Hover con `white/10`

---

### 2. **Cards**
```tsx
<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
  {/* Contenido */}
</div>
```

**Variantes:**
```tsx
/* Card con gradiente (KPI destacado) */
<div className="bg-gradient-to-br from-[#00184C] to-[#002a6e] text-white rounded-xl shadow-sm p-6">

/* Card con color de estado */
<div className="bg-green-50 border border-green-200 rounded-xl p-5">
```

---

### 3. **Botones**

#### Botón Primario (CTA)
```tsx
<button className="px-6 py-3 bg-[#F9D35A] text-[#00184C] rounded-lg font-semibold hover:bg-[#f7c840] transition-colors shadow-md hover:shadow-lg">
  Acción Principal
</button>
```

#### Botón Secundario
```tsx
<button className="px-6 py-3 bg-[#43D3FF] text-[#00184C] rounded-lg font-semibold hover:bg-[#2bc5f0] transition-colors">
  Acción Secundaria
</button>
```

#### Botón Outline
```tsx
<button className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-[#43D3FF] hover:text-[#00184C] transition-colors">
  Cancelar
</button>
```

#### Botón Pequeño/Icon
```tsx
<button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
  <Icon className="w-4 h-4" />
</button>
```

---

### 4. **Badges de Estado**
```tsx
/* Pendiente */
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-orange-100 text-orange-700 border-orange-200">
  <Clock className="w-3 h-3" />
  Pendiente
</span>

/* Confirmado */
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-green-100 text-green-700 border-green-200">
  <CheckCircle2 className="w-3 h-3" />
  Confirmado
</span>

/* Disponible */
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-blue-100 text-blue-700 border-blue-200">
  <FileCheck className="w-3 h-3" />
  Disponible
</span>

/* Rechazado */
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-red-100 text-red-700 border-red-200">
  <XCircle className="w-3 h-3" />
  Rechazada
</span>
```

**Template:**
```tsx
function StatusBadge({ status }: { status: string }) {
  const config = {
    pendiente: {
      label: "Pendiente",
      icon: Clock,
      className: "bg-orange-100 text-orange-700 border-orange-200",
    },
    confirmado: {
      label: "Confirmado",
      icon: CheckCircle2,
      className: "bg-green-100 text-green-700 border-green-200",
    },
    disponible: {
      label: "Disponible",
      icon: FileCheck,
      className: "bg-blue-100 text-blue-700 border-blue-200",
    },
  };

  const { label, icon: Icon, className } = config[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${className}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}
```

---

### 5. **Tablas**
```tsx
<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
  <table className="w-full">
    <thead className="bg-gray-50 border-b border-gray-200">
      <tr>
        <th className="px-6 py-4 text-left text-xs font-semibold text-[#00184C] uppercase tracking-wider">
          Columna
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200">
      <tr className="hover:bg-gray-50 transition-colors">
        <td className="px-6 py-4">
          <span className="text-sm text-gray-600">Contenido</span>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

**Características:**
- Header con fondo `gray-50`
- Hover en filas con `gray-50`
- Padding consistente: `px-6 py-4`
- Texto uppercase en headers
- Overflow hidden en el wrapper

---

### 6. **Filtros y Selects**

#### Select Estándar
```tsx
<select className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#43D3FF] focus:border-[#43D3FF] hover:border-[#43D3FF] transition-colors text-sm font-medium text-[#00184C]">
  <option value="all">Todos los estados</option>
  <option value="pendiente">Pendiente</option>
</select>
```

#### Date Filter (Componente Complejo)
```tsx
/* Botón trigger */
<button className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-[#43D3FF] transition-colors">
  <Calendar className="w-4 h-4 text-[#00184C]" />
  <span className="text-sm font-medium text-[#00184C]">
    Mes Corrido
  </span>
  <ChevronDown className="w-4 h-4 text-gray-500" />
</button>

/* Dropdown */
<div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-30 p-4">
  <button className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-100">
    Mes Corrido
  </button>
  {/* Estado activo */}
  <button className="w-full text-left px-3 py-2 rounded-lg text-sm bg-[#43D3FF] text-[#00184C] font-semibold">
    Últimos 30 días
  </button>
</div>
```

---

### 7. **Inputs**
```tsx
/* Input de texto */
<input 
  type="text"
  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#43D3FF] focus:border-[#43D3FF] transition-colors"
  placeholder="Placeholder"
/>

/* Input con label */
<div>
  <label className="block text-sm font-medium text-[#00184C] mb-2">
    Nombre del campo
  </label>
  <input 
    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#43D3FF] focus:border-[#43D3FF]"
  />
</div>

/* Input con error */
<input className="border-2 border-red-300 focus:ring-red-500 focus:border-red-500" />
<p className="mt-1 text-sm text-red-600">Mensaje de error</p>
```

---

### 8. **Modales**
```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
  {/* Overlay */}
  <div className="absolute inset-0 bg-black/50" onClick={onClose} />
  
  {/* Modal */}
  <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
    {/* Header */}
    <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
      <div className="flex items-center justify-between">
        <h3 className="text-[#00184C]">Título del Modal</h3>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>
    </div>
    
    {/* Body */}
    <div className="p-6">
      {/* Contenido */}
    </div>
    
    {/* Footer */}
    <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-2xl flex justify-end gap-3">
      <button className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-[#43D3FF] transition-colors">
        Cancelar
      </button>
      <button className="px-6 py-3 bg-[#F9D35A] text-[#00184C] rounded-lg font-semibold hover:bg-[#f7c840] shadow-md hover:shadow-lg transition-all">
        Confirmar
      </button>
    </div>
  </div>
</div>
```

---

### 9. **Checkbox y Toggle**
```tsx
/* Checkbox */
<label className="flex items-center gap-2 cursor-pointer">
  <input 
    type="checkbox"
    className="w-4 h-4 text-[#43D3FF] border-2 border-gray-300 rounded focus:ring-[#43D3FF] focus:ring-2"
  />
  <span className="text-sm text-gray-700">Seleccionar operación</span>
</label>

/* Checkbox en tabla */
<td className="px-6 py-4 w-12">
  <input 
    type="checkbox"
    checked={isSelected}
    onChange={() => handleSelect(id)}
    className="w-4 h-4 text-[#43D3FF] border-2 border-gray-300 rounded cursor-pointer hover:border-[#43D3FF] focus:ring-2 focus:ring-[#43D3FF]"
  />
</td>
```

---

### 10. **File Upload / Drag & Drop**
```tsx
<div 
  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
    isDragging 
      ? 'border-[#43D3FF] bg-[#43D3FF]/5' 
      : 'border-gray-300 hover:border-[#43D3FF]'
  }`}
  onDragOver={(e) => {
    e.preventDefault();
    setIsDragging(true);
  }}
  onDragLeave={() => setIsDragging(false)}
  onDrop={(e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }}
>
  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
  <p className="text-sm text-gray-600 mb-2">
    Arrastra tu archivo o <span className="text-[#43D3FF] font-semibold">busca</span>
  </p>
  <p className="text-xs text-gray-400">PDF hasta 10MB</p>
  <input 
    type="file"
    accept=".pdf"
    onChange={(e) => handleFiles(e.target.files)}
    className="hidden"
    id="fileInput"
  />
</div>

{/* Archivo seleccionado */}
{file && (
  <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
    <FileText className="w-5 h-5 text-green-700" />
    <div className="flex-1">
      <p className="text-sm font-medium text-green-900">{file.name}</p>
      <p className="text-xs text-green-600">{(file.size / 1024).toFixed(1)} KB</p>
    </div>
    <button 
      onClick={() => setFile(null)}
      className="p-1 hover:bg-green-100 rounded transition-colors"
    >
      <X className="w-4 h-4 text-green-700" />
    </button>
  </div>
)}
```

---

### 11. **KPI / Stat Cards**
```tsx
<div className="bg-gradient-to-br from-[#00184C] to-[#002a6e] text-white rounded-xl shadow-sm p-5">
  <div className="flex items-center gap-3">
    <DollarSign className="w-6 h-6" />
    <div>
      <p className="text-sm opacity-80 mb-0.5">Total Comisiones</p>
      <p className="text-2xl font-bold">$145,000</p>
      <p className="text-xs opacity-70">MXN acumulado</p>
    </div>
  </div>
</div>

/* Con badge */
<div className="bg-green-50 border border-green-200 rounded-xl p-5 relative">
  {badge && (
    <span className="absolute top-3 right-3 w-6 h-6 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
      {badge}
    </span>
  )}
  <div className="flex items-center gap-3 text-green-700">
    <CheckCircle2 className="w-6 h-6" />
    <div>
      <p className="text-sm opacity-80 mb-0.5">Disponible</p>
      <p className="text-2xl font-bold">$45,000</p>
      <p className="text-xs opacity-70">7 operaciones</p>
    </div>
  </div>
</div>
```

---

### 12. **Empty States**
```tsx
<div className="p-12 text-center">
  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
  <p className="text-gray-500 mb-2 font-medium">No hay datos disponibles</p>
  <p className="text-sm text-gray-400">
    Los datos aparecerán aquí cuando estén disponibles
  </p>
</div>
```

---

### 13. **Loading / Skeleton**
```tsx
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
</div>

/* Skeleton card */
<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
  <div className="space-y-2">
    <div className="h-4 bg-gray-200 rounded"></div>
    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
  </div>
</div>
```

---

### 14. **Tooltips**
```tsx
<div className="relative group">
  <button className="p-2 hover:bg-gray-100 rounded-lg">
    <Info className="w-4 h-4 text-gray-500" />
  </button>
  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#00184C] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
    Información adicional
    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#00184C]"></div>
  </div>
</div>
```

---

## 📱 Patrones de Layout

### Grid de Cards
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards */}
</div>

/* Para KPIs 4 columnas */
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* KPI Cards */}
</div>
```

### Sección con Header y Filtros
```tsx
<div className="space-y-6">
  {/* Header */}
  <div className="flex items-start justify-between gap-4 flex-wrap">
    <div>
      <h2 className="text-[#00184C] mb-2">Título de Sección</h2>
      <p className="text-sm text-gray-600">Descripción</p>
    </div>
    
    {/* Filtros a la derecha */}
    <div className="flex items-start gap-3">
      <select className="...">...</select>
      <DateFilter />
    </div>
  </div>
  
  {/* Contenido */}
  <div>...</div>
</div>
```

### Container Principal
```tsx
<main className="max-w-[1400px] mx-auto px-6 py-8">
  {/* Contenido */}
</main>
```

---

## 🎯 Interacciones y Estados

### Hover States
```css
/* Botones */
hover:bg-[#f7c840]          /* CTA yellow */
hover:bg-[#2bc5f0]          /* Cyan */
hover:bg-gray-100           /* Gray subtle */
hover:bg-white/10           /* Header nav */

/* Borders */
hover:border-[#43D3FF]      /* Focus cyan */

/* Shadows */
hover:shadow-lg             /* Elevación */
```

### Focus States
```css
focus:outline-none
focus:ring-2
focus:ring-[#43D3FF]
focus:border-[#43D3FF]
```

### Active States (Navegación)
```css
bg-[#43D3FF] text-[#00184C] font-semibold
```

### Disabled States
```css
disabled:opacity-50
disabled:cursor-not-allowed
disabled:bg-gray-100
```

### Transitions
```css
transition-colors            /* Default para colores */
transition-all               /* Para múltiples propiedades */
duration-200                 /* Rápido */
```

---

## 🔧 Utilidades y Helpers

### Formateo de Números (MXN)
```tsx
const formatCurrency = (amount: number) => {
  return `$${amount.toLocaleString("es-MX")} MXN`;
};
```

### Formateo de Fechas
```tsx
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  };
  return new Date(dateString).toLocaleDateString('es-MX', options);
};
```

### Clases Reutilizables
```tsx
/* Card wrapper estándar */
const cardClass = "bg-white rounded-xl shadow-sm border border-gray-200 p-6";

/* Input estándar */
const inputClass = "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#43D3FF] focus:border-[#43D3FF]";

/* Botón primario */
const btnPrimaryClass = "px-6 py-3 bg-[#F9D35A] text-[#00184C] rounded-lg font-semibold hover:bg-[#f7c840] transition-colors shadow-md hover:shadow-lg";

/* Botón secundario */
const btnSecondaryClass = "px-6 py-3 bg-[#43D3FF] text-[#00184C] rounded-lg font-semibold hover:bg-[#2bc5f0] transition-colors";
```

---

## 📚 Librerías y Dependencias

### Iconos
```bash
npm install lucide-react
```
```tsx
import { User, DollarSign, Calendar, Check, X } from 'lucide-react';
```

### Routing
```bash
npm install react-router
```
```tsx
import { BrowserRouter, Routes, Route, NavLink } from 'react-router';
```

### Date Picker
```bash
npm install react-day-picker
```
```tsx
import { DayPicker } from 'react-day-picker';
```

### State Management
```bash
npm install zustand
```
```tsx
import { create } from 'zustand';

const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

---

## 🗂️ Estructura de Archivos

```
/src
  /app
    /components
      AgentInfoCard.tsx
      DateFilter.tsx
      DashboardLayout.tsx
      Cartera.tsx
      Facturar.tsx
      Historial.tsx
      Resumen.tsx
      ConfirmPaymentModal.tsx
      ConfirmInvoiceModal.tsx
    /store
      appStore.ts
      dateFilterStore.ts
    routes.ts
    App.tsx
  /styles
    fonts.css
    theme.css
    tailwind.css
    index.css
```

---

## ✅ Checklist de Implementación

- [ ] Importar fuente Manrope en `fonts.css`
- [ ] Configurar colores principales en CSS variables
- [ ] Crear componente de Header con navegación
- [ ] Implementar sistema de badges de estado
- [ ] Crear componentes de botones (primario, secundario, outline)
- [ ] Implementar DateFilter con react-day-picker
- [ ] Crear estructura de modales reutilizables
- [ ] Configurar tablas con estilos consistentes
- [ ] Implementar KPI cards con variantes
- [ ] Crear empty states para todas las vistas
- [ ] Configurar inputs con estados de focus/error
- [ ] Implementar file upload con drag & drop
- [ ] Agregar tooltips informativos
- [ ] Configurar store global con Zustand

---

## 🎨 Tips de Diseño

1. **Consistencia:** Usa siempre los mismos espaciados (múltiplos de 4px)
2. **Jerarquía:** El color `#00184C` siempre para elementos importantes
3. **Feedback:** Todos los elementos interactivos deben tener hover/focus
4. **Estados:** Usa badges de color consistentes para cada tipo de estado
5. **Responsividad:** Mobile first, usa `grid` con breakpoints `md:` y `lg:`
6. **Accesibilidad:** Contraste mínimo 4.5:1, focus visible, labels en inputs
7. **Performance:** Lazy load de modales, virtualize tablas largas
8. **Animaciones:** Usa `transition-colors` para cambios sutiles, evita animaciones pesadas

---

## 📝 Notas Finales

Este sistema de diseño está optimizado para:
- ✅ Aplicaciones fintech internas
- ✅ Gestión de datos tabulares
- ✅ Flujos de confirmación/aprobación
- ✅ Dashboards con KPIs
- ✅ Filtros y búsquedas complejas
- ✅ Responsividad mobile-first
- ✅ Tailwind CSS v4

**Compatibilidad:** React 18+, Tailwind CSS 4.0, TypeScript 5+

---

Creado para plataformas de gestión de comisiones fintech 🚀
