# PDF & PPT Export - Best Practices Guide

## 🎯 Production-Ready Checklist

### Architecture & Code Quality

#### ✅ Component Structure
```jsx
// ✅ GOOD: Separated export logic
function Dashboard() {
  const dashboardRef = useRef(null);
  const [exportMode, setExportMode] = useState(null);

  return (
    <>
      {exportMode === 'pdf' && (
        <PDFDownloader
          contentRef={dashboardRef}
          onClose={() => setExportMode(null)}
        />
      )}
      
      <DashboardContent ref={dashboardRef} />
    </>
  );
}

// ❌ BAD: Tightly coupled export logic
function Dashboard() {
  const exportAsPDF = async () => {
    // Manually building PDF inside component
    // Hard to test, maintain, reuse
  };
}
```

#### ✅ Error Handling
```jsx
// ✅ GOOD: Error boundary wrapper
import { ErrorBoundary } from 'react-error-boundary';

function App() {
  return (
    <ErrorBoundary fallback={<ExportErrorFallback />}>
      {pdfOpen && (
        <PDFDownloader
          contentRef={dashboardRef}
          onClose={handleClose}
        />
      )}
    </ErrorBoundary>
  );
}

// ❌ BAD: No error handling
function App() {
  return (
    <PDFDownloader contentRef={dashboardRef} />
  );
}
```

#### ✅ Loading States
```jsx
// ✅ GOOD: User feedback during export
function Dashboard() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setPdfOpen(true);
  };

  return (
    <button 
      onClick={handleExport}
      disabled={isExporting}
    >
      {isExporting ? (
        <>
          <Spinner /> Exporting...
        </>
      ) : (
        'Export PDF'
      )}
    </button>
  );
}
```

---

## 📊 Chart Best Practices

### ✅ Proper Chart Structure
```jsx
// ✅ GOOD: Complete metadata + wrapper
function RevenueChart({ data }) {
  const chartMeta = useMemo(() => ({
    chartType: "bar",
    labels: data.map(d => d.quarter),
    values: data.map(d => d.revenue),
    colors: data.map(d => d.color),
    legendColor: "#1E40AF",
    lableColor: "#475569"
  }), [data]);

  return (
    <div className="ppt-group-root border rounded-lg p-6 bg-white shadow">
      <h3 className="text-lg font-semibold mb-4">Quarterly Revenue</h3>
      
      <div
        className="pdfppt-chart-snapshot"
        pdfppt-data-chart={JSON.stringify(chartMeta)}
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="quarter" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="revenue" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ❌ BAD: Missing metadata or wrapper
function RevenueChart({ data }) {
  return (
    <div className="pdfppt-chart-snapshot">
      {/* No metadata! Won't export to PPT */}
      <BarChart data={data} />
    </div>
  );
}
```

### ✅ Chart Color Consistency
```jsx
// ✅ GOOD: Shared color palette
const CHART_COLORS = {
  primary: ["#3B82F6", "#60A5FA", "#93C5FD", "#DBEAFE"],
  success: ["#10B981", "#34D399", "#6EE7B7", "#A7F3D0"],
  danger: ["#EF4444", "#F87171", "#FCA5A5", "#FECACA"],
};

function ChartCard({ type }) {
  const colors = CHART_COLORS[type] || CHART_COLORS.primary;
  
  const chartMeta = {
    chartType: "bar",
    colors: colors,  // ✅ Consistent colors
    // ...
  };
}

// ❌ BAD: Hardcoded colors everywhere
function ChartCard() {
  const chartMeta = {
    colors: ["#ff0000", "#00ff00"],  // ❌ Inconsistent
  };
}
```

### ✅ Responsive Chart Sizing
```jsx
// ✅ GOOD: Responsive container with min/max bounds
<div
  className="pdfppt-chart-snapshot w-full"
  style={{ minHeight: '300px', maxHeight: '500px' }}
>
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data}>
      {/* ... */}
    </BarChart>
  </ResponsiveContainer>
</div>

// ❌ BAD: Fixed dimensions
<BarChart width={500} height={300} data={data} />
```

---

## 🎨 Layout Best Practices

