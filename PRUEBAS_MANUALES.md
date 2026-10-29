# Lista de pruebas manuales

Usa valores ficticios. Estas pruebas son un checklist inicial, no certificación financiera.

## Navegación y presentación
- [ ] Inicio abre ambos módulos.
- [ ] Plan de pagos funciona sin visitar capacidad de pagos.
- [ ] Capacidad de pagos funciona sin calcular un plan.
- [ ] Menú adaptable funciona en móvil.
- [ ] No se corta la tabla en pantallas pequeñas; permite desplazamiento horizontal.
- [ ] El aviso de prototipo no desaparece.

## Plan de pagos
- [ ] Capital 30.000 Bs, tasa 18%, plazo 24 meses, mensual, francés.
- [ ] Cambiar a alemán y comprobar que las cuotas disminuyen.
- [ ] Cambiar a americano y comprobar que el capital se concentra al vencimiento.
- [ ] Cambiar a balloon y revisar el saldo/pago final.
- [ ] Tasa cero: no deben aparecer intereses.
- [ ] Rechazar monto cero, valores negativos, campos vacíos y plazos no enteros.
- [ ] Cambiar frecuencia y revisar número de pagos y fechas.
- [ ] Añadir cargo fijo por cuota y costo inicial y verificar el costo total.
- [ ] Exportar CSV y abrirlo en una hoja de cálculo.
- [ ] Imprimir y guardar como PDF.
- [ ] Enviar cuota a capacidad de pagos.

## Capacidad de pagos
- [ ] Persona/familia con valores de prueba.
- [ ] Comerciante/empresa cambia las etiquetas del formulario.
- [ ] Excedente = ingresos − gastos − otras deudas.
- [ ] Margen = excedente − nueva cuota.
- [ ] Introducir cuota manualmente sin utilizar el primer módulo.
- [ ] Simular ingresos cero y verificar que los ratios aparezcan como no calculables.
- [ ] Aumentar la caída de ingresos y comprobar el escenario conservador.
- [ ] Enviar cuota máxima orientativa al plan de pagos.
- [ ] Imprimir y guardar como PDF.

## Historial y configuración
- [ ] Guardar una simulación.
- [ ] Verla desde Simulaciones guardadas.
- [ ] Eliminar una simulación y borrar el historial.
- [ ] Cambiar parámetros predeterminados y restaurarlos.
- [ ] Recargar la página y comprobar que el historial y la configuración local persisten.

## Revisión financiera antes de una presentación formal
- [ ] Comparar cada método con cálculos independientes conocidos.
- [ ] Confirmar que capital amortizado, intereses y saldo final cuadran.
- [ ] Revisar el pago final balloon y los abonos extraordinarios.
- [ ] Confirmar convenciones de tasas, calendario y redondeo con un profesional financiero.


## Validaciones adicionales de seguros y reportes

- [ ] Calcular un plan con TRe, desgravamen y cesantía en cero: no deben sumarse primas.
- [ ] Introducir tasas de seguros conocidas y comprobar que cada columna y el total de seguros cambian.
- [ ] Cambiar frecuencia de mensual a trimestral y verificar que las primas por mil se ajusten a los meses del período.
- [ ] Exportar el cronograma CSV y comprobar que aparecen columnas separadas de desgravamen, cesantía y otros seguros.
- [ ] En el plan de pagos, usar “Descargar / guardar PDF”, elegir “Guardar como PDF” y verificar que se incluye el cronograma completo.
- [ ] En capacidad de pagos, calcular un escenario y guardar el reporte en PDF.
- [ ] Comprobar en vista móvil que el encabezado, los formularios y las tablas se pueden utilizar.
- [ ] Verificar con información contractual vigente antes de asignar valores reales a TRe, seguros o cargos.

## Verificación visual y exportaciones
- [ ] Abrir Inicio y comprobar que la marca Banco FIE se vea claramente en encabezado, portada y tarjeta visual.
- [ ] Generar un plan de pagos y usar **Descargar Excel**; confirmar que se abre en Excel/LibreOffice con cabecera de marca, métricas y cronograma.
- [ ] En el plan, usar **Descargar / guardar PDF** y elegir Guardar como PDF; verificar encabezado de marca, métricas, gráficos y tabla.
- [ ] Evaluar capacidad de pagos y repetir exportación Excel y PDF; confirmar que aparece el detalle del análisis.
