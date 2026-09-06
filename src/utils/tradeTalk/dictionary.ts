export type TradeTalkCategory =
  | "tools"
  | "materials"
  | "raceways"
  | "boxes"
  | "theory"
  | "jobsite";

export type TradeTalkKind = "formal" | "slang" | "brand" | "regional";

export type TradeTalkEntry = {
  aliases: string[];
  category: TradeTalkCategory;
  definition: string;
  fieldUse: string;
  id: string;
  kind: TradeTalkKind;
  officialName?: string;
  region?: string;
  safetyNote?: string;
  term: string;
};

export const CATEGORY_LABELS: Record<TradeTalkCategory, string> = {
  tools: "Tools",
  materials: "Materials",
  raceways: "Raceways",
  boxes: "Boxes",
  theory: "Theory",
  jobsite: "Jobsite",
};

export const KIND_LABELS: Record<TradeTalkKind, string> = {
  formal: "Electrical term",
  slang: "Common slang",
  brand: "Brand-derived",
  regional: "Regional slang",
};

// Original, field-oriented descriptions. Slang is labeled because usage varies by crew and region.
export const TRADE_TALK_ENTRIES: TradeTalkEntry[] = [
  {
    id: "ampacity", term: "Ampacity", aliases: ["amp rating", "wire amps"], kind: "formal", category: "theory",
    definition: "The maximum current a conductor can carry continuously under its stated conditions of use without exceeding its temperature rating.",
    fieldUse: "Used when checking conductor size, insulation temperature, terminations, ambient heat, and conductor grouping.",
  },
  {
    id: "awg", term: "AWG", aliases: ["American Wire Gauge", "wire gauge"], kind: "formal", category: "theory",
    definition: "The North American sizing system used for many electrical conductors. In the common range, a smaller gauge number means a larger conductor.",
    fieldUse: "A spool marked 12 AWG is commonly called number twelve wire.",
  },
  {
    id: "bonding", term: "Bonding", aliases: ["bond", "bonded"], kind: "formal", category: "theory",
    definition: "Connecting conductive parts together so they remain at substantially the same electrical potential and provide an effective fault-current path.",
    fieldUse: "You will hear this when working with metal boxes, raceways, enclosures, and grounding connections.",
  },
  {
    id: "branch-circuit", term: "Branch circuit", aliases: ["branch", "circuit"], kind: "formal", category: "theory",
    definition: "The conductors between the final overcurrent device and the outlets or equipment supplied by that circuit.",
    fieldUse: "Lighting, receptacle, and equipment circuits leaving a panel are common examples.",
  },
  {
    id: "current", term: "Current", aliases: ["amps", "amperage", "electric current"], kind: "formal", category: "theory",
    definition: "The rate of electric charge flow, measured in amperes.",
    fieldUse: "Current is the A value measured with an ammeter or clamp meter and used in load and conductor calculations.",
  },
  {
    id: "voltage", term: "Voltage", aliases: ["volts", "potential difference"], kind: "formal", category: "theory",
    definition: "Electrical potential difference between two points, measured in volts.",
    fieldUse: "Always identify what two points are being compared, such as line-to-neutral or line-to-line.",
  },
  {
    id: "resistance", term: "Resistance", aliases: ["ohms", "resistance reading"], kind: "formal", category: "theory",
    definition: "Opposition to electric current, measured in ohms.",
    fieldUse: "Used when testing conductors, loads, heating elements, and unwanted connections.",
  },
  {
    id: "voltage-drop", term: "Voltage drop", aliases: ["vd", "line loss"], kind: "formal", category: "theory",
    definition: "The reduction in voltage along conductors caused by current flowing through their impedance.",
    fieldUse: "Long runs, higher current, and smaller conductors can increase voltage drop.",
  },
  {
    id: "gfci", term: "GFCI", aliases: ["ground-fault circuit interrupter", "gfci receptacle", "ground fault-fault protection"], kind: "formal", category: "materials",
    definition: "A protective device that opens a circuit when it detects an unintended difference between outgoing and returning current.",
    fieldUse: "Common around wet locations and other areas where personnel shock protection is required.",
    safetyNote: "A GFCI does not replace safe work practices, proper grounding, or verification that equipment is de-energized.",
  },
  {
    id: "afci", term: "AFCI", aliases: ["arc-fault circuit interrupter", "arc fault"], kind: "formal", category: "materials",
    definition: "A protective device intended to recognize certain dangerous arcing conditions and open the circuit.",
    fieldUse: "Often encountered as a breaker or protective receptacle in dwelling branch circuits.",
  },
  {
    id: "thhn", term: "THHN", aliases: ["building wire", "thhn wire", "thwn-2"], kind: "formal", category: "materials",
    definition: "A common thermoplastic-insulated building-wire designation. Many modern conductors carry multiple markings, such as THHN and THWN-2.",
    fieldUse: "Frequently pulled through conduit for commercial branch circuits and feeders.",
    safetyNote: "Read the complete conductor marking; location, temperature, voltage, and oil-resistance ratings can differ.",
  },
  {
    id: "mc-cable", term: "MC cable", aliases: ["metal clad", "metal-clad cable", "mc"], kind: "formal", category: "materials",
    definition: "A factory assembly of insulated conductors enclosed in metallic armor and identified for its permitted uses.",
    fieldUse: "Common for commercial branch circuits where the selected cable and fittings are approved for the location.",
  },
  {
    id: "romex", term: "Romex", aliases: ["nm", "nm-b", "nonmetallic cable"], kind: "brand", category: "materials",
    officialName: "Nonmetallic-sheathed cable",
    definition: "A brand name commonly used as a general jobsite name for nonmetallic-sheathed cable.",
    fieldUse: "If a drawing or inspector requires precision, use the actual cable designation printed on the jacket.",
  },
  {
    id: "wire-nut", term: "Wire nut", aliases: ["twist-on connector", "wire connector", "wirenut", "marrette"], kind: "slang", category: "materials",
    officialName: "Twist-on wire connector",
    definition: "A connector twisted over prepared conductor ends to make an insulated splice.",
    fieldUse: "Color alone does not prove capacity; use the manufacturer’s conductor combination and installation instructions.",
  },
  {
    id: "bug", term: "Bug", aliases: ["split bolt", "split-bolt connector"], kind: "slang", category: "materials",
    officialName: "Split-bolt connector",
    definition: "A jobsite nickname for a split-bolt connector used to join or tap compatible conductors.",
    fieldUse: "The splice may require approved insulation and must match the conductor material and size range.",
  },
  {
    id: "yellow-77", term: "Yellow 77", aliases: ["soap", "wire lube", "pulling lube", "boy butter"], kind: "brand", category: "materials",
    officialName: "Wire-pulling lubricant",
    definition: "A brand-derived jobsite name for lubricant used to reduce friction while pulling conductors.",
    fieldUse: "Crews may say soap even when using a different approved pulling lubricant.",
    safetyNote: "Use a lubricant compatible with the conductor insulation and raceway.",
  },
  {
    id: "emt", term: "EMT", aliases: ["electrical metallic tubing", "thinwall", "thin wall", "pipe"], kind: "formal", category: "raceways",
    definition: "Electrical metallic tubing: a lightweight metal raceway joined with listed fittings.",
    fieldUse: "Often simply called pipe on commercial jobs, although its formal name is tubing.",
  },
  {
    id: "greenfield", term: "Greenfield", aliases: ["flex", "flexible metal conduit", "fmc"], kind: "brand", category: "raceways",
    officialName: "Flexible metal conduit (FMC)",
    definition: "An older brand-derived name that many electricians use for flexible metal conduit.",
    fieldUse: "Usually refers to spiral flexible metal raceway, but confirm the exact wiring method before selecting fittings.",
  },
  {
    id: "smurf-tube", term: "Smurf tube", aliases: ["ent", "electrical nonmetallic tubing", "blue tube"], kind: "slang", category: "raceways",
    officialName: "Electrical nonmetallic tubing (ENT)",
    definition: "A nickname for corrugated electrical nonmetallic tubing, often blue in color.",
    fieldUse: "The color inspired the nickname; the proper name is ENT.",
  },
  {
    id: "sealtite", term: "Sealtite", aliases: ["seal tight", "liquidtight flex", "liquid tight", "lfmc"], kind: "brand", category: "raceways",
    officialName: "Liquidtight flexible metal conduit (LFMC)",
    definition: "A brand-derived term commonly used for liquidtight flexible metal conduit.",
    fieldUse: "Electricians often use it for equipment connections that need flexibility and protection from moisture or liquids.",
  },
  {
    id: "conduit-body", term: "Conduit body", aliases: ["condulet", "lb", "ll", "lr", "c fitting"], kind: "formal", category: "raceways",
    definition: "A removable-cover raceway fitting that provides access for pulling, splicing where permitted, or changing direction.",
    fieldUse: "LB, LL, and LR describe common opening and direction arrangements.",
  },
  {
    id: "fish-tape", term: "Fish tape", aliases: ["snake", "fish", "fishing wire"], kind: "formal", category: "tools",
    definition: "A flexible tool pushed through a raceway so conductors or a pull line can be attached and drawn back.",
    fieldUse: "Someone saying snake the pipe usually means to run a fish tape or pull line through it.",
    safetyNote: "Do not insert conductive fish tape into equipment or raceways that may be energized.",
  },
  {
    id: "linemans", term: "Kleins", aliases: ["linemans", "linesman pliers", "lineman's pliers", "nines", "hammer"], kind: "brand", category: "tools",
    officialName: "Lineman’s pliers",
    definition: "A brand-derived nickname for heavy combination pliers used to grip, twist, splice, and cut conductor.",
    fieldUse: "Nines can refer to a common nine-inch size. Calling them a hammer is an electrician joke, not their intended use.",
  },
  {
    id: "dikes", term: "Dikes", aliases: ["diagonal cutters", "diags", "side cutters", "diagonal cutting pliers"], kind: "slang", category: "tools",
    officialName: "Diagonal-cutting pliers",
    definition: "Longstanding trade slang for pliers whose cutting edges meet diagonally across the jaws.",
    fieldUse: "Diagonal cutters is the clear, professional name and avoids confusion or offense.",
  },
  {
    id: "beater", term: "Beater", aliases: ["beater screwdriver", "demo screwdriver", "big flathead", "chisel driver"], kind: "slang", category: "tools",
    officialName: "Heavy-duty flat-blade screwdriver",
    definition: "A large flat-blade screwdriver a crew reserves for rough work such as prying, scraping, or light striking when the tool is designed for it.",
    fieldUse: "If the task requires a chisel or pry bar, the correct purpose-built tool is safer.",
  },
  {
    id: "ticker", term: "Ticker", aliases: ["beep stick", "volt stick", "non contact tester", "non-contact voltage tester", "ncv", "pen tester"], kind: "slang", category: "tools",
    officialName: "Non-contact voltage tester",
    definition: "A handheld indicator that senses the electric field around certain energized conductors without making direct metal contact.",
    fieldUse: "Useful as an initial indication, but conditions can produce misleading positive or negative results.",
    safetyNote: "Never use a non-contact tester as the only proof that equipment is de-energized. Follow the required test procedure with an adequately rated instrument.",
  },
  {
    id: "wiggy", term: "Wiggy", aliases: ["wigginton", "solenoid tester", "voltage tester"], kind: "brand", category: "tools",
    officialName: "Solenoid-type voltage tester",
    definition: "A brand-derived name commonly used for a rugged tester that indicates voltage using a solenoid mechanism.",
    fieldUse: "The word may be used loosely, so confirm which tester the person means.",
  },
  {
    id: "portaband", term: "Portaband", aliases: ["portable band saw", "band saw", "bandsaw"], kind: "brand", category: "tools",
    officialName: "Portable band saw",
    definition: "A common brand-derived name for a handheld band saw used to cut conduit, strut, rod, and other materials.",
    fieldUse: "Select the blade and tool rating for the material, and secure the work before cutting.",
  },
  {
    id: "chicago-bender", term: "Chicago bender", aliases: ["mechanical bender", "chicago"], kind: "slang", category: "tools",
    officialName: "Mechanical conduit bender",
    definition: "A floor-mounted mechanical bender commonly used for larger EMT and rigid raceway sizes.",
    fieldUse: "The exact shoe, markings, and procedure depend on the bender and conduit type.",
  },
  {
    id: "four-square", term: "4-square", aliases: ["four square", "4s box", "1900 box", "four inch square box"], kind: "slang", category: "boxes",
    officialName: "4-inch square box",
    definition: "A common square metal box used for splices, devices with covers or rings, and many commercial wiring applications.",
    fieldUse: "1900 box is a catalog-derived nickname still used by many crews.",
  },
  {
    id: "eleven-b", term: "11B box", aliases: ["eleven b", "4 11/16 box", "four eleven box", "four and eleven sixteenths"], kind: "slang", category: "boxes",
    officialName: "4-11/16-inch square box",
    definition: "A larger square metal box chosen when more conductor space, entries, or device capacity is needed.",
    fieldUse: "The nickname varies, but the face dimension is 4-11/16 inches.",
  },
  {
    id: "battleship", term: "Battleship", aliases: ["madison strap", "madison bar", "f clips", "box support strap"], kind: "regional", category: "boxes",
    officialName: "Old-work box support strap",
    definition: "A thin metal support slipped beside an old-work metal box and bent around the wall surface to hold the box in place.",
    fieldUse: "Battleship, Madison strap, and F-clip are regional names for similar box-support hardware.",
    region: "Name varies widely across the United States",
  },
  {
    id: "mud-ring", term: "Mud ring", aliases: ["plaster ring", "raised cover", "device ring"], kind: "slang", category: "boxes",
    officialName: "Plaster ring or raised device cover",
    definition: "A cover or ring that adapts a box opening for devices and brings the finished opening to the wall surface.",
    fieldUse: "Its rise should match the finished wall depth, and its marked volume may matter in a box-fill calculation.",
  },
  {
    id: "j-box", term: "J-box", aliases: ["junction box", "jbox", "splice box"], kind: "slang", category: "boxes",
    officialName: "Junction box",
    definition: "A box or enclosure used to contain conductor splices, taps, or connections.",
    fieldUse: "The box must remain appropriately accessible and sized for its contents and wiring method.",
  },
  {
    id: "knockout", term: "Knockout", aliases: ["ko", "k-o", "concentric knockout", "eccentric knockout"], kind: "formal", category: "boxes",
    definition: "A removable portion of a box or enclosure that creates an opening for a raceway, cable, or fitting.",
    fieldUse: "Use the fitting and opening size intended for the wiring method and enclosure.",
  },
  {
    id: "dead-front", term: "Dead front", aliases: ["panel cover", "trim", "panel trim"], kind: "formal", category: "materials",
    definition: "A barrier designed so a person on the operating side is not exposed to live parts under normal conditions.",
    fieldUse: "In a panelboard, it surrounds breaker handles and helps prevent accidental contact with energized parts.",
  },
  {
    id: "panel-guts", term: "Panel guts", aliases: ["guts", "panel interior", "interior"], kind: "slang", category: "materials",
    officialName: "Panelboard interior",
    definition: "A jobsite term for the internal bus, breaker-mounting structure, and related panel components supplied as an assembly.",
    fieldUse: "The interior, enclosure, trim, and breakers must be compatible as identified by the manufacturer.",
  },
  {
    id: "home-run", term: "Home run", aliases: ["homerun", "panel run"], kind: "slang", category: "jobsite",
    officialName: "Circuit run back to the source or panel",
    definition: "The portion of a branch circuit routed from its first outlet or junction point back to the supplying panel or source.",
    fieldUse: "On drawings it is often indicated with an arrow and circuit information.",
  },
  {
    id: "pigtail", term: "Pigtail", aliases: ["tail", "wire tail", "ground tail"], kind: "slang", category: "jobsite",
    officialName: "Short conductor lead",
    definition: "A short conductor used to connect a splice or terminal group to a device, enclosure, or other point.",
    fieldUse: "Common for device connections and bonding metal boxes without relying on the device as the through path.",
  },
  {
    id: "whip", term: "Whip", aliases: ["fixture whip", "equipment whip", "flex whip"], kind: "slang", category: "jobsite",
    officialName: "Short flexible wiring assembly",
    definition: "A short length of flexible raceway or cable assembled to connect equipment that needs movement, alignment, or an easier final connection.",
    fieldUse: "Common at light fixtures, HVAC equipment, transformers, and machinery when the wiring method permits it.",
  },
  {
    id: "stub-up", term: "Stub-up", aliases: ["stub 90", "stub", "ninety"], kind: "formal", category: "jobsite",
    definition: "A conduit bend that turns a run, commonly 90 degrees, so its end rises to a required height or location.",
    fieldUse: "The bender’s take-up or deduct is used to place the bend at the desired finished height.",
  },
  {
    id: "dogleg", term: "Dogleg", aliases: ["dog leg", "crooked offset", "twisted offset"], kind: "slang", category: "jobsite",
    officialName: "Misaligned offset",
    definition: "An offset whose bends do not share the same plane, causing the conduit to twist instead of lying flat.",
    fieldUse: "Usually describes a mistake that must be corrected before the conduit is installed.",
  },
  {
    id: "bird-dog", term: "Bird-dog", aliases: ["bird dog", "watching the crew"], kind: "slang", category: "jobsite",
    officialName: "Closely supervise or watch",
    definition: "Jobsite slang for closely watching a person, task, delivery, or piece of work.",
    fieldUse: "Someone may say the foreman is bird-dogging an installation that needs extra attention.",
  },
];

