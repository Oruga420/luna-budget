# Budget App (Single-User, Local-First) � Especificaci�n T�cnica, Roadmap por Fases y Tickets

> Paleta: naranja (#FF7A00/#FFA94D), amarillo (#FFD166/#FFE08C), turquesa (#1EC9C8/#79E0E0). Tipograf�a: Roboto.

---

## 0) Resumen ejecutivo

Aplicaci�n web single-user para gestionar presupuesto mensual sin base de datos externa. Persistencia local-first (IndexedDB + LocalStorage) y exportaci�n mensual autom�tica a CSV. Ingesta de gastos manual y por foto con an�lisis v�a OpenAI o3 para extraer item/importe/categor�a sugerida. Alertas configurables por umbral del presupuesto. Visualizaci�n principal: gr�fico de dona pseudo-3D animado (categor�as por %). Deploy en Vercel (Next.js App Router, Edge/Serverless para llamadas al API de OpenAI si se requiere, pero sin almacenar datos del usuario en backend).

---

## 1) Alcance (Scope)

* **Usuario �nico**; no hay registro/login.
* **Settings**: budget mensual, savings goal mensual, umbral de alerta (%), categor�as personalizadas, gastos fijos.
* **Gastos**: alta/edici�n/eliminaci�n; tipo (Fijo/Variable); categor�a; monto; fecha; adjuntar foto opcional.
* **Ingesta por foto**: subir imagen -> o3 (2 llamadas) -> JSON estandarizado -> pre-llenado del form.
* **Visualizaciones**: Dona 3D (categor�as % del gasto mensual), l�nea de tiempo simple (gasto diario acumulado), tarjetas de breakdown.
* **Alertas**: banner/perma-toast cuando se supera X% del budget; estado en home.
* **Rollover mensual**: al detectar cambio de mes -> exportar CSV del mes anterior y archivar en IndexedDB; reset de agregados del mes (no borra el hist�rico).
* **Export/Import**: export CSV del mes en curso y de meses previos; import CSV para restauraci�n.
* **Animaciones**: conteo regresivo del presupuesto restante; entrada de barras/segmentos; micro-interacciones al agregar gasto.

Fuera de alcance inicial: multiusuario, sync en la nube, cuentas/roles, notificaciones push del sistema operativo.

---

## 2) Arquitectura

* **Frontend**: Next.js 15 (App Router) + React 18.
* **UI**: TailwindCSS + shadcn/ui + Framer Motion.
* **Gr�ficos**: Recharts (dona), con capa de estilo para efecto 3D (sombreado radial/gradiente).
* **Persistencia**: IndexedDB via `idb` (hist�rico y blobs de im�genes) + LocalStorage (flags/ajustes r�pidos). Archivos CSV generados en el cliente (File API); opci�n de descarga.
* **Procesamiento de im�genes**:

  * Preferente **directo desde cliente a OpenAI** via edge function (Next.js Route Handler) para ocultar clave; *no* se persiste contenido en server.
  * Alternativa privacy-strict: opci�n "procesar local" desactivada (placeholder) hasta que exista un modelo local.
* **Despliegue**: Vercel.
* **Accesibilidad**: WCAG AA en colores/contraste.

### Estructura de datos

**CSV por mes** (schema columnas):

```
id, date_iso, item_name, amount, currency, category, type, source, notes, image_ref, month_key, budget_month, savings_goal_month
```

* `type`: "fixed" | "variable"
* `source`: "manual" | "image"
* `image_ref`: key interna para IndexedDB (blob store) o dataURL ef�mero.
* `month_key`: `YYYY-MM`

**IndexedDB stores**:

* `settings`: `{ budget:number, savingsGoal:number, alertThresholdPct:number, categories:string[], currency:string }`
* `fixedExpenses`: array de entradas `{ id, name, amount, category, billingDay? }`
* `entries`: gastos (todas las filas, index por `month_key`)
* `images`: blobs por `image_ref`
* `archives`: metadatos de CSV exportados `{ month_key, filename, bytes, checksum }`

---

## 3) Prompts y contrato con o3 (OpenAI)

**Llamada 1 (descripci�n breve del �tem)**

* Instrucci�n: "Describe brevemente el objeto/servicio principal visible en la foto en 10 palabras o menos para usarlo como nombre de �tem. Solo el nombre, sin precio."
* Salida esperada: string (ej. "Caja de cereal Corn Flakes").

**Llamada 2 (JSON estructurado)**

* Instrucci�n: "Devuelve solo JSON v�lido con el siguiente schema. Si no sabes un campo, usa null. No inventes precios."

```json
{
  "item_name": "string",
  "category_suggestion": "one of: [renta, internet, celular, comida, transporte, entretenimiento, weed, membresias, otros]",
  "notes": "string | null"
}
```

* Post-proceso: el usuario ingresa `amount` manualmente (obligatorio).

*Seguridad*: truncar contexto e im�genes; desactivar almacenamiento de logs en el backend.

---

## 4) UX/UI

* **Home**: header con budget restante (contador animado), progreso hacia savings goal, bot�n "+ Gasto", alerta de umbral si aplica.
* **Gr�fico dona 3D**: segmentos por categor�a, leyenda con % y monto, hover con detalles.
* **Lista de gastos**: filtros por categor�a, rango de fechas, tipo; b�squeda por texto.
* **Settings**: budget, savings goal, umbral, currency, gesti�n de categor�as, CRUD de gastos fijos.
* **Agregar gasto**: modal con tabs "Manual" / "Foto (o3)". En Foto: preview, resultados del LLM pre-llenan item/categor�a/notas.
* **Tema**: base clara; primarios naranja/amarillo/turquesa; Roboto; esquinas 2xl; sombras suaves.

---

## 5) Roadmap por Fases

### Fase 1 � Fundaciones & Persistencia Local

Objetivo: base Next.js, estado global, IndexedDB, settings m�nimos, CSV export manual.

**Tickets**

1. **F1-T1 | Bootstrap Next.js + Tailwind + shadcn + Framer**

   * *AC*: proyecto compila en Vercel preview; Tailwind y shadcn funcionando; fuente Roboto cargada.
   * *Tests*: build Vercel OK; Lighthouse sin errores cr�ticos; snapshot visual de home vac�o.

2. **F1-T2 | M�dulo de persistencia (IndexedDB + LocalStorage)**

   * *AC*: helpers `db.get/set/list` para stores `settings`, `entries`, `archives`, `images`; versi�n de esquema con migraci�n.
   * *Tests*: crear/leer/actualizar/borrar entradas; simulaci�n en Jest usando mock de IndexedDB.

3. **F1-T3 | Settings b�sicos (budget, savingsGoal, alertThresholdPct, currency)**

   * *AC*: formulario con validaciones; guardar en IndexedDB; reflectar en header.
   * *Tests*: cambiar budget y ver header actualizar; reload conserva cambios.

4. **F1-T4 | Export CSV manual del mes en curso**

   * *AC*: bot�n Export; archivo incluye cabeceras del schema y filas.
   * *Tests*: abrir CSV en Excel/Sheets sin corrupci�n; ver cantidad correcta de filas.

### Fase 2 � Modelo de Datos de Gastos & CRUD

Objetivo: CRUD completo, categor�as, gastos fijos.

**Tickets**

1. **F2-T1 | Schema de gasto + validaciones (Zod)**

   * *AC*: crear tipo fuerte; normalizar `date_iso`, `month_key`.
   * *Tests*: entradas inv�lidas rechazan; fechas se normalizan a local TZ.

2. **F2-T2 | CRUD de gastos (lista + filtros + b�squeda)**

   * *AC*: crear/editar/eliminar/ver; filtros por categor�a/tipo/fecha; b�squeda textual.
   * *Tests*: a�adir 10 gastos y filtrar por categor�a; edici�n persiste; eliminaci�n reduce conteo.

3. **F2-T3 | Gesti�n de categor�as personalizadas**

   * *AC*: crear/renombrar/eliminar categor�as; migraci�n de gastos afectados.
   * *Tests*: renombrar "otros"->"hogar" y verificar actualizaci�n en todos los gastos.

4. **F2-T4 | CRUD de gastos fijos**

   * *AC*: alta de fijos con `billingDay?`; auto-inyecci�n mensual al iniciar mes.
   * *Tests*: simular rollover y verificar que se agregan fijos del mes.

### Fase 3 � Ingesta por Foto (OpenAI o3)

Objetivo: flujo de foto->o3->JSON->pre-llenado.

**Tickets**

1. **F3-T1 | Route Handler /api/vision (Edge) + SDK OpenAI**

   * *AC*: endpoint recibe imagen (multipart), llama o3 2 veces (nombre y JSON), retorna `{ item_name, category_suggestion, notes }`.
   * *Tests*: mock de OpenAI; test de error por imagen vac�a; timeouts manejados.

2. **F3-T2 | UI de carga de imagen + pre-llenado**

   * *AC*: arrastrar/soltar o picker; preview; al retornar, pre-llenar �tems del form.
   * *Tests*: subir PNG/JPG; cancelar borra estado; pre-llenado editable.

3. **F3-T3 | Pol�tica de privacidad (no persist server)**

   * *AC*: clave protegida; server no guarda blobs; borrar buffers tras respuesta.
   * *Tests*: inspecci�n de c�digo y logs; auditor�a b�sica sin writes a disco.

### Fase 4 � C�lculos, Alertas y Animaciones

Objetivo: KPIs, umbrales, micro-interacciones.

**Tickets**

1. **F4-T1 | Agregados mensuales (restante, gastado, % por categor�a)**

   * *AC*: select por `month_key`; c�lculo de totales/percentiles; memoization.
   * *Tests*: dataset sint�tico valida % sumando 100�0.1.

2. **F4-T2 | Alertas por umbral**

   * *AC*: banner permanente si `spent/budget >= threshold` al entrar a la app; dismiss recuerda hasta cambio de estado.
   * *Tests*: threshold en 0.5, con $600/$1000 muestra alerta; bajar gasto o subir budget quita alerta.

3. **F4-T3 | Animaciones (Framer) en contador y alta de gasto**

   * *AC*: n�mero restante cuenta hacia abajo; confeti/impulso al guardar; accesible (prefers-reduced-motion).
   * *Tests*: snapshot con motion disabled; no jank a 60fps en desktop medio.

### Fase 5 � Visualizaciones (Dona 3D + Timeline)

Objetivo: gr�ficos pulidos.

**Tickets**

1. **F5-T1 | Dona Recharts con efecto 3D**

   * *AC*: gradientes/sombras para pseudo-3D; leyenda con %; click filtra lista.
   * *Tests*: segmentos concuerdan con datos; click emite filtro.

2. **F5-T2 | Timeline de gasto diario acumulado**

   * *AC*: l�nea/�rea simple; hover con total/d�a; toggle Mostrar.
   * *Tests*: suma por d�a respeta zona horaria; vac�os muestran 0.

### Fase 6 � Rollover Mensual, Archivo y Backup

Objetivo: cierre y reseteo mensual no destructivo.

**Tickets**

1. **F6-T1 | Detecci�n de cambio de mes**

   * *AC*: al abrir en nuevo mes -> banner "Cerrar mes anterior"; acci�n genera CSV y lo archiva en IndexedDB + descarga.
   * *Tests*: mock de fecha cruza 31->01; crea archivo con nombre `budget-YYYY-MM.csv`.

2. **F6-T2 | Auto-inyecci�n de gastos fijos del mes**

   * *AC*: tras cierre, crear registros "fixed" del mes con `date_iso` en `billingDay` o d�a 1.
   * *Tests*: lista contiene fijos; no duplica si se ejecuta dos veces (idempotente).

3. **F6-T3 | Import/Restore CSV**

   * *AC*: cargar CSV con schema v�lido -> hidratar `entries` del `month_key` correspondiente.
   * *Tests*: archivo corrupto rechaza con error claro; conteo de filas coincide.

### Fase 7 � Pulido, PWA Lite y Deploy Final

Objetivo: experiencia fina y publicaci�n.

**Tickets**

1. **F7-T1 | Theming definitivo (paleta y accesibilidad)**

   * *AC*: tokens Tailwind; contrast AA; modo alto contraste opcional.
   * *Tests*: axe DevTools sin violaciones severas de color.

2. **F7-T2 | PWA lite (manifest + offline b�sico)**

   * *AC*: iconos, manifest, cache est�tico; sin cachear datos.
   * *Tests*: Lighthouse PWA passes; instala en desktop/mobile.

3. **F7-T3 | Deploy Vercel + checklist**

   * *AC*: variables de entorno para OpenAI; pagespeed > 85; error boundaries implementados.
   * *Tests*: smoke e2e (Playwright) cubre: agregar gasto manual, por foto, export CSV, cambiar settings.

---

## 6) Criterios de aceptaci�n globales

* Todos los datos del usuario residen en el cliente (IndexedDB/LocalStorage).
* La app funciona sin conexi�n para ver datos ya cargados y agregar gastos manuales; la ingesta por foto requiere conexi�n.
* Exportaci�n CSV produce archivos v�lidos, abribles y con headers correctos.
* Gr�fico dona 3D refleja en tiempo real los cambios.
* Alertas por umbral aparecen de forma consistente y no intrusiva.

---

## 7) Casos de prueba (end-to-end)

1. **Alta manual simple**: set budget $1000; agregar gasto comida $50 -> restante $950; dona muestra categor�a.
2. **Umbral**: threshold 50%; cargar gastos hasta $600/$1000 -> aparece banner.
3. **Foto**: subir imagen de ticket/objeto -> o3 devuelve `item_name` y `category_suggestion`; usuario ingresa $; se crea registro con `source=image`.
4. **Rollover**: cambiar fecha del sistema a nuevo mes; cerrar mes -> descarga CSV; fijos se auto-inyectan; dashboard vuelve a cero gastos variables.
5. **Import**: importar CSV v�lido de mes pasado -> entries visibles al filtrar por ese `month_key`.

---

## 8) Seguridad y privacidad

* Clave OpenAI solo en serverless edge handler; CORS estricto; tama�o m�x de imagen; purga inmediata de buffers.
* Sin anal�tica por defecto; toggle opcional con consentimiento.

---

## 9) Tareas DevOps/Entrega

* Pipelines Vercel (preview, main).
* Lint/format (ESLint, Prettier).
* Tests: unit (Vitest/Jest), e2e (Playwright).
* Git Hooks (pre-commit) para typecheck.

---

## 10) Backlog (v2+)

* Clasificaci�n autom�tica de categor�a v�a embeddings.
* Reglas/Presupuestos por categor�a.
* Recordatorios locales tipo calendario.
* Sincronizaci�n opcional (Vercel Blob) -> requiere consentimiento.

---

## 11) Definition of Done (por fase)

* Todos los tickets de fase con AC cumplidos.
* Pruebas unitarias > 80% en m�dulos cr�ticos (persistencia, c�lculos).
* E2E b�sicos verdes en CI.
* Revisi�n UX visual (paleta/animaciones) aprobada.

