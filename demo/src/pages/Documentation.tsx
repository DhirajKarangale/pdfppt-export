import { memo, useState, useEffect, type ReactNode, } from "react";
import { FileText, Package, Palette, Plus, AlertTriangle, ChevronRight, Info, AlertCircle, Lightbulb, BookOpen, Download, Copy, Check } from "lucide-react";
import { ArrowUp, type LucideIcon } from "lucide-react";

type CodeBlockProps = {
  code: string;
  language?: string;
  title?: string;
};

type CalloutType = "info" | "warning" | "tip" | "danger";

type CalloutProps = {
  type?: CalloutType;
  children: ReactNode;
};

type SectionProps = {
  id: string;
  title: string;
  icon?: LucideIcon;
  children: ReactNode;
};

type SubSectionProps = {
  title: string;
  children: ReactNode;
};

type LibraryCardProps = {
  name: string;
  url: string;
  description: string;
};

type PropsTableRow = {
  prop: string;
  type: string;
  required: boolean;
  default?: string;
  description: string;
};

type PropsTableProps = {
  data: PropsTableRow[];
};

function CodeBlock({
  code,
  language = "jsx",
  title,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4">
      {title && (
        <div className="px-4 py-2 bg-slate-800 text-slate-300 text-sm font-medium rounded-t-lg border-b border-slate-700">
          {title}
        </div>
      )}
      <div className="relative">
        <pre className={`bg-slate-900 text-slate-100 p-4 overflow-x-auto ${title ? 'rounded-b-lg' : 'rounded-lg'} text-sm leading-relaxed`}>
          <code className={`language-${language}`}>{code}</code>
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 p-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Copy code"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function Callout({ type = "info", children }: CalloutProps) {
  const styles = {
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: <Info className="w-5 h-5 text-blue-600" />,
      text: "text-blue-900"
    },
    warning: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      icon: <AlertCircle className="w-5 h-5 text-amber-600" />,
      text: "text-amber-900"
    },
    tip: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      icon: <Lightbulb className="w-5 h-5 text-emerald-600" />,
      text: "text-emerald-900"
    },
    danger: {
      bg: "bg-red-50",
      border: "border-red-200",
      icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
      text: "text-red-900"
    }
  };

  const style = styles[type] || styles.info;

  return (
    <div className={`${style.bg} ${style.border} border-l-4 p-4 rounded-r-lg my-4`}>
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-0.5">{style.icon}</div>
        <div className={`${style.text} text-sm leading-relaxed`}>{children}</div>
      </div>
    </div>
  );
}

