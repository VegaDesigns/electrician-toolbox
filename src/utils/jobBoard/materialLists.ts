export type ListLine = { id: string; text: string; done: boolean; previous: string[]; kind?: "material" | "note" };
export type MaterialList = { id: string; title: string; lines: ListLine[]; completed: boolean; createdAt: number };
export type MaterialLists = { lists: MaterialList[] };

export function editLine(line: ListLine, text: string): ListLine {
  const next = text.trim();
  if (line.kind === "note") return next ? { ...line, text: next, previous: [], done: false } : line;
  if (!next || next === line.text) return line;
  return { ...line, text: next, done: false, previous: [...line.previous, line.text] };
}

export function materialParts(text: string): { quantity: string; description: string } {
  const match = text.match(/^(\d+)\s+-\s+(.+)$/s);
  return match ? { quantity: match[1], description: match[2] } : { quantity: "0", description: text };
}
export function materialText(quantity: string, description: string): string {
  const count = Number(quantity);
  return Number.isSafeInteger(count) && count > 0 ? `${count} - ${description.trim()}` : description.trim();
}

export function restoreLine(line: ListLine): ListLine {
  if (!line.previous.length) return line;
  return { ...line, text: line.previous[line.previous.length - 1], previous: line.previous.slice(0, -1), done: false };
}

export function splitLines(text: string): string[] {
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

export function decodeLists(raw: string): MaterialLists {
  const data = JSON.parse(raw) as MaterialLists;
  if (!data || !Array.isArray(data.lists)) throw new Error("Invalid lists");
  const ids = new Set<string>();
  for (const list of data.lists) {
    if (!list || typeof list.id !== "string" || ids.has(list.id) || typeof list.title !== "string" || typeof list.completed !== "boolean"
      || !Number.isFinite(list.createdAt) || !Array.isArray(list.lines)) throw new Error("Invalid list");
    ids.add(list.id);
    const lineIds = new Set<string>();
    for (const line of list.lines) {
      if (!line || typeof line.id !== "string" || lineIds.has(line.id) || typeof line.text !== "string" || typeof line.done !== "boolean"
        || (line.kind !== undefined && line.kind !== "material" && line.kind !== "note")
        || !Array.isArray(line.previous) || line.previous.some((text) => typeof text !== "string")) throw new Error("Invalid line");
      lineIds.add(line.id);
    }
  }
  return data;
}
