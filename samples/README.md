# 📂 Archivos de prueba — Facturación CFDI 4.0

Pares de archivos XML + PDF listos para subir en el **Paso 3 del wizard de facturación**.
Están diseñados para que el validador cruzado (`fileValidation.ts`) los acepte.

## ¿Por qué estos archivos pasan la validación?

El validador de la app (`src/app/utils/fileValidation.ts`) exige que **el PDF y el XML correspondan al mismo comprobante**. Para eso, hace una de tres comprobaciones:

1. `pdfBase.includes(folio)` — el nombre del PDF contiene el **folio** del XML.
2. `pdfBase.includes(uuid.slice(0, 8))` — el nombre del PDF contiene los primeros 8 chars del UUID.
3. `xmlBase === pdfBase` — nombres idénticos.

En estos archivos se cumplen las **tres condiciones a la vez** (nombres idénticos + folio presente + UUID presente), por lo que la validación es robusta.

---

## Par 1 — `factura-A-001234` (Persona Jurídica)

| Campo | Valor |
|---|---|
| Folio | `A-001234` |
| UUID | `F8A7B6C5-1234-4DEF-9ABC-0123456789AB` |
| RFC Emisor | `CON080828RA2` (Continental Seguros SA) |
| RFC Receptor | `VYT950815AB3` (Viajes y Turismo SA) |
| Tipo cliente | **Jurídica** (Retefuente 4%) |
| Subtotal | $14,800.00 MXN |
| IVA 16% | $2,368.00 MXN |
| Retefuente 4% | $592.00 MXN |
| **Total a facturar** | **$16,576.00 MXN** |
| Voucher sugerido | VCH-2026-004 ($16,700 disponible) |

---

## Par 2 — `factura-B-005678` (Persona Natural con ISR)

| Campo | Valor |
|---|---|
| Folio | `B-005678` |
| UUID | `A1B2C3D4-9876-4FED-8CBA-9988776655AA` |
| RFC Emisor | `CON080828RA2` (Continental Seguros SA) |
| RFC Receptor | `GARM850312AB1` (María García López) |
| Tipo cliente | **Natural** (Retefuente 10% + ISR opcional) |
| Subtotal | $8,800.00 MXN |
| IVA 16% | $1,408.00 MXN |
| Retefuente 10% | $880.00 MXN |
| ISR 10% (si aplica) | $792.00 MXN |
| **Total a facturar** | **$10,208.00 MXN** (con ISR) / **$9,328.00 MXN** (sin ISR) |
| Voucher sugerido | VCH-2026-005 ($8,800 disponible) |

---

## 🧪 Casos de prueba sugeridos

### ✅ Caso feliz — Par 1 (Jurídica)
1. Login como `maria.garcia@continental.com` / `demo` (rol comercial).
2. Ve a `/facturar`.
3. Selecciona 1 voucher (ej. VCH-2026-004).
4. Paso 2 → elige **Persona Jurídica**, deja ISR desactivado.
5. Paso 3 → sube `factura-A-001234.xml` y `factura-A-001234.pdf`.
6. Verás el badge verde "Archivos validados correctamente" con el folio `A-001234` y el UUID truncado.
7. Paso 4 → revisa el resumen y haz clic en **Enviar factura**.
8. Aparece la pantalla de éxito. Ve a `/historial` y verás tu factura radicada.

### ✅ Caso feliz con ISR — Par 2 (Natural)
1. Login como `maria.garcia@continental.com`.
2. `/facturar` → selecciona VCH-2026-005.
3. Paso 2 → elige **Persona Natural**, **activa ISR**.
4. Paso 3 → sube `factura-B-005678.xml` y `factura-B-005678.pdf`.
5. Validación cruzada: OK.
6. Paso 4 → el resumen fiscal debe mostrar:
   - Comisión bruta: $8,800
   - + IVA 16%: $1,408
   - − Retefuente 10%: $880
   - + ISR 10%: $792
   - Total impuestos: $1,320
   - Total a recibir (neto): **$7,480**
7. **Enviar factura**.

### ❌ Caso de error — XML y PDF no coinciden
1. En el Paso 3, sube `factura-A-001234.xml` y `factura-B-005678.pdf`.
2. La validación cruzada debe fallar con:
   > "Los archivos no corresponden al mismo comprobante. El PDF 'factura-B-005678.pdf' no coincide con el folio del XML (A-001234)."
3. El botón "Siguiente" permanece deshabilitado hasta que subas archivos válidos.

### ❌ Caso de error — XML inválido
1. Sube cualquier archivo `.txt` renombrado a `.xml` + el PDF correcto.
2. El validador detecta parse error:
   > "El archivo XML no tiene un formato válido."

### ❌ Caso de error — Archivo demasiado grande
1. Intenta subir un PDF de > 10 MB (no incluido por límite de Git).
2. `FileUploadBox` mostrará el mensaje "El archivo no debe superar los 10 MB".

---

## 📝 Notas técnicas

- Los XML son **CFDI 4.0 válidos** con namespace `cfdi:` y `tfd:` correctos.
- Los UUIDs y sellos son **demo** (no son válidos ante el SAT real).
- Los PDFs son PDFs **mínimos válidos** (PDF-1.4 con un page y un font), abren en cualquier visor.
- Los nombres de archivo **empiezan con `factura-`** porque ese prefijo no está restringido, solo importa que el folio `A-001234` / `B-005678` esté presente.
