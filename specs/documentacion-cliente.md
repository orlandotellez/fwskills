# fwskills — Descripción del sistema

Este documento describe el sistema **fwskills** completo, en términos de negocio: qué
es, cómo se organiza, qué resuelve y qué entrega. Está escrito para ser leído por
alguien que no participa en la construcción técnica del producto y que necesita
formarse una idea fiable de lo que se está construyendo y de lo que implica
mantenerlo.

---

## 1. Introducción

fwskills es un **repositorio comunitario de instrucciones especializadas para
agentes de inteligencia artificial**. La unidad de contenido del proyecto se llama
*skill*: una carpeta que contiene un único archivo descriptivo con la tarea que un
agente debe seguir y con los datos que permiten publicarla, clasificarla e
instalarla. Las skills se agrupan por área en cuatro categorías iniciales —
especificaciones, diseño, control de calidad y seguridad— y el diseño admite añadir
áreas nuevas sin reorganizar lo que ya existe.

El proyecto entrega dos cosas al mismo tiempo, construidas y versionadas juntas. La
primera es un **sitio web**: una página de bienvenida, un catálogo completo de skills
con búsqueda y filtros, una ficha de detalle por skill y la documentación del
proyecto. La segunda es un **programa de línea de comandos**, distribuido como paquete
público, que instala cualquier skill del catálogo directamente en el proyecto de
quien la usa, sin copiar archivos a mano y sin instalar nada de forma permanente. La
instalación es una sola instrucción:

```
npx fwskills add <categoria>/<skill>
```

El rasgo que define el sistema es que **no hay servidor, no hay base de datos, no hay
cuentas de usuario y no hay panel de administración**. El sitio se entrega como un
conjunto de archivos terminados que se sirven tal cual. El contenido del catálogo no
se escribe en ninguna pantalla de administración: se genera al compilar el sitio
leyendo directamente las carpetas donde viven las skills, de modo que publicar una
skill nueva —o un área nueva— consiste en añadir una carpeta. Toda la información que
parece dinámica (el número de seguidores, de colaboradores, de versiones publicadas
o la fecha de última actualización) también se resuelve en el momento de compilar y
queda congelada en la página, de modo que el sitio no necesita preguntar nada a
nadie cuando alguien lo visita.

### ¿Qué resuelve?

- **Poner orden en un contenido que hoy está disperso.** Las instrucciones para
  agentes circulan hoy como archivos pegados en conversaciones, enlaces sueltos y
  carpetas sin índice. Aquí existe un catálogo único, con búsqueda y filtros, donde
  cualquier persona puede encontrar lo que ya existe.
- **Hacer que la instalación sea reproducible.** Copiar un archivo a mano produce
  proyectos que divergen: la misma skill en versiones distintas en dos máquinas. Aquí
  la instalación se hace siempre desde la versión publicada, con un comando idéntico
  en todos lados.
- **Convertir el contenido en un contrato verificable.** Cada skill declara sus datos
  en un formato estructurado y obligatorio. Eso permite validarla, indexarla y
  clasificarla automáticamente, en lugar de dejarla como texto libre.
- **Bajar el costo de publicar contenido.** Publicar una skill o abrir un área
  completa no exige tocar el sitio. Quien publica no necesita permisos especiales ni
  aprender una herramienta de administración.
- **Ofrecer una vía de entrada abierta a la comunidad.** Cualquier persona puede
  contribuir con una skill siguiendo la misma plantilla, y la validación es automática,
  de modo que el proceso no depende de un equipo central que apruebe cada aporte.
- **No pedirle nada al visitante.** No hay registro, ni formulario, ni correo
  electrónico, ni seguimiento de comportamiento, ni cookies de publicidad. Se puede
  usar todo el producto sin dejar ningún dato detrás.
- **Evitar el mantenimiento recurrente.** Sin servidor, sin base de datos y sin
  dependencias externas en el navegador, no hay procesos que upholdan alive, ni
  actualizaciones de seguridad que aplicar, ni costos que crezcan con el tráfico.

---

## 2. Visión General del Sistema

El recorrido completo del sistema, de principio a fin, tiene ocho etapas. Las tres
primeras ocurren dentro del proyecto; la cuarta ocurre en el canal de distribución; las
cuatro siguientes ocurren en la máquina de quien usa el producto.

1. **Alguien escribe una skill.** Crea una carpeta en el área que le corresponde y
   escribe dentro un único archivo con dos partes: sus datos de identificación y la
   instrucción en sí. Nada más.
2. **La skill se valida automáticamente.** Al compilar el sitio, el sistema comprueba
   que los ocho campos obligatorios estén presentes y tengan el formato correcto. Si
   algo falla, la compilación se detiene y el mensaje indica qué archivo y qué campo
   es el problema. Una skill mal formada nunca llega a publicarse.
3. **El sitio se genera.** A partir de las carpetas se construyen, sin intervención
   manual, el catálogo, la ficha de cada skill, las páginas de cada área, el índice de
   búsqueda y el mapa del sitio que usan los buscadores.
4. **La skill se distribuye.** El programa de línea de comandos se publica en el
   registro público de paquetes, junto con el contenido de las skills. A partir de ese
   momento existe una única versión oficial de cada skill.
5. **Una persona descubre la skill.** En el sitio web, desde la portada, desde el
   catálogo o desde el buscador. La ficha muestra qué hace, con qué agentes es
   compatible, quién la escribió y cómo instalarla.
6. **La persona instala la skill.** Copia un comando en su terminal. El programa
   descarga el contenido publicado, lo verifica, decide la carpeta de destino
   adecuada y escribe los archivos.
7. **El agente de IA la utiliza.** Al working en el proyecto, el agente encuentra la
   skill instalada, comprueba que es compatible con él y sigue las instrucciones que
   contiene.
8. **La comunidad mantiene y amplía el catálogo.** Se reportan problemas, se publican
   versiones nuevas de las skills existentes y se incorporan skills nuevas mediante el
   proceso de contribución y revisión.

### Roles

