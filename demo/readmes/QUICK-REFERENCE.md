# PDF & PPT Export - Quick Reference Card

## 🚀 Quick Start (5 Minutes)

### 1. Install Dependencies
```bash
npm install jspdf html-to-image pptxgenjs culori
```

### 2. Import Components
```jsx
import PDFDownloader from "@/pdfppt/PDFDownloader";
import PPTDownloader from "@/pdfppt/PPTDownloader";
import "@/pdfppt/pdfppt-export.css";
```

### 3. Basic Implementation
```jsx
const dashboardRef = useRef(null);
const [pdfOpen, setPdfOpen] = useState(false);

<>
  {pdfOpen && (
    <PDFDownloader
      contentRef={dashboardRef}
      onClose={() => setPdfOpen(false)}
      defaultTitle="Report"
    />
  )}
  <div ref={dashboardRef}>
    <button onClick={() => setPdfOpen(true)}>Export</button>
    {/* Dashboard content */}
  </div>
</>
```

---

## 📋 CSS Classes Cheat Sheet

| Class | Purpose | Required? |
|-------|---------|-----------|
| `.pdfppt-noprint` | Exclude from export | For buttons/filters |
| `.pdfppt-chart-snapshot` | Chart container | For all charts |
| `.ppt-group-root` | Force PPT grouping | For borderless panels |

---

## 📊 Chart Metadata Template

### Single-Series (Bar/Line)
```jsx
const chartMeta = {
  chartType: "bar",  // or "line", "pie", "doughnut"
  labels: ["Q1", "Q2", "Q3"],
  values: [100, 150, 130],
  colors: ["#3B82F6", "#60A5FA", "#93C5FD"],
  legendColor: "#1E40AF",
  lableColor: "#475569"
};

<div
  className="pdfppt-chart-snapshot"
  pdfppt-data-chart={JSON.stringify(chartMeta)}
>
  <YourChart />
</div>
```

### Multi-Series (MultiBar/MultiLine)
```jsx
const chartMeta = {
  chartType: "multiline",
  labels: ["Jan", "Feb", "Mar"],
  datasets: [
    { label: "Sales", values: [100, 120, 110], color: "#3B82F6" },
    { label: "Costs", values: [80, 90, 85], color: "#EF4444" }
  ],
  legendColor: "#1E40AF",
  lableColor: "#475569"
};
```

---

## ⚙️ Props Quick Reference

### PDFDownloader
```jsx
<PDFDownloader
  contentRef={ref}          // Required: RefObject<HTMLElement>
  onClose={() => {}}        // Required: () => void
  defaultTitle="PDF Title"  // Optional: string
/>
```

### PPTDownloader
```jsx
<PPTDownloader
  contentRef={ref}          // Required: RefObject<HTMLElement>
  onClose={() => {}}        // Required: () => void
  defaultTitle="PPT Title"  // Optional: string
  scaleFactor={1.35}        // Optional: number (1.0-2.0)
  pptWidth={13.333}         // Optional: number (inches)
  pptHeight={7.5}           // Optional: number (inches)
  isStartEnd={true}         // Optional: boolean
  groupGapY={0}             // Optional: number (inches)
  imgSlideStart={img}       // Optional: string (image path)
  imgSlideMiddle={img}      // Optional: string
  imgSlideEnd={img}         // Optional: string
/>
```

---

## 🎯 Common Patterns

### Exclude Filters/Buttons
```jsx
<div className="pdfppt-noprint">
  <button onClick={handleExport}>Export</button>
  <FilterDropdown />
</div>
```

### Chart Container
```jsx
<div className="ppt-group-root border rounded-lg p-4 bg-white">
  <h3>Revenue Trend</h3>
  <div
    className="pdfppt-chart-snapshot"
    pdfppt-data-chart={JSON.stringify(chartMeta)}
  >
    <LineChart data={data} />
  </div>
</div>
```

### Dashboard Grid Layout
```jsx
<div ref={dashboardRef} className="grid grid-cols-2 gap-6">
  <div className="ppt-group-root border rounded-lg p-4 bg-white shadow">
    <ChartCard1 />
  </div>
  <div className="ppt-group-root border rounded-lg p-4 bg-white shadow">
    <ChartCard2 />
  </div>
</div>
```

---

## ⚠️ Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Blurry charts | Set `pixelRatio: 2` in options |
| Page breaks mid-element | Keep cards under 600px height |
| PPT panels overlap | Adjust `scaleFactor` (1.2-1.5) |
| Charts missing in PPT | Verify `chartType` is valid |
| Export hangs | Use `skipFonts: true` |
| CSS vars not working | Define on `:root` selector |

---

## 🎨 Export-Safe Layout

### ✅ Good
```jsx
<div className="grid grid-cols-2 gap-6">
  <div className="border rounded-lg p-4 bg-white shadow ppt-group-root">
    <ChartComponent />
  </div>
</div>
```

### ❌ Avoid
```jsx
<div className="relative">
  <div className="absolute top-10 left-5 z-10">
    <ChartComponent />
  </div>
</div>
```

---

## 🔥 Performance Tips

1. Use `skipFonts: true` in html-to-image options
2. Lower `pixelRatio` to 1 for faster exports
3. Reduce dashboard complexity
4. Pre-load background images
5. Show progress message to user

---

## 📖 Full Documentation

Access comprehensive docs at `/docs` route:
```jsx
import Documentation from "@/pages/Documentation";
```

---

## 🧪 Testing Checklist

- [ ] Charts have `.pdfppt-chart-snapshot` class
- [ ] Chart metadata is valid JSON
- [ ] Buttons have `.pdfppt-noprint` class
- [ ] Test in Chrome, Firefox, Safari, Edge
- [ ] Verify file downloads work
- [ ] Check export progress messages

---

## 📞 Need Help?

1. Check [Documentation.jsx](src/pages/Documentation.jsx) for complete guide
2. Review [Demo.jsx](src/pages/Demo.jsx) for working examples
3. See [PDF-PPT-EXPORT-GUIDE.md](PDF-PPT-EXPORT-GUIDE.md) for deep dive

---

**Quick Reference v1.0** • Built with React + TailwindCSS
