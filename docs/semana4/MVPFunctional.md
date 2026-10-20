# VehicleChain — MVP funcional (Semana 4)

Historial de mantenimiento vehicular entre talleres y propietarios, con evidencia verificable en un contrato propio de Soroban desplegado en Stellar Testnet.

## Evidencia verificable

| Qué | Enlace |
| --- | --- |
| Video (pitch + producto funcionando, 2:43) | **[PENDIENTE: enlace público]** |
| Contrato `vehiclechain` en Testnet | <https://stellar.expert/explorer/testnet/contract/CCYAXY4SVKDJYG74FN2GHOTKSGFERB6BZFGOIISWQCO5QMDHETMXNZDP> |
| Transacción de despliegue | <https://stellar.expert/explorer/testnet/tx/9bd7f60d0fe99cea9c68e06a89b0f069b371ece2ac5fc8a43ef8984d4c784e9b> |
| Código del contrato | [`contracts/vehiclechain/src/lib.rs`](../../contracts/vehiclechain/src/lib.rs) (tests en `test.rs`) |
| Código del front conectado | [`frontend/`](../../frontend/) — integración en `frontend/src/lib/` |
| Repositorio | <https://github.com/Lilypar59/Baf_Latam> |

Contract ID: `CCYAXY4SVKDJYG74FN2GHOTKSGFERB6BZFGOIISWQCO5QMDHETMXNZDP`

### Transacciones del flujo completo en Testnet

