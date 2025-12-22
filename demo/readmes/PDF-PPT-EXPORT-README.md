# pdf-ppt-export-react — Integration Guide & Developer Documentation

This document explains how to use the PDF and PPT export components included in this project: `PDFDownloader` and `PPTDownloader`.
It describes installation, runtime dependencies, component props, CSS classes, step-by-step usage, how charts should be annotated, and example code you can copy into your project.

This repository already includes example components and demo pages (see `src/pages/Demo.jsx` and `src/components/demo/*`). Use those as reference integrations.

---

**Table of Contents**
- Installation
- Why these libraries? (dependencies)
- Using `PDFDownloader`
  - Props
  - Preview vs Export flow
  - Example usage
  - Notes & common pitfalls
- Using `PPTDownloader`
  - Props
  - Layout & pagination strategy
  - Example usage
  - Notes & common pitfalls
- Required CSS classes & examples
- How to add a new chart (step-by-step)
- Debugging tips and FAQs
- License

---

**Installation**

Install the runtime dependencies used by these components. The project README also lists the primary dependencies — below are the commands if you are adding this to your project:

```bash
npm install jspdf html-to-image pptxgenjs culori
```

- `jspdf` — used by `PDFDownloader` to generate multi-page A4 PDFs with precise coordinates. https://www.npmjs.com/package/jspdf
- `html-to-image` — rasterizes DOM nodes into PNG data URLs. Used to snapshot charts and blocks before they are placed into PDF or PPT. https://www.npmjs.com/package/html-to-image
- `pptxgenjs` — used by `PPTDownloader` to create PPTX slides, text boxes, shapes, and charts. https://www.npmjs.com/package/pptxgenjs
- `culori` — color parsing/normalization utilities used for converting CSS colors to hex values expected by PPTX shapes. https://www.npmjs.com/package/culori

Why these libraries?
- They are well-tested and broadly used in web export utilities.
- `html-to-image` provides a reliable canvas-based raster pipeline that can bypass font/SVG rendering differences between PDF and browser canvas.
- `jspdf` and `pptxgenjs` provide precise layout control and export to the targeted formats.

---

**Using PDFDownloader**

Location: `src/pdfppt/PDFDownloader.jsx`

Purpose: Export a DOM subtree (referenced by a React `ref`) to a multi-page A4 PDF while avoiding content splitting across pages. Charts are rasterized to PNG and inserted as images to avoid SVG/font inconsistencies.

Props
- `contentRef` (required): React ref object pointing to the root DOM node of the dashboard or area you want to export.
- `onClose` (required): function called when the user cancels or the export completes.
- `defaultTitle` (optional): string — default PDF title and filename. Defaults to "PDF Title".

Preview vs Export
- Preview: The component clones your dashboard, rasterizes chart placeholders (`.pdfppt-chart-snapshot`) to PNG using `html-to-image`, and shows a scaled preview inside the modal. This lets the user confirm the layout before exporting.
- Export: When 'Download PDF' is clicked, the clone is rasterized into page-sized blocks. Each block is converted to PNG and added to the pdf using a helper `addElementWithPageBreak()` which ensures an element does not cross page boundaries. A header (title + date + rule) is applied to the first page.

Example usage (copy into your React component):

```jsx
import { useRef, useState } from 'react';
import PDFDownloader from './src/pdfppt/PDFDownloader';

function MyPage() {
  const contentRef = useRef(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <div ref={contentRef}>
        {/* Your dashboard markup here */}
      </div>

      {open && (
        <PDFDownloader
          contentRef={contentRef}
          defaultTitle="My Dashboard Report"
          onClose={() => setOpen(false)}
        />
      )}

      <button onClick={() => setOpen(true)}>Export PDF</button>
    </>
  );
}
```

Notes & common pitfalls
- Ensure `contentRef.current` contains visible elements (not display:none). The exporter filters nodes with zero width/height.
- Charts must be marked with `.pdfppt-chart-snapshot` and include a `pdfppt-data-chart` attribute containing JSON metadata (see "How to add a new chart" section below).
- Avoid elements that depend on external fonts that may be CORS protected; `html-to-image` provides options like `skipFonts` and `skipAutoScale` to mitigate.

---

**Using PPTDownloader**

Location: `src/pdfppt/PPTDownloader.jsx`

Purpose: Generate an editable PPTX from a DOM subtree. The algorithm tries to detect grouped panels (cards), extract text nodes and charts, and rebuild them as PPT shapes/text or PPT charts where possible. Where reconstruction fails, it falls back to images.

Props
- `contentRef` (required): React ref to the root DOM node to export.
- `onClose` (required): callback when export completes or the dialog is closed.
- `defaultTitle` (optional): default file name/title.
- `imgSlideStart`, `imgSlideMiddle`, `imgSlideEnd` (optional): image data URLs or paths applied to start, middle/content slides, and end slides respectively.
- `scaleFactor` (optional): global scale factor controlling how DOM pixels are converted to PPT inches during layout (default varies in component). Larger values increase effective resolution.
- `pptWidth`, `pptHeight` (optional): slide dimensions in inches (defaults in example are 13.333 x 7.5 i.e., 16:9 layout).
- `isStartEnd` (optional): whether to include wrapper start/end slides.
- `groupGapY` (optional): gap between stacked groups on a slide in inches.

