# Historias de usuario — VehicleChain

**Autor:** Alexis Suárez

Formato: _Como {rol}, quiero {acción} para {beneficio}._

- **Rol:** quién necesita algo.
- **Acción:** lo que esa persona quiere poder hacer, concreta y verificable.
- **Beneficio:** para qué; conecta con la propuesta de valor y explica por qué esa acción le importa a esa persona.

---

## Propietario

- **HU1.** Como propietario de un vehículo, quiero consultar en un solo lugar todos los mantenimientos registrados por los distintos talleres, con fecha, kilometraje y tipo de servicio, para tener mi historial completo sin depender de facturas y documentos dispersos.
- **HU2.** Como propietario de un vehículo, quiero dar y quitar a un taller o a un posible comprador el permiso para ver el historial de mi vehículo, para decidir quién ve la información de mi vehículo y proteger mis datos personales.
- **HU3.** Como propietario de un vehículo, quiero compartir el historial verificable de mi vehículo con un comprador cuando lo vaya a vender, para demostrar que el vehículo recibió buen mantenimiento y negociar con confianza.

## Taller

- **HU4.** Como taller participante, quiero registrar cada servicio que hago, con identificador del vehículo, fecha, kilometraje, tipo de servicio y el hash de la orden de trabajo, para dejar evidencia permanente del trabajo que hice y que quede a nombre de mi taller.
- **HU5.** Como taller participante, quiero consultar el historial de un vehículo que llega por primera vez, si el propietario me dio permiso, para saber qué servicios se le hicieron antes y cuándo, y así diagnosticar y recomendar mejor.

## Comprador / nuevo propietario

- **HU6.** Como comprador de un vehículo usado, quiero ver el historial de mantenimiento en orden cronológico, con el taller que hizo cada registro, para revisar si el kilometraje es coherente y detectar inconsistencias antes de comprar.
- **HU7.** Como comprador de un vehículo usado, quiero comprobar que ningún registro del historial fue modificado después de publicarse, para confiar en la información y no depender solo de lo que me diga el vendedor o de peritajes costosos.