| Rol | ¿Qué puede hacer? |
| --- | --- |
| Visitante | Llegar al sitio sin cuenta ni registro, leer la portada, recorrer el catálogo completo, filtrar y buscar skills, abrir la ficha de cualquiera de ellas, leer la documentación, consultar la guía de instalación y decidir si el proyecto le sirve. También puede copiar un comando de instalación directamente desde cualquier página. |
| Usuario que instala skills | Todo lo que hace el visitante, y además: instalar una skill concreta o un área completa en su proyecto, listar lo que tiene disponible, buscar por texto, instalar en la carpeta de un agente concreto o en un destino que él elija, desinstalar, actualizar a la última versión publicada, consultar los datos de una skill antes de instalarla y preparar las carpetas de destino en su equipo. |
| Contribuyente | Proponer una skill nueva, proponer un área nueva, seguir el proceso de contribución paso a paso, consultar la lista de requisitos de calidad que debe cumplir una skill, abrir una solicitud de cambio con su aportación y reportar una skill que considere maliciosa o defectuosa. |
| Revisor | Revisar solicitudes de cambio antes de que se integren: comprobar que la skill cumple los requisitos de calidad, que la documentación es correcta, que los datos declarados coinciden con el contenido, que la propuesta no introduce problemas de rendimiento o accesibilidad y que el cambio respeta las convenciones acordadas. |
| Mantenedor | Publicar las versiones del programa de línea de comandos, decidir qué se integra y qué no, custodiar la convención de datos de las skills, atender los reportes de seguridad, mantener la coherencia entre el sitio, la documentación y el programa instalado, y velar por que la versión publicada del sitio y la del programa nunca se contradigan. |

Existe además un sexto actor que no es una persona: el **agente de inteligencia
artificial**, que no navega el sitio ni se registra, sino que lee la skill ya
instalada en el proyecto de quien lo utiliza y sigue sus instrucciones.

---

## 3. Cómo está organizado el sistema

La organización del sistema responde a una decisión simple: **el contenido vive en
las carpetas, y todo lo demás se deriva de ellas**.

### El sitio web es un conjunto de archivos terminados

No hay un servidor detrás del sitio. Cuando el sitio se publica, lo que existe es un
conjunto de páginas ya renderizadas, con su estilo y su contenido resueltos. Quien
visita el sitio recibe exactamente los mismos archivos que se publicaron, sin que
nadie los procese en ese momento. Eso implica tres cosas:

- No hay nada que pueda caerse en producción. No hay procesos que reiniciar, ni
  memoria que se agote, ni colas que se saturen, ni una caída de las tres de la
  mañana.
- El costo de atención al cliente no crece con el tráfico. Publicar mil visitas o un
  millón cuesta lo mismo desde el punto de vista del sistema.
- El contenido se actualiza por publicación, no en caliente. Si mañana se publica una
  skill nueva, todo el sitio se reconstruye y se vuelve a publicar de una vez.

### El contenido del sitio se genera al compilar, no se escribe a mano

El catálogo no está guardado en ninguna base de datos ni en ninguna lista del código
del sitio. Está **derivado de las carpetas donde se guardan las skills**. Durante la
compilación, el sistema lee esas carpetas, comprueba que cada una esté bien formada y
con eso produce automáticamente el catálogo, la ficha de cada skill, las páginas de
cada área, el índice que alimenta el buscador y el mapa del sitio.

La consecuencia práctica es la regla que gobierna todo el proyecto: **añadir una
skill, o un área completa de skills, es añadir una carpeta**. Nadie edita el sitio.
Quien publica contenido no necesita aprender cómo está construido el sitio, ni pedir
permisos especiales, ni coordinarse con nadie del equipo técnico. Lo único que puede
requerir un pequeño ajuste de presentación es un área muy nueva, y solo para
asignarle su icono y su descripción: es información de presentación, no de contenido.

Esa misma generación automática hace que sea imposible que el sitio y el contenido
se contradigan. La portada, el catálogo y la ficha de una skill leen la misma fuente,
de modo que una skill no puede verse de una manera en un sitio y de otra en otro.

### El programa de línea de comandos trabaja en la máquina de quien lo usa

El segundo entregable no es un servicio: es un programa. Se ejecuta en el ordenador
de la persona que lo invoca, con los permisos de esa persona, y su única salida es
escribir archivos dentro de su proyecto. No escucha en ningún puerto, no expone
interfaces de comunicación, no guarda sesión de nadie y no tiene memoria entre
ejecuciones.

No hace falta instalarlo. Se ejecuta bajo demanda desde el registro público de
paquientes, que lo descarga, lo usa y termina. El programa reconoce qué agente de
inteligencia artificial se está usando en ese proyecto, resuelve en qué carpeta
corresponde instalar la skill, descarga el contenido publicado, lo valida con las
mismas reglas que usa el sitio, avisa qué archivos va a escribir, y solo entonces
escribe. Si algo falla, no deja una instalación a medias.

### Ambos entregables se versionan juntos

El sitio y el programa viven en un mismo repositorio, con un solo historial de
versiones y una sola instalación de dependencias. Esto no es un detalle de orden
interno: evita el fallo más importante posible en un proyecto como este, que es que
la documentación anuncie una skill que el programa publicado todavía no sabe
instalar. Aquí no puede ocurrir, porque las dos cosas se publican juntas.

### Por qué esto le importa al cliente

- **No hay un servidor que mantener.** No hay infraestructura que contratar, actualizar
  ni vigilar; no hay ventanas de mantenimiento; no hay un equipo de guardia.
- **No hay costos que escalen con el tráfico.** El sitio se sirve desde un servicio de
  archivos, cuyo costo es estable independientemente de la cantidad de visitas.
- **No hay una brecha de robo de datos que cerrar.** El sistema no almacena datos de
  personas porque no tiene dónde almacenarlos: no hay cuentas, no hay formularios que
  guarden información y no hay seguimiento de comportamiento.
- **Publicar es barato y rápido.** Añadir contenido no es un proyecto: es añadir una
  carpeta y republicar el sitio.
- **Lo que no se rompe, no hay que arreglarlo.** La ausencia de componentes activos
  elimina de un plumazo toda una categoría de incidencias: las más difíciles de
  diagnosticar y las más caras de resolver.

---

## 4. Tecnologías Utilizadas

### Sitio web

| Tecnología | ¿Para qué se usa? |
| --- | --- |
| Astro 7 | Es el motor que construye el sitio. Genera páginas ya terminadas, sin servidor detrás y sin enviar programas al navegador. |
| TypeScript en modo estricto | Es el lenguaje en el que está escrito el sitio. El modo estricto hace que los errores de datos se detecten antes de publicar, en lugar de aparecer en una página visible. |
| Colecciones de contenido con validación por esquema | Es el mecanismo que lee las carpetas de skills al compilar y comprueba que cada una tenga sus ocho campos obligatorios bien escritos. |
| lucide-astro | Es el juego de iconos del sitio. Los iconos se dibujan directamente dentro de la página, así que no hay descargas adicionales al visitarla. |

### Documentación

| Tecnología | ¿Para qué se usa? |
| --- | --- |
| Astro Starlight | Aporta la estructura de la documentación multipágina: menú lateral, índice por página, navegación de página anterior y siguiente, buscador propio y cajón de navegación en móvil. |
| Puente de identidad visual | Adapta el aspecto de la documentación al del resto del sitio, de modo que la documentación no parezca un producto distinto. |

### Línea de comandos

