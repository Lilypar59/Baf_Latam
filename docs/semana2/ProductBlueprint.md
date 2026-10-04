# Product Blueprint — VehicleChain

## 1. Priorización de historias

El equipo seleccionó **9 historias para el backlog Kanban**, conservando exactamente la nomenclatura acordada:

1. `HU1JA(1) - Validar la incorporación de un taller`
2. `HU6JA(2) - Detectar registros potencialmente duplicados`
3. `HU1JP(1) - Registro Vehículo`
4. `HU2JP(2) - Consultar Histórico`
5. `HU3JP(3) - Permisos de acceso historial`
6. `HU4JP(4) - Transferencia de Propietario`
7. `HU1JT(1) - Registro Taller`
8. `HU2JT(2) - Registro de Servicio`
9. `HU3JT(3) - Recibir evidencia de publicación del mantenimiento`

### Criterio de priorización

Las historias se priorizaron por cuatro criterios: **dependencia funcional**, **valor para el propietario**, **valor diferencial de blockchain** y **control/calidad del dato**. El producto primero debe disponer de vehículos, talleres y servicios; después debe permitir consultar y controlar el historial; finalmente debe demostrar evidencia verificable y continuidad ante el cambio de propietario.

El backlog se gestiona en GitHub Projects. Las nueve historias anteriores son las que pasan al tablero del equipo.

---

## 2. Propuesta de valor

**VehicleChain permite al propietario mantener un historial de mantenimiento asociado al vehículo, aunque los servicios sean realizados por diferentes talleres, y conservar su continuidad cuando cambia de propietario.**

Actualmente, la información puede quedar distribuida entre sistemas internos de talleres, facturas, órdenes de trabajo y otros comprobantes. VehicleChain propone un flujo único: el taller se incorpora como participante autorizado, registra el servicio, el sistema genera evidencia verificable de su publicación y el propietario puede consultar y controlar el acceso al historial.

La propuesta no intenta reemplazar el RUNT ni convertirse en autoridad sobre la propiedad jurídica del vehículo. La transferencia de propietario en VehicleChain representa la **continuidad y transferencia controlada del historial**, mientras el cambio legal de propietario continúa realizándose mediante los mecanismos oficiales.

La diferencia frente a una base de datos privada convencional está en la evidencia compartida de las operaciones críticas. Stellar/Soroban permite mantener estado verificable y aplicar reglas de autorización sobre operaciones como publicación de evidencia y transferencia de titularidad del historial.

El resultado esperado no es afirmar que un mantenimiento fue verdadero por el solo hecho de estar registrado, sino proporcionar **trazabilidad e integridad verificable** sobre quién publicó un registro y si este fue modificado posteriormente.

---

## 3. Flujo de usuario

```text
ADMINISTRADOR
    │
    ├── HU1JA(1) Validar incorporación de taller
    │
    ▼
TALLER
    │
    ├── HU1JT(1) Registro Taller
    │
    └── HU2JT(2) Registro de Servicio
                    │
                    ▼
            HU3JT(3) Evidencia
            de publicación
                    │
                    ▼
             HISTORIAL VEHÍCULO
                    │
                    ▼
PROPIETARIO ── HU2JP(2) Consultar Histórico
    │
    ├── HU3JP(3) Permisos de acceso
    │
    └── HU4JP(4) Transferencia de Propietario
                    │
                    ▼
             NUEVO PROPIETARIO
                    │
                    ▼
          Mismo historial histórico
```

### Secuencia

1. El administrador valida la incorporación del taller.
2. El taller queda registrado como participante.
3. El propietario registra el vehículo.
4. El taller registra un servicio asociado al vehículo.
5. El backend valida datos y busca posibles duplicados.
6. Se almacena el detalle off-chain y se genera la evidencia criptográfica.
7. La evidencia crítica se registra en Stellar/Soroban.
8. El taller recibe una referencia verificable de publicación.
9. El propietario consulta el histórico y controla los permisos.
10. Cuando cambia el propietario, el actual autoriza la transferencia de la titularidad del historial dentro de VehicleChain.
11. El nuevo propietario recibe acceso al mismo historial sin modificar los registros anteriores.

