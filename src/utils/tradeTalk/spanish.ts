import type { TradeTalkEntry } from "./dictionary";

type SpanishEntry = Pick<TradeTalkEntry, "definition" | "fieldUse"> & Partial<Pick<TradeTalkEntry, "term" | "officialName" | "region" | "safetyNote">>;

// Presentation only: IDs, English aliases, favorites, and saved history stay canonical.
// Slang and brand names are intentionally not given invented regional equivalents.
export const TRADE_TALK_ES: Record<string, SpanishEntry> = {
  ampacity: {
    term: "Ampacidad",
    definition: "La corriente máxima que un conductor puede transportar continuamente, bajo sus condiciones de uso, sin superar su temperatura nominal.",
    fieldUse: "Se usa al revisar el calibre, la temperatura del aislamiento, las terminales, el calor ambiental y la agrupación de conductores.",
  },
  awg: {
    term: "AWG",
    definition: "Sistema norteamericano para indicar el calibre de muchos conductores eléctricos. En el rango habitual, un número de calibre menor indica un conductor más grande.",
    fieldUse: "Un rollo marcado 12 AWG suele llamarse cable número doce.",
  },
  bonding: {
    term: "Unión equipotencial",
    definition: "Conectar partes conductoras entre sí para mantenerlas a un potencial eléctrico prácticamente igual y proporcionar una trayectoria eficaz para la corriente de falla.",
    fieldUse: "Se menciona al trabajar con cajas metálicas, canalizaciones, envolventes y conexiones de puesta a tierra.",
  },
  "branch-circuit": {
    term: "Circuito derivado",
    definition: "Los conductores entre el último dispositivo de protección contra sobrecorriente y las salidas o equipos alimentados por ese circuito.",
    fieldUse: "Los circuitos de iluminación, receptáculos y equipos que salen de un tablero son ejemplos comunes.",
  },
  current: {
    term: "Corriente",
    definition: "La cantidad de carga eléctrica que fluye por unidad de tiempo, medida en amperios.",
    fieldUse: "Es el valor A que se mide con un amperímetro o una pinza amperimétrica y se utiliza en cálculos de cargas y conductores.",
  },
  voltage: {
    term: "Voltaje",
    definition: "La diferencia de potencial eléctrico entre dos puntos, medida en voltios.",
    fieldUse: "Identifica siempre los dos puntos que se comparan; por ejemplo, línea a neutro o línea a línea.",
  },
  resistance: {
    term: "Resistencia",
    definition: "Oposición al paso de la corriente eléctrica, medida en ohmios.",
    fieldUse: "Se utiliza al probar conductores, cargas, elementos calefactores y conexiones no deseadas.",
  },
  "voltage-drop": {
    term: "Caída de voltaje",
    definition: "La reducción de voltaje a lo largo de los conductores causada por la corriente que circula a través de su impedancia.",
    fieldUse: "Los recorridos largos, la corriente elevada y los conductores más pequeños pueden aumentar la caída de voltaje.",
  },
  gfci: {
    term: "GFCI",
    officialName: "Interruptor de circuito por falla a tierra",
    definition: "Un dispositivo de protección que abre un circuito al detectar una diferencia no prevista entre la corriente que sale y la que regresa.",
    fieldUse: "Es común en lugares húmedos y otras áreas donde se requiere protección de las personas contra descargas eléctricas.",
    safetyNote: "Un GFCI no sustituye las prácticas de trabajo seguras, la puesta a tierra correcta ni la verificación de que el equipo esté desenergizado.",
  },
  afci: {
    term: "AFCI",
    officialName: "Interruptor de circuito por falla de arco",
    definition: "Un dispositivo de protección diseñado para reconocer ciertas condiciones peligrosas de arco eléctrico y abrir el circuito.",
    fieldUse: "Suele encontrarse como interruptor automático o receptáculo de protección en circuitos derivados de viviendas.",
  },
  thhn: {
    term: "THHN",
    definition: "Una designación común de conductor para edificios con aislamiento termoplástico. Muchos conductores modernos tienen varias marcas, como THHN y THWN-2.",
    fieldUse: "Se instala frecuentemente en tubería para circuitos derivados y alimentadores comerciales.",
    safetyNote: "Lee la marca completa del conductor; las clasificaciones de ubicación, temperatura, voltaje y resistencia al aceite pueden variar.",
  },
  "mc-cable": {
    term: "Cable MC",
    definition: "Conjunto de fábrica de conductores aislados dentro de una armadura metálica, identificado para sus usos permitidos.",
    fieldUse: "Es común en circuitos derivados comerciales donde el cable y los accesorios elegidos están aprobados para la ubicación.",
  },
  romex: {
    officialName: "Cable con cubierta no metálica",
    definition: "Una marca que se usa comúnmente en la obra como nombre general del cable con cubierta no metálica.",
    fieldUse: "Cuando un plano o inspector requiere precisión, usa la designación real impresa en la cubierta del cable.",
  },
  "wire-nut": {
    officialName: "Conector de empalme de rosca",
    definition: "Un conector que se enrosca sobre los extremos preparados de los conductores para formar un empalme aislado.",
    fieldUse: "El color por sí solo no indica la capacidad. Sigue las combinaciones de conductores y las instrucciones del fabricante.",
  },
  bug: {
    officialName: "Conector de perno partido",
    definition: "Un nombre de obra para un conector de perno partido que une conductores compatibles o permite derivaciones.",
    fieldUse: "El empalme puede requerir aislamiento aprobado. El conector debe corresponder al material y al rango de calibres de los conductores.",
  },
  "yellow-77": {
    officialName: "Lubricante para tendido de conductores",
    definition: "Un nombre derivado de una marca para un lubricante que reduce la fricción al jalar conductores.",
    fieldUse: "Algunos equipos dicen «soap» aunque utilicen otro lubricante aprobado.",
    safetyNote: "Usa un lubricante compatible con el aislamiento del conductor y la canalización.",
  },
  emt: {
    term: "EMT",
    officialName: "Tubería metálica eléctrica",
    definition: "Tubería metálica eléctrica: una canalización metálica liviana que se une con accesorios certificados para ese uso.",
    fieldUse: "En las obras comerciales suele llamarse simplemente «pipe», aunque su nombre técnico en inglés es tubing.",
  },
  greenfield: {
    officialName: "Tubería metálica flexible (FMC)",
    definition: "Un nombre antiguo derivado de una marca que muchos electricistas usan para la tubería metálica flexible.",
    fieldUse: "Normalmente se refiere a una canalización metálica flexible en espiral. Confirma el método de cableado antes de elegir los accesorios.",
  },
  "smurf-tube": {
    officialName: "Tubería eléctrica no metálica (ENT)",
    definition: "Un apodo para la tubería eléctrica no metálica corrugada, que frecuentemente es azul.",
    fieldUse: "El color inspiró el apodo; el nombre técnico es ENT.",
  },
  sealtite: {
    officialName: "Tubería metálica flexible hermética a líquidos (LFMC)",
    definition: "Un término derivado de una marca que se usa comúnmente para la tubería metálica flexible hermética a líquidos.",
    fieldUse: "Se utiliza a menudo en conexiones de equipos que necesitan flexibilidad y protección contra humedad o líquidos.",
  },
  "conduit-body": {
    term: "Cuerpo de tubería",
    definition: "Un accesorio de canalización con tapa removible que permite acceso para jalar conductores, hacer empalmes donde se permita o cambiar de dirección.",
    fieldUse: "LB, LL y LR describen disposiciones comunes de las aberturas y la dirección.",
  },
  "fish-tape": {
    term: "Guía pasacables",
    definition: "Una herramienta flexible que se introduce en una canalización para sujetar conductores o una cuerda de tiro y jalarlos de regreso.",
    fieldUse: "Cuando alguien dice «snake the pipe», normalmente pide pasar una guía o cuerda de tiro por la tubería.",
    safetyNote: "No introduzcas una guía conductora en equipos o canalizaciones que puedan estar energizados.",
  },
  linemans: {
    officialName: "Pinzas de electricista",
    definition: "Un apodo derivado de una marca para pinzas combinadas robustas que sujetan, retuercen, empalman y cortan conductores.",
    fieldUse: "«Nines» puede referirse al tamaño común de nueve pulgadas. Llamarlas «hammer» es una broma del oficio, no su uso previsto.",
  },
  dikes: {
    officialName: "Pinzas de corte diagonal",
    definition: "Una expresión tradicional del oficio para pinzas cuyos filos se encuentran en diagonal a través de las mordazas.",
    fieldUse: "«Diagonal cutters» es el nombre profesional claro en inglés y evita confusiones o expresiones ofensivas.",
  },
  beater: {
    officialName: "Destornillador plano de trabajo pesado",
    definition: "Un destornillador plano grande que el equipo reserva para trabajo pesado, como hacer palanca, raspar o golpear ligeramente cuando la herramienta está diseñada para ello.",
    fieldUse: "Si la tarea requiere un cincel o una palanca, es más seguro usar la herramienta diseñada para ese trabajo.",
  },
  ticker: {
    officialName: "Detector de voltaje sin contacto",
    definition: "Un indicador portátil que detecta el campo eléctrico alrededor de ciertos conductores energizados sin hacer contacto metálico directo.",
    fieldUse: "Sirve como indicación inicial, pero las condiciones pueden producir resultados positivos o negativos engañosos.",
    safetyNote: "Nunca uses un detector sin contacto como única prueba de que un equipo está desenergizado. Sigue el procedimiento de prueba requerido con un instrumento de categoría adecuada.",
  },
  wiggy: {
    officialName: "Probador de voltaje de solenoide",
    definition: "Un nombre derivado de una marca para un probador robusto que indica voltaje mediante un mecanismo de solenoide.",
    fieldUse: "La palabra puede usarse de manera general; confirma a qué probador se refiere la persona.",
  },
  portaband: {
    officialName: "Sierra de cinta portátil",
    definition: "Un nombre común derivado de una marca para una sierra de cinta manual que corta tubería, riel, varilla y otros materiales.",
    fieldUse: "Selecciona la hoja y la capacidad de la herramienta según el material. Asegura la pieza antes de cortar.",
  },
  "chicago-bender": {
    officialName: "Dobladora mecánica de tubería",
    definition: "Una dobladora mecánica apoyada en el piso, usada comúnmente para calibres mayores de EMT y canalización rígida.",
    fieldUse: "La zapata, las marcas y el procedimiento exactos dependen de la dobladora y del tipo de tubería.",
  },
  "four-square": {
    officialName: "Caja cuadrada de 4 pulgadas",
    definition: "Una caja metálica cuadrada común para empalmes, dispositivos con tapas o aros y muchas aplicaciones de cableado comercial.",
    fieldUse: "«1900 box» es un apodo derivado de un catálogo que todavía usan muchos equipos.",
  },
  "eleven-b": {
    officialName: "Caja cuadrada de 4-11/16 pulgadas",
    definition: "Una caja metálica cuadrada más grande, elegida cuando se necesita más espacio para conductores, entradas o dispositivos.",
    fieldUse: "El apodo varía, pero la medida frontal es de 4-11/16 pulgadas.",
  },
  battleship: {
    officialName: "Abrazadera de soporte para caja de remodelación",
    definition: "Un soporte metálico delgado que se introduce junto a una caja metálica en una pared existente y se dobla sobre la pared para sujetar la caja.",
    fieldUse: "«Battleship», «Madison strap» y «F-clip» son nombres regionales de herrajes similares para soportar cajas.",
    region: "El nombre varía mucho dentro de Estados Unidos",
  },
  "mud-ring": {
    officialName: "Aro para yeso o tapa elevada para dispositivos",
    definition: "Una tapa o aro que adapta la abertura de una caja para dispositivos y lleva la abertura hasta la superficie terminada de la pared.",
    fieldUse: "La elevación debe corresponder a la profundidad de la pared terminada. El volumen marcado puede ser importante para calcular el llenado de caja.",
  },
  "j-box": {
    officialName: "Caja de conexiones",
    definition: "Una caja o envolvente que contiene empalmes, derivaciones o conexiones de conductores.",
    fieldUse: "La caja debe conservar la accesibilidad necesaria y tener un tamaño adecuado para su contenido y método de cableado.",
  },
  knockout: {
    term: "Disco removible",
    definition: "Una parte removible de una caja o envolvente que crea una abertura para una canalización, cable o accesorio.",
    fieldUse: "Usa el accesorio y el tamaño de abertura previstos para el método de cableado y la envolvente.",
  },
  "dead-front": {
    term: "Frente muerto",
    definition: "Una barrera diseñada para que una persona en el lado de operación no quede expuesta a partes energizadas en condiciones normales.",
    fieldUse: "En un tablero rodea las manijas de los interruptores y ayuda a evitar el contacto accidental con partes energizadas.",
  },
  "panel-guts": {
    officialName: "Interior del tablero",
    definition: "Una expresión de obra para el conjunto de barras internas, estructura de montaje de interruptores y componentes relacionados del tablero.",
    fieldUse: "El interior, la caja, el frente y los interruptores deben ser compatibles según las indicaciones del fabricante.",
  },
  "home-run": {
    officialName: "Tramo del circuito hacia la fuente o el tablero",
    definition: "La parte de un circuito derivado que va desde su primera salida o caja de conexiones hasta el tablero o la fuente que lo alimenta.",
    fieldUse: "En los planos suele indicarse con una flecha y los datos del circuito.",
  },
  pigtail: {
    officialName: "Conductor corto de conexión",
    definition: "Un conductor corto que conecta un empalme o grupo de terminales con un dispositivo, una caja u otro punto.",
    fieldUse: "Es común en conexiones de dispositivos y en la unión de cajas metálicas, sin depender del dispositivo para dar continuidad a la trayectoria.",
  },
  whip: {
    officialName: "Conjunto corto de cableado flexible",
    definition: "Un tramo corto de canalización flexible o cable preparado para conectar un equipo que necesita movimiento, alineación o una conexión final más sencilla.",
    fieldUse: "Es común en luminarias, equipos de climatización, transformadores y maquinaria cuando el método de cableado lo permite.",
  },
  "stub-up": {
    term: "Doblez de subida",
    definition: "Un doblez de tubería, comúnmente de 90 grados, que eleva el extremo hasta la altura o posición requerida.",
    fieldUse: "Se usa la deducción de la dobladora para ubicar el doblez y obtener la altura final deseada.",
  },
  dogleg: {
    officialName: "Desplazamiento fuera de plano",
    definition: "Un desplazamiento cuyos dobleces no están en el mismo plano, de modo que la tubería queda torcida en lugar de apoyarse plana.",
    fieldUse: "Normalmente describe un error que debe corregirse antes de instalar la tubería.",
  },
  "bird-dog": {
    officialName: "Supervisar u observar de cerca",
    definition: "Jerga de obra para observar de cerca a una persona, tarea, entrega o trabajo.",
    fieldUse: "Alguien puede decir que el capataz está «bird-dogging» una instalación que necesita atención adicional.",
  },
};

export function localizeTradeTalkEntry(entry: TradeTalkEntry, language: "en" | "es"): TradeTalkEntry {
  return language === "es" && TRADE_TALK_ES[entry.id] ? { ...entry, ...TRADE_TALK_ES[entry.id] } : entry;
}
