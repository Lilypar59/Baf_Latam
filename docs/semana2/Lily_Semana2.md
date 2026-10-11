# Historias de usuario individuales — VehicleChain

**Autora:** Lily Pardo  
**Usuario de GitHub:** @Lilypar59  
**Semana:** 2 — Product Blueprint

Estas historias fueron planteadas como un aporte complementario al trabajo del equipo. Se enfocan en necesidades que no están cubiertas directamente en las historias individuales de los otros integrantes: incorporación y validación de talleres, continuidad del historial después de una venta, cobertura del historial, auditoría de accesos, comprobantes de publicación y control de duplicados.

## Historias de usuario

### HU1 — Validar la incorporación de un taller

**Como administrador de VehicleChain, quiero validar la identidad y los datos básicos de un taller antes de habilitarlo como participante, para que los nuevos registros de mantenimiento queden asociados a un actor identificado dentro de la plataforma.**

**Valor:** establece una condición mínima de confianza sobre quién puede generar registros y permite diferenciar la identidad del actor de la integridad posterior del registro.

---

### HU2 — Mantener la continuidad después de una venta

**Como propietario de un vehículo, quiero iniciar la transferencia del acceso al historial cuando venda mi vehículo, para que el nuevo propietario pueda continuar consultándolo sin modificar los registros históricos existentes.**

**Valor:** hace que el historial acompañe al vehículo y no dependa de que el antiguo propietario continúe administrándolo.

---

### HU3 — Conocer la cobertura real del historial

**Como comprador de un vehículo usado, quiero conocer qué período de tiempo y qué tipos de mantenimiento están registrados y cuáles presentan ausencia de información, para interpretar correctamente el alcance del historial antes de comprar.**

**Valor:** evita confundir un historial incompleto con evidencia de que determinados mantenimientos nunca ocurrieron.

---

### HU4 — Consultar la trazabilidad de los accesos

**Como propietario de un vehículo, quiero consultar un registro de los accesos autorizados a la información de mi vehículo, para saber cuándo se consultó el historial y mantener trazabilidad sobre su uso.**

**Valor:** complementa el control de acceso con evidencia de utilización y refuerza el enfoque de privacidad del producto.

---

### HU5 — Recibir evidencia de publicación del mantenimiento

**Como taller participante, quiero recibir un comprobante verificable cuando un mantenimiento quede registrado correctamente, para poder demostrar que mi taller publicó ese registro en VehicleChain en una fecha determinada.**

**Valor:** genera una evidencia útil para el propio taller y puede contribuir a incentivar su participación en el sistema.

---

### HU6 — Detectar registros potencialmente duplicados

**Como administrador de VehicleChain, quiero que el sistema identifique posibles registros duplicados para un mismo vehículo, taller, fecha y servicio, para reducir inconsistencias y mantener la calidad del historial.**

**Valor:** evita que un mismo mantenimiento sea contabilizado varias veces y agrega una regla de calidad de datos independiente de la blockchain.

---

### HU7 — Distinguir evidencia de integridad de veracidad

**Como usuario de VehicleChain, quiero que el sistema indique claramente que un registro es íntegro pero que la plataforma no garantiza por sí sola que el mantenimiento realmente ocurrió, para interpretar la evidencia de forma correcta y no confundir blockchain con una validación física del servicio.**

**Valor:** establece una expectativa correcta sobre el producto y evita una de las principales limitaciones conceptuales del proyecto: blockchain protege la integridad del registro, pero no garantiza la verdad del dato introducido.

## Priorización individual

| Orden | Historia | Prioridad  | Justificación                                                                                                                    |
| :---: | :------: | :--------: | -------------------------------------------------------------------------------------------------------------------------------- |
|   1   |   HU1    |    Alta    | La identidad del taller es una condición de confianza para interpretar posteriormente los registros de mantenimiento.            |
|   2   |   HU7    |    Alta    | Define correctamente qué problema resuelve blockchain y evita una promesa incorrecta sobre la veracidad de los mantenimientos.   |
|   3   |   HU2    |    Alta    | Permite que el historial permanezca asociado al vehículo después de una venta, uno de los escenarios centrales del producto.     |
|   4   |   HU3    | Media-alta | Ayuda al comprador a interpretar el historial sin asumir que la ausencia de información significa que un servicio nunca ocurrió. |
|   5   |   HU4    |   Media    | Fortalece privacidad y trazabilidad de acceso, pero depende de que primero exista información registrada.                        |
|   6   |   HU5    |   Media    | Aporta valor al taller y puede favorecer la adopción, aunque no es el núcleo del caso de uso de compra.                          |
|   7   |   HU6    |   Media    | Mejora la calidad de los datos y evita duplicados, pero puede implementarse después de las capacidades centrales del MVP.        |

## Historia que considero más importante

### HU1 — Validar la incorporación de un taller

La considero la más importante porque VehicleChain no solo necesita demostrar que un registro no fue modificado después de publicarse; también necesita identificar quién generó ese registro.

El proyecto debe mantener separadas tres dimensiones:

1. **Identidad del actor:** quién realizó y publicó el registro.
2. **Veracidad del dato:** si el servicio realmente fue realizado como se declaró.
3. **Integridad del registro:** si la información publicada fue modificada posteriormente.

Blockchain puede contribuir principalmente a la tercera dimensión. Por eso, la identificación y validación de los talleres debe formar parte del diseño del producto, aunque la validación de la veracidad física del mantenimiento requiera otros mecanismos.

Esta historia también ayuda a evitar una interpretación incorrecta del producto: **VehicleChain no certifica que un vehículo esté en buen estado ni que cada mantenimiento haya ocurrido; proporciona evidencia sobre los registros realizados por actores identificados y sobre la integridad posterior de esos registros.**

## Relación con el MVP

Estas historias aportan funcionalidades potenciales para la discusión del backlog:

- **HU1:** incorporación y validación básica de talleres.
- **HU2:** continuidad del historial ante cambio de propietario.
- **HU3:** visualización de cobertura y ausencia de información.
- **HU4:** auditoría básica de accesos.
- **HU5:** comprobante verificable de publicación.
- **HU6:** detección básica de duplicados.
- **HU7:** explicación de la naturaleza y límites de la evidencia blockchain.

La selección definitiva del MVP debe hacerse en equipo después de comparar las historias de los tres integrantes. El entregable exige que las historias priorizadas se conviertan posteriormente en el backlog del tablero Kanban de GitHub Projects.
