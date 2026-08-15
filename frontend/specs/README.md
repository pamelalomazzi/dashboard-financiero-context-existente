# Contrato de Datos de Features Frontend

Este documento define el contrato de datos para 3 funcionalidades del dashboard financiero.

## Convenciones generales

- Formato de fecha para query params: YYYY-MM-DD.
- Si un parametro opcional no se envia, el backend no aplica ese filtro.
- Estados de UI esperados en todas las features: loading, empty, error, success.

---

## 1) Filtro de rango de fechas en el dashboard

### Endpoint exacto que consume

- GET /api/metrics/facets
  - Uso: obtener rango disponible y valores de filtros (incluye min_date y max_date).
- GET /api/metrics
  - Uso: obtener movimientos filtrados por start_date y end_date.

### Tipos TypeScript asociados

- Request:
  - DateRangeFilter (frontend/specs/param-types.ts)
- Response:
  - FacetsResponse (frontend/specs/api-types.ts) para /api/metrics/facets
  - FinancialMovement[] (frontend/src/lib/financial-types.ts) para /api/metrics

### Parametros validos y restricciones

Para DateRangeFilter:

- start_date (opcional)
  - Tipo: string con formato YYYY-MM-DD.
  - Regla UI: si existe end_date, no puede ser mayor que end_date.
- end_date (opcional)
  - Tipo: string con formato YYYY-MM-DD.
  - Regla UI: si existe start_date, no puede ser menor que start_date.

Restricciones operativas:

- Ambos campos vacios: request valida, sin filtro temporal.
- Si la fecha cae fuera de [min_date, max_date] recibido por facets:
  - La UI debe bloquear aplicar y mostrar validacion local.

### Edge cases y comportamiento exacto de UI

1. start_date > end_date
- Que pasa: el usuario selecciona rango invertido.
- UI debe mostrar:
  - Mensaje inline: "La fecha inicial no puede ser mayor que la fecha final".
  - Boton Aplicar deshabilitado.
  - No se dispara llamada al endpoint.

2. Rango valido pero sin resultados en /api/metrics
- Que pasa: backend responde 200 con arreglo vacio.
- UI debe mostrar:
  - Estado empty en widgets de datos: "No hay movimientos para el rango seleccionado".
  - Mantener visibles inputs de fecha y boton Limpiar.
  - No mostrar banner de error.

3. Falla en /api/metrics/facets (500 o network)
- Que pasa: no se puede obtener min_date y max_date.
- UI debe mostrar:
  - Banner de error no bloqueante: "No se pudo cargar el rango de fechas".
  - Inputs de fecha deshabilitados hasta reintento exitoso.
  - Accion visible de Reintentar.

---

## 2) Tabla de alertas de anomalias

### Endpoint exacto que consume

- GET /api/metrics/alerts
  - Query params usados por UI: start_date, end_date, threshold
  - Parametros adicionales del endpoint (opcional en UI): group_by, business_type

### Tipos TypeScript asociados

- Request:
  - AlertsParams (frontend/specs/param-types.ts)
  - Base compartida: DateRangeFilter (frontend/specs/param-types.ts)
- Response:
  - AlertsResponse (frontend/specs/api-types.ts)
  - Entrada de fila: AlertEntry (frontend/specs/api-types.ts)

### Parametros validos y restricciones

Para AlertsParams:

- start_date (opcional)
  - Tipo: YYYY-MM-DD.
- end_date (opcional)
  - Tipo: YYYY-MM-DD.
- threshold (obligatorio)
  - Tipo en frontend: AlertThreshold (number con marca de dominio).
  - Regla de producto UI: rango [0.01, 1.0].
  - Semantica: valor mas alto produce menos alertas.

Notas de compatibilidad:

- Backend actual permite threshold >= 0.
- Frontend debe mantener restriccion mas estricta [0.01, 1.0] para consistencia UX.

### Edge cases y comportamiento exacto de UI

