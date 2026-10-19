# Portfolio

Static portfolio / resume page for Praveen Bathula, hosted on GitHub Pages.

## Files

| File         | Purpose                                                                                               |
|--------------|-------------------------------------------------------------------------------------------------------|
| `data.js`    | All content: profile, contact, skills, experience, projects, education. Edit this to update the site. |
| `index.html` | Page skeleton. Sections are empty containers filled by `index.js`.                                    |
| `index.js`   | Renders `data.js` into the page, builds the DOCX, wires the PDF/theme buttons.                        |
| `styles.css` | Screen styling, light and dark.                                                                       |
| `print.css`  | Print styling: single column, ATS-friendly, used by "Download PDF".                                   |

No build step and no dependencies to install. The DOCX button loads `docx` from a CDN at runtime.

## Local preview

```
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Updating content

Edit `data.js` and push to `main`. GitHub Pages redeploys automatically.

## Downloads

- **Download PDF** uses the browser print dialog with `print.css`. In Chrome choose "Save as PDF" and turn **off** headers and footers.
- **Download DOCX** generates a Word document from the same data.
