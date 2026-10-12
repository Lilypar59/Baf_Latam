# VehicleChain --- Documentación Semana 3 (Functional Proof)

## 1. Front construido

**Enlace al front:** <https://vehiclechain-frontend.bolt.host/>

VehicleChain es una aplicación web que permite recorrer de punta a punta
el flujo principal del MVP definido en el Product Blueprint: un
historial de mantenimiento vehicular que distintos talleres alimentan,
que un propietario controla y que un administrador supervisa validando
talleres y revisando registros potencialmente duplicados.

El front de VehicleChain está construido con **React + Vite +
TypeScript**, utilizando **Tailwind CSS** para estilos e **íconos
Lucide**. En esta etapa todos los datos son **simulados en memoria**
(`src/data/mockData.ts`): no hay backend, base de datos ni contrato
Soroban conectados. Las pantallas que muestran hashes o transacciones de
Stellar lo indican explícitamente, porque la integración real
corresponde a la siguiente etapa.

### Estructura y navegación

La aplicación arranca en una **pantalla de selección de rol**, que
reemplaza la autenticación durante la demo. Se pueden seleccionar los
roles **Propietario, Taller o Administrador**.

Al elegir un rol se abre su panel, compuesto por un layout común:

- **Barra lateral** con el menú del rol, contadores ---por ejemplo,
  talleres pendientes o posibles duplicados--- y la opción **Cambiar
  de rol**, que devuelve a la pantalla inicial sin recargar.
- **Barra superior** con buscador y usuario activo.
- **Área de contenido**, donde se renderiza la pantalla seleccionada.

La navegación se resuelve mediante estado de React (`role` y
`activePage` en `App.tsx`), no mediante rutas de URL. Cada rol cuenta
con un **dashboard** con accesos directos a sus pantallas, por lo que el
flujo puede recorrerse desde el menú o desde el dashboard.

Como los datos simulados son compartidos entre roles durante la sesión,
las acciones realizadas por un rol se reflejan en los demás. Por
ejemplo, una solicitud enviada por un taller aparece en la lista del
administrador y un servicio registrado por un taller entra al historial
del vehículo.

### Mapa de pantallas e historias

---

Rol Pantalla Historia Qué demuestra

---

Todos Selección de rol --- Acceso simulado a
los tres roles
del MVP

Propietario Dashboard --- Resumen de
vehículos y
actividad
reciente

Propietario Registrar `HU1JP(1)` Alta del vehículo
Vehículo al que se asocian
los servicios

Propietario Mis Vehículos → `HU2JP(2)` Historial
detalle cronológico de
mantenimientos
por vehículo

Propietario Permisos a `HU3JP(3)` Control de qué
Talleres taller accede a
qué vehículo

Propietario Transferencias `HU4JP(4)` Transferencia de
la titularidad
del historial

Taller Dashboard --- Estado del taller
y servicios
registrados

Taller Registrar Taller `HU1JT(1)` Solicitud de
incorporación,
queda pendiente
de validación

Taller Registrar `HU2JT(2)` Registro del
Servicio mantenimiento
sobre un vehículo
existente

Taller Publicación del `HU3JT(3)` Evidencia de
mantenimiento publicación
simulada

Administrador Dashboard --- Talleres
pendientes y
posibles
duplicados

Administrador Validar Talleres `HU1JA(1)` Aprobar o
rechazar
solicitudes de
talleres

Administrador Detectar `HU6JA(2)` Alertas de
Duplicados servicios
potencialmente
repetidos

---

Las nueve historias del MVP tienen al menos una pantalla asociada;
ninguna pantalla queda aislada del flujo.

### Rol Propietario

El **dashboard** saluda al propietario y resume sus vehículos y su
actividad reciente, con accesos a las demás pantallas.

![Dashboard del propietario](img/02-propietario-dashboard.png)

**Registrar Vehículo --- `HU1JP(1)`.** Formulario con placa, VIN, marca,
modelo, año, color, kilometraje y tipo de combustible. Todos los campos
son obligatorios. Al enviarlo, el vehículo queda asociado al propietario
y disponible para que un taller registre servicios sobre él.

![Registrar vehículo](img/03-registrar-vehiculo.png)

**Mis Vehículos e historial --- `HU2JP(2)`.** Lista los vehículos del
propietario con buscador por placa o modelo. Al seleccionar uno se abre
su ficha y el **Historial de Mantenimientos** en línea de tiempo: cada
servicio muestra fecha, taller que lo realizó, descripción, kilometraje
y estado. Esta pantalla comunica la propuesta de valor del Blueprint: un
historial **continuo y asociado al vehículo**, aunque lo alimenten
talleres distintos.

