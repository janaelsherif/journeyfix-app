/**
 * Comparison table layout (30Apr26_nexilon-preise.html) — five columns:
 * Schnell-Check | Aktionsbericht | Prof. Bericht | Modul B | Modul C
 */
export type FiveCell = "y" | "n" | "p" | "o";

export type NexilonCompGroupKey = "kern" | "modB" | "modC" | "delivery";

export type CompRow =
  | { kind: "group"; groupKey: NexilonCompGroupKey }
  | { kind: "five"; key: string; cells: [FiveCell, FiveCell, FiveCell, FiveCell, FiveCell] }
  | { kind: "dash3plus2"; key: string; b: FiveCell; c: FiveCell }
  | { kind: "dash4plus1"; key: string; c: FiveCell }
  | { kind: "text5"; key: string; textKey: "pdfPages" | "leadTimes" };

export const NEXILON_COMP_ROWS: CompRow[] = [
  { kind: "group", groupKey: "kern" },
  { kind: "five", key: "rowScore", cells: ["y", "y", "y", "y", "y"] },
  { kind: "five", key: "rowTop5", cells: ["y", "y", "y", "y", "y"] },
  { kind: "five", key: "rowSub8", cells: ["n", "y", "y", "y", "y"] },
  { kind: "five", key: "rowFix5", cells: ["n", "y", "y", "y", "y"] },
  { kind: "five", key: "row12Dim", cells: ["n", "n", "y", "y", "y"] },
  { kind: "five", key: "rowCompetition", cells: ["n", "n", "y", "y", "y"] },
  { kind: "five", key: "rowAgency", cells: ["n", "n", "y", "y", "y"] },
  { kind: "group", groupKey: "modB" },
  { kind: "dash3plus2", key: "rowRewrite", b: "p", c: "p" },
  { kind: "dash3plus2", key: "rowTestimonials", b: "p", c: "p" },
  { kind: "dash3plus2", key: "rowQA", b: "p", c: "p" },
  { kind: "dash3plus2", key: "rowPlugin", b: "p", c: "p" },
  { kind: "group", groupKey: "modC" },
  { kind: "dash4plus1", key: "rowPhase8", c: "o" },
  { kind: "dash4plus1", key: "rowRoadmap", c: "o" },
  { kind: "dash4plus1", key: "rowBudget", c: "o" },
  { kind: "dash4plus1", key: "rowWeek", c: "o" },
  { kind: "dash4plus1", key: "rowSwiss", c: "o" },
  { kind: "group", groupKey: "delivery" },
  { kind: "text5", key: "rowPdfPages", textKey: "pdfPages" },
  { kind: "text5", key: "rowLeadTime", textKey: "leadTimes" },
];
