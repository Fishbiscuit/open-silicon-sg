# Editing the site

Everything people read is in this folder. Change a file, then run
`node src/build.mjs` from the project root. The build checks every file and
stops with the file name and the problem if something is wrong.

| What you want to change | Edit |
|---|---|
| Site name, short mark (the SG / Si tile), menu, footer | `site.md` |
| Home page: headline, introduction, section titles, the exhibition's dates and area cards, who the hub is for | `home.md` |
| Add or change a workshop or event | `events/` (copy `events/_template.md`) |
| Opening sequence: captions for each object, the open chip, final line | `hero.md` |
| "Why open silicon": intro and the nine steps. Each step stays up longer the longer its text is. | `fab.md` |
| Exhibit cards | `exhibits/` (copy `exhibits/_template.md`). These show only if `exhibition_areas` is removed from `home.md`; the page now shows the companion's carousel instead. |

Rules of thumb:

- Text between `---` lines at the top of a file is settings: `key: value`.
  Long text can go on the lines under `key: >`, indented.
- Below the second `---` is ordinary Markdown: blank line between
  paragraphs, `**bold**`, `*italic*`, `[link](https://…)`, `- ` lists.
- Files whose names start with `_` are templates and are never shown.
- Dates are written `2026-11-23`. An event moves from "Upcoming" to "Past"
  by itself once its last date has gone by; you never move it by hand.
- `public: false` keeps an entry in the repository but off the site.
- A heading's `_emphasis` field names one whole word in it to highlight,
  for example `about_emphasis: together`.
- Pictures and the font are not in this repository. They come from a
  separately held asset bundle; see the main README.
- `source:` notes where a fact came from. The site never shows it, but this
  repository is public, so cite only public sources there.