Layout & pagination strategy
- The exporter measures DOM bounding boxes relative to a root container.
- It treats visually styled containers (cards with borders, backgrounds, or shadows) as panels — these become candidate slide panels.
- It assigns stable `data-uid` attributes to elements to ensure deterministic ordering.
- The `assignPosition2` layout algorithm (internal) paginates groups across slides and positions shapes; when the algorithm cannot confidently map DOM to PPT elements the exporter falls back to rendering a full-slide image.

Example usage

```jsx
import PPTDownloader from './src/pdfppt/PPTDownloader';
import { useRef, useState } from 'react';

function MyPage() {
  const contentRef = useRef(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <div ref={contentRef}>
        {/* Dashboard */}
      </div>

      {open && (
        <PPTDownloader
          contentRef={contentRef}
          defaultTitle="Deck"
          onClose={() => setOpen(false)}
          imgSlideStart="/assets/start.png"
          imgSlideMiddle="/assets/content-bg.png"
          imgSlideEnd="/assets/end.png"
        />
      )}

      <button onClick={() => setOpen(true)}>Export PPT</button>
    </>
  )
}
```

Notes & common pitfalls
- PPT export is heuristic-based — complex absolutely-positioned UIs or CSS transforms may not map cleanly to PPT shapes.
- Use card-like containers for predictable panel detection.
- Charts must be annotated with `.pdfppt-chart-snapshot` and `pdfppt-data-chart` metadata for best results.

---

**Required CSS classes & what they mean**

These classes are used by the export components to identify special nodes and to control what is included or excluded in exports.

- `pdfppt-noprint`
  - Purpose: Exclude interactive UI controls (filters, buttons) from exported output.
  - Usage: Add to any DOM node you don't want to appear in the exported PDF/PPT.
  - Example:

    <div className="pdfppt-noprint">Filters and controls</div>

- `pdfppt-chart-snapshot`
  - Purpose: Mark chart containers that should be rasterized and (for PPT) replaced with editable chart data when possible.
  - Requirement: The element should include a `pdfppt-data-chart` attribute containing a JSON string with chart metadata (labels, values, colors, chartType).
  - Example markup (see next section for a real example):

    <div className="pdfppt-chart-snapshot" pdfppt-data-chart={JSON.stringify(chartMeta)}></div>

- `ppt-group-root`
  - Purpose: Force a container to be considered a grouped panel in PPT export. Helpful for card components that should map to single slide panels.
  - Example:

    <div className="ppt-group-root card"> ... card contents ... </div>

The project also includes a scoped CSS file for the export modal: `src/pdfppt/pdfppt-export.css`. This file provides the modal UI shown by both downloaders. Import or bundle this CSS in your application so the modal displays correctly.

File to include in your build:

- File: src/pdfppt/pdfppt-export.css

You can customize the styles, but avoid removing the classes referenced above.

---

**How to add a new chart (step-by-step)**

To ensure charts export correctly to PDF and become editable or well-rendered images in PPT, follow this process.

1. Render your chart in the DOM as you normally would (e.g., using Recharts, Chart.js, ApexCharts, etc.).
2. Wrap or allow the chart container to have class `pdfppt-chart-snapshot`.
3. Add a `pdfppt-data-chart` attribute containing a JSON string with chart metadata. The metadata schema expected by the included demo components (see `ChartPie.jsx`) is simple and contains at least:

```json
{
  "chartType": "pie",        // bar, line, pie, doughnut, multibar, multiline
  "labels": ["A","B","C"],
  "values": [10, 20, 30],
  "colors": ["#93C5FD","#60A5FA","#3B82F6"],
  "legendColor": "#1D4ED8",
  "lableColor": "#1D4ED8"
}
```

4. Example (Recharts pie chart as used in the demo):

```jsx
const chartMeta = {
  chartType: "pie",
  labels: pieData.map(d => d.label),
  values: pieData.map(d => d.data),
  colors: pieData.map(d => d.fill),
};

<div className="pdfppt-chart-snapshot" pdfppt-data-chart={JSON.stringify(chartMeta)}>
  {/* your chart canvas or svg here */}
</div>
```

5. For best results, keep chart containers sized responsively and avoid CSS transforms that dramatically change measured width/height.

6. If you are using custom chart types, extend the exporter logic to recognize your `chartType` and map any needed properties. See `src/pdfppt/PPTDownloader.jsx` for the section that parses `pdfppt-data-chart` and writes PPT charts (search for `pdfppt-data-chart` in that file).

---

**Debugging tips & FAQs**

- Q: The preview shows an empty area or elements missing.
  - A: The exporter filters out elements with zero width or height. Make sure the DOM is rendered and not collapsed (e.g., use `min-height` or ensure images/fonts finished loading before opening the export modal).

- Q: Charts look blurry in PDF or PPT.
  - A: Increase `pixelRatio` used by `html-to-image` when rasterizing. In `PDFDownloader`/`PPTDownloader` the preview options use `pixelRatio: 2`. The exporter sometimes uses a higher internal raster scale for final export.

- Q: PPT layout looks different from the webpage.
  - A: PPT export approximates CSS layout. Use card-style containers, avoid deep absolute layouts, and annotate groups with `ppt-group-root` for better mapping.

---

License

This project includes components derived from the demo in the repository. See the main project license (MIT) included in the repository.

---

If you'd like, I can also:
- Add a small TypeScript declaration file for these components.
- Add a playground React page with annotated examples and a small test harness.

Which of these would you like next?
