<!-- Replace this image with your generated GitHub social preview -->
![pdfppt-export – Export React dashboards to PDF & PPTX](https://raw.githubusercontent.com/your-username/your-repo/main/assets/social-preview.png)

# pdfppt-export

**pdfppt-export** is a React helper library that provides two drop‑in modal components —  
`PDFDownloader` and `PPTDownloader` — to export any rendered dashboard or UI section into:

- 📄 **Multi‑page A4 PDFs** with smart page breaks  
- 📊 **Structured PowerPoint (PPTX)** files with real text, shapes, panels, and charts  

Exports are generated directly from the **existing DOM** using a simple `ref` and a few lightweight CSS markers.

---

## 🧠 How the Library Works (Mental Model)

1. You wrap your dashboard inside a container referenced by `contentRef`
2. On export, the DOM is **cloned** (original DOM is never mutated)
3. Elements are processed based on CSS markers:
   - Controls removed
   - Charts converted
   - Panels detected
4. Output is generated as **PDF** or **PPTX**

If it renders correctly in the browser, it can be exported.

---

## ✨ Export Modes

### 📄 PDF Export (`PDFDownloader`)
- A4 portrait pages
- Smart block‑level slicing (elements never split)
- Charts rasterized as images for reliability
- Header (title + date) on first page only
- Fallback to full snapshot if layout detection fails

### 📊 PPT Export (`PPTDownloader`)
- Real PowerPoint slides (not screenshots)
- Panels auto‑detected from DOM styles
- Text, shapes, borders recreated
- Charts rebuilt as **editable PPT charts**
- Up to **2 panels per slide**
- Optional branded start / end slides

---

## 📦 Installation

```bash
npm install pdfppt-export jspdf html-to-image pptxgenjs culori
```

> React 18 required

---

## 🧩 Basic Usage

```jsx
import { PDFDownloader, PPTDownloader } from "pdfppt-export";
import { useRef, useState } from "react";

export default function DashboardPage() {
  const dashboardRef = useRef(null);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [pptOpen, setPptOpen] = useState(false);

  return (
    <>
      {pdfOpen && (
        <PDFDownloader
          contentRef={dashboardRef}
          onClose={() => setPdfOpen(false)}
        />
      )}

      {pptOpen && (
        <PPTDownloader
          contentRef={dashboardRef}
          onClose={() => setPptOpen(false)}
        />
      )}

      <div ref={dashboardRef}>
        <div className="pdfppt-noprint">
          <button onClick={() => setPdfOpen(true)}>Export PDF</button>
          <button onClick={() => setPptOpen(true)}>Export PPT</button>
        </div>

        {/* Dashboard UI */}
      </div>
    </>
  );
}
```

---

## 🎨 CSS Classes (Very Important)

### 1️⃣ `pdfppt-noprint`
**Purpose:** Exclude UI from both PDF and PPT

```html
<div class="pdfppt-noprint">
  buttons, filters, dropdowns, inputs
</div>
```

- Removed from cloned DOM
- Not visible in preview or export
- Use for toolbars, controls, actions

---

### 2️⃣ `chart-snapshot`
**Purpose:** Mark chart containers

```html
<div
  class="chart-snapshot"
  data-chart='{"chartType":"pie","labels":["A","B"],"values":[60,40]}'
></div>
```

Behavior:
- **PDF:** chart → PNG image
- **PPT:** chart → native PowerPoint chart

This class is mandatory for chart export.

---

### 3️⃣ `ppt-group-root` (Optional)
**Purpose:** Force panel detection in PPT

```html
<div class="ppt-group-root">
  <h3>Revenue</h3>
  <div class="chart-snapshot" ...></div>
</div>
```

Use when:
- Automatic grouping misses a container
- You want explicit slide panels

---

## 📊 Charts — Full Guide

### Supported Chart Types

| Type | `chartType` |
|----|----|
| Bar | `"bar"` |
| Line | `"line"` |
| Pie | `"pie"` |
| Doughnut | `"doughnut"` |
| Multi‑series Bar | `"multibar"` |
| Multi‑series Line | `"multiline"` |

---

### Basic Chart Example

```html
<div
  class="chart-snapshot"
  data-chart='{
    "chartType": "bar",
    "labels": ["Jan","Feb","Mar"],
    "values": [120,90,150],
    "colors": ["#2563EB","#60A5FA","#93C5FD"],
    "showLegend": false
  }'
></div>
```

---

### Multi‑Series Bar Chart

```html
<div
  class="chart-snapshot"
  data-chart='{
    "chartType": "multibar",
    "multilineData": [
      { "name": "2023", "labels": ["Q1","Q2"], "values": [40,60] },
      { "name": "2024", "labels": ["Q1","Q2"], "values": [55,80] }
    ],
    "barGrouping": "clustered"
  }'
></div>
```

---

### Multi‑Series Line Chart

```html
<div
  class="chart-snapshot"
  data-chart='{
    "chartType": "multiline",
    "multilineData": [
      { "name": "Users", "labels": ["Jan","Feb"], "values": [200,260] },
      { "name": "Orders", "labels": ["Jan","Feb"], "values": [120,180] }
    ]
  }'
></div>
```

---

### Chart Metadata Reference

| Field | Description |
|----|----|
| `labels` | Category labels |
| `values` | Numeric values |
| `colors` | Chart colors |
| `showLegend` | Show legend |
| `legendColor` | Legend text color |
| `lableColor` | Data label color |
| `barGrouping` | clustered / stacked |
| `barDir` | col / bar |
| `valAxisTitle` | Y‑axis title |
| `catAxisTitle` | X‑axis title |

> ⚠️ `lableColor` spelling is intentional (matches implementation)

---

## 🧱 Project Structure (Recommended)

```txt
src/
 ├─ components/
 │   ├─ Dashboard.tsx
 │   ├─ Charts/
 │   │   └─ RevenueChart.tsx
 │
 ├─ pages/
 │   └─ DashboardPage.tsx
 │
 ├─ export/
 │   ├─ PdfExport.tsx
 │   └─ PptExport.tsx
 │
 └─ App.tsx
```

**Best practices**
- Keep export buttons outside charts (`pdfppt-noprint`)
- Wrap logical sections as panels
- Keep charts inside `chart-snapshot` containers
- Avoid deeply nested layouts

---

## 🧪 Common Issues & Fixes

| Issue | Fix |
|----|----|
| Blank chart in PPT | Invalid JSON |
| Layout overlap | Reduce `scaleFactor` |
| Too many slides | Combine panels |
| Controls visible | Missing `pdfppt-noprint` |
| Chart not editable | Missing `data-chart` |

---

## 📄 License

MIT — free for commercial and personal use.

---

## 🤝 Contributing

PRs welcome.  
If you improve layout detection, chart support, or performance, feel free to contribute.

---

**pdfppt-export** focuses on correctness and structure — not screenshots.  
If it renders well, it exports well.