![Mis vehículos](img/04-mis-vehiculos.png)

![Historial del vehículo](img/05-historial-vehiculo.png)

**Permisos a Talleres --- `HU3JP(3)`.** Muestra los permisos activos y
revocados por vehículo y taller, y permite **otorgar** un permiso nuevo
indicando vehículo, correo del taller, alcance ---solo mantenimiento,
solo diagnóstico o acceso completo--- y fecha de expiración, o
**revocar** uno existente. Responde al criterio de aceptación de que el
propietario decide quién consulta su historial; en la arquitectura del
Blueprint estos permisos viven off-chain.

![Permisos a talleres](img/06-permisos.png)

**Transferencias --- `HU4JP(4)`.** Lista las transferencias del
historial ---completadas, pendientes y rechazadas--- con propietario
anterior, nuevo propietario, fecha y hash de evidencia, y permite
iniciar una **nueva transferencia**. La operación representa la
transferencia de la titularidad del historial dentro de VehicleChain: el
nuevo propietario recibe el mismo historial sin modificar los servicios
anteriores. No sustituye el traspaso jurídico del vehículo, que sigue
realizándose por los mecanismos oficiales.

![Transferencias](img/07-transferencias.png)

### Rol Taller

El **dashboard del taller** muestra el número de servicios registrados,
el estado del taller ---pendiente de validación--- y accesos a sus dos
acciones principales, además de los últimos servicios registrados.

![Dashboard del taller](img/08-taller-dashboard.png)

**Registrar Taller --- `HU1JT(1)`.** Formulario de solicitud de
incorporación con nombre, NIT, dirección, ciudad, correo y teléfono. Al
enviarlo, la solicitud queda en estado **Pendiente de validación** y
aparece en el panel del administrador.

![Registrar taller](img/09-registrar-taller.png)

**Registrar Servicio --- `HU2JT(2)`.** El taller indica la placa de un
vehículo ya registrado, el tipo de servicio, descripción, fecha y
kilometraje. Si la placa no corresponde a un vehículo existente, el
registro no se realiza. El servicio aceptado se agrega al historial del
vehículo, conectando esta pantalla con la consulta del propietario.

![Registrar servicio](img/10-registrar-servicio.png)

**Publicación del mantenimiento --- `HU3JT(3)`.** Tras registrar el
servicio, la interfaz muestra un estado intermedio "Publicando
evidencia..." y luego la tarjeta de **Publicación del mantenimiento**
con estado publicado, red (Stellar Testnet), identificador de
transacción y hash. La pantalla aclara que son **datos simulados** y que
la integración real con Soroban corresponde a la siguiente etapa. Su
objetivo es dejar listo el punto exacto donde el contrato devolverá la
referencia verificable al taller.

![Evidencia de publicación](img/11-evidencia-publicacion.png)

### Rol Administrador

El **dashboard del administrador** muestra dos indicadores: talleres
pendientes de validación y grupos de posibles duplicados, con accesos a
cada pantalla.

![Dashboard del administrador](img/12-admin-dashboard.png)

**Validar Talleres --- `HU1JA(1)`.** Lista las solicitudes pendientes
con nombre, NIT y ciudad, y botones **Aprobar** y **Rechazar**. Al
decidir, la solicitud pasa a la sección de revisadas con su estado. En
el contrato propio (§2), esta decisión habilitará al taller para
publicar evidencia.

![Validar talleres](img/13-validar-talleres.png)

**Detectar Duplicados --- `HU6JA(2)`.** Agrupa servicios con el mismo
vehículo, tipo y fecha registrados por talleres distintos y los presenta
como **Posible registro duplicado**, con las opciones Revisar o
Continuar. El sistema no elimina registros automáticamente, tal como
exige el criterio de aceptación. Es una regla de demostración; la
versión definitiva comparará también kilometraje y se ejecutará en el
backend.

![Detectar duplicados](img/14-detectar-duplicados.png)

### Relación con el MVP del Blueprint

El front recorre la misma secuencia definida en el Blueprint:

```text
Taller validado → Vehículo registrado → Servicio registrado → Duplicados detectados
→ Evidencia publicada → Historial consultable → Permisos → Transferencia de titularidad del historial
```

Se respetaron los límites del MVP: **no existe rol comprador**, no hay
consulta al RUNT ni traspaso jurídico y no se muestran datos personales
como parte de la evidencia en Stellar.