1. threshold fuera de rango (ejemplo: 0, 1.2 o valor no numerico)
- Que pasa: input invalido en cliente.
- UI debe mostrar:
  - Error inline: "Threshold debe estar entre 0.01 y 1.0".
  - Boton Recalcular deshabilitado.
  - No se dispara request.

2. Respuesta vacia de /api/metrics/alerts
- Que pasa: backend responde 200 con [].
- UI debe mostrar:
  - Estado empty explicito: "No se detectaron anomalias para el periodo y threshold seleccionados".
  - Tabla sin filas de datos, sin estado de error.
  - Input de threshold visible y editable para nuevo intento.

3. Timeout o error de red al cargar alertas
- Que pasa: la llamada falla.
- UI debe mostrar:
  - Banner de error: "No se pudieron cargar las alertas".
  - Mantener ultimo valor valido de threshold en el input.
  - Boton Reintentar visible.

---

## 3) Vista comparativa B2B vs B2C (2 tablas + 1 grafico)

### Endpoints exactos que consume

- GET /api/metrics/b2b
  - Uso: tabla de movimientos B2B.
- GET /api/metrics/b2c
  - Uso: tabla de movimientos B2C.

Ambos endpoints consumen los mismos filtros temporales:

- start_date (opcional)
- end_date (opcional)

Opcionales adicionales soportados por backend:

- category
- operation_type

### Tipos TypeScript asociados

- Request:
  - DateRangeFilter (frontend/specs/param-types.ts)
  - Si se usa filtrado adicional:
    - operation_type: "income" | "outcome"
    - category: "suppliers" | "sales" | "operational" | "administrative" | "others"
- Response:
  - FinancialMovement[] (frontend/src/lib/financial-types.ts) para /api/metrics/b2b
  - FinancialMovement[] (frontend/src/lib/financial-types.ts) para /api/metrics/b2c

### Parametros validos y restricciones

Para ambos endpoints:

- start_date
  - Tipo: YYYY-MM-DD.
- end_date
  - Tipo: YYYY-MM-DD.
- operation_type (opcional)
  - Valores validos: income, outcome.
- category (opcional)
  - Valores validos: suppliers, sales, operational, administrative, others.

Restriccion de consistencia visual:

- El mismo DateRangeFilter debe aplicarse a ambas llamadas para evitar comparaciones sesgadas.

### Edge cases y comportamiento exacto de UI

1. B2B con datos y B2C vacio (o viceversa)
- Que pasa: una respuesta trae filas y la otra [].
- UI debe mostrar:
  - Tabla con datos en el lado disponible.
  - Tabla vacia en el otro lado con mensaje: "Sin movimientos para este rango".
  - Grafico comparativo visible, serie vacia en 0 para el lado sin datos.

2. Ambas respuestas vacias
- Que pasa: /b2b y /b2c devuelven [].
- UI debe mostrar:
  - Estado empty global: "No hay datos B2B ni B2C para el rango seleccionado".
  - No renderizar barras/lineas en el grafico; mostrar placeholder centrado.
  - Mantener filtros visibles para ajuste rapido.

3. Una de las dos llamadas falla
- Que pasa: error parcial (ejemplo /b2b falla y /b2c responde 200).
- UI debe mostrar:
  - Banner de error global indicando fuente fallida.
  - Tabla exitosa sigue visible con sus datos.
  - Tabla fallida en estado error local con accion Reintentar.
  - Grafico deshabilitado o marcado como incompleto con leyenda "Comparacion parcial".

---

## Resumen de mapeo rapido

- DateRange feature:
  - Request: DateRangeFilter
  - Response: FacetsResponse + FinancialMovement[]
- Alerts feature:
  - Request: AlertsParams
  - Response: AlertsResponse
- B2B vs B2C feature:
  - Request: DateRangeFilter (+ filtros opcionales)
  - Response: FinancialMovement[] de /api/metrics/b2b y /api/metrics/b2c
