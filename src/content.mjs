// Content layer. Every word on the site lives in content/ as Markdown with a
// front-matter header; this module reads it, checks it against a schema and
// renders the Markdown. No dependencies, so the build runs anywhere Node does.
//
// Front matter is a small, strict subset of YAML:
//   key: value              strings, numbers, true/false, [inline, lists]
//   key: >                  folded text: the indented lines below, joined
//   key:                    then an indented block of "- item" lines
//     - plain item          or "- key: value" items (more keys indented below)
//   # comment
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, basename } from "node:path";

export class ContentError extends Error {}

// ------------------------------------------------------------ front matter
function scalar(raw) {
  let v = raw.trim();
  if (!/^["']/.test(v)) v = v.replace(/\s+#.*$/, "");
  if (v === "") return "";
  if (v === "true") return true;
  if (v === "false") return false;
  if (v === "null" || v === "~") return null;
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) return v.slice(1, -1).replace(/\\"/g, '"');
  if (v.startsWith("[") && v.endsWith("]")) return v.slice(1, -1).split(",").map((s) => scalar(s)).filter((s) => s !== "");
  return v;
}

export function parseFrontMatter(text, file = "") {
  const lines = text.split("\n").map((raw, i) => ({ raw, i: i + 1, indent: raw.match(/^ */)[0].length, body: raw.trim() })).filter((l) => l.body && !l.body.startsWith("#"));
  let pos = 0;
  const fail = (l, msg) => { throw new ContentError(`${file}:${l.i + 1}: ${msg}\n    ${l.raw}`); };
  function folded(indent) {
    const parts = [];
    while (pos < lines.length && lines[pos].indent > indent) parts.push(lines[pos++].body);
    return parts.join(" ");
  }
  function block(indent) {
    if (pos < lines.length && lines[pos].body.startsWith("- ")) {
      const list = [];
      const at = lines[pos].indent;
      while (pos < lines.length && lines[pos].indent === at && lines[pos].body.startsWith("- ")) {
        const l = lines[pos];
        const rest = l.body.slice(2);
        const kv = rest.match(/^([A-Za-z_][\w-]*):(?:\s+(.*)|\s*)$/);
        if (kv) {
          // a map item: this key, plus any keys indented under it
          const item = {};
          pos++;
          assign(item, kv[1], kv[2] ?? "", l, at + 2);
          while (pos < lines.length && lines[pos].indent > at && !lines[pos].body.startsWith("- ")) {
            const k2 = lines[pos].body.match(/^([A-Za-z_][\w-]*):(?:\s+(.*)|\s*)$/);
            if (!k2) fail(lines[pos], "expected key: value");
            const l2 = lines[pos++];
            assign(item, k2[1], k2[2] ?? "", l2, l2.indent);
          }
          list.push(item);
        } else {
          pos++;
          list.push(scalar(rest));
        }
      }
      return list;
    }
    const map = {};
    while (pos < lines.length && lines[pos].indent > indent) {
      const l = lines[pos];
      const kv = l.body.match(/^([A-Za-z_][\w-]*):(?:\s+(.*)|\s*)$/);
      if (!kv) fail(l, "expected key: value");
      pos++;
      assign(map, kv[1], kv[2] ?? "", l, l.indent);
    }
    return map;
  }
  function assign(target, key, value, l, indent) {
    if (key in target) fail(l, `duplicate key "${key}"`);
    if (value === ">" || value === "|") target[key] = folded(indent);
    else if (value === "") target[key] = pos < lines.length && lines[pos].indent > indent ? block(indent) : "";
    else target[key] = scalar(value);
  }
  const out = {};
  while (pos < lines.length) {
    const l = lines[pos];
    if (l.indent !== 0) fail(l, "unexpected indentation");
    const kv = l.body.match(/^([A-Za-z_][\w-]*):(?:\s+(.*)|\s*)$/);
    if (!kv) fail(l, "expected key: value");
    pos++;
    assign(out, kv[1], kv[2] ?? "", l, 0);
  }
  return out;
}

export function readDoc(file) {
  const text = readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: text.trim(), file, slug: basename(file, ".md") };
  return { data: parseFrontMatter(m[1], file), body: m[2].trim(), file, slug: basename(file, ".md") };
}

// ------------------------------------------------------------ schemas
// A schema maps field → "type" or "type?" (optional). Types: string, text,
// number, boolean, date (YYYY-MM-DD), url, list, map, any, or "a|b|c" enums.
export function check(doc, schema) {
  const errs = [];
  for (const [field, spec] of Object.entries(schema)) {
    const optional = spec.endsWith("?");
    const type = spec.replace(/\?$/, "");
    const v = doc.data[field];
    if (v === undefined || v === "" || v === null) {
      if (!optional) errs.push(`missing "${field}"`);
      continue;
    }
    const bad = (why) => errs.push(`"${field}" ${why} (got ${JSON.stringify(v)})`);
    if (type === "string" || type === "text") { if (typeof v !== "string") bad("should be text"); }
    else if (type === "number") { if (typeof v !== "number") bad("should be a number"); }
    else if (type === "boolean") { if (typeof v !== "boolean") bad("should be true or false"); }
    else if (type === "date") { if (!/^\d{4}-\d{2}-\d{2}$/.test(String(v)) || isNaN(Date.parse(v))) bad("should be a date like 2026-11-23"); }
    else if (type === "url") { if (!/^https?:\/\//.test(String(v))) bad("should start with https://"); }
    else if (type === "list") { if (!Array.isArray(v)) bad("should be a list"); }
    else if (type === "map") { if (typeof v !== "object" || Array.isArray(v)) bad("should be a set of key: value lines"); }
    else if (type.includes("|")) { if (!type.split("|").includes(String(v))) bad(`should be one of ${type.split("|").join(", ")}`); }
  }
  for (const field of Object.keys(doc.data)) if (!(field in schema)) errs.push(`unknown field "${field}" (typo?)`);
  if (errs.length) throw new ContentError(`${doc.file}:\n  - ${errs.join("\n  - ")}`);
  return doc;
}

// A collection is a folder of .md files. Files starting with "_" are
// templates, index.md holds the folder's own settings, README.md is notes;
// all three are skipped.
export function collection(dir, schema) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_") && f !== "README.md" && f !== "index.md")
    .sort()
    .map((f) => check(readDoc(join(dir, f)), schema));
}

// ------------------------------------------------------------ markdown
const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
export function inline(text) {
  return esc(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
    .replace(/\*([^*]+)\*/g, "<i>$1</i>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|#[\w-]+)\)/g, (_, t, u) => `<a href="${u}"${u.startsWith("http") ? ' target="_blank" rel="noopener"' : ""}>${t}</a>`)
    .replace(/ -- /g, " – ");
}

// Blocks: paragraphs, ### headings, - lists, 1. lists, | tables |,
// :::name Optional title ... ::: containers, and {{shortcode}} lines that the
// caller renders (sitemap, timeline, events and so on).
export function markdown(src, shortcodes = {}, ctx = {}) {
  const lines = src.split("\n");
  const out = [];
  let i = 0;
  const para = [];
  const flush = () => { if (para.length) { out.push(`<p>${inline(para.join(" "))}</p>`); para.length = 0; } };
  while (i < lines.length) {
    const line = lines[i];
    const t = line.trim();
    if (!t) { flush(); i++; continue; }
    let m;
    if ((m = t.match(/^\{\{(\w[\w-]*)\}\}$/))) {
      flush();
      const fn = shortcodes[m[1]];
      if (!fn) throw new ContentError(`${ctx.file ?? "markdown"}: unknown block {{${m[1]}}}`);
      out.push(fn(ctx));
      i++;
      continue;
    }
    if ((m = t.match(/^:::(\w[\w-]*)\s*(.*)$/))) {
      flush();
      const inner = [];
      i++;
      while (i < lines.length && lines[i].trim() !== ":::") inner.push(lines[i++]);
      i++;
      const title = m[2] ? `<p class="eyebrow">${inline(m[2])}</p>` : "";
      out.push(`<div class="${m[1]}">${title}${markdown(inner.join("\n"), shortcodes, ctx)}</div>`);
      continue;
    }
    if ((m = t.match(/^(#{2,4})\s+(.*)$/))) { flush(); const n = m[1].length + 1; out.push(`<h${n}>${inline(m[2])}</h${n}>`); i++; continue; }
    if (/^[-*] /.test(t) || /^\d+\. /.test(t)) {
      flush();
      const ordered = /^\d+\. /.test(t);
      const items = [];
      while (i < lines.length && (ordered ? /^\d+\. /.test(lines[i].trim()) : /^[-*] /.test(lines[i].trim()))) {
        let item = lines[i].trim().replace(/^([-*]|\d+\.) /, "");
        i++;
        while (i < lines.length && /^\s{2,}\S/.test(lines[i]) && !/^\s*([-*]|\d+\.) /.test(lines[i])) item += " " + lines[i++].trim();
        items.push(`<li>${inline(item)}</li>`);
      }
      out.push(`<${ordered ? "ol" : "ul"}>${items.join("")}</${ordered ? "ol" : "ul"}>`);
      continue;
    }
    if (t.startsWith("|")) {
      flush();
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) rows.push(lines[i++].trim());
      const cells = (r) => r.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
      const head = cells(rows[0]);
      const body = rows.slice(2).map(cells);
      out.push(`<div class="table-wrap"><table><thead><tr>${head.map((h) => `<th>${inline(h)}</th>`).join("")}</tr></thead><tbody>${body.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
      continue;
    }
    para.push(t);
    i++;
  }
  flush();
  return out.join("\n");
}
