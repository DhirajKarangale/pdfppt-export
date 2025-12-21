# ⚛️ pdf-ppt-export-react — Demo Project

This is the **official demo & reference application** for the npm library  
**`pdf-ppt-export-react`**.

📦 **Library:** https://www.npmjs.com/package/pdf-ppt-export-react  
🌐 **Live Demo:** https://demo-pdfppt-export.vercel.app/

This project exists to **explain real behavior**, not just APIs.  
If you want to understand **how charts, CSS, and layouts affect PDF & PPT export**, this demo is the source of truth.

---

## 🎯 What This Demo Is (and Is Not)

✅ **This is**
- A real dashboard app
- A visual reference for export behavior
- A safe playground to experiment with layout & CSS
- The best way to learn the library correctly

❌ **This is not**
- The library source
- A minimal example
- A screenshot-based exporter demo

---

## 🧠 Core Idea

`pdf-ppt-export-react` supports **two very different export pipelines**:

| Export Type | Strategy | Output |
|------------|----------|--------|
| **PDF** | Full raster capture | Pixel-perfect PDF |
| **PPTX** | Semantic reconstruction | Editable PowerPoint |

This demo shows **both**, side-by-side.

---

## 📄 PDF Export — How It Really Works

Powered by `PDFDownloader`

### Key Characteristics
- **Pure raster PDF**
- What you see is exactly what you get
- Charts are always converted to images
- No text or chart is split across pages

### How Pagination Works
- DOM is analyzed into **block-sized elements**
- Each block is placed fully on a page
- If it doesn’t fit → a new page is created
- Header (title + date) appears only on the **first page**

### Important Rules
- Elements with `.pdfppt-noprint` are excluded
- Charts must use `.chart-snapshot`
- Layout depends entirely on rendered DOM

👉 **Best for:** reports, audits, sharing, printing

---

## 📊 PPT Export — How It Really Works

Powered by `PPTDownloader`

### This Is NOT an Image Export
PPT export **rebuilds your dashboard semantically** into PowerPoint:

- Text → editable text boxes
- Charts → real PPT charts
- Panels → shapes with fills & borders
- Layout → computed & paginated

### Export Pipeline (Simplified)
1. Assign stable IDs to DOM nodes
2. Deduplicate text (lowest unique container)
3. Detect **group panels** (background, border, shadow, or forced)
4. Extract charts via `data-chart` JSON
5. Run layout engine
6. Render editable slides
7. Fallback to full-image slide if no groups detected

---

## 📦 CSS & Markup Rules That Matter

### 1️⃣ `.chart-snapshot` (Required for Charts)
All charts **must** be wrapped with:
```html
<div class="chart-snapshot" data-chart='{...}'>
```

Used for:
- PDF rasterization
- PPT preview snapshot
- PPT chart reconstruction

---

### 2️⃣ `data-chart` (Required for PPT Charts)
Charts are recreated using JSON metadata:
```html
data-chart='{
  "chartType": "bar",
  "labels": ["A", "B"],
  "values": [10, 20],
  "showLegend": true
}'
```

Supports:
- `bar`, `multibar`
- `line`, `multiline`
- `pie`, `doughnut`

---

### 3️⃣ Group Detection (Panels)
An element becomes a **PPT group** if:
- It has background color, border, or shadow  
**OR**
- It has `.ppt-group-root`

Everything inside becomes part of the same slide group.

---

### 4️⃣ `.pdfppt-noprint`
Excluded from **both PDF & PPT**:
```html
<div class="pdfppt-noprint">...</div>
```

---

### 5️⃣ `data-ppt-skip`
Skips element **only in PPT export**.

---

## 📁 Project Structure

```
demo/
├── src/
│   ├── components/
│   │   ├── ChartBar.tsx
│   │   ├── ChartLine.tsx
│   │   ├── ChartPie.tsx
│   │   └── InfoBox.tsx
│   ├── App.tsx          # Export wiring + dashboard
│   ├── index.css        # Export-aware styling
│   └── main.tsx
```

---

## 🛠️ Run Locally

```bash
git clone https://github.com/DhirajKarangale/pdfppt-export
cd demo
npm install
npm run dev
```

---

## 🧪 How to Use This Demo Properly

- Change padding / borders → re-export PPT
- Remove panel background → observe grouping changes
- Modify chart metadata → see PPT chart updates
- Add `.pdfppt-noprint` → confirm exclusion

This demo is intentionally **not minimal** — it’s realistic.

---