function Section({ id, title, icon: Icon, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-20">
      <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-slate-200">
        {Icon && <Icon className="w-7 h-7 text-blue-600" />}
        <h2 className="text-3xl font-bold text-slate-900">{title}</h2>
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

function SubSection({ title, children }: SubSectionProps) {
  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold text-slate-800 mb-4">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function LibraryCard({ name, url, description }: LibraryCardProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 bg-white border border-slate-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h4 className="font-mono font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
            {name}
          </h4>
          <p className="text-sm text-slate-600 mt-1">{description}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 flex-shrink-0 mt-0.5" />
      </div>
    </a>
  );
}

function PropsTable({ data }: PropsTableProps) {
  return (
    <div className="overflow-x-auto my-4">
      <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
        <thead>
          <tr className="bg-slate-100">
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 border-b border-slate-200">Prop</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 border-b border-slate-200">Type</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 border-b border-slate-200">Required</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 border-b border-slate-200">Default</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 border-b border-slate-200">Description</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="px-4 py-3 font-mono text-sm text-slate-900">{row.prop}</td>
              <td className="px-4 py-3 font-mono text-xs text-slate-600">{row.type}</td>
              <td className="px-4 py-3 text-center">
                {row.required ? (
                  <span className="inline-block px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded">Yes</span>
                ) : (
                  <span className="inline-block px-2 py-1 text-xs font-semibold text-slate-500 bg-slate-100 rounded">No</span>
                )}
              </td>
              <td className="px-4 py-3 font-mono text-xs text-slate-600">{row.default || "—"}</td>
              <td className="px-4 py-3 text-sm text-slate-700">{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Documentation() {
  const [activeSection, setActiveSection] = useState("introduction");
  const [isSidebarOpen, _] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const sections = [
    { id: "introduction", label: "Introduction", icon: BookOpen },
    { id: "installation", label: "Installation", icon: Package },
    { id: "architecture", label: "Architecture", icon: FileText },
    { id: "pdf-export", label: "PDF Export", icon: Download },
    { id: "ppt-export", label: "PPT Export", icon: Download },
    { id: "styling", label: "Styling Guide", icon: Palette },
    { id: "charts", label: "Adding Charts", icon: Plus },
    { id: "troubleshooting", label: "Troubleshooting", icon: AlertTriangle }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || window.pageYOffset;
      setShowScrollTop(y > 300);
    };

    // check once in case user reloads mid-page
    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  const scrollToTop = () => {
    try {
      // Prefer the document scrolling element (html / body) for window.page scrolling
      const docEl = document.scrollingElement || document.documentElement || document.body;

      // Find first obvious inner scrollable container to support apps that scroll a specific element
      const candidates = [document.querySelector('#root'), document.querySelector('main'), document.querySelector('.container'), docEl];
      const scrollContainer = candidates.find((c) => c && c.scrollHeight > c.clientHeight) || docEl;

      if (scrollContainer === docEl) {
        // Scroll the window/document
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Scroll the inner container smoothly
        // Some browsers support element.scrollTo with behavior; fallback to setInterval if not
        if (typeof scrollContainer.scrollTo === 'function') {
          scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          scrollContainer.scrollTop = 0;
        }
      }
    } catch (err) {
      // Fallback safe behavior
      window.scrollTo({ top: 0 });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <aside
            className={`${isSidebarOpen ? "block" : "hidden"
              } lg:block w-64 flex-shrink-0 sticky top-24 self-start`}
          >
            <nav className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <div className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${activeSection === section.id
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-slate-700 hover:bg-slate-50"
                        }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">{section.label}</span>
                    </button>
                  );
                })}
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 max-w-4xl">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 lg:p-12 space-y-16">

              {/* Introduction */}
              <Section id="introduction" title="Introduction" icon={BookOpen}>
                <p className="text-lg text-slate-700 leading-relaxed">
                  <strong>pdf-ppt-export-react</strong> is a React-based, DOM-driven export utility that converts your rendered dashboards into professional multi-page PDFs and editable PowerPoint presentations.
                </p>

                <Callout type="info">
                  <strong>Structure-First Approach:</strong> Unlike screenshot-based tools, this library analyzes your DOM structure, extracts panels, text, shapes, and charts, then rebuilds them as real PowerPoint elements with editable text and native charts.
                </Callout>

                <div className="grid md:grid-cols-2 gap-4 my-6">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">📄 PDF Export</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Multi-page A4 format</li>
                      <li>• Smart pagination</li>
                      <li>• High-fidelity layout</li>
                      <li>• No cross-page breaks</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200">
                    <h4 className="font-semibold text-emerald-900 mb-2">📊 PPT Export</h4>
                    <ul className="text-sm text-emerald-800 space-y-1">
                      <li>• Editable text boxes</li>
                      <li>• Real PowerPoint charts</li>
                      <li>• Preserved panels & shapes</li>
                      <li>• Custom backgrounds</li>
                    </ul>
                  </div>
                </div>

                <Callout type="warning">
                  <strong>PPT Export Maturity:</strong> PowerPoint export is complex and still evolving. It works best when you follow the documented conventions strictly. PDF export is stable and production-ready.
                </Callout>
              </Section>

              {/* Installation */}
              <Section id="installation" title="Installation" icon={Package}>
                <SubSection title="Install Core Dependencies">
                  <CodeBlock
                    language="bash"
                    code={`npm install jspdf html-to-image pptxgenjs culori`}
                  />
                  <p className="text-slate-700">
                    The export system is built into your project files. You only need to install the runtime dependencies.
                  </p>
                </SubSection>

                <SubSection title="Dependencies Explained">
                  <div className="space-y-3">
                    <LibraryCard
                      name="jspdf"
                      url="https://www.npmjs.com/package/jspdf"
                      description="Generates multi-page A4 PDFs with precise positioning and image embedding."
                    />
                    <LibraryCard
                      name="html-to-image"
                      url="https://www.npmjs.com/package/html-to-image"
                      description="Converts DOM nodes into PNG images for charts and content blocks."
                    />
                    <LibraryCard
                      name="pptxgenjs"
                      url="https://www.npmjs.com/package/pptxgenjs"
                      description="Creates native PowerPoint slides with shapes, text boxes, and charts."
                    />
                    <LibraryCard
                      name="culori"
                      url="https://www.npmjs.com/package/culori"
                      description="Normalizes CSS colors (rgb, hsl, named) into hex values for PPT rendering."
                    />
                  </div>
                </SubSection>

                <SubSection title="Peer Requirements">
                  <CodeBlock
                    language="json"
                    code={`{
  "react": ">=16.8",
  "react-dom": ">=16.8"
}`}
                  />
                </SubSection>

                <SubSection title="Import the CSS">
                  <p className="text-slate-700">
                    Import the modal styles in your main app or component:
                  </p>
                  <CodeBlock
                    language="jsx"
                    code={`import '@/pdfppt/pdfppt-export.css';`}
                  />
                </SubSection>
              </Section>

              {/* Architecture */}
              <Section id="architecture" title="Architecture Overview" icon={FileText}>
                <SubSection title="Component Responsibilities">
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <h4 className="font-semibold text-slate-900 mb-2">PDFDownloader.jsx</h4>
                      <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
                        <li>Clones dashboard DOM and stabilizes layout</li>
                        <li>Rasterizes charts to PNG using html-to-image</li>
                        <li>Collects renderable blocks that fit PDF page dimensions</li>
                        <li>Prevents elements from splitting across pages</li>
                        <li>Adds header (title + date) to first page only</li>
                        <li>Exports as multi-page A4 PDF via jsPDF</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <h4 className="font-semibold text-slate-900 mb-2">PPTDownloader.jsx</h4>
                      <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
                        <li>Assigns stable UIDs to DOM elements</li>
                        <li>Detects visually styled containers as "panels"</li>
                        <li>Extracts unique text nodes using ancestor heuristics</li>
                        <li>Parses chart metadata from data attributes</li>
                        <li>Runs layout algorithm to paginate panels across slides</li>
                        <li>Renders panels, shapes, text, and native PPT charts</li>
                        <li>Applies optional start/middle/end background images</li>
                      </ul>
                    </div>
                  </div>
                </SubSection>

                <SubSection title="Data Flow">
                  <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
                    <ol className="space-y-3 text-slate-700">
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">1</span>
                        <span><strong>User opens modal</strong> → Preview generation starts</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">2</span>
                        <span><strong>DOM cloned</strong> → CSS variables inlined, .pdfppt-noprint removed</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">3</span>
                        <span><strong>Charts rasterized</strong> → .pdfppt-chart-snapshot converted to PNG</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">4</span>
                        <span><strong>Preview displayed</strong> → User edits title</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">5</span>
                        <span><strong>User clicks Download</strong> → Export phase begins</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">6</span>
                        <span><strong>Content processed</strong> → PDF or PPT generated</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">7</span>
                        <span><strong>File saved</strong> → Modal closed via onClose callback</span>
                      </li>
                    </ol>
                  </div>
                </SubSection>

                <SubSection title="Why Export Logic is Separated">
                  <Callout type="tip">
                    <strong>Separation of Concerns:</strong> Export components are isolated from your dashboard logic. They operate on refs to the rendered DOM, meaning you don't need to modify your dashboard components or pass data manually.
                  </Callout>
                  <p className="text-slate-700">
                    This architecture ensures your dashboard remains clean and focused on presentation, while export logic handles cloning, rasterization, and file generation independently.
                  </p>
                </SubSection>
              </Section>

              {/* PDF Export */}
              <Section id="pdf-export" title="PDF Export Guide" icon={Download}>
                <SubSection title="Basic Usage">
                  <CodeBlock
                    title="Dashboard.jsx"
                    code={`import { useRef, useState } from "react";
import PDFDownloader from "@/pdfppt/PDFDownloader";

export default function Dashboard() {
  const dashboardRef = useRef(null);
  const [pdfOpen, setPdfOpen] = useState(false);

  return (
    <>
      {pdfOpen && (
        <PDFDownloader
          contentRef={dashboardRef}
          onClose={() => setPdfOpen(false)}
          defaultTitle="Dashboard Report"
        />
      )}

      <div ref={dashboardRef}>
        <div className="pdfppt-noprint">
          <button onClick={() => setPdfOpen(true)}>
            Export PDF
          </button>
        </div>

        {/* Your dashboard content */}
        <div className="grid grid-cols-2 gap-4">
          <YourChartComponent />
          <YourKPICard />
        </div>
      </div>
    </>
  );
}`}
                  />
                </SubSection>

                <SubSection title="Props Reference">
                  <PropsTable
                    data={[
                      {
                        prop: "contentRef",
                        type: "RefObject<HTMLElement>",
                        required: true,
                        default: "",
                        description: "Ref pointing to the root DOM node to export"
                      },
                      {
                        prop: "onClose",
                        type: "() => void",
                        required: true,
                        default: "",
                        description: "Callback invoked after modal close or successful download"
                      },
                      {
                        prop: "defaultTitle",
                        type: "string",
                        required: false,
                        default: '"PDF Title"',
                        description: "Default PDF title (editable in modal) and filename"
                      }
                    ]}
                  />
                </SubSection>

                <SubSection title="How It Works">
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h5 className="font-semibold text-blue-900 mb-2">1. Preview Phase</h5>
                      <p className="text-sm text-blue-800">
                        Clones dashboard DOM, inlines CSS variables, removes .pdfppt-noprint elements, rasterizes charts, and displays scaled preview.
                      </p>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h5 className="font-semibold text-blue-900 mb-2">2. Block Collection</h5>
                      <p className="text-sm text-blue-800">
                        Scans DOM tree depth-first to collect elements that fit within PDF page dimensions. Recursively breaks down oversized elements.
                      </p>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h5 className="font-semibold text-blue-900 mb-2">3. Smart Pagination</h5>
                      <p className="text-sm text-blue-800">
                        Each block is rasterized to PNG. If adding it would overflow the current page, a new page is created. Elements never split across pages.
                      </p>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h5 className="font-semibold text-blue-900 mb-2">4. Header Rendering</h5>
                      <p className="text-sm text-blue-800">
                        First page includes title, date, and horizontal rule. Subsequent pages start directly with content.
                      </p>
                    </div>
                  </div>
                </SubSection>

                <SubSection title="PDF Behavior">
                  <ul className="list-disc list-inside space-y-2 text-slate-700">
                    <li>A4 portrait orientation (595 × 842 pixels)</li>
                    <li>20px horizontal margins, 16px top margin, 20px bottom margin</li>
                    <li>Charts converted to high-DPI PNG images (pixelRatio: 2)</li>
                    <li>Automatic fallback to full dashboard snapshot if block detection fails</li>
                    <li>Font loading awaited before rendering to prevent missing glyphs</li>
                  </ul>
                </SubSection>

                <Callout type="tip">
                  <strong>Performance Optimization:</strong> For large dashboards, the export may take several seconds. Use the <code>msg</code> state to display progress like "Rendering 3 / 10...".
                </Callout>
              </Section>

              {/* PPT Export */}
              <Section id="ppt-export" title="PowerPoint Export Guide" icon={Download}>
                <SubSection title="Basic Usage">
                  <CodeBlock
                    title="Dashboard.jsx"
                    code={`import { useRef, useState } from "react";
import PPTDownloader from "@/pdfppt/PPTDownloader";
import imgSlideStart from "@/assets/slides/start.png";
import imgSlideMiddle from "@/assets/slides/middle.png";
import imgSlideEnd from "@/assets/slides/end.png";

export default function Dashboard() {
  const dashboardRef = useRef(null);
  const [pptOpen, setPptOpen] = useState(false);

  return (
    <>
      {pptOpen && (
        <PPTDownloader
          contentRef={dashboardRef}
          onClose={() => setPptOpen(false)}
          defaultTitle="Dashboard Presentation"
          imgSlideStart={imgSlideStart}
          imgSlideMiddle={imgSlideMiddle}
          imgSlideEnd={imgSlideEnd}
          scaleFactor={1.35}
          pptWidth={13.333}
          pptHeight={7.5}
          isStartEnd={true}
          groupGapY={0}
        />
      )}

      <div ref={dashboardRef}>
        <div className="pdfppt-noprint">
          <button onClick={() => setPptOpen(true)}>
            Export PPT
          </button>
        </div>

        {/* Your dashboard content */}
        <div className="ppt-group-root">
          <YourChartComponent />
        </div>
      </div>
    </>
  );
}`}
                  />
                </SubSection>

                <SubSection title="Props Reference">
                  <PropsTable
                    data={[
                      {
                        prop: "contentRef",
                        type: "RefObject<HTMLElement>",
                        required: true,
                        default: "",
                        description: "Ref pointing to the dashboard root"
                      },
                      {
                        prop: "onClose",
                        type: "() => void",
                        required: true,
                        default: "",
                        description: "Close callback"
                      },
                      {
                        prop: "defaultTitle",
                        type: "string",
                        required: false,
                        default: '"PPT Title"',
                        description: "Presentation filename & title"
                      },
                      {
                        prop: "scaleFactor",
                        type: "number",
                        required: false,
                        default: "1.35",
                        description: "Global panel scaling before layout"
                      },
                      {
                        prop: "pptWidth",
                        type: "number",
                        required: false,
                        default: "13.333",
                        description: "Slide width in inches"
                      },
                      {
                        prop: "pptHeight",
                        type: "number",
                        required: false,
                        default: "7.5",
                        description: "Slide height in inches"
                      },
                      {
                        prop: "isStartEnd",
                        type: "boolean",
                        required: false,
                        default: "true",
                        description: "Enable start & end wrapper slides"
                      },
                      {
                        prop: "groupGapY",
                        type: "number",
                        required: false,
                        default: "0",
                        description: "Vertical gap (inches) between panels"
                      },
                      {
                        prop: "imgSlideStart",
                        type: "string",
                        required: false,
                        default: "undefined",
                        description: "Start slide background image"
                      },
                      {
                        prop: "imgSlideMiddle",
                        type: "string",
                        required: false,
                        default: "undefined",
                        description: "Content slides background image"
                      },
                      {
                        prop: "imgSlideEnd",
                        type: "string",
                        required: false,
                        default: "undefined",
                        description: "End slide background image"
                      }
                    ]}
                  />
                </SubSection>

                <SubSection title="How PPT Export Works">
                  <div className="space-y-4">
                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <h5 className="font-semibold text-emerald-900 mb-2">1. DOM Analysis</h5>
                      <p className="text-sm text-emerald-800">
                        Assigns stable UIDs to all elements for consistent ordering. Scans for visually styled containers (borders, backgrounds, shadows) to identify "panels".
                      </p>
                    </div>

                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <h5 className="font-semibold text-emerald-900 mb-2">2. Content Extraction</h5>
                      <p className="text-sm text-emerald-800">
                        Collects unique text nodes (lowest unique ancestor heuristic) and chart placeholders with metadata from <code>pdfppt-data-chart</code> attributes.
                      </p>
                    </div>

                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <h5 className="font-semibold text-emerald-900 mb-2">3. Layout Algorithm</h5>
                      <p className="text-sm text-emerald-800">
                        Groups content inside panels, scales using <code>scaleFactor</code>, runs pagination algorithm to distribute panels across slides without overlap.
                      </p>
                    </div>

                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <h5 className="font-semibold text-emerald-900 mb-2">4. Native PPT Rendering</h5>
                      <p className="text-sm text-emerald-800">
                        Renders panels as shapes with borders/backgrounds, text as native text boxes, and charts as editable PowerPoint charts using PptxGenJS.
                      </p>
                    </div>
                  </div>
                </SubSection>

                <Callout type="warning">
                  <strong>PPT Complexity:</strong> PowerPoint export uses heuristics and may not handle complex absolute positioning or deeply nested layouts perfectly. Always preview the output and adjust your dashboard structure if needed.
                </Callout>

                <SubSection title="Best Practices for PPT">
                  <ul className="list-disc list-inside space-y-2 text-slate-700">
                    <li>Use card-like containers with clear borders/backgrounds</li>
                    <li>Avoid deeply nested absolute positioning</li>
                    <li>Keep text contrast high for readability</li>
                    <li>Use <code>.ppt-group-root</code> to force panel grouping</li>
                    <li>Test with different <code>scaleFactor</code> values (1.2–1.5 typical)</li>
                  </ul>
                </SubSection>
              </Section>

              {/* Styling */}
              <Section id="styling" title="Styling & CSS Guide" icon={Palette}>
                <SubSection title="Required CSS Classes">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">.pdfppt-noprint</h4>
                      <p className="text-slate-700 mb-3">
                        Excludes UI elements from export (buttons, filters, dropdowns, navigation).
                      </p>
                      <CodeBlock
                        code={`<div className="pdfppt-noprint">
  <button onClick={handleExport}>Export PDF</button>
  <FilterDropdown />
  <Navbar />
</div>`}
                      />
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">.pdfppt-chart-snapshot</h4>
                      <p className="text-slate-700 mb-3">
                        Marks chart containers for rasterization. Must include <code>pdfppt-data-chart</code> attribute with metadata.
                      </p>
                      <CodeBlock
                        code={`const chartMeta = {
  chartType: "bar",
  labels: ["Q1", "Q2", "Q3", "Q4"],
  values: [120, 150, 130, 180],
  colors: ["#3B82F6", "#60A5FA", "#93C5FD", "#DBEAFE"],
  legendColor: "#1E40AF",
  lableColor: "#1E40AF"
};

<BarChart
  data={data}
  className="pdfppt-chart-snapshot"
  pdfppt-data-chart={JSON.stringify(chartMeta)}
/>`}
                      />
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">.ppt-group-root</h4>
                      <p className="text-slate-700 mb-3">
                        Forces PPT to treat container as a grouped panel, even without visible borders.
                      </p>
                      <CodeBlock
                        code={`<div className="ppt-group-root">
  <h3 className="font-bold mb-4">Revenue Overview</h3>
  <div className="pdfppt-chart-snapshot" {...}>
    <LineChart data={revenueData} />
  </div>
</div>`}
                      />
                    </div>
                  </div>
                </SubSection>

                <SubSection title="Tailwind Layout Tips">
                  <Callout type="tip">
                    <strong>Export-Safe Layouts:</strong> Use standard Flexbox/Grid layouts. Avoid heavy use of absolute positioning or transforms that may not translate well to PDF/PPT coordinate systems.
                  </Callout>

                  <div className="space-y-3 mt-4">
                    <CodeBlock
                      title="Good: Standard Grid Layout"
                      code={`<div className="grid grid-cols-2 gap-6">
  <div className="border rounded-lg p-4 bg-white shadow">
    <ChartComponent />
  </div>
  <div className="border rounded-lg p-4 bg-white shadow">
    <KPICard />
  </div>
</div>`}
                    />

                    <CodeBlock
                      title="Avoid: Complex Absolute Positioning"
                      code={`<!-- This may not export correctly -->
<div className="relative">
  <div className="absolute top-10 left-5 z-10">
    <ChartComponent />
  </div>
  <div className="absolute top-20 left-40 z-20">
    <KPICard />
  </div>
</div>`}
                    />
                  </div>
                </SubSection>

                <SubSection title="Page Break Control (PDF)">
                  <p className="text-slate-700 mb-3">
                    PDF export automatically prevents elements from splitting. You can influence pagination by:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-slate-700">
                    <li>Keeping card heights under ~600px for reliable single-page rendering</li>
                    <li>Using clear container boundaries (borders, backgrounds)</li>
                    <li>Avoiding extremely tall single elements (will be recursively broken down)</li>
                  </ul>
                </SubSection>

                <SubSection title="Responsive Export Behavior">
                  <Callout type="info">
                    Export captures the current rendered state. If your dashboard is responsive, the export will reflect the viewport size at export time. For consistent results, export from desktop viewport.
                  </Callout>
                </SubSection>
              </Section>

              {/* Adding Charts */}
              <Section id="charts" title="Adding Charts" icon={Plus}>
                <SubSection title="Chart Structure Requirements">
                  <p className="text-slate-700 mb-4">
                    Every chart must have two components to export correctly:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-slate-700">
                    <li><strong>CSS Class:</strong> <code>.pdfppt-chart-snapshot</code> on the chart container</li>
                    <li><strong>Metadata Attribute:</strong> <code>pdfppt-data-chart</code> with JSON metadata</li>
                  </ol>
                </SubSection>

                <SubSection title="Chart Metadata Schema">
                  <CodeBlock
                    language="typescript"
                    code={`interface ChartMetadata {
  chartType: "bar" | "line" | "pie" | "doughnut" | "multibar" | "multiline";
  labels: string[];           // X-axis labels or pie slice names
  values: number[];           // Single dataset values
  colors: string[];           // Hex colors for each data point
  legendColor: string;        // Hex color for legend text
  lableColor: string;         // Hex color for axis/chart labels
  showLegend?: boolean;       // Optional: show chart legend
  datasets?: {                // For multi-series charts (multibar, multiline)
    label: string;
    values: number[];
    color: string;
  }[];
}`}
                  />
                </SubSection>

                <SubSection title="Example: Bar Chart">
                  <CodeBlock
                    title="BarChartCard.jsx"
                    code={`import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export function BarChartCard({ data }) {
  const chartMeta = {
    chartType: "bar",
    labels: data.map(d => d.name),
    values: data.map(d => d.value),
    colors: ["#3B82F6", "#60A5FA", "#93C5FD", "#DBEAFE"],
    legendColor: "#1E40AF",
    lableColor: "#475569"
  };

  return (
    <div className="p-6 bg-white rounded-lg border shadow">
      <h3 className="text-lg font-semibold mb-4">Quarterly Revenue</h3>
      
      <div
        className="pdfppt-chart-snapshot"
        pdfppt-data-chart={JSON.stringify(chartMeta)}
      >
        <BarChart width={500} height={300} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#3B82F6" />
        </BarChart>
      </div>
    </div>
  );
}`}
                  />
                </SubSection>

                <SubSection title="Example: Pie Chart">
                  <CodeBlock
                    title="PieChartCard.jsx"
                    code={`import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts";

export function PieChartCard({ data }) {
  const chartMeta = {
    chartType: "pie",
    labels: data.map(d => d.name),
    values: data.map(d => d.value),
    colors: data.map(d => d.color),
    legendColor: "#1E40AF",
    lableColor: "#FFFFFF",
    showLegend: true
  };

  return (
    <div className="p-6 bg-white rounded-lg border shadow ppt-group-root">
      <h3 className="text-lg font-semibold mb-4">Market Share</h3>
      
      <div
        className="pdfppt-chart-snapshot"
        pdfppt-data-chart={JSON.stringify(chartMeta)}
      >
        <PieChart width={400} height={400}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={120}
            label
          >
            {data.map((entry, index) => (
              <Cell key={\`cell-\${index}\`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>
    </div>
  );
}`}
                  />
                </SubSection>

                <SubSection title="Example: Multi-Series Line Chart">
                  <CodeBlock
                    title="MultiLineChartCard.jsx"
                    code={`import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export function MultiLineChartCard({ data }) {
  const chartMeta = {
    chartType: "multiline",
    labels: data.map(d => d.month),
    datasets: [
      {
        label: "Revenue",
        values: data.map(d => d.revenue),
        color: "#3B82F6"
      },
      {
        label: "Expenses",
        values: data.map(d => d.expenses),
        color: "#EF4444"
      },
      {
        label: "Profit",
        values: data.map(d => d.profit),
        color: "#10B981"
      }
    ],
    legendColor: "#1E40AF",
    lableColor: "#475569"
  };

  return (
    <div className="p-6 bg-white rounded-lg border shadow ppt-group-root">
      <h3 className="text-lg font-semibold mb-4">Financial Trends</h3>
      
      <div
        className="pdfppt-chart-snapshot"
        pdfppt-data-chart={JSON.stringify(chartMeta)}
      >
        <LineChart width={600} height={300} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="revenue" stroke="#3B82F6" />
          <Line type="monotone" dataKey="expenses" stroke="#EF4444" />
          <Line type="monotone" dataKey="profit" stroke="#10B981" />
        </LineChart>
      </div>
    </div>
  );
}`}
                  />
                </SubSection>

                <SubSection title="Supported Chart Types">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <code className="font-semibold text-slate-900">bar</code>
                      <p className="text-sm text-slate-600 mt-1">Single-series bar chart</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <code className="font-semibold text-slate-900">line</code>
                      <p className="text-sm text-slate-600 mt-1">Single-series line chart</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <code className="font-semibold text-slate-900">pie</code>
                      <p className="text-sm text-slate-600 mt-1">Pie chart with labeled slices</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <code className="font-semibold text-slate-900">doughnut</code>
                      <p className="text-sm text-slate-600 mt-1">Doughnut/donut chart variant</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <code className="font-semibold text-slate-900">multibar</code>
                      <p className="text-sm text-slate-600 mt-1">Multi-series grouped bars</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <code className="font-semibold text-slate-900">multiline</code>
                      <p className="text-sm text-slate-600 mt-1">Multi-series line chart</p>
                    </div>
                  </div>
                </SubSection>

                <SubSection title="Excluding a Chart from Export">
                  <p className="text-slate-700 mb-3">
                    Simply add <code>.pdfppt-noprint</code> to the chart container:
                  </p>
                  <CodeBlock
                    code={`<div className="pdfppt-noprint">
  <BarChart data={interactiveData} />
</div>`}
                  />
                </SubSection>

                <Callout type="tip">
                  <strong>Chart Library Compatibility:</strong> This system works with any React chart library (Recharts, Chart.js, Victory, Nivo, etc.). Just wrap it with the required class and metadata.
                </Callout>
              </Section>

              {/* Troubleshooting */}
              <Section id="troubleshooting" title="Troubleshooting" icon={AlertTriangle}>
                <SubSection title="Common Issues & Solutions">

                  <div className="space-y-6">
                    <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-red-900 mb-2">❌ Charts appear blurry in PDF</h4>
                      <p className="text-sm text-red-800 mb-3">
                        <strong>Cause:</strong> Low pixelRatio or missing font rendering.
                      </p>
                      <p className="text-sm text-red-800 mb-2"><strong>Solution:</strong></p>
                      <ul className="list-disc list-inside text-sm text-red-800 space-y-1">
                        <li>Ensure <code>pixelRatio: 2</code> in html-to-image options</li>
                        <li>Wait for fonts to load: <code>await document.fonts.ready</code></li>
                        <li>Set explicit font attributes on SVG text elements</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-red-900 mb-2">❌ Page breaks occur mid-element</h4>
                      <p className="text-sm text-red-800 mb-3">
                        <strong>Cause:</strong> Element height exceeds available page space and cannot be broken down.
                      </p>
                      <p className="text-sm text-red-800 mb-2"><strong>Solution:</strong></p>
                      <ul className="list-disc list-inside text-sm text-red-800 space-y-1">
                        <li>Reduce card/container heights to fit within ~600px</li>
                        <li>Use clear container boundaries (borders, backgrounds)</li>
                        <li>Split large content into multiple smaller cards</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-red-900 mb-2">❌ PPT panels overlap or misalign</h4>
                      <p className="text-sm text-red-800 mb-3">
                        <strong>Cause:</strong> Complex absolute positioning or incorrect scaleFactor.
                      </p>
                      <p className="text-sm text-red-800 mb-2"><strong>Solution:</strong></p>
                      <ul className="list-disc list-inside text-sm text-red-800 space-y-1">
                        <li>Use standard Flexbox/Grid layouts instead of absolute positioning</li>
                        <li>Adjust <code>scaleFactor</code> prop (try 1.2–1.5)</li>
                        <li>Add <code>groupGapY</code> to create vertical spacing between panels</li>
                        <li>Force grouping with <code>.ppt-group-root</code> class</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-red-900 mb-2">❌ Charts not appearing in PPT</h4>
                      <p className="text-sm text-red-800 mb-3">
                        <strong>Cause:</strong> Missing or malformed <code>pdfppt-data-chart</code> metadata.
                      </p>
                      <p className="text-sm text-red-800 mb-2"><strong>Solution:</strong></p>
                      <ul className="list-disc list-inside text-sm text-red-800 space-y-1">
                        <li>Verify <code>pdfppt-data-chart</code> attribute contains valid JSON</li>
                        <li>Ensure <code>chartType</code> is one of: bar, line, pie, doughnut, multibar, multiline</li>
                        <li>Check that <code>labels</code>, <code>values</code>, and <code>colors</code> arrays match in length</li>
                        <li>Validate hex color format (e.g., #3B82F6)</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-red-900 mb-2">❌ Modal CSS conflicts with app theme</h4>
                      <p className="text-sm text-red-800 mb-3">
                        <strong>Cause:</strong> Global CSS resets or theme overrides affecting modal styles.
                      </p>
                      <p className="text-sm text-red-800 mb-2"><strong>Solution:</strong></p>
                      <ul className="list-disc list-inside text-sm text-red-800 space-y-1">
                        <li>Modal CSS uses scoped isolation layer (see pdfppt-export.css)</li>
                        <li>Increase specificity if needed by wrapping modal in custom class</li>
                        <li>Use <code>!important</code> sparingly for critical style overrides</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-red-900 mb-2">❌ Export hangs or times out</h4>
                      <p className="text-sm text-red-800 mb-3">
                        <strong>Cause:</strong> Too many elements, heavy images, or network font loading.
                      </p>
                      <p className="text-sm text-red-800 mb-2"><strong>Solution:</strong></p>
                      <ul className="list-disc list-inside text-sm text-red-800 space-y-1">
                        <li>Use <code>skipFonts: true</code> in html-to-image options</li>
                        <li>Optimize large images before rendering</li>
                        <li>Reduce dashboard complexity or export in sections</li>
                        <li>Show progress message to user during export</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-red-900 mb-2">❌ CSS variables not appearing in export</h4>
                      <p className="text-sm text-red-800 mb-3">
                        <strong>Cause:</strong> CSS custom properties not inlined during cloning.
                      </p>
                      <p className="text-sm text-red-800 mb-2"><strong>Solution:</strong></p>
                      <ul className="list-disc list-inside text-sm text-red-800 space-y-1">
                        <li>Export logic automatically inlines CSS variables from :root</li>
                        <li>If issues persist, use direct color values instead of var(--color)</li>
                        <li>Ensure variables are defined on <code>:root</code> or <code>html</code> selector</li>
                      </ul>
                    </div>
                  </div>
                </SubSection>

                <SubSection title="Performance Optimization">
                  <Callout type="tip">
                    <strong>Speed Up Exports:</strong>
                    <ul className="mt-2 space-y-1">
                      <li>• Use <code>skipFonts: true</code> and <code>skipAutoScale: true</code></li>
                      <li>• Reduce <code>pixelRatio</code> to 1 for faster (but lower quality) exports</li>
                      <li>• Minimize DOM depth in export region</li>
                      <li>• Pre-load background images before opening modal</li>
                    </ul>
                  </Callout>
                </SubSection>

                <SubSection title="Debugging Tips">
                  <ol className="list-decimal list-inside space-y-2 text-slate-700">
                    <li>Check browser console for html-to-image errors</li>
                    <li>Inspect cloned DOM in debugger (pause before cleanup)</li>
                    <li>Verify contentRef.current is not null when modal opens</li>
                    <li>Test with simplified dashboard first, then add complexity</li>
                    <li>Use browser DevTools to simulate different viewports</li>
                  </ol>
                </SubSection>

                <SubSection title="Browser Compatibility">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Browser</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">PDF Export</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">PPT Export</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-100">
                          <td className="px-4 py-3 text-slate-900">Chrome 90+</td>
                          <td className="px-4 py-3 text-center text-green-600 font-semibold">✓</td>
                          <td className="px-4 py-3 text-center text-green-600 font-semibold">✓</td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="px-4 py-3 text-slate-900">Firefox 88+</td>
                          <td className="px-4 py-3 text-center text-green-600 font-semibold">✓</td>
                          <td className="px-4 py-3 text-center text-green-600 font-semibold">✓</td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="px-4 py-3 text-slate-900">Safari 14+</td>
                          <td className="px-4 py-3 text-center text-green-600 font-semibold">✓</td>
                          <td className="px-4 py-3 text-center text-amber-600 font-semibold">~</td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="px-4 py-3 text-slate-900">Edge 90+</td>
                          <td className="px-4 py-3 text-center text-green-600 font-semibold">✓</td>
                          <td className="px-4 py-3 text-center text-green-600 font-semibold">✓</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm text-slate-600 mt-3">
                    ~ Safari may have minor color rendering differences in PPT. Test thoroughly.
                  </p>
                </SubSection>

                <Callout type="info">
                  <strong>Need More Help?</strong> Check the demo implementation in <code>/src/pages/Demo.jsx</code> for a complete working example.
                </Callout>
              </Section>

            </div>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-slate-200 bg-white">
        <div className="container mx-auto px-6 text-center">
          <p className="text-slate-600 text-sm">
            Built with React, TailwindCSS, jsPDF, html-to-image, and PptxGenJS
          </p>
          <p className="text-slate-500 text-xs mt-2">
            Export your dashboards with confidence • Structure-first approach • Production-ready
          </p>
        </div>
      </footer>

      {/* Scroll To Top Button */}
      <button
        type="button"
        aria-label="Scroll to top"
        onClick={scrollToTop}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            scrollToTop();
          }
        }}
        className={`fixed right-6 bottom-6 z-50 flex items-center justify-center w-10 h-10 rounded-full border bg-white text-slate-700 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-transform duration-200 ease-out ${showScrollTop ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}
      >
        <ArrowUp className="w-4 h-4" />
      </button>
    </div>
  );
}

export default memo(Documentation);