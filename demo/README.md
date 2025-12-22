# pdfppt-export — Demo & Documentation

This repository contains:

- 📦 **Library documentation** for `pdf-ppt-export-react`
- 🧪 **Live demo project** showing real-world usage
- 🧩 **Reference implementation** to understand how everything works internally

If you want to export any React dashboard or UI section to **PDF or PPTX**, this project shows exactly how to do it.

---

## 🔗 Important Links

- 📦 **Library (npm)**  
  https://www.npmjs.com/package/pdf-ppt-export-react

- 🌐 **Live Demo**  
  https://pdfppt-export.vercel.app/

- 📘 **Source Repository**  
  https://github.com/DhirajKarangale/pdfppt-export

---

## 🚀 What This Demo Shows

Export a React dashboard to:

- 📄 Multi-page PDF  
- 📊 Editable PowerPoint (PPTX)

Handles:

- Charts & graphs  
- Panels / cards  
- Text blocks & layouts  

Features:

- Uses real DOM structure (not screenshots only)
- Works with Vite / CRA / JSX / TSX

---

## 📂 Project Structure (Relevant Parts)

```
pdfppt-export/
├── demo/                  # Demo application
│   ├── src/
│   │   ├── Demo.tsx       # Main implementation example
│   │   ├── components/    # Charts, panels, UI blocks
│   │   └── utils/
│   └── package.json
│
├── pdf-ppt-export-react/  # Library source
│
└── README.md
```

👉 Start with **Demo.tsx** — it contains the full usage example.

---

## 🛠️ Getting Started (Run Demo Locally)

```bash
git clone https://github.com/DhirajKarangale/pdfppt-export
cd demo
npm install
npm run dev
```

Then open the local URL shown in the terminal.

---

## 🧪 How the Demo Works

1. A dashboard UI is rendered (charts, panels, text)
2. A ref is attached to the root container
3. PDFDownloader and PPTDownloader modals are triggered
4. The library:
   - Scans the DOM
   - Groups panels & content
   - Exports structured PDF or PPTX

All logic is fully visible and customizable.

---

## 📌 Key File to Read

### demo/src/Demo.tsx

This file shows:

- How to attach contentRef
- How to open export modals
- How to configure PDF & PPT export
- How images, charts, and layouts are handled

If you understand **Demo.tsx**, you understand the library.

---

## 📦 Using the Library in Your Own Project

```bash
npm install pdf-ppt-export-react
```

```ts
import { PDFDownloader, PPTDownloader } from "pdf-ppt-export-react";
```

Attach a ref to your dashboard and you’re ready to export.

👉 Full API & props are documented in the library README.

---

## 🎯 Who This Is For

- React developers building dashboards
- Analytics / reporting tools
- Admin panels
- Internal tools needing export to PDF / PPT
- SaaS apps needing client-ready reports

---

## 🧩 Design Principles

- Minimal API
- No lock-in
- Real editable PPT slides
- Works with existing UI
- Developer-first design

---