Lo que queda simulado ---autenticación, persistencia y publicación en
Soroban--- corresponde a las capas de backend, PostgreSQL y contrato que
se implementarán en la siguiente etapa. El front ya tiene identificados
los puntos donde se conectarán: registro de taller y vehículo,
publicación de evidencia del servicio y transferencia de la titularidad.

---

## 2. Decisión técnica

### Opción elegida: A --- Contrato propio en Soroban

VehicleChain creará su propio contrato Soroban, desplegado inicialmente
en **Stellar Testnet**. En esta semana se documenta la decisión; el
contrato se implementará en la siguiente etapa.

### Qué hará el contrato

El Blueprint define que Stellar no se usa para el CRUD de vehículos,
talleres y servicios ---eso lo resuelve PostgreSQL---, sino como **capa
de evidencia compartida para operaciones críticas**.

---

Función Qué registra o ejecuta Historia
en la red

---

Registrar taller Identificador del `HU1JA(1)`, `HU1JT(1)`
autorizado taller y su estado  
 (habilitado /  
 rechazado), firmado por
el administrador

Registrar vehículo Identificador técnico `HU1JP(1)`
del vehículo y la  
 `Address` del  
 propietario actual del  
 historial

Publicar evidencia de Identificador del `HU2JT(2)`, `HU3JT(3)`
servicio vehículo, del servicio  
 y del taller, hash del  
 registro off-chain y  
 timestamp

Consultar evidencia Lectura del hash `HU2JP(2)`
publicado para  
 comprobar que el  
 registro en PostgreSQL  
 no fue modificado

Transferir titularidad Actualización de la `HU4JP(4)`
del historial `Address` del  
 propietario y evento de
transferencia, sin  
 alterar los servicios  
 previos

---

Las operaciones protegidas usarán `Address` y `require_auth`: solo un
taller habilitado podrá publicar evidencia y solo el propietario actual
podrá transferir el historial. No se almacenarán en el ledger datos
personales, documentos ni órdenes de trabajo completas; los permisos de
consulta (`HU3JP(3)`) y la detección de duplicados (`HU6JA(2)`)
permanecerán en el backend.

### Por qué hace falta un contrato propio

La propuesta de valor del Blueprint es **integridad + trazabilidad +
autorización de operaciones críticas**. Las reglas que la sostienen son
específicas del dominio: qué talleres pueden publicar, a qué vehículo
pertenece cada evidencia, quién es el titular actual del historial y que
una transferencia nunca modifique los registros anteriores.

Ninguna herramienta genérica del ecosistema impone estas reglas por
nosotros; un contrato propio las hace verificables por cualquier
participante sin depender de la base de datos de una sola organización.

### Qué se descartó (Opción B)

- **Escribir el hash en el campo memo o en `manageData` de una
  transacción Stellar clásica:** permite anclar evidencia, pero no
  valida quién publica ni gestiona la titularidad del historial; toda
  la autorización quedaría en el backend y la cadena solo guardaría
  datos sin reglas.
- **Tokenizar el vehículo como activo/NFT:** modela propiedad
  transferible y comerciable, lo cual podría confundirse con el
  traspaso jurídico que el Blueprint excluye explícitamente del MVP.
- **Servicios externos de notarización o anclaje de hashes:** añaden
  un intermediario y no ofrecen la lógica de talleres habilitados ni
  la continuidad del historial entre propietarios.

Sí se aprovechará el ecosistema existente como **herramientas de
apoyo**, no como sustituto del contrato: Soroban SDK y Stellar CLI para
desarrollo y despliegue, Stellar Testnet y Friendbot para pruebas sin
activos reales, y Stellar Expert para que la referencia de publicación
(`HU3JT(3)`) sea verificable públicamente.

En esta entrega la decisión queda documentada pero **no implementada**:
el contrato todavía no está escrito ni desplegado en Stellar Testnet. Lo
construido en el front es la simulación de cómo se verá esa evidencia
una vez publicada, anticipando la integración real de la siguiente
etapa.

---

## 3. Participación del equipo

---

Integrante Usuario de GitHub Aporte Responsabilidad

---

Juan Carlos _(completar)_ Base del proyecto Rol Propietario
(estructura,  
 navegación,  
 selección de rol)
y las 4 pantallas
de Propietario  
 (`HU1JP–HU4JP`)

Alexis _(completar)_ Las 3 pantallas Rol Taller
de Taller:  
 registro de  
 taller, registro  
 de servicio y  
 evidencia de  
 publicación  
 (`HU1JT–HU3JT`)

Lily _(completar)_ Las pantallas de Rol Administrador
Administrador:  
 validar talleres  
 y detectar  
 duplicados  
 (`HU1JA`,  
 `HU6JA`)