---

## 4. Alcance del MVP

### Incluido

| Historia   | Función                                            | Resultado                                                   |
| ---------- | -------------------------------------------------- | ----------------------------------------------------------- |
| `HU1JA(1)` | Validar incorporación de taller                    | Solo talleres habilitados participan                        |
| `HU6JA(2)` | Detectar duplicados                                | Se identifican posibles registros repetidos                 |
| `HU1JP(1)` | Registro Vehículo                                  | Existe una entidad vehículo a la que asociar servicios      |
| `HU2JP(2)` | Consultar Histórico                                | El propietario consulta la secuencia de servicios           |
| `HU3JP(3)` | Permisos de acceso historial                       | El propietario controla quién puede consultar               |
| `HU4JP(4)` | Transferencia de Propietario                       | Se transfiere la titularidad del historial en la plataforma |
| `HU1JT(1)` | Registro Taller                                    | Se crea la identidad operativa del taller                   |
| `HU2JT(2)` | Registro de Servicio                               | El taller registra el mantenimiento                         |
| `HU3JT(3)` | Recibir evidencia de publicación del mantenimiento | El taller recibe evidencia verificable                      |

### Fuera del MVP

- Comprador como rol independiente.
- Consulta o validación directa del RUNT.
- Traspaso jurídico de propiedad.
- Peritajes.
- Aseguradoras.
- Gobierno como participante obligatorio.
- Analítica avanzada.
- Reputación avanzada de talleres.
- Incentivos o fidelización.
- Integraciones comerciales externas.

### Justificación del recorte

El recorte concentra el producto en una sola propuesta: **continuidad e integridad del historial de mantenimiento del vehículo entre talleres y propietarios**.

No necesitamos resolver compra/venta, peritajes, seguros o integración gubernamental para demostrar el valor central. La transferencia de propietario se conserva porque permite demostrar que el historial acompaña al vehículo y no depende exclusivamente de una persona.

---

## 5. Lean Canvas

| Bloque                       | VehicleChain                                                                                                                                    |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Problema**                 | Historial de mantenimiento fragmentado entre talleres y pérdida de continuidad cuando cambia de taller o propietario.                           |
| **Segmentos**                | Propietarios de vehículos; talleres independientes; administradores de la plataforma.                                                           |
| **Propuesta de valor única** | Historial de mantenimiento estructurado, con evidencia verificable y continuidad entre propietarios.                                            |
| **Solución**                 | Registro de vehículo, talleres y servicios; consulta histórica; permisos; evidencia verificable; transferencia de titularidad del historial.    |
| **Canales**                  | Talleres participantes, plataforma web y alianzas futuras con actores del ecosistema automotor.                                                 |
| **Métricas clave**           | Vehículos registrados, talleres validados, servicios registrados, servicios con evidencia, consultas autorizadas y transferencias de historial. |
| **Ventaja diferencial**      | Evidencia compartida y verificable de registros críticos sin depender de una única base de datos como autoridad de integridad.                  |
| **Costos**                   | Desarrollo, infraestructura, base de datos, operación, recursos/transacciones de Stellar y soporte.                                             |
| **Ingresos**                 | En MVP: no definidos. Evolución posible mediante servicios para talleres o planes empresariales, sujetos a validación.                          |

---

## 6. Backlog priorizado — Kanban

**Enlace al tablero GitHub Projects:** <https://github.com/users/Lilypar59/projects/1>

