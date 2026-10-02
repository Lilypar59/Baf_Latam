# Historias de usuario individuales

**Nombre:** Juan Carlos

**Usuario de GitHub:** @Ledger146

---

## Mis historias de usuario

1. Como comprador de un vehículo usado, quiero verificar que el historial de mantenimiento no ha sido alterado después de haberse registrado, para tomar una decisión de compra informada sin depender únicamente de la palabra del vendedor.
2. Como propietario de un vehículo, quiero que el detalle específico de cada mantenimiento registrado (qué se hizo, qué piezas o componentes se intervinieron, y el resultado) sea consultable por cualquier taller nuevo, para evitar disputas sobre si un mantenimiento preventivo o correctivo fue realizado completamente, o que me cobren de nuevo por un servicio que ya se hizo.
3. Como propietario de un vehículo, quiero decidir qué talleres o compradores pueden consultar mi historial de mantenimiento, para mantener el control sobre mi información sin exponerla a cualquiera.
4. Como taller mecánico, quiero consultar el historial de mantenimientos previos de un vehículo antes de intervenirlo, para no repetir un servicio ya realizado ni asumir responsabilidad por un trabajo que hizo otro taller.
5. Como propietario de un vehículo, quiero que mi historial de mantenimiento siga disponible aunque cambie de taller o pierda mis facturas físicas, para no depender de documentos que se puedan extraviar o deteriorar con el tiempo.

## La más importante y por qué

| Orden de importancia | Historia # | Por qué |
| :---: | :---: | --- |
| 1 (la más importante) | 1 | Es el caso de uso principal que marca el Problem Brief como MVP ("comprar un vehículo usado y verificar su historial"). Sin esto, el producto no tiene razón de ser. |
| 2 | 2 | Ataca directamente las fricciones del brief con un ejemplo concreto y real (disputa sobre si un servicio se hizo completo), y muestra por qué el registro necesita ser detallado, no solo "existir". |
| 3 | 4 | Es la otra cara de la historia 2: sin que el taller pueda consultar lo que ya se hizo, no puede evitar repetir trabajo ni deslindar responsabilidad. Las dos juntas muestran la tensión entre partes que no confían entre sí. |
| 4 | 3 | Es una condición de diseño no negociable (privacidad del propietario), pero depende de que ya exista algo que proteger (historias 1, 2 y 4). |
| 5 (la menos importante) | 5 | Es un buen beneficio adicional para el propietario, pero es una consecuencia de que el historial ya exista y esté registrado; no resuelve por sí sola ningún conflicto central. |