| Tecnología | ¿Para qué se usa? |
| --- | --- |
| Node.js 22.12 o posterior | Es el entorno en el que se ejecuta el programa de instalación. Se exige una versión concreta y comprobable. |
| TypeScript en modo estricto | Comparte lenguaje y reglas de validación con el sitio. El modo estricto es aquí una barrera de seguridad, porque el programa escribe archivos en el disco de otra persona. |
| Bibliotecas propias de Node, sin dependencias de terceros | El programa no incorpora bibliotecas externas en tiempo de ejecución. Cuanto menos software arrastra, menor es la superficie de ataque y de mantenimiento. |
| Empaquetado como archivo único | El programa publicado se entrega como un solo archivo ejecutable, de modo que funcione en el equipo de quien lo usa sin herramientas de compilación instaladas. |
| Distribución por el registro público de npm | Es el canal que hace que el programa esté disponible bajo demanda, sin instalación previa. |

### Infraestructura y despliegue

| Tecnología | ¿Para qué se usa? |
| --- | --- |
| Un único repositorio con espacios de trabajo | Sitio y programa se versionan juntos, con una sola instalación de dependencias, de modo que no puedan publicarse desalineados. |
| Git | Proporciona el historial completo de cambios y es el mecanismo por el que se revisa y acepta cada contribución. |
| Alojamiento de archivos estáticos | El sitio publicado se entrega desde un servicio que solo sirve archivos. Funciona igual en los proveedores de alojamiento estático más habituales. |
| Registro público de npm | Canal de distribución del programa de línea de comandos y del contenido de las skills. |
| Verificación automática antes de publicar | Cada publicación debe pasar las comprobaciones de tipos, de validación de contenido y de calidad. Es una tarea de infraestructura pendiente: hoy la verificación depende de que alguien la ejecute. |
| Credenciales solo en el momento de compilar | El acceso a la información pública del repositorio se realiza únicamente al compilar el sitio y nunca se expone al visitante ni al programa instalado. |

---

## 5. Base de Datos

### Este sistema no tiene base de datos

Es una decisión explícita de arquitectura, no una funcionalidad pendiente. No existe
base de datos, ni esquema, ni migraciones, ni motor de persistencia, ni caché
almacenada. La razón es que el contenido del proyecto ya está guardado en archivos de
texto legibles y versionados, y una base de datos solo añadiría una segunda copia de
lo mismo, con el riesgo de que ambas dejaran de coincidir.

### Qué gana el cliente con esa decisión

- **Nada que aprovisionar ni pagar.** No hay un servicio de base de datos que
  contratar, dimensionar, actualizar ni supervisar.
- **Nada que asegurar.** No hay credenciales de base de datos, ni usuarios de
  aplicación, ni conexiones que proteger, ni superficie de robo de credenciales que
  vigilar.
- **Nada que respaldar.** No hay copias de seguridad de base de datos que programar ni
  que restaurar. El historial está en el control de versiones, que es el respaldo
  natural de un proyecto de código abierto.
- **Ninguna superficie de filtración.** El riesgo más habitual de una filtración de
  datos es que alguien reúna todos los datos personales en un solo lugar. Aquí
  no hay datos personales almacenados en ningún lugar, porque el sistema no tiene
  usuarios.
- **Ninguna migración que planear.** Cambiar la forma del contenido es cambiar una
  carpeta, no escribir un plan de migración de tablas.

### Cuál es el modelo de información real

La fuente de verdad del catálogo es **la estructura de carpetas del repositorio**:

| Concepto | Cómo se representa |
| --- | --- |
| El conjunto de skills | El conjunto de carpetas donde viven las skills |
| La identidad de una skill | Su ubicación: el área a la que pertenece y el nombre de su carpeta |
| Los atributos de una skill | Los ocho campos que declara su archivo descriptivo |
| Las áreas del catálogo | Las carpetas de primer nivel que agrupan las skills por materia |

No hay dos lugares donde resida la misma información. El sitio web y el programa de
instalación leen exactamente la misma fuente, y cada uno la valida por su cuenta con
las mismas reglas, así que ninguno de los dos puede mostrar o instalar algo distinto de
lo que el otro declara.

### Qué registra cada skill

Cada archivo descriptivo de una skill declara **exactamente ocho campos**. No hay
valores por defecto: si falta uno, la validación falla.

| Campo | Qué significa, en palabras sencillas |
| --- | --- |
| Nombre | El identificador de la skill. Es también el nombre de su carpeta y la última parte de su dirección en el sitio, así que cambiarlo cambia su ubicación para siempre. |
| Descripción | Una o dos frases que explican qué tarea resuelve la skill. Es el texto que el agente lee para decidir si le sirve, por lo que describe la tarea y no la tecnología. |
| Área | El área del catálogo a la que pertenece. Debe coincidir con la carpeta donde vive, de modo que la clasificación nunca pueda contradecir a la ubicación. |
| Versión | El número de versión de la skill, siguiendo la convención estándar de tres partes. Cada skill se versiona por separado, con independencia del programa que la instala. |
| Autoría | Quién escribió la skill. Puede ser una persona o varias, y se enlaza a su perfil público. |
| Etiquetas | Palabras clave abiertas que alimentan el filtro por etiqueta del catálogo. |
| Compatibilidad | Con qué agentes de inteligencia artificial funciona la skill. Permite saber, **antes de instalar**, si la skill resulta aplicable. |
| Destacada | Indica si la skill debe aparecer entre las destacadas de la portada. Es un interruptor simple, activo o inactivo. |

Una skill puede incluir, además del archivo descriptivo, carpetas de material de
apoyo, código auxiliar y recursos gráficos, que se publican y se instalan junto con
ella.

---

## 6. Módulos Principales del Sistema

El sistema se compone de **cuatro módulos** que trabajan juntos. Cada uno tiene una
responsabilidad única y ninguno depende de forma oculta del otro.

### Módulo 1 · El sitio web

Es la cara pública del proyecto. Su responsabilidad es permitir que cualquiera
descubra, entienda y evalúe el catálogo sin ningún tipo de registro.

Incluye la portada, que explica qué es el proyecto, muestra las áreas disponibles con
su número de skills, destaca hasta seis skills seleccionadas, explica el flujo de uso
en tres pasos, muestra las métricas de la comunidad y cierra con una llamada a la
acción. Incluye además el catálogo completo con sus filtros, las fichas de detalle de
cada skill, la guía de instalación, la página de contribución y la página de error.

Todo el sitio comparte la misma cabecera, el mismo pie y el mismo sistema visual,
definido en un único lugar. El sitio funciona en modo claro y en modo oscuro, y
respeta la preferencia del sistema del visitante cuando este no ha elegido nada.