### ✅ Export-Friendly Grid
```jsx
// ✅ GOOD: Clean grid with clear boundaries
<div ref={dashboardRef} className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
  <div className="ppt-group-root border rounded-lg p-4 bg-white shadow-sm">
    <ChartCard title="Revenue" />
  </div>
  
  <div className="ppt-group-root border rounded-lg p-4 bg-white shadow-sm">
    <ChartCard title="Expenses" />
  </div>
  
  <div className="ppt-group-root border rounded-lg p-4 bg-white shadow-sm col-span-full">
    <ChartCard title="Profit Trend" />
  </div>
</div>

// ❌ BAD: Complex nested absolute positioning
<div ref={dashboardRef} className="relative">
  <div className="absolute top-0 left-0 z-10">
    <ChartCard />
  </div>
  <div className="absolute top-20 left-40 z-20">
    <ChartCard />
  </div>
</div>
```

### ✅ Consistent Spacing
```jsx
// ✅ GOOD: Predictable spacing with Tailwind
<div className="space-y-6">
  <div className="ppt-group-root border rounded-lg p-6 bg-white">
    <h3 className="text-xl font-semibold mb-4">Section 1</h3>
    <ChartComponent />
  </div>
  
  <div className="ppt-group-root border rounded-lg p-6 bg-white">
    <h3 className="text-xl font-semibold mb-4">Section 2</h3>
    <ChartComponent />
  </div>
</div>

// ❌ BAD: Inconsistent manual margins
<div>
  <div style={{ marginBottom: '23px' }}>
    <ChartComponent />
  </div>
  <div style={{ marginBottom: '47px' }}>
    <ChartComponent />
  </div>
</div>
```

### ✅ Card Structure
```jsx
// ✅ GOOD: Clear visual hierarchy
<div className="ppt-group-root border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden">
  {/* Header */}
  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
    <h3 className="text-lg font-semibold text-slate-900">Card Title</h3>
    <p className="text-sm text-slate-600">Subtitle or description</p>
  </div>
  
  {/* Content */}
  <div className="p-6">
    <ChartComponent />
  </div>
  
  {/* Footer (optional) */}
  <div className="px-6 py-3 border-t border-slate-100 bg-slate-50">
    <p className="text-xs text-slate-500">Last updated: {date}</p>
  </div>
</div>
```

---

## ⚡ Performance Best Practices

### ✅ Optimize Chart Rendering
```jsx
// ✅ GOOD: Memoized chart component
const ChartCard = memo(({ data, title }) => {
  const chartMeta = useMemo(() => ({
    chartType: "bar",
    labels: data.map(d => d.label),
    values: data.map(d => d.value),
    colors: CHART_COLORS.primary,
    legendColor: "#1E40AF",
    lableColor: "#475569"
  }), [data]);

  return (
    <div className="ppt-group-root border rounded-lg p-6 bg-white">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div
        className="pdfppt-chart-snapshot"
        pdfppt-data-chart={JSON.stringify(chartMeta)}
      >
        <BarChart data={data} />
      </div>
    </div>
  );
});

// ❌ BAD: No memoization, recreates metadata on every render
function ChartCard({ data, title }) {
  const chartMeta = {
    chartType: "bar",
    labels: data.map(d => d.label),  // ❌ Recreated every render
    // ...
  };
}
```

### ✅ Lazy Load Export Components
```jsx
// ✅ GOOD: Code-splitting for export components
const PDFDownloader = lazy(() => import('@/pdfppt/PDFDownloader'));
const PPTDownloader = lazy(() => import('@/pdfppt/PPTDownloader'));

function Dashboard() {
  const [pdfOpen, setPdfOpen] = useState(false);

  return (
    <Suspense fallback={<LoadingSpinner />}>
      {pdfOpen && (
        <PDFDownloader
          contentRef={dashboardRef}
          onClose={() => setPdfOpen(false)}
        />
      )}
    </Suspense>
  );
}
```

### ✅ Pre-load Background Images
```jsx
// ✅ GOOD: Pre-load images before opening modal
useEffect(() => {
  const images = [imgSlideStart, imgSlideMiddle, imgSlideEnd];
  images.forEach(src => {
    const img = new Image();
    img.src = src;
  });
}, []);
```

### ✅ Debounce Export Actions
```jsx
// ✅ GOOD: Prevent double-clicks
import { debounce } from 'lodash';

const handleExport = useMemo(
  () => debounce(() => {
    setPdfOpen(true);
  }, 1000, { leading: true, trailing: false }),
  []
);

<button onClick={handleExport}>Export PDF</button>
```

---

## 🔒 Security Best Practices

