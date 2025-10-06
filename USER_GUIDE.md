# Luna Budget Keeper - Guía de Uso (SOP)

**Versión**: 1.0
**Fecha**: 5 de Octubre, 2025
**Aplicación**: https://lunas-budget.vercel.app

---

## 📱 Acceso a la Aplicación

### Desde Computadora
1. Abre tu navegador (Chrome, Firefox, Safari, Edge)
2. Navega a: `https://lunas-budget.vercel.app`
3. La aplicación cargará tus datos automáticamente desde la nube

### Desde Celular
1. Abre tu navegador móvil
2. Navega a: `https://lunas-budget.vercel.app`
3. **Opcional**: Agrega a la pantalla de inicio:
   - **iPhone**: Tap "Compartir" → "Agregar a Inicio"
   - **Android**: Menú (⋮) → "Agregar a pantalla de inicio"

**✨ Sincronización Automática**: Todos tus datos se sincronizan entre dispositivos automáticamente. Los cambios que hagas en tu computadora aparecerán en tu celular y viceversa.

---

## 🏠 Navegación Principal

La app tiene dos secciones principales:

### 1. **DASHBOARD** (Casa 🏠)
- Vista de resumen de tu presupuesto
- Gráficos y visualizaciones
- Lista de movimientos del mes

### 2. **CONFIGURACIÓN** (Engrane ⚙️)
- Ajustes de presupuesto y metas
- Gestión de categorías
- Gastos fijos mensuales

---

## ⚙️ Configuración Inicial

### Paso 1: Configurar tu Presupuesto

1. **Ir a Configuración** (tap en ⚙️ en la barra superior)

2. **Presupuesto Mensual**:
   - Ingresa tu presupuesto total del mes (ej: `11822.00`)
   - Este es el dinero que tienes disponible para gastar

3. **Meta de Ahorro**:
   - ¿Cuánto quieres ahorrar este mes? (ej: `4000.00`)
   - La app te mostrará cuánto te queda disponible después de ahorrar

4. **Umbral de Alerta**:
   - Porcentaje del presupuesto que activa una alerta (ej: `0.8` = 80%)
   - Cuando gastes más del 80%, verás una advertencia

5. **Moneda**:
   - Selecciona tu moneda: CAD, USD, MXN, EUR, COP, ARS
   - Por defecto: **CAD**

6. **Guardar Cambios**:
   - Tap en "Guardar Cambios"
   - Verás confirmación verde

### Paso 2: Configurar Categorías

Las categorías te ayudan a organizar tus gastos.

**Categorías por Defecto**:
- 🍔 comida
- 🚗 transporte
- 🎮 entretenimiento
- 🌿 weed
- 💳 membresias
- 🏠 renta
- 📡 internet
- 📱 celular
- 📦 otros

**Agregar Categoría Nueva**:
1. Scroll abajo en Configuración
2. Encuentra "Gestión de Categorías"
3. Escribe el nombre (ej: "gym", "mascotas")
4. Tap "Agregar"

**Renombrar Categoría**:
1. Encuentra la categoría en la lista
2. Tap "Renombrar"
3. Ingresa el nuevo nombre
4. **Importante**: ¡Todos tus gastos con esa categoría se actualizarán automáticamente!

**Eliminar Categoría**:
1. Encuentra la categoría
2. Tap "Borrar"
3. Selecciona una categoría de reemplazo
4. Todos los gastos se moverán a la nueva categoría

### Paso 3: Configurar Gastos Fijos

Los gastos fijos son pagos recurrentes mensuales (renta, suscripciones, etc.)

1. Scroll a "Gastos Fijos Mensuales" en Configuración

2. **Agregar Gasto Fijo**:
   - **Nombre**: Descripción (ej: "Renta", "Netflix")
   - **Monto**: Cantidad exacta
   - **Categoría**: Selecciona de tu lista
   - **Día de Cobro**: Día del mes (1-31) o déjalo vacío
   - **Notas**: Detalles opcionales

3. Tap "Guardar Gasto Fijo"

