## pdfppt-export (Quick User Guide)

Small React helper package providing two drop-in modals (`PDFDownloader`, `PPTDownloader`) to export any referenced dashboard DOM to a multi‑page PDF or a structured PPTX (with real charts & panels) using only a ref and lightweight CSS markers.

### 1. What It Does
Two React modals to export a section of your app:
* PDFDownloader → A4 multi‑page PDF (charts rasterized, tall content sliced).
* PPTDownloader → PPTX with panels, texts, shapes, charts (or single full-image fallback).

### 2. Install
```bash
npm install pdfppt-export jspdf html-to-image pptxgenjs culori axios
```
React 18 required.

### 3. Basic Usage
```jsx
const ref = useRef(null);
{showPdf && <PDFDownloader onClose={()=>setShowPdf(false)} contentRef={ref} />}
{showPpt && <PPTDownloader onClose={()=>setShowPpt(false)} contentRef={ref} />}
<div ref={ref}>
	<div className="pdfppt-noprint">buttons/toolbars here</div>
	<div className="chart-snapshot" data-chart='{"chartType":"pie","labels":["A","B"],"values":[60,40],"colors":["#3B82F6","#93C5FD"],"showLegend":true}'>{/* chart */}</div>
</div>
```

### 4. Essential Props
PDFDownloader:
| Prop | Purpose |
|------|---------|
| onClose | Close modal after export/cancel |
| contentRef | Ref to root DOM you want captured |

PPTDownloader (adds layout + branding):
| Prop | Default | Purpose |
|------|---------|---------|
| onClose | — | Close modal |
| contentRef | — | Root to scan |
| imgSlideStart | null | Background for first slide (title) |
| imgSlideMiddle | null | Background for content slides |
| imgSlideEnd | null | Background for last slide |
| scaleFactor | 1.35 | Uniform scale for detected panels |
| pptWidth | 13.333 | Deck width (inches) |
| pptHeight | 7.5 | Deck height (inches) |
| isStartEnd | true | Include start & end slides |

### 5. Classes You Use
| Class | Why |
|-------|-----|
| pdfppt-noprint | Exclude controls from PDF/PPT |
| chart-snapshot | Mark chart wrapper for image (PDF) & metadata (PPT) |
| pdfppt-export-* | Library’s own modal styles (imported automatically) |

### 6. Chart Metadata (data-chart)
Minimal JSON for a chart element:
```jsonc
{
	"chartType": "pie",
	"labels": ["A","B","C"],
	"values": [30,40,30],
	"colors": ["#3B82F6","#60A5FA","#93C5FD"],
	"showLegend": true,
	"legendColor": "#000",
	"lableColor": "#000" // (spelling matches implementation)
}
```
Attach as string: `<div class="chart-snapshot" data-chart='{"chartType":"pie",...}'>`.

### 7. contentRef Explained
Pass a React ref pointing to a wrapper containing everything you want exported. Anything inside gets cloned; items with `pdfppt-noprint` are removed; chart containers get converted.

### 8. PDF Behavior (Quick)
* Tries single full snapshot; if height > ~14000px or fails → slices into pages.
* Each page: header (title + date) + content slice.

### 9. PPT Behavior (Quick)
* Detects “panels” (elements with background/border/shadow or forced `ppt-group-root`).
* Up to two panels per slide, scaled by `scaleFactor`.
* Rebuilds charts from metadata (not just images).
* No panels found → one slide with full screenshot.

### 10. Common Tips
| Need | Do |
|------|----|
| Hide buttons | Add `pdfppt-noprint` |
| Selectable charts in PPT | Provide valid `data-chart` JSON |
| Fewer slides | Group related content visually |
| Disable start/end | `isStartEnd={false}` |
| Branding | Supply `imgSlideStart/imgSlideMiddle/imgSlideEnd` |

### 11. Minimal Checklist
1. Install package + peers.
2. Wrap dashboard in a `ref`.
3. Tag charts: `.chart-snapshot` + `data-chart`.
4. Hide controls: `pdfppt-noprint`.
5. Render modals on demand.

### 12. Troubleshooting (Fast)
| Problem | Fix |
|---------|-----|
| Blank chart in PPT | Invalid JSON → check quotes / braces |
| Missing styles | Ensure global CSS variables available before open |
| Too many PDF pages | Reduce height / split dashboard |
| Overlapping PPT layout | Simplify panels or adjust scaleFactor |

### 13. License & Export
Import:
```js
import { PDFDownloader, PPTDownloader } from 'pdfppt-export';
```
License: MIT.

### 14. Example (Compact)
```jsx
<div ref={ref}>
	<div className="pdfppt-noprint">
		<button onClick={()=>setShowPdf(true)}>PDF</button>
		<button onClick={()=>setShowPpt(true)}>PPT</button>
	</div>
	<div className="chart-snapshot" data-chart='{"chartType":"bar","labels":["Jan","Feb"],"values":[120,90],"colors":["#2563EB","#60A5FA"],"showLegend":false}' />
</div>
```

That’s it—focus on the essentials, add metadata for charts, and exclude what you don’t want printed.