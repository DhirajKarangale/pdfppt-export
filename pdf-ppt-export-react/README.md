![pdfppt-export – Export React dashboards to PDF & PPTX](https://raw.githubusercontent.com/DhirajKarangale/pdfppt-export/main/Assets/Cover1.png)

# pdfppt-export

**pdfppt-export** is a React helper library that provides two drop‑in modal components —  
`PDFDownloader` and `PPTDownloader` — to export any rendered dashboard or UI section into:

- 📄 **Multi‑page A4 PDFs** with smart page breaks  
- 📊 **Structured PowerPoint (PPTX)** files with real text, shapes, panels, and charts  

Exports are generated directly from the **existing DOM** using a simple `ref` and a few lightweight CSS markers.

---

## 🧠 How the Library Works (Mental Model)

1. Wrap your dashboard inside a container referenced by `contentRef`
2. On export, the DOM is **cloned** (original DOM is never mutated)
3. Elements are processed using CSS markers:
   - UI controls removed
   - Charts converted
   - Panels detected
4. Output is generated as **PDF** or **PPTX**

If it renders correctly in the browser, it can be exported.

---

## ✨ Export Modes

### 📄 PDF Export (`PDFDownloader`)
- A4 portrait pages
- Smart block‑level slicing (elements never split across pages)
- Charts rasterized as images for reliability
- Header (title + date) on first page only
- Fallback to full snapshot if layout detection fails

### 📊 PPT Export (`PPTDownloader`)
- Real PowerPoint slides (not screenshots)
- Panels auto‑detected from DOM styles
- Text, shapes, borders recreated
- Charts rebuilt as **editable PPT charts**
- Up to **2 panels per slide**
- Optional branded start / middle / end slides

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

## ⚙️ Component Props Reference

## 📄 PDFDownloader Props

```tsx
<PDFDownloader
  contentRef={dashboardRef}
  onClose={() => {}}
  defaultTitle="Dashboard Report"
/>
```

| Prop | Required | Type | Description |
|----|----|----|----|
| `contentRef` | ✅ | `React.RefObject<HTMLElement>` | Root dashboard container to export |
| `onClose` | ✅ | `() => void` | Called on close or after download |
| `defaultTitle` | ❌ | `string` | Initial title & PDF filename |

---

## 📊 PPTDownloader Props

```tsx
<PPTDownloader
  contentRef={dashboardRef}
  onClose={() => {}}
  defaultTitle="Dashboard Deck"
  imgSlideStart="/start.png"
  imgSlideMiddle="/content.png"
  imgSlideEnd="/end.png"
  scaleFactor={1.35}
  pptWidth={13.333}
  pptHeight={7.5}
  isStartEnd={true}
  groupGapY={0}
/>
```

### Core Props

| Prop | Required | Default | Description |
|----|----|----|----|
| `contentRef` | ✅ | — | Root dashboard DOM |
| `onClose` | ✅ | — | Close handler |
| `defaultTitle` | ❌ | `"PPT Title"` | Initial title & filename |

### Layout & Scaling

| Prop | Default | Description |
|----|----|----|
| `scaleFactor` | `1.35` | Panel scaling factor |
| `pptWidth` | `13.333` | Slide width (inches) |
| `pptHeight` | `7.5` | Slide height (inches) |
| `groupGapY` | `0` | Vertical gap between panels (inches) |

### Branding & Slides

| Prop | Default | Description |
|----|----|----|
| `isStartEnd` | `true` | Include start/end slides |
| `imgSlideStart` | `undefined` | Start slide background |
| `imgSlideMiddle` | `undefined` | Content slide background |
| `imgSlideEnd` | `undefined` | End slide background |

---

## 🎨 CSS Classes (Very Important)

### `pdfppt-noprint`
Exclude UI from export.

```html
<div class="pdfppt-noprint">
  buttons, filters, dropdowns
</div>
```

### `chart-snapshot`
Marks chart containers.

```html
<div
  class="chart-snapshot"
  data-chart='{"chartType":"pie","labels":["A","B"],"values":[60,40]}'
></div>
```

### `ppt-group-root`
Forces panel grouping in PPT.

```html
<div class="ppt-group-root">
  <h3>Revenue</h3>
  <div class="chart-snapshot"></div>
</div>
```

---

## 📊 Charts — Full Guide

### Supported Chart Types

| Type | chartType |
|----|----|
| Bar | `bar` |
| Line | `line` |
| Pie | `pie` |
| Doughnut | `doughnut` |
| Multi‑bar | `multibar` |
| Multi‑line | `multiline` |

---

### Basic Chart Example

```html
<div
  class="chart-snapshot"
  data-chart='{
    "chartType": "bar",
    "labels": ["Jan","Feb","Mar"],
    "values": [120,90,150],
    "colors": ["#2563EB","#60A5FA","#93C5FD"]
  }'
></div>
```

---

### Multi‑Series Chart Example

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

## 🧱 Recommended Project Structure

```txt
src/
 ├─ components/
 ├─ charts/
 ├─ pages/
 ├─ export/
 └─ App.tsx
```

---

## 🧪 Common Issues & Fixes

| Issue | Fix |
|----|----|
| Blank chart | Invalid JSON |
| Overlap | Reduce scaleFactor |
| Controls visible | Add pdfppt-noprint |
| Image-only PPT | Missing data-chart |

---

## 📄 License

MIT

---

**pdfppt-export** focuses on correctness and structure — not screenshots.
