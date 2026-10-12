# VehicleChain — Documentación Semana 3 (Functional Proof)

## 1. Front construido

VehicleChain es una interfaz web que permite recorrer el flujo principal del
MVP definido en el Product Blueprint: un historial de mantenimiento vehicular
que distintos talleres alimentan, que un propietario controla, y que un
administrador supervisa validando talleres y revisando registros
potencialmente duplicados.

La pantalla inicial presenta una selección de rol simulada (sin
autenticación real todavía): Propietario, Taller o Administrador. Cada rol
abre su propio panel, con una barra lateral de navegación y un botón para
cambiar de rol en cualquier momento.

**Panel de Propietario.** Incluye cuatro pantallas: registrar un vehículo
(HU1JP), consultar el historial de mantenimiento del vehículo en orden
cronológico (HU2JP), administrar permisos de acceso por taller (HU3JP), y
transferir el control del historial a un nuevo propietario (HU4JP). La
pantalla de historial es la que comunica la propuesta de valor central del
producto: un registro continuo construido por distintos talleres, en vez de
facturas y documentos dispersos.

**Panel de Taller.** Incluye el registro de un taller nuevo, que queda en
estado "pendiente de validación" hasta que un administrador lo revisa
(HU1JT), y el registro de un servicio de mantenimiento sobre un vehículo
existente (HU2JT). Al registrar un servicio, la aplicación simula la
publicación de su evidencia —un hash y una transacción de ejemplo en Stellar
Testnet— dejando claro que es una demostración del flujo y no una
transacción real (HU3JT).

**Panel de Administrador.** Permite revisar las solicitudes de talleres
pendientes y aprobarlas o rechazarlas (HU1JA), y revisar registros de
mantenimiento potencialmente duplicados —mismo vehículo, mismo tipo de
servicio, misma fecha, registrados por talleres distintos— antes de que se
conviertan en una disputa entre propietario y taller (HU6JA).

La navegación completa funciona de extremo a extremo dentro de cada rol, sin
rutas rotas ni pantallas aisladas. Todos los datos son simulados (en memoria
del navegador): no hay backend ni base de datos todavía, como corresponde a
esta etapa del proyecto.

_(Agregar aquí: captura de pantalla o enlace al front funcionando, por
ejemplo un enlace de Vercel.)_

## 2. Decisión técnica

VehicleChain elige la **Opción A — contrato propio en Soroban**, en lugar de
usar una herramienta existente del ecosistema Stellar.

Se descarta la Opción B porque el producto necesita reglas de negocio
específicas del dominio —quién puede registrar un servicio sobre qué
vehículo, cómo se transfiere el control de un historial entre propietarios,
qué cuenta como evidencia válida de un mantenimiento, cómo se valida la
incorporación de un taller— que no corresponden a lo que resuelve una
herramienta genérica del ecosistema.

El contrato no sustituye la base de datos del producto: los datos
personales, los documentos completos y el detalle de cada mantenimiento
siguen viviendo fuera de la cadena (off-chain). Lo que el contrato
registrará y hará consultable en Stellar/Soroban es la evidencia de que
esos eventos ocurrieron y no fueron alterados después: identificador del
vehículo, identificador del servicio, identificador del taller, un hash de
la evidencia del registro, marca de tiempo, y el evento de transferencia del
historial entre propietarios. Aporta integridad y trazabilidad sobre la
evidencia, no una verificación de que el mantenimiento ocurrió físicamente.

En esta entrega la decisión queda documentada pero no implementada: el
contrato todavía no está escrito ni desplegado en Stellar Testnet. Lo que sí
se construyó en el front es la simulación de cómo se vería esa evidencia una
vez publicada (ver sección "Panel de Taller" arriba), para anticipar la
integración real de la siguiente etapa.

## 3. Participación del equipo

| Integrante | Usuario de GitHub | Aporte | Responsabilidad |
|---|---|---|---|
| Juan Carlos | _(completar)_ | Base del proyecto (estructura, navegación, selección de rol) y las 4 pantallas de Propietario (HU1JP–HU4JP) | Rol Propietario |
| Alexis | _(completar)_ | Las 3 pantallas de Taller: registro de taller, registro de servicio y evidencia de publicación (HU1JT–HU3JT) | Rol Taller |
| Lily | _(completar)_ | Las 3 pantallas de Administrador: validar talleres y detectar duplicados (HU1JA, HU6JA) | Rol Administrador |

## 4. Bloqueos y siguiente paso

No hubo bloqueos técnicos relevantes; se usaron datos simulados en memoria,
sin depender de backend ni de la integración con Stellar.

El contrato Soroban todavía no se encuentra implementado, dado que su
desarrollo corresponde a la siguiente etapa. El próximo paso será
implementar y desplegar en Stellar Testnet el contrato definido, integrar
las operaciones críticas (registro de vehículo, registro de servicio,
transferencia de historial) con el frontend, y validar la evidencia de
publicación con datos reales en lugar de simulados.