Lo que este módulo no hace, por decisión explícita: no recibe datos, no envía
información a ningún servicio externo mientras se navega, y no carga programas
grandes en el navegador. La única excepción acotada es la sección de documentación,
que necesita un buscador y un conmutador de modo visual.

### Módulo 2 · La documentación

Su responsabilidad es explicar el proyecto con profundidad: cómo se usa el programa de
instalación comando por comando, cómo se escribe una skill, cómo se versiona, cómo se
publica y qué se espera de una contribución.

Se organiza en **diez secciones**: introducción, primeros pasos, referencia completa de
los siete comandos del programa de línea de comandos (una página por comando),
anatomía de una skill, descripción de las cuatro áreas, guía para crear una skill,
compatibilidad con agentes, versionado, preguntas frecuentes y registro de cambios.

Incluye un buscador propio que cubre simultáneamente las skills y las páginas de
documentación, navegación entre páginas consecutivas, y un enlace directo a la página
de edición de cada documento en el repositorio, para que corregir una errata sea tan
sencillo como editar un archivo.

### Módulo 3 · El catálogo de skills

Su responsabilidad es ser el inventario del proyecto, y no tiene casi ningún contenido
propio: prácticamente todo lo que muestra se deduce de las carpetas de skills.

Cuando se compila el sitio, este módulo recorre las carpetas, comprueba que cada skill
decleara correctamente sus ocho campos y produce cuatro resultados: la lista
completa con la que se construye el catálogo y sus filtros, una dirección web propia
por skill, un índice de búsqueda que cubre a la vez skills y documentación, y el mapa
de direcciones que usan los buscadores web para indexar el sitio.

El módulo mantiene además tres datos de navegación: el conteo de skills por área, la
selección de hasta seis skills destacadas para la portada, y la propuesta de skills
relacionadas en cada ficha, elegidas por área común o por etiquetas compartidas.

La regla que lo gobierna es inviolable: **publicar contenido no es un cambio de
código**. Si una incorporación de contenido requiere modificar el sitio, es que la
adición está mal planteada.

### Módulo 4 · El programa de línea de comandos

Su responsabilidad es llevar una skill desde el catálogo hasta el proyecto de quien la
usa, de forma reproducible y verificable.

Expone **siete comandos** más una variante documentada: `init` prepara las carpetas de
destino de los agentes detectados; `list` muestra lo disponible; `search` busca por
nombre, descripción y etiquetas; `add` instala una skill o un área completa;
`remove` desinstala; `update` trae las versiones publicadas de lo ya instalado; e
`info` muestra los datos de una skill y dónde se instalaría, sin instalar nada.

Además define **seis opciones de ejecución** que aplican a varios comandos a la vez:
elegir una carpeta de destino, instalar en la configuración global del agente en lugar
de la del proyecto, sobrescribir archivos existentes, mostrar el plan sin escribir
nada, responder automáticamente a todas las preguntas, y restringir la instalación a un
área completa.

Su diseño atiende a un requisito importante: **las instalaciones nunca quedan a
medias**. El contenido se prepara en un lugar provisional y solo se mueve a su destino
cuando está completo. Si algo falla, no queda nada escrito. Además, el programa
informa siempre qué archivos va a escribir, cuáles ya existen y cuáles se omiten, y
pregunta antes de sobrescribir o de desinstalar salvo que se le indique lo contrario.

Para que otras personas puedan automatizar su uso, el programa define **siete códigos
de salida** cerrados y estables, cada uno con un significado distinto y accionable:
operación completada, error inesperado, uso incorrecto, skill o área inexistente,
conflicto con archivos existentes, contenido que no cumple las reglas, fallo de red y
ausencia de un agente compatible en la máquina.

### Dos módulos que no existen, y por qué

El esquema de organización que sigue este proyecto contempla cuatro carpetas:
sitio web, lógica de servidor, base de datos e interfaz de programación. En fwskills
**dos de esas carpetas no se crean**, y su ausencia es una decisión registrada, no un
vacío pendiente:

- **No hay módulo de base de datos.** El contenido ya está versionado en archivos; una
  base de datos obligaría a inventar un modelo de datos que divergiría de la realidad
  en cuanto cambiara una skill.
- **No hay módulo de interfaz de programación.** No hay servidor, ni aplicación móvil,
  ni integraciones de terceros. El único contrato legible por máquinas del proyecto es
  la ayuda del propio programa de línea de comandos, que es el equivalente funcional de
  una interfaz de programación para una herramienta de terminal.

---

## 7. Pantallas Principales

El sistema tiene **siete pantallas**, todas estáticas y todas con la misma cabecera,
el mismo pie y el mismo sistema visual. Ninguna tiene estados de carga, porque no hay
peticiones de datos mientras se navega: todo el contenido ya está en la página.

### Área pública

| Pantalla | Para qué sirve |
| --- | --- |
| **Inicio** | Explicar en una sola pantalla qué es el proyecto y conducir a las dos acciones que importan: explorar el catálogo y contribuir. Muestra la licencia, el número de skills, el número de colaboradores, el comando de instalación listo para copiar, las áreas con su conteo, hasta seis skills destacadas, el flujo de uso en tres pasos, las métricas de la comunidad con los avatares de quienes contribuyen, cinco preguntas frecuentes y una llamada final a la acción. Si la información de la comunidad no está disponible, la sección se muestra sin esas cifras en lugar de mostrar ceros. |
| **Instalación** | Explicar sin ambigüedad cómo instalar y usar el programa, en **nueve secciones**: requisitos, uso sin instalar nada, instalación permanente, los siete comandos disponibles, dónde se instalan las skills según el agente, las opciones de ejecución, cómo verificar que todo funciona, solución de problemas frecuentes y versionado y actualización. Todos los comandos son copiables y la guía ofrece la variante equivalente para los cuatro gestores de paquetes más habituales. |
| **Página de error** | Cerrar el camino con el mismo tono del sitio. Quien llega a una dirección inexistente —incluido el nombre de una skill que no existe— recibe un mensaje claro y tres salidas en un clic: al catálogo, a la documentación y a la portada. |

### Área de catálogo

| Pantalla | Para qué sirve |
| --- | --- |
| **Catálogo** | Enumerar todas las skills del repositorio y permitir encontrarlas sin recorrerlas todas: filtrar por área, buscar por texto y filtrar por etiqueta. El filtro activo siempre queda reflejado en la dirección de la página, de modo que cualquier vista se puede compartir por mensaje o enlace. Incluye un contador de resultados que se actualiza al filtrar, y un mensaje claro con un botón para limpiar los filtros cuando no hay coincidencias. |
| **Ficha de skill** | Documentar una skill completa y permitir instalarla sin abandonar la página. Muestra los ocho campos de identificación, el contenido de la instrucción con resaltado, los archivos que la componen con enlaces al repositorio, la fecha de última actualización, un índice lateral de la página, tres skills relacionadas y el comando de instalación listo para copiar. Incluye accesos para ver el archivo original en el repositorio, proponer una edición o reportar un problema con los datos de la skill ya cargados en el reporte. |

