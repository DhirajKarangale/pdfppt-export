<!-- Replace the image URL below with your generated GitHub social preview -->
![pdfppt-export – Export React dashboards to PDF & PPTX](https://raw.githubusercontent.com/DhirajKarangale/pdfppt-export/main/Assets/Cover1.png)

# pdfppt-export

**pdfppt-export** is a lightweight React utility that lets you export any dashboard or UI section to a **multi-page PDF** or a **fully structured PowerPoint (PPTX)** using just a React ref.

No chart rewrites. No heavy setup.  
Just tag what you want, hide what you don’t, and export.

---

## ✨ What is pdfppt-export?

Most export libraries only generate screenshots.

**pdfppt-export** understands structure.

- 📄 **PDF Export** — A4 multi-page PDFs with smart slicing
- 📊 **PPTX Export** — Real slides with panels, text, shapes, and charts
- 🧠 **Layout-aware** — Detects panels automatically
- ⚡ **Drop-in modals** — Works with any React app via a `ref`

Perfect for:
- Analytics dashboards
- Admin panels
- Internal reporting tools
- Client-ready exports

---

## 🚀 Features

### PDF Export
- A4 multi-page output
- Tall content automatically sliced
- Charts rendered reliably
- Header with title & date

### PPTX Export
- Panel-based slide generation
- Real charts via metadata (not images)
- Optional branded start / end slides
- Graceful fallback to full-image slide

### Developer Experience
- React 18 compatible
- Works with Vite & CRA (JS + TS)
- Minimal API
- No chart library lock-in

---

## 📦 Installation

```bash
npm install pdfppt-export jspdf html-to-image pptxgenjs culori
```

> React 18 is required.

---

## 🧩 Basic Usage

```jsx
import { PDFDownloader, PPTDownloader } from "pdfppt-export";
import { useRef, useState } from "react";

export default function Dashboard() {
  const ref = useRef(null);
  const [showPdf, setShowPdf] = useState(false);
  const [showPpt, setShowPpt] = useState(false);

  return (
    <>
      {showPdf && (
        <PDFDownloader
          contentRef={ref}
          onClose={() => setShowPdf(false)}
        />
      )}

      {showPpt && (
        <PPTDownloader
          contentRef={ref}
          onClose={() => setShowPpt(false)}
        />
      )}

      <div ref={ref}>
        <div className="pdfppt-noprint">
          <button onClick={() => setShowPdf(true)}>Export PDF</button>
          <button onClick={() => setShowPpt(true)}>Export PPT</button>
        </div>

        {/* Dashboard content */}
      </div>
    </>
  );
}
```

---

## 📄 License

MIT — free for commercial and personal use.