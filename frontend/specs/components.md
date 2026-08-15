# Especificaciones de Componentes Frontend

Este documento define la especificación funcional de componentes para tres capacidades del dashboard financiero:

1. Filtro de rango de fechas
2. Tabla de alertas de anomalías
3. Vista comparativa B2B vs B2C

Las especificaciones están orientadas a React + TypeScript y se alinean con los contratos definidos en frontend/specs/api-types.ts y frontend/specs/param-types.ts.

## 1) Filtro de rango de fechas en el dashboard

### Componente: DateRangeFilterBar

Objetivo:
Permitir al usuario seleccionar una fecha inicial y una fecha final para filtrar el resto de widgets del dashboard.

Props:
- value: DateRangeFilter
- minDate: string
- maxDate: string
- disabled: boolean
- loading: boolean
- errorMessage: string | null
- onChange: (next: DateRangeFilter) => void
- onApply: () => void
- onReset: () => void

Estado interno:
- draftStartDate: string | undefined
- draftEndDate: string | undefined
- touched: boolean
- localValidationError: string | null
- isDirty: boolean

Reglas de validación interna:
- Si ambas fechas existen, start_date no debe ser mayor que end_date.
- Si existe minDate y maxDate, ambas fechas deben quedar dentro del rango.
- Si un campo tiene valor, debe seguir formato YYYY-MM-DD.

Render por estado:
- loading:
  - Renderiza dos controles de fecha deshabilitados con skeleton.
  - Renderiza botón Aplicar deshabilitado.
  - No muestra mensajes de error de validación local.
- empty:
  - Este componente no tiene estado empty propio de datos.
  - Si no hay value inicial, renderiza inputs vacíos con placeholder de formato.
- error:
  - Si localValidationError existe, renderiza mensaje inline bajo los inputs.
  - Si errorMessage existe (error externo), renderiza banner compacto sobre botones.
  - Botón Aplicar deshabilitado cuando hay error local.
- success:
  - Renderiza dos date inputs interactivos.
  - Botón Aplicar habilitado cuando isDirty y sin errores.
  - Botón Limpiar habilitado cuando haya al menos un campo con valor.

Accesibilidad:
- Asociar label explícito a cada input.
- Exponer feedback de validación con aria-live polite.
- Botones con textos claros: Aplicar filtro y Limpiar filtro.

## 2) Tabla de alertas de anomalías con threshold y estado vacío explícito

### Componente: AlertsPanel

Objetivo:
Orquestar carga de alertas, edición del threshold y render de tabla o estados alternativos.

Props:
- params: AlertsParams
- data: AlertsResponse | null
- loading: boolean
- error: string | null
- onThresholdChange: (next: number) => void
- onRefresh: () => void

Estado interno:
- thresholdInput: string
- thresholdValidationError: string | null
- isSubmitting: boolean

Reglas de validación interna:
- threshold debe ser numérico.
- threshold debe estar entre 0.01 y 1.0 inclusive.
- Permitir hasta 2 decimales para UX consistente.

Render por estado:
- loading:
  - Muestra input threshold deshabilitado.
  - Muestra botón Recalcular deshabilitado.
  - Muestra skeleton de cabecera de tabla y de filas.
- empty:
  - Estado explícito obligatorio cuando data existe y longitud es 0.
  - Mensaje sugerido: No se detectaron anomalías para el período y threshold seleccionados.
  - Mantener visible el input de threshold para permitir reintento.
- error:
  - Muestra alerta visual con el mensaje de error.
  - Mantiene visible el input threshold con el último valor válido.
  - Muestra acción Reintentar.
- success:
  - Renderiza tabla con columnas:
    - Período
    - Outcome observado
    - Promedio base
    - Incremento
  - Formatea incremento en porcentaje legible.

### Componente: AlertsThresholdInput

Objetivo:
Encapsular el control de threshold para ser reutilizable y testeable de forma aislada.

Props:
- value: string
- min: number
- max: number
- step: number
- disabled: boolean
- errorMessage: string | null
- onChange: (next: string) => void
- onSubmit: () => void