### Área de documentación

| Pantalla | Para qué sirve |
| --- | --- |
| **Documentación** | Referencia técnica del proyecto en diez secciones, con navegación profunda. Incluye un buscador propio accesible con atajo de teclado que cubre a la vez las skills y las páginas de documentación, un índice lateral agrupado por secciones, un índice por página que resalta la sección visible, navegación entre páginas consecutivas, ejemplos copiables y un enlace para editar cada página directamente en el repositorio. La sección de referencia de los comandos contiene una página independiente por cada uno de los siete. |

### Área de contribución

| Pantalla | Para qué sirve |
| --- | --- |
| **Contribuir** | Convertir la intención de contribuir en una primera aportación sin ninguna duda. Se organiza en **ocho bloques**: una introducción con accesos al repositorio, una línea de tiempo vertical de seis pasos que lleva desde crear la carpeta hasta la integración del cambio, una lista de seis requisitos de calidad comprobables, el proceso para proponer un área nueva, la descripción de los tres roles de la comunidad con sus responsabilidades, el bloque de seguridad con la forma de reportar una skill maliciosa y la política de código ejecutable, los enlaces a los documentos de contribución y a las plantillas, y una llamada final a la acción. La lista de requisitos se muestra deliberadamente como texto de referencia y no como casillas marcables: sin servidor, una casilla marcada se perdería al recargar. |

---

## 8. Autenticación y Seguridad

### No hay cuentas, ni registro, ni acceso

**El sistema no tiene autenticación de ningún tipo.** No existe el concepto de usuario
registrado, ni inicio de sesión, ni sesión, ni recuperación de contraseña, ni perfil, ni
nivel de permiso dentro del sitio. Nadie puede iniciar sesión porque no hay a quién
iniciarle sesión. El programa de línea de comandos tampoco pide credenciales: no
acepta contraseñas ni claves de acceso, y no lee ningún archivo de configuración
secreta del equipo donde se ejecuta.

La razón es directa: no hay ningún dato personal que proteger y no hay ninguna
acción restringida que lo justifique. Cualquier persona puede ver todo el contenido del
sitio, y cualquier persona puede instalar cualquier skill, siempre que la use bajo su
propia responsabilidad.

Lo que sí hay, y conviene no confundir con un inicio de sesión, es el control de
permisos del sistema operativo. Si alguien ejecuta el programa en un equipo, el
programa tiene exactamente los mismos permisos que esa persona y no pide permisos
administrativos adicionales. Los permisos los concede el sistema operativo, no esta
herramienta.

### Lo que sí existe: medidas de protección reales

#### Accesibilidad y navegación por teclado

El sitio está diseñado para que **toda su funcionalidad se pueda alcanzar y usar sin
ratón**. El objetivo declarado es conformidad con el estándar de accesibilidad para
sitios web, nivel AA, en todas las páginas, incluidas las de documentación.

| Medida | Detalle |
| --- | --- |
| Navegación completa por teclado | Menú principal, menú móvil, buscador, acordeones, filtros y pestañas son operables sin ratón. |
| Foco siempre visible | El indicador de dónde está el cursor de teclado se mantiene siempre visible y con contraste suficiente. No se elimina nunca sin sustituirlo por otro indicador. |
| Orden de tabulación lógico | El recorrido con la tecla de tabulación sigue el mismo orden en que la información aparece en pantalla. |
| Foco atrapado en los paneles | El buscador y el menú móvil retienen el foco mientras están abiertos y lo devuelven al elemento que los abrió al cerrarse. |
| Enlace de salto | Existe un acceso directo al contenido principal, para no recorrer toda la navegación en cada visita. |
| Estructura clara | Una sola región principal y un solo título principal por página, con la jerarquía de títulos sin saltos. |
| Formularios etiquetados | Todo campo de búsqueda o filtro tiene su etiqueta asociada, y los mensajes dinámicos se anuncian a los lectores de pantalla. |
| Áreas táctiles amplias | Los botones, pestañas y filtros tienen un tamaño mínimo de 44 por 44 píxeles, por encima del tamaño mínimo recomendado para dedo. |
| Zoom sin roturas | El contenido se puede usar al 200 % de ampliación sin desplazamiento horizontal. |
| Respeto por la preferencia de movimiento | Si la persona que visita el sistema tiene activada la preferencia de reducir el movimiento en su dispositivo, se desactiva toda animación y todo desplazamiento suave del sitio. |

#### Contraste de color

Los colores se han calculado, no estimado a ojo. **El texto normal exige una relación
mínima de 4,5 a 1** frente a su fondo; **el texto grande, de 3 a 1**; y **el indicador
de foco de teclado, de 3 a 1**. La escala de textos del sitio se diseñó partiendo del
tono más débil y se verificó en las dos condiciones más desfavorables: el mínimo
alcanzado es de 4,72 a 1, por encima del estándar. Por debajo de 13 píxeles de tamaño
no se usa el tono de texto más débil, porque a ese tamaño deja de ser cómodo de leer.
Los colores están definidos una sola vez por cada modo, de modo que un cambio de
identidad visual se hace en un único lugar y no puede desincronizarse entre páginas.

#### Política de seguridad para las skills contribuidas

El sistema acepta contribuciones de cualquiera, y por eso define por escrito qué es una
skill aceptable. Los **seis requisitos de calidad** que toda skill debe cumplir antes de
integrarse son:

- Una descripción clara de la tarea que resuelve.
- Casos de uso concretos, no abstractos.
- Ejemplos que alguien pueda ejecutar y verificar.
- Ningún secreto ni dato personal.
- Una licencia compatible con la del proyecto.
- Haber sido probada con al menos un agente compatible.

A esto se añade una barrera automática: si la skill no declara correctamente sus ocho
campos, **la compilación del sitio se detiene** y la skill no llega a publicarse. Nadie
tiene que detectar el problema a ojo, y no existe la posibilidad de publicar una ficha
con datos falsos o incompletos.

#### Proceso de revisión antes de aceptar una aportación

Publicar una skill es un cambio en el repositorio, y ese cambio se somete a revisión
como cualquier otro. El proceso publicado tiene seis pasos: obtener una copia del
repositorio, crear la carpeta en el área correcta, escribir el archivo descriptivo con
sus datos, validarlo en el equipo propio antes de proponerlo, abrir la solicitud de
cambio siguiendo la plantilla, y esperar la revisión y la integración.