const DAILY_IDS = ["battleship", "beater", "smurf-tube", "dogleg", "wiggy", "four-square", "yellow-77", "home-run"];

export function normalizeDictionaryText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function editDistance(left: string, right: string): number {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let row = 1; row <= left.length; row += 1) {
    let diagonal = previous[0];
    previous[0] = row;
    for (let column = 1; column <= right.length; column += 1) {
      const above = previous[column];
      previous[column] = Math.min(
        previous[column] + 1,
        previous[column - 1] + 1,
        diagonal + (left[row - 1] === right[column - 1] ? 0 : 1),
      );
      diagonal = above;
    }
  }
  return previous[right.length];
}

function entryScore(entry: TradeTalkEntry, normalizedQuery: string): number {
  const names = [entry.term, entry.officialName ?? "", ...entry.aliases]
    .map(normalizeDictionaryText)
    .filter(Boolean);
  if (names.some((name) => name === normalizedQuery)) return 120;
  if (names.some((name) => normalizedQuery.includes(name) && name.length >= 3)) return 105;
  if (names.some((name) => name.startsWith(normalizedQuery))) return 95;
  if (names.some((name) => name.includes(normalizedQuery))) return 82;

  const queryWords = normalizedQuery.split(" ").filter(Boolean);
  const searchable = normalizeDictionaryText([
    entry.term,
    entry.officialName,
    ...entry.aliases,
    entry.definition,
    entry.fieldUse,
  ].filter(Boolean).join(" "));
  const matchedWords = queryWords.filter((word) => searchable.includes(word));
  if (matchedWords.length === queryWords.length) return 65;

  if (normalizedQuery.length >= 4) {
    const nearest = Math.min(...names.map((name) => editDistance(name, normalizedQuery)));
    if (nearest <= 1) return 72;
    if (nearest <= 2) return 52;
  }
  return 0;
}

export function searchTradeTalk(
  query: string,
  options: { category?: TradeTalkCategory; limit?: number } = {},
): TradeTalkEntry[] {
  const normalizedQuery = normalizeDictionaryText(query);
  const candidates = options.category
    ? TRADE_TALK_ENTRIES.filter(({ category }) => category === options.category)
    : TRADE_TALK_ENTRIES;

  if (!normalizedQuery) return candidates.slice(0, options.limit ?? candidates.length);

  return candidates
    .map((entry) => ({ entry, score: entryScore(entry, normalizedQuery) }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score || left.entry.term.localeCompare(right.entry.term))
    .slice(0, options.limit ?? 30)
    .map(({ entry }) => entry);
}

export function getTradeTalkEntry(id: string): TradeTalkEntry | undefined {
  return TRADE_TALK_ENTRIES.find((entry) => entry.id === id);
}

export function getDailyTradeTalkEntry(date = new Date()): TradeTalkEntry {
  const dayNumber = Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 86_400_000);
  const id = DAILY_IDS[Math.abs(dayNumber) % DAILY_IDS.length];
  return getTradeTalkEntry(id) ?? TRADE_TALK_ENTRIES[0];
}