| ID         | Historia                                           | Prioridad | Dependencia         |
| ---------- | -------------------------------------------------- | --------: | ------------------- |
| `HU1JA(1)` | Validar la incorporación de un taller              |        P1 | —                   |
| `HU1JT(1)` | Registro Taller                                    |        P1 | HU1JA(1)            |
| `HU1JP(1)` | Registro Vehículo                                  |        P1 | —                   |
| `HU2JT(2)` | Registro de Servicio                               |        P2 | HU1JT(1) + HU1JP(1) |
| `HU6JA(2)` | Detectar registros potencialmente duplicados       |        P2 | HU2JT(2)            |
| `HU3JT(3)` | Recibir evidencia de publicación del mantenimiento |        P2 | HU2JT(2)            |
| `HU2JP(2)` | Consultar Histórico                                |        P3 | HU2JT(2)            |
| `HU3JP(3)` | Permisos de acceso historial                       |        P3 | HU2JP(2)            |
| `HU4JP(4)` | Transferencia de Propietario                       |        P4 | HU3JP(3)            |

### Criterios de aceptación resumidos

#### `HU1JA(1) - Validar la incorporación de un taller`

- El administrador puede revisar los datos básicos del taller.
- Un taller aprobado queda habilitado para registrar servicios.
- Un taller rechazado no puede publicar servicios.
- La identidad operativa del taller queda asociada a sus registros.

#### `HU6JA(2) - Detectar registros potencialmente duplicados`

- El sistema compara vehículo, taller, fecha, kilometraje y tipo de servicio.
- Una coincidencia relevante se marca como potencial duplicado.
- El sistema no elimina automáticamente el registro sin una regla explícita.

#### `HU1JP(1) - Registro Vehículo`

- El propietario autenticado puede registrar un vehículo.
- Se genera un identificador interno único.
- El vehículo queda asociado al propietario.
- El vehículo queda disponible para registrar servicios.

#### `HU2JP(2) - Consultar Histórico`

- El propietario puede consultar los servicios registrados.
- Los servicios aparecen ordenados cronológicamente.
- Cada registro identifica el taller y la evidencia disponible.
- La consulta diferencia información disponible de ausencia de información.

#### `HU3JP(3) - Permisos de acceso historial`

- El propietario puede autorizar un actor.
- El sistema registra el permiso.
- Un actor sin autorización no puede consultar información protegida.
- Los datos personales permanecen fuera del ledger público.

#### `HU4JP(4) - Transferencia de Propietario`

- El propietario actual inicia la transferencia.
- El nuevo propietario debe ser identificado/autorizado.
- La transferencia no modifica los registros históricos.
- La nueva titularidad del historial queda registrada.
- La función no sustituye el trámite jurídico de traspaso.

#### `HU1JT(1) - Registro Taller`

- Se crea el perfil operativo del taller.
- El taller queda vinculado a su identidad/autorización.
- Solo talleres habilitados pueden registrar servicios.

#### `HU2JT(2) - Registro de Servicio`

- El taller registra vehículo, fecha, kilometraje y tipo de servicio.
- Se genera un identificador único del servicio.
- El sistema valida los datos obligatorios.
- Se genera el hash/evidencia antes de publicar el registro.

#### `HU3JT(3) - Recibir evidencia de publicación del mantenimiento`

- El servicio aceptado genera una evidencia criptográfica.
- La evidencia se registra mediante la infraestructura definida de Stellar.
- El taller recibe el identificador/referencia de la publicación.
- La referencia permite comprobar posteriormente la integridad del registro.

---

## 7. Arquitectura inicial

```text
                         ┌─────────────────────┐
                         │     Frontend Web     │
                         │ Propietario / Taller │
                         │     Administrador    │
                         └──────────┬──────────┘
                                    │ HTTPS
                                    ▼
                         ┌─────────────────────┐
                         │      Backend API     │
                         │ Autenticación/RBAC   │
                         │ Reglas de negocio    │
                         └───────┬───────┬─────┘
                                 │       │
                    off-chain    │       │  evidencia
                                 ▼       ▼
                         ┌──────────┐  ┌──────────────┐
                         │PostgreSQL│  │ Stellar /    │
                         │          │  │ Soroban      │
                         └────┬─────┘  │              │
                              │        │ hashes       │
                              │        │ servicios    │
                              ▼        │ ownership    │
                         documentos    └──────────────┘
                         y datos
                         privados
```

