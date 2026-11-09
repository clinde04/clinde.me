# clinde.me

Source for [clinde.me](https://clinde.me), Collin Linde's personal site.

Plain HTML, CSS and JavaScript with no build step.

| Path | What it is |
| --- | --- |
| `index.html` | The home page |
| `site.js` | The purple orb that follows the mouse, and the scroll hint in the hero |
| `styles.css` | All styles, shared by every page |
| `tools/text-percent/` | The Text Percent Calculator |
| `utils/textpercent/` | Redirect from the calculator's old address |
| `404.html` | Not-found page |

## Run it locally

Any static file server works. With Python installed:

```bash
python -m http.server 4173
```

Then open <http://localhost:4173>.

## Deploy

GitHub Pages serves the `main` branch from the repository root.
