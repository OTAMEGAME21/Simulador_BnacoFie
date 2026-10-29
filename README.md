# Simuladores financieros — proyecto demostrativo

**Ubicación de referencia:** Tarija, Bolivia  
**Tecnologías:** HTML, CSS y JavaScript. Chart.js se carga desde CDN para los gráficos.

> Este proyecto es un prototipo académico independiente. No es una plataforma oficial de Banco FIE, no concede créditos y no consulta sistemas bancarios reales. Las tasas, costos y límites iniciales son valores demostrativos.

## Contenido de la carpeta

- `index.html`: página principal y formularios de los dos módulos.
- `css/styles.css`: diseño adaptable, componentes y estilos de impresión.
- `js/app.js`: cálculos, validaciones, gráficos, conexión entre módulos, guardado local y exportación CSV.
- `assets/`: carpeta reservada para logotipos autorizados o recursos propios.

## Cómo abrirlo

1. Descarga y extrae el ZIP completo.
2. Abre `index.html` en Chrome, Edge o Firefox.
3. Para mostrar los gráficos se necesita conexión a Internet, porque Chart.js y las fuentes se cargan desde CDN. Los cálculos principales se ejecutan en el navegador.
4. Para publicarlo, sube toda la carpeta a un hosting estático. No cambies la estructura de carpetas.

También se puede abrir con un servidor local sencillo. Si tienes Python instalado, desde esta carpeta ejecuta:

```bash
python -m http.server 8000
```

Después abre `http://localhost:8000`.

## Módulo 1 — Plan de pagos

Incluye:
- Sistema francés, alemán, americano y balloon.
- Frecuencia mensual, trimestral, semestral y anual.
- Fecha de desembolso y primer vencimiento.
- Cargos por cuota y costos iniciales configurables.
- Abono extraordinario simplificado.
- Tabla de amortización, indicadores y gráficos.
- Exportación CSV e impresión/guardado a PDF desde el navegador.
- Transferencia opcional de la cuota al módulo de capacidad de pagos.

## Módulo 2 — Capacidad de pagos

Puede utilizarse por separado o recibir la cuota del plan de pagos. Incluye:
- Perfil persona/familia o comerciante/empresa.
- Ingresos, gastos, otras deudas y nueva cuota.
- Excedente mensual, margen, ratios y cuota máxima orientativa.
- Escenario conservador con caída de ingresos y aumento de gastos.
- Gráficos, tabla de indicadores e impresión/guardado a PDF.
- Envío de cuota máxima orientativa al plan de pagos para explorar otro escenario.

## Parámetros y almacenamiento

La sección **Parámetros** permite ajustar la tasa predeterminada y el límite orientativo cuota/ingresos. No son tasas ni reglas oficiales de Banco FIE. Las simulaciones guardadas y parámetros se almacenan en `localStorage` del navegador, no en un servidor. Borrar datos del navegador puede eliminarlos.

## Consideraciones financieras importantes

- La periodicidad convierte la tasa nominal anual en una tasa por período usando `tasa anual × frecuencia / 12`. Productos reales pueden utilizar tasas efectivas, días exactos u otras convenciones.
- La tabla es una simulación orientativa; redondeos, fechas, seguros, comisiones y condiciones contractuales pueden cambiar un cronograma real.
- Los abonos extraordinarios se modelan de forma simplificada; no sustituyen las reglas contractuales de prepago.
- El sistema balloon representa una parte del capital pendiente para el vencimiento. Revise el cronograma antes de usarlo en una presentación formal.
- La cuota máxima del módulo de capacidad es un indicador de planificación, no una decisión crediticia ni una política de Banco FIE.
- Antes de usar parámetros oficiales, verifique el tarifario y las condiciones de los productos en fuentes oficiales vigentes y documente la fecha y fuente.

## Próximas mejoras recomendadas antes de uso productivo

1. Revisión independiente de las fórmulas y pruebas automatizadas con casos financieros de referencia.
2. Reglas de tasa efectiva/nominal, base de días y vencimientos según producto.
3. Reglas exactas para pagos extraordinarios, seguro y comisiones.
4. Pruebas de accesibilidad, compatibilidad móvil y seguridad.
5. Solo con autorización y requisitos claros: identidad visual oficial, servidor, autenticación y almacenamiento seguro.



## Mejoras incorporadas en esta versión

- Identidad visual inspirada en los colores de Banco FIE: magenta `#E3007B` y azul `#2D4B9B`; el símbolo del encabezado es una recreación gráfica de demostración, no un archivo oficial del logotipo.
- Plan de pagos con campos editables para componente TRe anual adicional, seguro de desgravamen, seguro de cesantía y otros seguros por cuota.
- Para desgravamen y cesantía se puede elegir la base de cálculo: saldo pendiente al inicio de cada período o monto original del préstamo.
- Los seguros se calculan con la tasa por mil mensual ingresada y la frecuencia de pago seleccionada; el seguro adicional fijo se cobra por vencimiento.
- El resumen muestra la tasa anual usada (tasa nominal ingresada + componente TRe configurado) para que el ajuste sea visible.
- Exportación CSV del cronograma con columnas separadas para desgravamen, cesantía y otros seguros.
- Reporte imprimible/guardable en PDF para ambos simuladores: pulsa el botón correspondiente y elige **Guardar como PDF** en el cuadro de impresión del navegador.
- El simulador de capacidad de pagos continúa funcionando de manera independiente; también puede recibir la cuota estimada del plan de pagos.

## Advertencias importantes

Este es un prototipo académico independiente, no una aplicación oficial ni afiliada a Banco FIE. Los campos TRe, tasas de seguro, base asegurada, cargos y porcentajes deben configurarse con información contractual vigente y validada. Los valores predeterminados de seguros y TRe son cero para evitar inventar tarifas. El seguro de desgravamen puede depender del saldo asegurado y de las condiciones de póliza. El término TRe debe interpretarse y parametrizarse de acuerdo con el producto y la documentación que se esté simulando; aquí se representa como un componente anual adicional configurable y no se afirma que sea la fórmula oficial de un producto de Banco FIE.

Referencias institucionales para validar información antes de una utilización real:
- Banco FIE, productos de crédito: https://www.bancofie.com.bo/productos/credito
- Banco FIE, seguro de desgravamen: https://www.bancofie.com.bo/productos/seguros/desgravamen
- Banco FIE, sitio institucional: https://www.bancofie.com.bo/

No se solicitan credenciales ni se envían los datos a un servidor. Las simulaciones guardadas se conservan en el almacenamiento local del navegador.

## Identidad visual y exportación de reportes
- La portada incorpora un logotipo vectorial de estilo Banco FIE, más visible, junto con una portada visual reforzada en magenta y azul.
- Los reportes del plan de pagos y de capacidad pueden exportarse a Excel compatible (.xls, formato HTML tabular con estilos). Incluyen encabezado de marca, resumen y tabla de resultados.
- Los botones de PDF abren el diálogo de impresión del navegador; elige **Guardar como PDF**. El reporte incluye encabezado visual Banco FIE y colores de marca.
- El logotipo vectorial incluido es una recreación visual para este prototipo académico, no un archivo oficial proporcionado por Banco FIE. El sistema no es una plataforma oficial ni está afiliado al banco.