### Componentes

**Frontend:** interfaz para propietarios, talleres y administradores.

**Backend/API:** autenticación, autorización, validaciones, detección de duplicados, reglas de negocio y coordinación de las operaciones blockchain.

**PostgreSQL:** almacena datos detallados y privados que necesitan consulta o modificación.

**Stellar/Soroban:** registra evidencia verificable de operaciones críticas. Soroban permite contratos con estado en el ledger y reglas de autorización.

### Regla de privacidad

No se almacenan nombres, teléfonos, correos, documentos personales ni órdenes de trabajo completas en el ledger.

---

## 8. Uso de Stellar y justificación

VehicleChain no necesita blockchain para resolver simplemente el CRUD de vehículos, talleres y servicios. PostgreSQL puede realizar esas funciones de forma eficiente. El uso de Stellar se justifica en las operaciones donde necesitamos una **evidencia compartida y resistente a modificaciones posteriores**.

### Soroban — evidencia del servicio

Cuando un taller registra un servicio, el backend normaliza los datos relevantes y calcula una evidencia criptográfica. Soroban puede almacenar el identificador del vehículo, identificador del servicio, identificador del taller y el hash asociado, evitando llevar el documento completo al ledger.

### Soroban — autorización

Las operaciones críticas pueden exigir autorización del actor correspondiente. Soroban proporciona mecanismos de autorización mediante `Address` y `require_auth`, permitiendo que una función protegida requiera la autorización del propietario o participante correspondiente.

### Transferencia de propietario

En `HU4JP(4)`, el propietario actual autoriza el cambio de titularidad del historial. El contrato puede actualizar la referencia del propietario autorizado y registrar la operación, mientras PostgreSQL mantiene la información privada necesaria para la aplicación.

**Importante:** esta operación representa la transferencia de titularidad dentro de VehicleChain; no sustituye el registro jurídico de propiedad ante la autoridad de tránsito.

### Testnet

La primera implementación puede realizarse sobre **Stellar Testnet**, destinada al desarrollo y pruebas de aplicaciones y contratos sin utilizar activos reales.

### Qué NO hace Stellar

- No verifica físicamente que el taller haya realizado el servicio.
- No certifica por sí solo que el kilometraje sea verdadero.
- No sustituye RUNT.
- No realiza el trámite legal de transferencia.
- No debe almacenar datos personales innecesarios.

La propuesta blockchain es, por tanto, **integridad + trazabilidad + autorización de operaciones críticas**, no "verdad automática".

---

## 9. Decisión técnica central

> **¿Qué aporta Stellar/Soroban a VehicleChain que no obtendríamos simplemente con PostgreSQL administrado por una sola organización?**

Una capa de evidencia compartida para operaciones críticas —especialmente publicación de servicios y transferencia de titularidad del historial— en un contexto donde participan talleres independientes y el sistema necesita demostrar que determinados registros no fueron modificados silenciosamente después de su publicación.

---

## 10. Límites y evolución

### MVP

```text
Taller validado
      ↓
Vehículo registrado
      ↓
Servicio registrado
      ↓
Duplicados detectados
      ↓
Evidencia publicada
      ↓
Historial consultable
      ↓
Permisos
      ↓
Transferencia de titularidad del historial
```

### Evolución

- Interoperabilidad con RUNT.
- Participación institucional.
- Integración con organismos de tránsito.
- Identidad/verificación avanzada de talleres.
- Auditoría avanzada.
- Reputación de talleres.
- Analítica.
- APIs externas.
- Integraciones con aseguradoras, fabricantes y concesionarios.