Estado interno:
- touched: boolean
- focused: boolean

Render por estado:
- loading:
  - Input numérico deshabilitado con indicador visual de carga.
- empty:
  - Cuando value vacío, placeholder con ejemplo 0.30.
- error:
  - Mensaje inline cuando errorMessage existe.
- success:
  - Input editable y botón asociado habilitado.

### Componente: AlertsTable

Objetivo:
Presentar las alertas en una tabla accesible y ordenada.

Props:
- rows: AlertsResponse
- loading: boolean
- emptyMessage: string

Estado interno:
- sortBy: period | increase_ratio
- sortDirection: asc | desc

Render por estado:
- loading:
  - Skeleton de al menos 5 filas.
- empty:
  - Fila única ocupando todas las columnas con emptyMessage.
- error:
  - No maneja error directo, error se muestra en AlertsPanel.
- success:
  - Filas de datos con ordenamiento cliente opcional por columna.

## 3) Vista comparativa B2B vs B2C con dos tablas en paralelo y un gráfico

### Componente: BusinessComparisonView

Objetivo:
Mostrar una comparación simultánea entre movimientos B2B y B2C en formato tabular y gráfico.

Props:
- dateRange: DateRangeFilter
- b2bRows: FinancialMovement[]
- b2cRows: FinancialMovement[]
- loading: boolean
- error: string | null
- onRefresh: () => void

Estado interno:
- selectedOperationType: income | outcome | all
- selectedCategory: suppliers | sales | operational | administrative | others | all
- normalizedSeries: Array<{ period: string; b2b: number; b2c: number }>

Render por estado:
- loading:
  - Renderiza layout final con placeholders.
  - Dos skeleton tables en paralelo.
  - Skeleton del gráfico comparativo.
- empty:
  - Si ambas tablas están vacías, muestra estado vacío global con mensaje.
  - Si solo una tabla está vacía, la otra mantiene sus datos y la vacía muestra empty local.
- error:
  - Banner de error global y acción Reintentar.
  - Opcionalmente ocultar gráfico si no hay datos mínimos para comparar.
- success:
  - Grid de 2 columnas en desktop y 1 columna en mobile.
  - Tabla B2B a la izquierda y tabla B2C a la derecha en desktop.
  - Debajo, gráfico comparativo de serie temporal.

### Componente: BusinessMovementsTable

Objetivo:
Renderizar una tabla de movimientos para un tipo de negocio específico.

Props:
- title: string
- rows: FinancialMovement[]
- loading: boolean
- emptyMessage: string
- maxRows: number

Estado interno:
- page: number
- pageSize: number
- sortBy: create_date | amount | category
- sortDirection: asc | desc

Render por estado:
- loading:
  - Cabecera y cuerpo con skeleton.
- empty:
  - Mensaje explícito dentro de la tabla.
- error:
  - No maneja error directo; hereda del contenedor.
- success:
  - Filas paginadas y ordenables.
  - Columnas sugeridas: Fecha, Categoría, Tipo, Monto.

### Componente: B2BvsB2CChart

Objetivo:
Comparar visualmente la evolución mensual de B2B y B2C.

Props:
- series: Array<{ period: string; b2b: number; b2c: number }>
- loading: boolean
- emptyMessage: string

Estado interno:
- hoveredPeriod: string | null
- highlightedSeries: b2b | b2c | null

Render por estado:
- loading:
  - Skeleton de contenedor del gráfico.
- empty:
  - Mensaje centrado con emptyMessage.
- error:
  - No maneja error directo; error en el contenedor principal.
- success:
  - Gráfico de líneas o barras agrupadas con leyenda.
  - Tooltip con ambos valores para el período seleccionado.

## Contrato de estados global recomendado

Para mantener consistencia entre componentes, se recomienda un estado de petición compartido por feature:

- idle: aún no se pidió data
- loading: petición en curso
- success: petición completada con data
- empty: petición completada sin elementos
- error: petición fallida

Regla práctica:
- empty aplica solo cuando la llamada fue exitosa y la colección está vacía.
- error no debe reemplazar controles de filtro; deben quedar visibles para recuperación rápida.
