# VehicleChain — Semana 3: Functional Proof

## 1. Front construido

> Pendiente: documentar pantallas, navegación, roles, relación con historias de usuario y MVP, y capturas o enlace al front funcionando (400–2000 palabras).

---

## 2. Decisión técnica

### Opción elegida: A — Contrato propio en Soroban

VehicleChain creará su propio contrato Soroban, desplegado inicialmente en **Stellar Testnet**. Esta semana solo se documenta la decisión; el contrato se implementará en la siguiente etapa.

### Qué hará el contrato

El Blueprint define que Stellar no se usa para el CRUD de vehículos, talleres y servicios (eso lo resuelve PostgreSQL), sino como **capa de evidencia compartida para operaciones críticas**. El contrato registrará y ejecutará únicamente lo siguiente:

| Función | Qué registra o ejecuta en la red | Historia |
| --- | --- | --- |
| Registrar taller autorizado | Identificador del taller y su estado (habilitado / rechazado), firmado por el administrador | `HU1JA(1)`, `HU1JT(1)` |
| Registrar vehículo | Identificador técnico del vehículo y la `Address` del propietario actual del historial | `HU1JP(1)` |
| Publicar evidencia de servicio | Identificador del vehículo, del servicio y del taller, hash del registro off-chain y timestamp | `HU2JT(2)`, `HU3JT(3)` |
| Consultar evidencia | Lectura del hash publicado para comprobar que el registro en PostgreSQL no fue modificado | `HU2JP(2)` |
| Transferir titularidad del historial | Actualización de la `Address` del propietario y evento de transferencia, sin alterar los servicios previos | `HU4JP(4)` |

Las operaciones protegidas usarán `Address` y `require_auth`: solo un taller habilitado puede publicar evidencia y solo el propietario actual puede transferir el historial. No se almacenan en el ledger datos personales, documentos ni órdenes de trabajo completas; permisos de consulta (`HU3JP(3)`) y detección de duplicados (`HU6JA(2)`) permanecen en el backend.

### Por qué hace falta un contrato propio

La propuesta de valor del Blueprint es **integridad + trazabilidad + autorización de operaciones críticas**. Las reglas que la sostienen son específicas del dominio: qué talleres pueden publicar, a qué vehículo pertenece cada evidencia, quién es el titular actual del historial y que una transferencia nunca modifique los registros anteriores. Ninguna herramienta genérica del ecosistema impone estas reglas por nosotros; un contrato propio las hace verificables por cualquier participante sin depender de la base de datos de una sola organización, que es precisamente la decisión técnica central del Blueprint.

### Qué se descartó (Opción B)

- **Escribir el hash en el campo memo o en `manageData` de una transacción Stellar clásica:** permite anclar evidencia, pero no valida quién publica ni gestiona la titularidad del historial; toda la autorización quedaría en el backend y la cadena solo guardaría datos sin reglas.
- **Tokenizar el vehículo como activo/NFT (p. ej. con contratos estándar de tokens):** modela propiedad transferible y comerciable, lo cual podría confundirse con el traspaso jurídico que el Blueprint excluye explícitamente del MVP.
- **Servicios externos de notarización o anclaje de hashes:** añaden un intermediario y no ofrecen la lógica de talleres habilitados ni la continuidad del historial entre propietarios.

Sí se aprovechará el ecosistema existente como **herramientas de apoyo**, no como sustituto del contrato: Soroban SDK y Stellar CLI para desarrollo y despliegue, Stellar Testnet y Friendbot para pruebas sin activos reales, y Stellar Expert para que la referencia de publicación (`HU3JT(3)`) sea verificable públicamente.

---

## 3. Participación del equipo

> Pendiente: usuario de GitHub, aporte y responsabilidad de cada integrante.

---

## 4. Bloqueos y siguiente paso

> Pendiente.
