/**
 * Converts markdown-like analysis text to HTML for PDF output.
 * Matches ReportView styling: h2 indigo, h3 teal, h4 amber, tables, blockquotes.
 */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function boldToHtml(s: string): string {
  return s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

export function markdownToHtml(text: string, maxLength = 0): string {
  if (!text || typeof text !== "string") return "";
  const content = maxLength > 0 && text.length > maxLength ? text.substring(0, maxLength) + "\n\n..." : text;
  const lines = content.split("\n");
  const parts: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("## ")) {
      parts.push(`<h2 class="pdf-h2">${boldToHtml(escapeHtml(line.slice(3)))}</h2>`);
      i++;
    } else if (line.startsWith("### ")) {
      parts.push(`<h3 class="pdf-h3">${boldToHtml(escapeHtml(line.slice(4)))}</h3>`);
      i++;
    } else if (line.startsWith("#### ")) {
      parts.push(`<h4 class="pdf-h4">${boldToHtml(escapeHtml(line.slice(5)))}</h4>`);
      i++;
    } else if (line.startsWith("> ")) {
      parts.push(`<blockquote class="pdf-blockquote">${boldToHtml(escapeHtml(line.slice(2)))}</blockquote>`);
      i++;
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) {
        items.push(`<li>${boldToHtml(escapeHtml(lines[i].slice(2)))}</li>`);
        i++;
      }
      parts.push(`<ul class="pdf-list">${items.join("")}</ul>`);
    } else if (line.includes("|") && line.trim().startsWith("|")) {
      const tableRows: string[][] = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim().startsWith("|")) {
        const row = lines[i];
        if (!/^[\s|:-]+$/.test(row.trim())) {
          const cells = row
            .split("|")
            .map((c) => boldToHtml(escapeHtml(c.trim())))
            .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
          tableRows.push(cells);
        }
        i++;
      }
      if (tableRows.length > 0) {
        const header = tableRows[0].map((c) => `<th class="pdf-th">${c}</th>`).join("");
        const body = tableRows
          .slice(1)
          .map(
            (row, ri) =>
              `<tr class="${ri % 2 === 1 ? "pdf-tr-alt" : ""}">${row.map((c) => `<td class="pdf-td">${c}</td>`).join("")}</tr>`
          )
          .join("");
        parts.push(`<table class="pdf-table"><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table>`);
      }
    } else if (line.trim()) {
      parts.push(`<p class="pdf-p">${boldToHtml(escapeHtml(line))}</p>`);
      i++;
    } else {
      i++;
    }
  }

  return parts.join("\n");
}