La revisión cubre cinco aspectos: que el cambio esté **correcto** y pase todas las
comprobaciones automáticas; que respete la **arquitectura** acordada, incluida la regla
de que publicar contenido no toca el código del sitio; que los **datos de la skill**
sean correctos y coincidan con su contenido; que no introduzca **problemas de
rendimiento o accesibilidad**; y que siga las **convenciones** acordadas, como el
formato de los mensajes de cambio y el tamaño razonable de cada revisión. Toda
aportación necesita al menos una aprobación antes de integrarse. Cualquier cambio que
altere la estructura del proyecto debe ir acompañado de una decisión de arquitectura
escrita, con su contexto, las alternativas descartadas y sus consecuencias.

#### Política sobre código ejecutable dentro de las skills

Esta es la medida más específica, porque es el punto donde el riesgo no está en la
herramienta sino en lo que la persona ejecuta después. Una skill puede incluir código
auxiliar, y eso es legítimo. Pero el sistema lo somete a reglas estrictas:

| Regla | Detalle |
| --- | --- |
| El código auxiliar se permite | Es una capacidad legítima de una skill, y el caso de uso obvio es un script de validación. |
| Debe declararse | Todo script que se distribuya con una skill tiene que estar declarado en los datos de la skill, y el programa de instalación lo muestra al instalarla. |
| Lo no declarado no se instala | Los archivos ejecutables que no estén declarados se omiten y se avisa. |
| Revisión obligatoria | Todo script exige revisión específica antes de integrarse. No es una revisión condicional: es un punto bloqueante. |
| La revisión cubre el comportamiento observable | Qué lee, qué escribe, a qué red accede, qué ejecuta. No basta con que el código "parezca correcto". |
| Prohibido exponer secretos | Se rechaza todo script que imprima las variables de entorno del equipo o que lea archivos de credenciales del usuario. |
| Prohibida la instalación remota | Se rechaza todo script que ejecute una descarga directa a un intérprete. |
| Las skills de seguridad no ejecutan nada | Una skill cuyo propósito es auditar no puede incluir código que se ejecute por su cuenta. |

Y una aclaración que el sistema repite de forma explícita: **el programa de instalación
copia los scripts, no los ejecuta**. El punto de control no es la instalación, es la
revisión previa. Por eso el programa avisa siempre, durante la instalación, si la skill
que se está instalando incluye algo ejecutable: una herramienta que instala algo
silenciosamente ejecutable detrás de un mensaje de éxito está ocultando información
relevante.

#### Otras medidas de protección

- **El sitio no transmite datos a terceros.** No hay analítica, ni píxeles de
  seguimiento, ni fuentes tipográficas externas, ni programas incrustados de terceros.
  Quien visita el sitio no es perfilado por nadie.
- **El sitio declara una política de seguridad restrictiva** que no permite ejecutar
  programas incrustados en la página, y todos los enlaces que apuntan fuera del sitio
  se abren con protección contra el acceso a la ventana de origen.
- **El programa nunca pide un token de acceso.** No existe ninguna opción para
  proporcionar credenciales, precisamente porque no necesita ninguna. Una opción de
  ese tipo en una herramienta que no lo requiere sería un objetivo de robo.
- **El programa no escribe fuera del proyecto.** Todas las rutas se comprueban antes de
  escribir, incluidos los enlaces simbólicos, de modo que ningún contenido descargado
  puede hacer que se escriba fuera de la carpeta de destino.
- **El programa no sobrescribe ni borra nada sin preguntar.** Informa de los archivos
  existentes, avisa de los que difieren, y al desinstalar conserva los archivos que él
  no instaló, aunque se lo pidan.

---

## 9. Servicios Externos

El sistema se apoya en **dos servicios externos, y en ninguno más**. No hay pasarela
de pago, ni herramienta de analítica, ni gestor de relaciones con clientes, ni
proveedor de identidad, ni ningún servicio de terceros en el navegador.

| Servicio | Qué es | Para qué se usa | Cuándo se usa |
| --- | --- | --- | --- |
| **Registro público de npm** | El almacén público donde se publican paquetes de software. | Es la fuente de las skills. El programa de línea de comandos lo consulta para resolver una referencia, obtener la versión publicada de una skill y descargar los archivos que la componen. | **En el momento de la instalación**, en el equipo de quien instala, y solo mientras dura esa operación. |
| **GitHub** | El servicio donde vive el repositorio del proyecto. | Aporta la información pública que el sitio muestra: el número de seguidores, el número de personas que han contribuido, sus avatares, el historial de versiones publicadas y la fecha de última actualización de cada skill. | **Únicamente al compilar el sitio.** Nunca cuando alguien navega, nunca cuando alguien instala. |

La diferencia entre el momento en que se usa cada uno no es un detalle: es una regla de
diseño. **Un servicio usado durante la compilación puede necesitar credenciales; uno
usado en tiempo de ejecución, no.** Por eso el acceso a la información del repositorio
tiene una credencial opcional que existe solo en el servidor de publicación y nunca
llega al navegador ni al programa instalado, mientras que el acceso al almacén de
paquetes no usa ninguna credencial en absoluto.

Hay tres comportamientos deliberados que conviene conocer:

- **La publicación de una versión no se rompe si GitHub no responde.** Se usa el último
  valor conocido; si tampoco existe, la cifra simplemente se omite de la página. Nunca
  se muestra un cero, porque un cero afirma algo falso: que se consultó y no hay
  nada. En ausencia de dato, la sección se muestra sin esa cifra.
- **Una instalación que falla no deja nada a medias.** Si la descarga falla, no se
  escribe ningún archivo y se informa el motivo. Una skill a medio instalar en la
  carpeta del agente es peor que no tenerla, porque el agente puede leerla sin sus
  archivos de apoyo y fallar de una forma difícil de diagnosticar.
- **El navegador solo habla con el sitio.** Y el programa instalado solo habla con el
  almacén de paquetes. Ninguna otra dependencia de red existe en ninguno de los dos
  recorridos.

---

## 10. Flujos Principales del Sistema

### Flujo 1 · Descubrir una skill en el sitio

1. La persona llega a la portada, por un enlace compartido, por un buscador web o
   por la página de una de las áreas.
2. En la portada ve de un vistazo qué es el proyecto, cuántas skills hay, qué áreas
   existen y cuáles son las destacadas.
3. Entra al catálogo y acota la búsqueda: elige un área, escribe una palabra o
   selecciona una etiqueta.
4. La vista filtrada queda registrada en la dirección de la página, de modo que puede
   copiarla y compartirla tal cual.
5. Abre la ficha de la skill que le interesa.
6. En la ficha lee qué tarea resuelve, con qué agentes es compatible, quién la escribió,
   en qué versión está, qué archivos la componen y cuándo se actualizó por última vez.
7. Si la skill no es la que buscaba, la ficha le ofrece tres skills relacionadas por
   área común o por etiquetas compartidas.