### ✅ Sanitize User Input
```jsx
// ✅ GOOD: Sanitize title before export
const sanitizeFilename = (name) => {
  return name
    .replace(/[^a-z0-9_\-]/gi, '_')
    .substring(0, 100);
};

<PDFDownloader
  defaultTitle={sanitizeFilename(userProvidedTitle)}
  contentRef={dashboardRef}
  onClose={handleClose}
/>

// ❌ BAD: Direct user input
<PDFDownloader
  defaultTitle={userInput}  // ❌ Could contain malicious chars
  contentRef={dashboardRef}
/>
```

### ✅ Validate Chart Metadata
```jsx
// ✅ GOOD: Schema validation
const validateChartMeta = (meta) => {
  const validTypes = ['bar', 'line', 'pie', 'doughnut', 'multibar', 'multiline'];
  
  if (!validTypes.includes(meta.chartType)) {
    throw new Error(`Invalid chartType: ${meta.chartType}`);
  }
  
  if (!Array.isArray(meta.labels) || meta.labels.length === 0) {
    throw new Error('Chart labels must be non-empty array');
  }
  
  if (!Array.isArray(meta.values) || meta.values.length !== meta.labels.length) {
    throw new Error('Values must match labels length');
  }
  
  return true;
};

const chartMeta = {
  chartType: "bar",
  labels: data.map(d => d.label),
  values: data.map(d => d.value),
  colors: CHART_COLORS.primary,
  legendColor: "#1E40AF",
  lableColor: "#475569"
};

try {
  validateChartMeta(chartMeta);
  <div pdfppt-data-chart={JSON.stringify(chartMeta)}>
    <BarChart />
  </div>
} catch (error) {
  console.error('Invalid chart metadata:', error);
}
```

---

## ♿ Accessibility Best Practices

### ✅ Accessible Export Buttons
```jsx
// ✅ GOOD: Semantic, accessible buttons
<button
  onClick={handleExportPDF}
  disabled={isExporting}
  aria-label="Export dashboard as PDF"
  aria-busy={isExporting}
  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
>
  <Download className="w-4 h-4 mr-2" aria-hidden="true" />
  {isExporting ? 'Exporting...' : 'Export PDF'}
</button>

// ❌ BAD: Non-semantic, no ARIA
<div onClick={handleExportPDF}>
  Export
</div>
```

### ✅ Keyboard Navigation
```jsx
// ✅ GOOD: Keyboard accessible modal
function ExportModal({ onClose }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
    >
      <h2 id="export-modal-title">Export PDF</h2>
      {/* ... */}
    </div>
  );
}
```

---

## 🧪 Testing Best Practices

### ✅ Unit Tests for Validation
```jsx
// ✅ GOOD: Test chart metadata validation
describe('validateChartMeta', () => {
  it('should accept valid bar chart metadata', () => {
    const meta = {
      chartType: 'bar',
      labels: ['Q1', 'Q2'],
      values: [100, 150],
      colors: ['#3B82F6', '#60A5FA'],
      legendColor: '#1E40AF',
      lableColor: '#475569'
    };
    
    expect(() => validateChartMeta(meta)).not.toThrow();
  });
  
  it('should reject invalid chart type', () => {
    const meta = {
      chartType: 'invalid',
      labels: ['Q1'],
      values: [100],
      colors: ['#3B82F6'],
      legendColor: '#1E40AF',
      lableColor: '#475569'
    };
    
    expect(() => validateChartMeta(meta)).toThrow('Invalid chartType');
  });
});
```

### ✅ Integration Tests
```jsx
// ✅ GOOD: Test export flow
describe('PDF Export', () => {
  it('should export dashboard to PDF', async () => {
    const { getByText, getByLabelText } = render(<Dashboard />);
    
    // Click export button
    fireEvent.click(getByText('Export PDF'));
    
    // Modal should appear
    expect(getByLabelText('PDF preview')).toBeInTheDocument();
    
    // Fill in title
    const titleInput = getByLabelText('Presentation title');
    fireEvent.change(titleInput, { target: { value: 'Test Report' } });
    
    // Click download
    fireEvent.click(getByText('Download PDF'));
    
    // Wait for export to complete
    await waitFor(() => {
      expect(getByText('Export PDF')).not.toBeDisabled();
    });
  });
});
```

---

## 📱 Responsive Best Practices