4. **Se descuenta automáticamente** de tu presupuesto disponible

**Ver Gastos Fijos**:
- Se muestran en una tabla
- Total mensual aparece abajo

**Editar Gasto Fijo**:
- Tap en cualquier campo de la tabla
- Modifica el valor
- Presiona Enter para guardar

**Eliminar Gasto Fijo**:
- Tap "Borrar" junto al gasto
- Confirmación automática

---

## 💰 Registrar Gastos

Hay **dos formas** de agregar gastos:

### Método 1: Manual (📝)

1. **Ir al Dashboard** (🏠)

2. **Abrir el Formulario**:
   - Tap el botón naranja "+" (esquina inferior derecha en móvil)
   - O botón "Nuevo Movimiento" en escritorio

3. **Seleccionar Tab "MANUAL"**

4. **Llenar el Formulario**:
   - **Ítem**: Nombre del gasto (ej: "Café Starbucks")
   - **Monto**: Cantidad gastada
   - **Categoría**: Selecciona una
   - **Tipo**: Variable (la mayoría) o Fijo
   - **Fecha**: Por defecto es hoy, puedes cambiarla
   - **Moneda**: Tu moneda configurada
   - **Notas**: Opcional (referencia, ubicación, etc.)

5. **Guardar**:
   - Tap "Guardar Movimiento"
   - Verás confeti 🎉
   - El gasto aparece en la lista

### Método 2: Por Foto (📸 + 🤖 AI)

**Útil para**: Tickets, recibos, productos

1. **Abrir Formulario** (igual que arriba)

2. **Seleccionar Tab "FOTO (O3)"**

3. **Subir Imagen**:
   - **Arrastrar y Soltar**: Arrastra una foto al área punteada
   - **O Click**: Tap "haz click aquí" para seleccionar de tu galería

4. **Tipos de Archivo Aceptados**:
   - JPG, JPEG, PNG, WebP
   - Máximo 4MB

5. **Preview**:
   - Verás la foto que subiste
   - Puedes cancelar con ✕

6. **Procesar con AI**:
   - Tap "Procesar Imagen" (botón azul)
   - Loading... ⏳
   - La AI (GPT-4o) analiza tu foto

7. **Resultados**:
   - **Ítem**: La AI sugiere un nombre
   - **Categoría**: Sugerencia automática
   - **Notas**: Detalles opcionales extraídos
   - **⚠️ Importante**: ¡Debes ingresar el MONTO manualmente!

8. **Editar y Guardar**:
   - Cambia a tab "MANUAL"
   - Campos ya están pre-llenos
   - Ingresa el monto
   - Ajusta lo que necesites
   - Tap "Guardar Movimiento"

**Tips para Mejores Resultados**:
- Foto clara y enfocada
- Buena iluminación
- Objeto/ticket centrado
- Evita fondos muy ocupados

---

## 📊 Ver tu Presupuesto (Dashboard)

### Tarjetas de Resumen

En la parte superior verás 4 tarjetas con **números animados**:

1. **PRESUPUESTO**
   - Tu budget mensual total
   - "Disponible": Lo que te queda

2. **META DE AHORRO**
   - Tu objetivo de ahorro
   - Color indica si lo alcanzarás:
     - 🟢 Verde: Más de $6,000 disponibles
     - 🟡 Amarillo: $4,001-$6,000 disponibles
     - 🔴 Rojo: Menos de $4,000 disponibles

3. **GASTO ACUMULADO**
   - Total gastado en el mes
   - "Movimientos": # de gastos registrados

4. **GASTOS FIJOS MENSUALES**
   - Total de tus suscripciones/fijos
   - Se descuentan automáticamente

### 🔔 Alerta de Presupuesto

Si gastas más del umbral configurado (ej: 80%), verás:
- Banner naranja con ⚠️
- Icono animado
- Mensaje: "Has usado X% de tu presupuesto mensual"

### 📈 Gráfico de Dona

**¿Qué Muestra?**: Distribución de gastos por categoría