8. Si quiere profundizar, sigue los enlaces hacia la referencia de la skill, la guía de
   compatibilidad o la guía de cómo escribir una skill.

### Flujo 2 · Instalar una skill

1. La persona copia el comando de instalación desde la ficha, desde la portada o desde
   la guía de instalación. El comando tiene la forma `npx fwskills add <categoria>/<skill>`.
2. Lo ejecuta en la terminal de su proyecto. No necesita instalar nada: el programa se
   descarga, se ejecuta y termina.
3. El programa reconoce qué agente de inteligencia artificial se está usando en ese
   proyecto y determina la carpeta de destino. Si no reconoce ninguno, lo dice de forma
   explícita y ofrece la solución: preparar las carpetas o indicar un destino.
4. Consulta el almacén público, resuelve la referencia y obtiene la versión publicada
   de esa skill.
5. Valida el contenido descargado contra las mismas reglas que usa el sitio, con los
   ocho campos obligatorios. Si algo no cumple, se detiene y nombra el campo
   problemático, sin escribir nada.
6. Muestra el plan: qué archivos se van a crear, cuáles ya existen con el mismo
   contenido, cuáles difieren y en qué carpeta se instalará todo.
7. Si hay archivos que difieren, pregunta antes de sobrescribirlos, salvo que se le
   haya indicado que no pregunte.
8. Escribe los archivos. La instalación se prepara aparte y solo se mueve a su destino
   cuando está completa, de modo que no quedan instalaciones a medias.
9. Informa el resultado y, si la skill incluye scripts ejecutables, lo dice de forma
   visible para que la persona pueda revisarlos antes de usarlos.

Para instalar un área completa, la persona indica el área en lugar de una skill
concreta y obtiene todas las skills de esa área en orden alfabético, o ninguna: si
alguna falla, no se instala ninguna y se informa del motivo.

### Flujo 3 · Usar la skill con un agente

1. La persona trabaja en su proyecto con su agente de inteligencia artificial.
2. El agente detecta la skill instalada en la carpeta del agente, porque la instalación
   mantiene la misma estructura de áreas y nombres que usa el catálogo.
3. El agente lee los datos de la skill y comprueba la declaración de compatibilidad. Si
   el agente no figura entre los compatibles, la descarta sin más.
4. El agente lee la instrucción y la aplica a la tarea que le han pedido.
5. Si la skill incluye material de apoyo, el agente lo consulta según lo que la propia
   instrucción indique.
6. Cuando la skill se actualiza en el catálogo, la persona trae la versión nueva con el
   comando de actualización, que compara las versiones instaladas con las publicadas y
   solo sustituye lo que corresponde.

### Flujo 4 · Contribuir una skill nueva

1. Una persona decide compartir su trabajo y llega a la página de contribuir, que no
   requiere cuenta ni registro.
2. Lee la línea de tiempo de seis pasos y la lista de requisitos de calidad.
3. Obtiene una copia del repositorio y crea una carpeta dentro del área que le
   corresponde. Si propone un área completamente nueva, abre primero una consulta
   explicando qué área es y qué resuelve.
4. Escribe el archivo descriptivo de la skill con sus ocho campos y la instrucción
   completa.
5. **Valida en su propio equipo antes de proponer nada.** El sistema pone a su
   disposición la misma comprobación que usa la compilación del sitio, de modo que
   descubre aquí los problemas que si no descubriría en la revisión.
6. Abre la solicitud de cambio siguiendo la plantilla, que incluye la lista de
   requisitos de calidad.
7. Una persona revisora comprueba la corrección, el respeto de la arquitectura, la
   exactitud de los datos, la ausencia de problemas de rendimiento o accesibilidad y el
   cumplimiento de las convenciones. Si la skill incluye scripts, su revisión es
   obligatoria y específica.
8. Con al menos una aprobación, la aportación se integra, el sitio se recompila, la
   validación se ejecuta de nuevo y la skill aparece en el catálogo con su ficha, su
   entrada en el buscador y su dirección web, sin que nadie haya escrito código.
9. Si en cualquier momento la skill resulta defectuosa o perjudicial, cualquiera puede
   reportarla desde la propia página de contribución y existe un canal específico para
   los reportes de seguridad.

### Flujo 5 · Publicar una versión

1. La publicación se prepara: la versión a publicar es una de dos, una versión del
   programa de línea de comandos o una publicación del sitio.
2. Se ejecutan, en orden, las comprobaciones automáticas: verificación de tipos,
   validación de todos los archivos de skill del repositorio, análisis de estilo,
   comprobación de formato, pruebas automáticas y una prueba que ejecuta el programa
   compilado como lo ejecutaría una persona.
3. Para el programa, se comprueba el contenido exacto del paquete antes de publicarlo
   y se verifica que funcione desde una instalación limpia, sin herramientas de
   compilación en el equipo y con la caché de descargas vacía, que es la única forma de
   detectar un paquete publicado que no se puede ejecutar.
4. Se publica el programa en el registro público, con un token de publicación de
   alcance mínimo, con verificación en dos pasos activa y sin que ese token figure en
   ningún archivo del repositorio.
5. Se comprueba la experiencia real de uso: el programa se descarga, muestra los siete
   comandos y funciona, y la instalación de una skill se resuelve y se planifica
   correctamente.
6. Se etiqueta la versión en el repositorio y se publica la entrada correspondiente en
   el registro de cambios de la documentación, con los comandos nuevos, las opciones
   nuevas y cualquier cambio incompatible.
7. Se recompila y publica el sitio, que anuncia la versión nueva del programa y refleja
   las skills nuevas o actualizadas.
8. Si la superficie pública del programa cambió, se actualizan a la vez la ayuda del
   programa, la referencia del sitio y el manual del paquete, porque las tres son la
   misma lista en tres lugares y una discrepancia entre ellas es un defecto.

---

## 11. Casos de Uso por Tipo de Usuario

### Visitante sin cuenta

- Llega al sitio desde un enlace, un buscador o un mensaje compartido, sin registrarse
  y sin dejar ningún dato.
- Lee la portada y entiende en menos de diez segundos de lectura qué es el proyecto y si
  le sirve.
- Recorre el catálogo completo y lo acota por área, por palabra o por etiqueta.
- Abre la ficha de cualquier skill y lee su descripción, su compatibilidad, su autoría,
  su versión y su fecha de actualización.
- Copia el comando de instalación directamente desde cualquier página, sin registrarse.
- Consulta la guía de instalación completa, con la variante del comando para su gestor
  de paquetes.
- Lee la documentación técnica, incluido el buscador.
- Consulta la página de contribución para entender el proyecto y, si quiere, participar.
- Cambia entre modo claro y modo oscuro, o deja que el sistema decida.
- Usa todo el sitio con el teclado, sin necesidad de ratón.
- Si llega a una dirección inexistente, recibe un mensaje claro y tres salidas a un
  clic.