---

---

## 4. Bloqueos y siguiente paso

### Estado técnico

No hubo bloqueos técnicos relevantes para la entrega del Functional
Proof. Se trabajó con **datos simulados en memoria**, sin depender
todavía del backend, PostgreSQL ni de la integración real con
Stellar/Soroban.

El contrato Soroban todavía no se encuentra implementado, dado que su
desarrollo corresponde a la siguiente etapa. El próximo paso técnico
será implementar y desplegar en **Stellar Testnet** el contrato
definido, integrar las operaciones críticas ---registro de vehículo,
registro de servicio y transferencia del historial--- con el frontend y
validar la evidencia de publicación con datos reales en lugar de
simulados.

### Flujo básico de trabajo con Git y GitHub

Debido a que el proyecto es colaborativo y no todos los integrantes
tienen experiencia previa con Git, se establece el siguiente flujo
básico para evitar pérdida de cambios o conflictos innecesarios.

#### 1. No trabajar directamente sobre `main`

Cada integrante debe trabajar en una rama propia o de funcionalidad:

```bash
git switch -c feature/nombre-de-la-funcionalidad
```

Ejemplo:

```bash
git switch -c feature/validacion-talleres
```

#### 2. Antes de comenzar a trabajar

Actualizar la información del repositorio:

```bash
git fetch origin
```

Actualizar la rama base si corresponde:

```bash
git switch main
git pull origin main
```

Después regresar a la rama de trabajo:

```bash
git switch feature/nombre-de-la-funcionalidad
```

#### 3. Revisar qué cambios tenemos

Antes de hacer commit:

```bash
git status
```

Para revisar los cambios realizados:

```bash
git diff
```

#### 4. Guardar los cambios

Agregar los archivos que realmente correspondan al trabajo realizado:

```bash
git add archivo1 archivo2
```

o, si se está seguro de que todos los cambios pertenecen al commit:

```bash
git add .
```

Luego crear el commit:

```bash
git commit -m "feat: descripcion breve del cambio"
```

Ejemplos:

```bash
git commit -m "feat: agregar validacion de talleres"
git commit -m "docs: actualizar documentacion semana 3"
```

#### 5. Publicar la rama en GitHub

```bash
git push -u origin feature/nombre-de-la-funcionalidad
```

Después de la primera publicación, normalmente bastará con:

```bash
git push
```

#### 6. Crear un Pull Request

Cuando la funcionalidad esté lista:

```text
Rama de trabajo
      ↓
Push
      ↓
GitHub
      ↓
Pull Request
      ↓
Revisión del equipo
      ↓
Merge
```

El Pull Request debe explicar brevemente:

- qué se desarrolló;
- qué archivos o módulos fueron modificados;
- cómo se puede probar;
- si queda alguna tarea pendiente.

#### 7. Antes de continuar después de un merge

Actualizar la información local:

```bash
git fetch origin
```

y obtener los últimos cambios de la rama correspondiente:

```bash
git pull
```

#### 8. Si aparecen conflictos

**No eliminar archivos ni aceptar todos los cambios automáticamente.**

Primero se debe revisar qué modificó cada integrante. En Git Extensions
se puede utilizar el comparador visual para revisar las diferencias y
resolverlas manualmente.

Después de resolver los conflictos:

```bash
git status
git add .
git commit -m "fix: resolver conflictos de merge"
```

### Reglas de colaboración

1.  **No hacer `push --force` sobre `main` ni sobre ramas de otro
    integrante**, salvo que el equipo lo acuerde explícitamente.
2.  **No hacer `git reset --hard` sin verificar antes qué cambios se
    perderán.**
3.  Hacer commits pequeños y relacionados con una sola tarea.
4.  Usar mensajes de commit descriptivos.
5.  Antes de modificar un archivo que otra persona está trabajando,
    coordinarlo con el equipo.
6.  Para cambios importantes, utilizar Pull Request y revisión antes del
    merge.
7.  Mantener `main` como rama estable y evitar desarrollar directamente
    sobre ella.
8.  Antes de comenzar una tarea, actualizar la información remota con
    `git fetch`.
9.  Revisar `git status` antes de cambiar de rama, hacer merge o
    realizar un pull.
10. Si no se entiende un conflicto o un comando puede provocar pérdida
    de información, **detenerse y consultar antes de ejecutarlo**.

Este flujo busca que el equipo pueda trabajar de forma paralela,
mantener trazabilidad de los cambios y reducir el riesgo de sobrescribir
el trabajo de otros integrantes.