### ✅ Mobile-Friendly Export
```jsx
// ✅ GOOD: Responsive dashboard with export warning
function Dashboard() {
  const [showMobileWarning, setShowMobileWarning] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleExport = () => {
    if (isMobile) {
      setShowMobileWarning(true);
    } else {
      setPdfOpen(true);
    }
  };

  return (
    <>
      {showMobileWarning && (
        <Alert>
          For best results, please export from a desktop device.
          <button onClick={() => setPdfOpen(true)}>
            Export Anyway
          </button>
        </Alert>
      )}
      
      <button onClick={handleExport}>Export PDF</button>
    </>
  );
}
```

### ✅ Viewport-Specific Layouts
```jsx
// ✅ GOOD: Desktop-optimized export layout
<div
  ref={dashboardRef}
  className="
    grid 
    grid-cols-1 
    sm:grid-cols-2 
    lg:grid-cols-3 
    gap-4 
    lg:gap-6
  "
>
  {/* Cards adjust to viewport */}
</div>
```

---

## 🎨 Theming Best Practices

### ✅ Export-Safe Color Scheme
```jsx
// ✅ GOOD: Define export color palette
const EXPORT_COLORS = {
  // High contrast for readability
  text: {
    primary: '#1E293B',    // slate-900
    secondary: '#475569',  // slate-600
    muted: '#94A3B8',      // slate-400
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F8FAFC',  // slate-50
    tertiary: '#F1F5F9',   // slate-100
  },
  border: {
    light: '#E2E8F0',      // slate-200
    medium: '#CBD5E1',     // slate-300
    dark: '#94A3B8',       // slate-400
  },
  chart: {
    primary: ['#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE'],
    success: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0'],
    warning: ['#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A'],
    danger: ['#EF4444', '#F87171', '#FCA5A5', '#FECACA'],
  }
};

// Use in components
<div
  className="border rounded-lg bg-white"
  style={{
    borderColor: EXPORT_COLORS.border.light,
    color: EXPORT_COLORS.text.primary
  }}
>
  {/* Content */}
</div>
```

---

## 🚀 Deployment Best Practices

### ✅ Build Optimization
```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'export-utils': [
            'jspdf',
            'html-to-image',
            'pptxgenjs',
            'culori'
          ]
        }
      }
    }
  }
};
```

### ✅ CDN for Heavy Dependencies
```html
<!-- Optional: Load jsPDF from CDN for faster initial load -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
```

### ✅ Error Monitoring
```jsx
// ✅ GOOD: Track export failures
import * as Sentry from '@sentry/react';

async function handleExport() {
  try {
    await exportPDF();
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        component: 'PDFDownloader',
        action: 'export'
      },
      extra: {
        dashboardId: dashboard.id,
        chartCount: charts.length
      }
    });
    
    showErrorToast('Export failed. Please try again.');
  }
}
```

---

## 📊 Analytics Best Practices

### ✅ Track Export Usage
```jsx
// ✅ GOOD: Analytics tracking
import { trackEvent } from '@/utils/analytics';

const handleExportPDF = () => {
  trackEvent('export_initiated', {
    format: 'pdf',
    chartCount: charts.length,
    dashboardId: dashboard.id,
    timestamp: Date.now()
  });
  
  setPdfOpen(true);
};

const handleExportComplete = () => {
  trackEvent('export_completed', {
    format: 'pdf',
    duration: Date.now() - startTime,
    fileSize: fileSize,
    success: true
  });
  
  onClose();
};
```

---

## ✅ Summary

**Production-Ready Checklist:**
- ✅ Error boundaries around export components
- ✅ Loading states with progress feedback
- ✅ Debounced export buttons
- ✅ Validated chart metadata
- ✅ Responsive layouts with mobile warnings
- ✅ Memoized components and metadata
- ✅ Lazy-loaded export components
- ✅ Accessible UI with ARIA labels
- ✅ Comprehensive error handling
- ✅ Analytics tracking
- ✅ Build optimization

**Follow These Principles:**
1. **Separation of Concerns:** Keep export logic separate from dashboard
2. **User Feedback:** Always show progress and handle errors gracefully
3. **Performance:** Memoize, lazy load, optimize images
4. **Accessibility:** Keyboard navigation, ARIA labels, semantic HTML
5. **Testing:** Unit tests for validation, integration tests for flows
6. **Monitoring:** Track errors and usage patterns

---

**Best Practices v1.0** • Production-Ready Export System