### Usuario que instala skills

- Todo lo que puede hacer un visitante, y además:
- Prepara las carpetas de destino de los agentes que tiene instalados.
- Instala una skill concreta indicándola por su área y su nombre.
- Instala un área completa de skills de una sola vez.
- Lista todo lo disponible, o limitado a un área, para decidir qué instalar.
- Busca skills por texto sin conocer de antemano su nombre.
- Consulta los datos completos de una skill, incluido dónde se instalaría y si ya está
  instalada, sin instalar nada.
- Elige en qué carpeta se instala: la del agente en el proyecto, su configuración
  global, o una ruta que él indique.
- Simula la instalación para ver exactamente qué se escribiría, sin escribir nada.
- Desinstala una skill cuando ya no la necesita.
- Actualiza las skills instaladas a la versión publicada.
- Automatiza su uso en scripts, porque el programa devuelve códigos de salida estables
  y distinguibles según la causa del fallo.

### Contribuyente

- Publica una skill nueva en un área existente sin ningún permiso especial y sin tocar
  el código del sitio.
- Propone un área nueva, explicando qué resuelve y acompañando la propuesta con
  ejemplos.
- Sigue un proceso documentado paso a paso, con enlaces a las plantillas y a los
  documentos de referencia.
- Usa la misma comprobación de validación que el sitio para detectar los errores en su
  propio equipo, antes de proponer el cambio.
- Consulta la lista de requisitos de calidad y de política de código ejecutable antes de
  enviar su aportación.
- Reporta una skill defectuosa o perjudicial por un canal específico.
- Es acreditado como autor de la skill, con enlace a su perfil público.

### Revisor

- Recibe solicitudes de cambio y las revisa antes de que se integren.
- Comprueba la corrección del cambio y que las comprobaciones automáticas pasan.
- Comprueba que la aportación respeta la arquitectura y, en particular, que publicar
  contenido no ha exigido tocar el código del sitio.
- Comprueba que los datos declarados por la skill coinciden con su contenido y con la
  carpeta donde vive.
- Comprueba que la aportación no introduce problemas de rendimiento ni de
  accesibilidad.
- Revisa de forma obligatoria y específica cualquier código ejecutable incluido en una
  skill, examinando qué lee, qué escribe, a qué red accede y qué ejecuta.
- Exige que las decisiones que alteran la estructura del proyecto queden escritas con su
  contexto y sus alternativas.
- Aprobar o rechazar, y en el segundo caso, explicar qué debe corregirse.

### Mantenedor

- Publica las versiones del programa de línea de comandos y del sitio, con la lista de
  comprobaciones previa completa.
- Publica versiones nuevas de skills y las skills nuevas que hayan pasado la revisión.
- Custodia la convención de datos de las skills y la definición de las áreas.
- Atiende los reportes de seguridad y decide qué se retira del catálogo.
- Mantiene la coherencia entre la ayuda del programa, la referencia del sitio y el
  manual del paquete, que enumeran la misma lista.
- Custodia la publicación y decide cuándo se publica, con qué versión y con qué nota en
  el registro de cambios.
- Custodia la identidad visual del sitio, que se define en un único lugar y se aplica a
  todas las páginas por igual.

---

## 12. Resumen General del Sistema

| Aspecto | Detalle |
| --- | --- |
| Módulos | **4**: sitio web, documentación, catálogo de skills y programa de línea de comandos. De las cuatro carpetas que contempla el esquema de organización de este proyecto, dos existen con código (sitio y lógica del programa) y dos no se crean de forma deliberada: base de datos e interfaz de programación. |
| Pantallas | **7**: Inicio, Catálogo, Ficha de skill, Instalación, Documentación, Contribuir y Página de error. |
| Comandos del programa de línea de comandos | **7** (`init`, `list`, `search`, `add`, `remove`, `update`, `info`), más **1 variante documentada** que instala un área completa. Con **6 opciones de ejecución** y **7 códigos de salida** estables. |
| Áreas iniciales del catálogo | **4**: especificaciones, diseño, control de calidad y seguridad. El diseño admite añadir áreas nuevas sin reorganizar el contenido existente. |
| Secciones de la documentación | **10**: introducción, primeros pasos, referencia de los comandos (una página por comando), anatomía de una skill, áreas, creación de una skill, compatibilidad, versionado, preguntas frecuentes y registro de cambios. |
| Roles de persona | **5**: visitante, usuario que instala skills, contribuyente, revisor y mantenedor. Existe además un actor no humano, el agente de inteligencia artificial, que consume la skill instalada. |
| Elementos visuales compartidos | **8** componentes globales (cabecera, bloque de código, pestañas de gestor de paquetes, tarjeta de skill, etiquetas, ruta de navegación, acordeón y pie), definidos en un único lugar y usados por todas las páginas. |
| Campos que declara cada skill | **8** campos obligatorios, validados automáticamente. Si falta alguno o tiene un formato incorrecto, la skill no se publica. |
| Servicios externos | **2**: el registro público de paquetes, usado en el momento de instalar, y el repositorio del proyecto, usado solo al compilar el sitio. |
| Licencia | **MIT**, tanto para el sitio como para el programa de línea de comandos. |
| Tecnologías clave | **Astro 7** para el sitio, **TypeScript en modo estricto** en todo el código, **Starlight** para la documentación, **Node.js 22.12 o posterior** para el programa de línea de comandos, **lucide** para los iconos, **npm** para la gestión de dependencias y la distribución. |
| Alojamiento | Archivos estáticos. Sin servidor de aplicación, sin procesos que puedan caerse y sin costos que crezcan con el tráfico. |
| Base de datos | **No.** No hay persistencia; el modelo de información es la estructura de carpetas del repositorio y el contenido de cada archivo de skill. |
| Cuentas de usuario | **No.** No hay registro, ni inicio de sesión, ni sesiones, ni roles de acceso dentro del sistema. |
| Objetivos de calidad | Puntuación mínima de 95 sobre 100 en las cuatro áreas evaluadas por la auditoría automática de calidad web, en el sitio publicado; conformidad con el estándar de accesibilidad nivel AA; disponibilidad igual o superior al 99,9 %, heredada del servicio de alojamiento. |
| Privacidad | Sin seguimiento de comportamiento, sin telemetría, sin cookies de publicidad y sin recursos de terceros que se carguen desde el exterior. El único recurso externo en tiempo de ejecución es el índice de búsqueda, servido por el propio sitio. |
| Estado de la verificación | La verificación de tipos y la validación de contenido están definidas y son obligatorias antes de publicar. La automatización continua de las comprobaciones, el análisis de estilo y las pruebas automáticas del sitio son tareas de infraestructura pendientes. |