| Paso | Historia | Transacción |
| --- | --- | --- |
| El administrador habilita un taller | `HU1JA(1)` | [3657ac33…](https://stellar.expert/explorer/testnet/tx/3657ac33f9ca1c6364d0148116b6335210dc0783b1337ebcbc9acdcc468bce35) |
| El propietario registra su vehículo | `HU1JP(1)` | [8f653ead…](https://stellar.expert/explorer/testnet/tx/8f653ead53621670e0ffe1d1eaa263de598217cc4765d93fc5f22fb2daecf1bc) |
| El taller publica la evidencia de un servicio | `HU2JT(2)`, `HU3JT(3)` | [70f5463d…](https://stellar.expert/explorer/testnet/tx/70f5463d2b5b8dfeb10d72b8ea818a4f72db036fc856c8fff3ab1b4b18fb1180) |
| El propietario transfiere la titularidad del historial | `HU4JP(4)` | [1583cf15…](https://stellar.expert/explorer/testnet/tx/1583cf157585b555ef33361171bb7c5e941cff40104c7fcdc006717b02bc2cb4) |

Las transacciones hechas desde el front durante la grabación del video también aparecen en la pestaña de historial del contrato en Stellar Expert.

## Qué construimos

**Contrato propio en Soroban** (`soroban-sdk` 29, protocolo 29 de Testnet), como se declaró en el Entregable 3:

| Función | Historia | Quién firma |
| --- | --- | --- |
| `set_workshop`, `is_workshop_enabled` | `HU1JA(1)`, `HU1JT(1)` | Administrador |
| `register_vehicle`, `get_vehicle` | `HU1JP(1)` | Propietario |
| `publish_service`, `get_service` | `HU2JT(2)`, `HU3JT(3)` | Taller habilitado |
| `verify_service`, `get_vehicle_services` | `HU2JP(2)` | Lectura pública |
| `transfer_history` | `HU4JP(4)` | Titular actual |

El contrato impone las reglas del dominio: solo un taller habilitado publica, una evidencia no se puede sobrescribir y solo el titular actual transfiere el historial. La transferencia no toca los servicios anteriores. En la cadena no hay datos personales: el vehículo se identifica por el SHA-256 de su VIN y cada servicio por el SHA-256 de su registro off-chain. Tiene 7 tests unitarios y emite un evento por cada operación.

**Front conectado al contrato** (React + Vite + TypeScript):

- Acceso con la wallet **Freighter**. Los roles se leen del contrato: es administrador la cuenta que coincide con `get_admin`, y es taller habilitado la que pasa `is_workshop_enabled`.
- Cliente tipado generado con `stellar contract bindings typescript`. Las escrituras se firman en Freighter y cada operación muestra su progreso y el enlace a la transacción.
- El historial del propietario se lee del contrato y cada servicio se marca **Íntegro** o **Modificado off-chain** al recalcular su hash.
- Se corrigió `HU4JP(4)`: ya no hay comprador ni precio, sino la cuenta del nuevo titular y la aclaración de que no es un traspaso jurídico.

**Resto del back**: la capa `frontend/src/lib/` calcula los hashes, consulta y firma en el contrato y guarda los datos off-chain (placa, descripción, solicitudes de talleres). En esta versión ese almacenamiento es local del navegador, que hace las veces de base de datos. Los permisos (`HU3JP(3)`) y la detección de duplicados (`HU6JA(2)`) siguen off-chain, como define el Blueprint.

## Aprendizajes y ajustes priorizados

Aprendimos que la frontera entre lo que va en la cadena y lo que no define todo el diseño. Al principio pensábamos en "guardar el historial en blockchain". Al construir el contrato, entendimos que su valor no está en almacenar datos, sino en las reglas que nadie puede saltarse: quién puede publicar, que una evidencia no se reescribe y quién es el titular. Por eso a la cadena solo van hashes y direcciones, y eso resolvió a la vez la privacidad y el costo.

También aprendimos que la wallet cambia la experiencia. Con roles simulados, cualquiera entraba a cualquier panel. Con Freighter, el rol depende de la cuenta, y eso obligó a rediseñar el acceso: primero la wallet, luego un rol habilitado según el contrato. Además, cada firma necesita mensajes claros, porque los errores del contrato llegan como códigos.

Ajustes ordenados por impacto y esfuerzo:

1. **Hecho (alto impacto, bajo esfuerzo):** corregir la transferencia para eliminar comprador y precio, que contradecían el Blueprint.
2. **Hecho (alto, medio):** traducir los errores del contrato y bloquear las acciones que el contrato rechazaría, como publicar con un taller no habilitado.
3. **Antes del cierre (alto, medio):** desplegar públicamente la versión integrada del front.
4. **Pendiente (alto, alto):** un backend compartido con PostgreSQL para que los datos off-chain sean comunes a todos los usuarios.
5. **Pendiente (medio, medio):** permisos de consulta reales (`HU3JP(3)`) y una regla de duplicados más robusta.

## Riesgos y pendientes

**Datos off-chain locales.** El riesgo más importante hoy es que los datos fuera de la cadena (placa, marca, descripción del servicio, solicitudes de talleres) viven en el navegador. El contrato es la fuente común de verdad para la titularidad, los talleres habilitados y los hashes, pero si un taller y un propietario usan equipos distintos, el propietario verá la evidencia sin el detalle del servicio. Para resolverlo hace falta el backend con PostgreSQL definido en el Blueprint, que guarde los registros y calcule los mismos hashes.

**Dependencia de la wallet.** Hoy cada participante necesita Freighter, una cuenta en Testnet y algo de XLM para las comisiones. Para un taller o un propietario sin experiencia en cripto esto es una barrera alta. Pendiente: evaluar cuentas inteligentes con passkeys o un patrocinador de comisiones, para que firmar sea tan simple como iniciar sesión.

**Administrador único.** Una sola cuenta habilita a todos los talleres. Si esa clave se pierde o se compromete, se pierde el control del sistema. El contrato ya permite rotar el admin (`set_admin`), pero falta una multifirma o una gobernanza compartida.

**Calidad de la información.** El contrato garantiza quién publicó un registro y que no fue modificado, pero no que el servicio se haya hecho de verdad. Un taller habilitado podría publicar datos falsos. Mitigaciones previstas: la detección de duplicados, la posibilidad de deshabilitar talleres y, a futuro, reputación por taller.

**Ciclo de vida de los datos en la red.** El almacenamiento de Soroban tiene un tiempo de vida (TTL). El contrato lo extiende en cada escritura, pero un vehículo sin actividad durante meses podría archivarse y habría que restaurarlo. Pendiente: monitorear el TTL y renovarlo.

**Pendiente de cierre.** Publicar el front integrado: el enlace de Bolt muestra una versión anterior. Además, cada integrante debe verificar su commit propio de esta semana.

## Plan de validación con usuarios

**A quiénes.** Al usuario del Problem Brief, el propietario de un vehículo que hace mantenimientos en talleres distintos, en especial quien está por vender o comprar un usado. Como actor necesario, a talleres independientes, que son los que publican los servicios. Meta inicial: 8 propietarios, 3 compradores de usados y 3 talleres en Bogotá.

**Métodos.**

1. **Entrevistas cortas (20 min)** antes de mostrar el producto, para entender cómo guardan hoy el historial y qué documentos piden o entregan al vender.
2. **Prueba guiada con el MVP en Testnet.** El propietario registra su vehículo, un taller publica un servicio real y el propietario consulta el historial y lo verifica en Stellar Expert. Observamos dónde se traba cada uno, sobre todo con la wallet.
3. **Prueba con compradores.** Les mostramos dos fichas del mismo vehículo, una con facturas sueltas y otra con el historial verificado de VehicleChain, y les preguntamos cuál les da más confianza y por qué.
4. **Métricas del MVP**, contadas desde los eventos del contrato y el registro off-chain: talleres habilitados, servicios publicados por taller, vehículos con al menos dos servicios de talleres distintos y tiempo para registrar un servicio.

**Hipótesis y criterio de éxito.**

| Hipótesis | Se cumple si… |
| --- | --- |
| H1. El propietario valora tener un historial único que no dependa del taller | Al menos 6 de 8 propietarios dicen que lo usarían para su próximo mantenimiento o venta |
| H2. Un taller está dispuesto a registrar cada servicio | Al menos 2 de 3 talleres registran servicios reales durante 2 semanas, y registrar uno toma menos de 3 minutos |
| H3. Un historial verificado aumenta la confianza del comprador | Al menos 2 de 3 compradores eligen la ficha verificada y explican que es porque no se puede alterar |
| H4. Firmar con wallet no es una barrera insalvable | Al menos el 70 % completa el registro sin ayuda; si no, se prioriza el acceso con passkeys |

Si H2 no se cumple, el riesgo es de adopción y no técnico: revisaríamos el incentivo para el taller (por ejemplo, visibilidad como "taller verificado") antes de seguir construyendo.

## Equipo

| Integrante | Usuario de GitHub |
| --- | --- |
| Lily Pardo | Lilypar59 |
| Alexis Suárez | sualexiz |
| Juan Carlos Vargas | Ledger146 |

Cada integrante tiene al menos un commit propio en el repositorio durante esta semana.