**Dos Vistas**:
1. **SOLO VARIABLES**: Solo gastos que agregaste
2. **INCLUYE FIJOS**: Variables + gastos fijos mensuales

**Toggle**: Botones arriba del gráfico

**Colores**: Cada categoría tiene un color único
- Naranja (#FF7A00)
- Amarillo (#FFD166)
- Turquesa (#1EC9C8)
- Magenta, Cyan, etc.

**Hover**: Pasa el mouse para ver:
- Nombre de categoría
- Monto exacto

**Leyenda**: Abajo muestra todas las categorías con colores

### 📉 Línea de Tiempo

**¿Qué Muestra?**: Tu gasto a lo largo del mes

**Dos Líneas**:
1. **Sólida (azul)**: Gasto acumulado (total hasta ese día)
2. **Punteada (naranja)**: Gasto diario

**Mostrar/Ocultar**: Botón arriba a la derecha

**Hover**: Pasa el mouse para ver valores exactos

### 📋 Movimientos del Mes

**Tabla con tus gastos**:
- Fecha
- Ítem (nombre)
- Categoría
- Tipo (Variable/Fijo)
- **Monto** (con color si es CAD):
  - 🔴 Rojo: $150 CAD o más
  - 🟠 Naranja: $100-$149 CAD
  - Negro: Menos de $100 CAD
- Notas
- Acciones (Editar/Borrar)

**Filtros** (arriba de la tabla):

1. **Buscar** (🔍):
   - Escribe para buscar por nombre de ítem
   - Ejemplo: "café" muestra todos los gastos de café

2. **Por Categoría**:
   - Dropdown con tus categorías
   - "Todas las categorías" = sin filtro

3. **Por Tipo**:
   - Todos
   - Variables
   - Fijos

4. **Rango de Fechas**:
   - "Desde" → "Hasta"
   - Deja vacío para ver todos

**Limpiar Filtros**: Botón abajo de los filtros

**Resultados**: Se muestra el conteo (ej: "22 resultados")

### Editar un Movimiento

1. Find el gasto en la tabla
2. Tap "Editar"
3. Modal se abre con datos pre-llenos
4. Modifica lo que necesites
5. Tap "Actualizar Movimiento"

### Eliminar un Movimiento

1. Tap "Borrar" en la fila
2. Loading...
3. Confirmación: "Movimiento eliminado."
4. Desaparece de la lista

---

## 📤 Exportar a CSV

**¿Para Qué?**: Backup, análisis en Excel/Sheets, contabilidad

### Cómo Exportar

1. Scroll a "Movimientos del Mes"
2. Encuentra botón "Exportar CSV" (arriba de la tabla)
3. Tap el botón
4. Archivo se descarga automáticamente

### Nombre del Archivo

Formato: `budget-YYYY-MM.csv`

Ejemplo: `budget-2025-10.csv` (Octubre 2025)

### Contenido del CSV

**Columnas**:
```
id, date_iso, item_name, amount, currency, category, type, source, notes, image_ref, month_key, budget_month, savings_goal_month
```

**Incluye**:
- ✅ Todos tus gastos variables
- ✅ Tus gastos fijos (convertidos a entries)
- ✅ Metadata del mes (presupuesto, meta de ahorro)

**Mensaje de Éxito**:
```
CSV exportado: 15 variables + 7 fijos (total: 22 movimientos)
```

### Abrir en Excel/Sheets

1. Abre Excel o Google Sheets
2. Archivo → Importar → CSV
3. Selecciona tu archivo descargado
4. Listo para analizar

---

## 🔄 Sincronización entre Dispositivos

### Cómo Funciona

La app usa **Vercel Blob** para almacenar tus datos en la nube:

1. **Al Abrir la App**:
   - Descarga datos del servidor
   - Los guarda localmente (IndexedDB)
   - Muestra tu información

2. **Al Hacer Cambios**:
   - Guardan localmente primero (rápido)
   - Se sincronizan al servidor automáticamente
   - Otros dispositivos recibirán los cambios

3. **Al Abrir en Otro Dispositivo**:
   - Descarga la versión más reciente
   - Siempre ves datos actualizados

### ¿Necesito Conexión?

**Para Ver Datos**: No (trabaja offline)
**Para Sincronizar**: Sí (necesitas internet)
**Para Foto con AI**: Sí (requiere internet)

### Verificar Sincronización

1. Agrega un gasto en tu laptop
2. Abre la app en tu celular
3. Refresca la página
4. El gasto debe aparecer

**Si no aparece**:
- Verifica conexión a internet
- Refresca ambas páginas (F5 o pull-down)
- Espera 5-10 segundos

---

## 🎨 Personalización

### Cambiar Moneda

1. Ve a Configuración
2. Dropdown "Moneda"
3. Selecciona: CAD, USD, MXN, EUR, COP, ARS
4. Tap "Guardar Cambios"
5. **Nota**: Gastos anteriores mantienen su moneda original

### Ajustar Meta de Ahorro

1. Configuración → "Meta de Ahorro Mensual"
2. Ingresa nuevo monto
3. Guardar
4. Dashboard actualiza color del indicador

### Ajustar Umbral de Alerta

1. Configuración → "Umbral de Alerta"
2. Valor entre 0 y 1
   - 0.5 = alerta al 50%
   - 0.8 = alerta al 80%
   - 0.9 = alerta al 90%
3. Guardar
4. Banner aparece al superar el umbral

---

## 🛠️ Solución de Problemas

### "No veo mis datos en el celular"

**Solución**:
1. Verifica que estés usando la misma URL: `lunas-budget.vercel.app`
2. Refresca la página (pull-down o F5)
3. Espera 10 segundos para que cargue
4. Verifica conexión a internet

**Si persiste**:
- Cierra y vuelve a abrir el navegador
- Limpia caché del navegador
- Prueba en modo incógnito

### "El gráfico no se muestra"

**Causa**: Loop infinito (ya arreglado en v1.0)

**Solución**:
- Refresca la página
- Asegúrate de tener gastos registrados
- Si es una página nueva, espera unos segundos

### "Error al procesar imagen"

**Posibles Causas**:
1. Imagen muy grande (>4MB)
2. Formato no soportado
3. Sin conexión a internet
4. API key de OpenAI inválida (problema del servidor)

**Soluciones**:
1. Reduce tamaño de imagen
2. Usa JPG o PNG
3. Verifica conexión
4. Contacta soporte si persiste

### "Los números no se animan"

**Causa**: `prefers-reduced-motion` activado

**Explicación**: Tu sistema/navegador tiene animaciones desactivadas por accesibilidad

**Opcional**: Desactiva en configuración de tu SO

### "No puedo editar un gasto fijo"

**Funcionalidad**: Edición inline

**Cómo**:
1. Tap directamente en el campo (nombre, monto, etc.)
2. Se convierte en input editable
3. Modifica
4. Presiona Enter
5. Si no funciona, usa botón "Editar" regular

---

## 📱 Tips de Uso Diario

### Workflow Recomendado

**Por la Mañana**:
1. Abre la app
2. Revisa tu "Disponible" en la tarjeta de Presupuesto
3. Planifica gastos del día

**Durante el Día**:
1. Cuando gastes algo, toma foto del ticket
2. O guarda el ítem en tu mente
3. Al llegar a casa, registra todo

**Por la Noche**:
1. Agrega todos los gastos del día
2. Usa foto + AI para tickets
3. Revisa el gráfico de dona
4. Verifica que no superes tu meta

**Fin de Mes**:
1. Exporta CSV para tus registros
2. Revisa el timeline: ¿gastaste más al inicio o al final?
3. Ajusta presupuesto para el próximo mes

### Mejores Prácticas

✅ **Sí**:
- Registra gastos el mismo día
- Usa categorías consistentemente
- Toma fotos claras de tickets
- Exporta CSV cada mes
- Revisa tus gastos semanalmente

❌ **No**:
- Dejes que se acumulen muchos gastos sin registrar
- Olvides agregar notas importantes
- Ignores la alerta de umbral
- Elimines gastos sin pensarlo (mejor ajusta)

---

## 🔐 Privacidad y Seguridad

### ¿Dónde están mis datos?

1. **Localmente** (tu dispositivo):
   - IndexedDB en tu navegador
   - Solo tú puedes acceder

2. **En la Nube** (Vercel Blob):
   - Un solo archivo: `luna-budget-data.json`
   - Público pero **no listable** (necesitas la URL exacta)
   - Sin autenticación (app de un solo usuario)

### ¿Qué pasa con las fotos?

**Procesamiento**:
- Se envían a OpenAI para análisis
- OpenAI NO almacena las imágenes (configurado así)
- Resultados regresan como JSON
- Fotos NO se guardan en el servidor

**Local**:
- Puedes almacenar fotos localmente (feature planeada)
- Por ahora, solo se procesan, no se guardan

### ¿Alguien puede ver mi presupuesto?

**No**, porque:
- Es app de un solo usuario
- Sin sistema de login
- Sin compartir con terceros
- Datos encriptados en tránsito (HTTPS)

---

## 🎯 Casos de Uso Comunes

### Caso 1: Control de Gastos Semanales

**Objetivo**: No gastar más de $200/semana en comida

**Cómo**:
1. Configura presupuesto mensual: $800 (4 semanas × $200)
2. Solo crea gastos con categoría "comida"
3. Filtra por categoría "comida" en el dashboard
4. Revisa el total semanal
5. Ajusta gastos si te pasas

### Caso 2: Ahorrar para Vacaciones

**Objetivo**: Ahorrar $2000 en 5 meses

**Cómo**:
1. Meta de ahorro mensual: $400
2. Presupuesto mensual: Tus ingresos - $400
3. Registra TODOS los gastos
4. Al final del mes, verifica si alcanzaste la meta
5. Exporta CSV para hacer seguimiento

### Caso 3: Rastrear Gastos de Weed 🌿

**Objetivo**: Saber exactamente cuánto gastas

**Cómo**:
1. Usa categoría "weed" consistentemente
2. Agrega notas: cepa, dispensario, cantidad
3. Filtra por categoría "weed"
4. Revisa gráfico de dona: % del presupuesto
5. Exporta CSV al final del mes

### Caso 4: Dividir Gastos con Roommate

**Limitación**: La app es de un solo usuario

**Workaround**:
1. Registra todos los gastos
2. Agrega nota: "compartido con [nombre]"
3. Exporta CSV al final del mes
4. En Excel, filtra por "compartido"
5. Suma y divide entre dos

**Mejor Solución**: Usa app multi-usuario (fuera de alcance)

---

## 🚀 Funciones Avanzadas

### Atajos de Teclado (Desktop)

**Navegación**:
- `Ctrl + H`: Ir al Dashboard
- `Ctrl + S`: Ir a Settings
- `Ctrl + N`: Nuevo movimiento
- `Esc`: Cerrar modal

**En Formularios**:
- `Tab`: Siguiente campo
- `Shift + Tab`: Campo anterior
- `Enter`: Guardar (cuando esté enfocado)

### Gestos Táctiles (Mobile)

- **Swipe Down**: Refresh (pull-to-refresh)
- **Long Press**: Copiar texto
- **Pinch Zoom**: Zoom en gráficos (no implementado aún)

### Comandos de Búsqueda

En el campo de búsqueda de movimientos:
- Búsqueda por nombre: `café`
- Búsqueda parcial: `star` (encuentra "starbucks")
- Case-insensitive: `CAFÉ` = `café`

### Edición Rápida de Gastos Fijos

**Tabla de Gastos Fijos**:
1. Click en cualquier celda
2. Se vuelve editable
3. Modifica
4. Presiona Enter
5. Guarda automáticamente

**Campos Editables**:
- Nombre
- Monto
- Categoría (dropdown)
- Día de Cobro
- Notas

---

## 📞 Soporte y Ayuda

### Preguntas Frecuentes

**P: ¿Puedo usar esto con múltiples usuarios?**
R: No, es app de un solo usuario. Cada persona necesita su propia URL/instalación.

**P: ¿Funcionará sin internet?**
R: Parcialmente. Puedes ver datos y agregar gastos manuales, pero no sincronizar o usar AI.

**P: ¿Puedo cambiar el diseño/colores?**
R: No en la app. Es código abierto, puedes modificar en tu propia instalación.

**P: ¿Cómo borro todos mis datos?**
R:
1. Settings de tu navegador
2. Clear Site Data / Limpiar datos
3. Selecciona IndexedDB
4. Confirma

**P: ¿Mis datos están respaldados?**
R: Sí, en Vercel Blob. También puedes exportar CSV regularmente.

**P: ¿Puedo importar un CSV?**
R: No en v1.0. Feature planeada para v2.

### Reportar Errores

**Si encuentras un bug**:
1. Nota exactamente qué paso te llevó al error
2. Toma screenshot si es posible
3. Reporta en: https://github.com/Oruga420/luna-budget/issues

**Incluye**:
- Dispositivo (laptop/móvil)
- Navegador (Chrome/Safari/Firefox)
- Pasos para reproducir
- Screenshot/video

---

## 🎓 Glosario

**Budget/Presupuesto**: Cantidad total disponible para gastar en el mes

**Savings Goal/Meta de Ahorro**: Dinero que planeas NO gastar (ahorrar)

**Threshold/Umbral**: Porcentaje del presupuesto que activa una alerta

**Variable Expense**: Gasto ocasional que tú registras manualmente

**Fixed Expense/Gasto Fijo**: Pago recurrente mensual (renta, Netflix, etc.)

**Entry/Movimiento**: Un gasto registrado (variable o fijo)

**Month Key**: Identificador del mes en formato YYYY-MM (ej: 2025-10)

**Sync/Sincronización**: Proceso de compartir datos entre dispositivos

**IndexedDB**: Base de datos local en tu navegador

**Vercel Blob**: Almacenamiento en la nube de Vercel

**CSV**: Comma-Separated Values (formato de archivo para Excel/Sheets)

**AI/GPT-4o**: Inteligencia artificial que analiza fotos

**Hydrate**: Cargar datos del servidor al almacenamiento local

---

## 📚 Recursos Adicionales

### Videos Tutoriales (Futuros)
- Configuración inicial
- Agregar gasto por foto
- Interpretar gráficos
- Exportar y analizar CSV

### Documentación Técnica
- STOPPING_POINT.md (para desarrolladores)
- Project plan.md (especificación original)
- README.md (instalación)

### Links Útiles
- App: https://lunas-budget.vercel.app
- GitHub: https://github.com/Oruga420/luna-budget
- Issues: https://github.com/Oruga420/luna-budget/issues

---

## ✅ Checklist de Inicio

**Primera Vez Usando la App**:
- [ ] Abro la URL en mi navegador
- [ ] Voy a Configuración
- [ ] Ingreso mi presupuesto mensual
- [ ] Configuro mi meta de ahorro
- [ ] Ajusto el umbral de alerta
- [ ] Selecciono mi moneda
- [ ] Reviso/ajusto las categorías
- [ ] Agrego mis gastos fijos (renta, suscripciones)
- [ ] Guardo cambios
- [ ] Vuelvo al Dashboard
- [ ] Agrego mi primer gasto
- [ ] ¡Listo! 🎉

**Uso Diario**:
- [ ] Abro la app
- [ ] Reviso mi presupuesto disponible
- [ ] Agrego gastos del día
- [ ] Reviso el gráfico
- [ ] Verifico que no superé mi meta

**Fin de Mes**:
- [ ] Exporto CSV
- [ ] Reviso el timeline completo
- [ ] Analizo mis gastos por categoría
- [ ] Ajusto presupuesto para el próximo mes

---

**¡Listo para empezar a controlar tus finanzas! 🚀💰**

**Última actualización**: 5 de Octubre, 2025
**Versión de la App**: 1.0
**Autor**: Luna Budget Team
