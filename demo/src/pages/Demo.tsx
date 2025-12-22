import { memo, useRef, useState } from "react";
import { PDFDownloader, PPTDownloader } from "pdf-ppt-export-react"; 
import { Coffee, Bug, Calendar, Download, FileText, Presentation, Info } from "lucide-react";

import InfoBox from "../components/demo/InfoBox";
import ChartPie from "../components/demo/ChartPie";

import imgSlideStartLocal from "../utils/Slides/Start.PNG";
import imgSlideMiddleLocal from "../utils/Slides/Middle.png";
import imgSlideEndLocal from "../utils/Slides/End.PNG";
import demoData from "../utils/demoData.json";

type DemoProps = {
  startImg?: string;
  middleImg?: string;
  endImg?: string;
};

function Demo({ startImg, middleImg, endImg }: DemoProps) {
  const contentRef = useRef(null);
  const [isPDFDownload, setIsPDFDownload] = useState(false);
  const [isPPTDownload, setIsPPTDownload] = useState(false);
  const [isPDFProcessing, setIsPDFProcessing] = useState(false);
  const [isPPTProcessing, setIsPPTProcessing] = useState(false);

  const imgStart = startImg || imgSlideStartLocal;
  const imgMiddle = middleImg || imgSlideMiddleLocal;
  const imgEnd = endImg || imgSlideEndLocal;

  const { infoItems, infoItems2, infoItems3, chartData } = demoData;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Live Export Demo
            </h1>
            <p className="text-lg text-slate-600 mb-6">
              Interactive demonstration of PDF and PowerPoint export functionality. Use the Export controls below to generate files from this dashboard.
            </p>

            {/* Info Callout */}
            <div className="bg-blue-50 border-l-4 border-blue-200 p-4 rounded-r-lg">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <Info className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-sm text-blue-900 leading-relaxed">
                  <p className="font-semibold mb-1">What you're seeing:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-800">
                    <li>A pie chart showing team mood breakdown</li>
                    <li>Three info cards with development tips and stories</li>
                    <li>All components are marked with export classes for PDF/PPT generation</li>
                  </ul>
                  <p className="mt-3">
                    <strong>Try it:</strong> Use the export controls near the charts or in the Export section to generate PDF or PowerPoint files from this dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content - What Gets Exported */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div
            ref={contentRef}
            className="space-y-8">
            {/* Export Card - placed above charts and right-aligned */}
            <div className="flex justify-end pdfppt-noprint">
              <div className="w-full max-w-7xl">
                <div className="ml-auto w-full sm:w-auto bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900">Export Dashboard</h3>
                      <p className="text-sm text-slate-600">Download this dashboard as PDF or PowerPoint.</p>
                    </div>

                    <div className="mt-3 sm:mt-0 flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => {
                          if (isPDFProcessing || isPPTProcessing) return;
                          setIsPDFProcessing(true);
                          setIsPDFDownload(true);
                        }}
                        disabled={isPDFProcessing || isPPTProcessing}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold ${isPDFProcessing || isPPTProcessing ? 'bg-blue-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                      >
                        {isPDFProcessing ? (
                          <>
                            <Download className="w-4 h-4 animate-spin" />
                            Generating PDF...
                          </>
                        ) : (
                          <>
                            <FileText className="w-4 h-4" />
                            Download PDF
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          if (isPPTProcessing || isPDFProcessing) return;
                          setIsPPTProcessing(true);
                          setIsPPTDownload(true);
                        }}
                        disabled={isPPTProcessing || isPDFProcessing}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold ${isPPTProcessing || isPDFProcessing ? 'bg-slate-100 cursor-wait text-slate-500' : 'bg-white border border-slate-300 hover:bg-slate-50 text-slate-800'}`}
                      >
                        {isPPTProcessing ? (
                          <>
                            <Download className="w-4 h-4 animate-spin text-slate-700" />
                            Generating PPTX...
                          </>
                        ) : (
                          <>
                            <Presentation className="w-4 h-4" />
                            Download PPTX
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mt-3">
                    Exports the currently visible dashboard. PPT export is experimental and may improve over time.
                  </p>
                </div>
              </div>
            </div>

            {/* First Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <ChartPie
                  title="Team Mood Breakdown"
                  chartData={chartData}
                />
              </div>

              <div className="lg:col-span-2">
                <InfoBox
                  title="Dev Survival Tips"
                  items={infoItems}
                  icon={<Coffee />}
                  accentColor="#F59E0B"
                />
              </div>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <InfoBox
                title="Engineering Sagas"
                items={infoItems2}
                icon={<Bug />}
                accentColor="#EF4444"
              />

              <InfoBox
                title="Release Night Stories"
                items={infoItems3}
                icon={<Calendar />}
                accentColor="#3B82F6"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Export Info Section */}
      <div className="bg-white border-t border-slate-200 shadow-sm mt-12">
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              How Export Works
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">PDF Export</h3>
                </div>
                <ul className="text-sm text-slate-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Clones the dashboard DOM</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Converts charts to high-DPI images</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Smart pagination prevents page breaks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Adds header with title and date</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Generates multi-page A4 PDF</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                    <Presentation className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">PPT Export</h3>
                </div>
                <ul className="text-sm text-slate-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Analyzes DOM structure for panels</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Extracts text, shapes, and charts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Creates native PowerPoint elements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Applies custom background slides</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Generates editable PPTX file</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-sm text-emerald-800">
                <strong className="text-emerald-900">💡 Pro Tip:</strong> All components use <code className="px-1.5 py-0.5 bg-emerald-100 rounded text-emerald-900 font-mono text-xs">.pdfppt-chart-snapshot</code> and <code className="px-1.5 py-0.5 bg-emerald-100 rounded text-emerald-900 font-mono text-xs">.ppt-group-root</code> classes to ensure proper export formatting.
              </p>
            </div>

            {/* Export Section - grouped actions and helper text */}
            <div className="mt-8 p-6 bg-slate-50 rounded-lg border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Export</h3>
              <p className="text-sm text-slate-700 mb-4">Export the visible dashboard to PDF or PowerPoint. Charts are rasterized at high DPI for crisp output.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsPDFDownload(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700"
                >
                  <FileText className="w-4 h-4" /> Download PDF
                </button>

                <button
                  onClick={() => setIsPPTDownload(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-800 rounded-md text-sm font-semibold hover:bg-slate-200"
                >
                  <Presentation className="w-4 h-4" /> Download PPTX
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Modals */}
      {isPDFDownload && (
        <PDFDownloader
          onClose={() => {
            setIsPDFDownload(false);
            setIsPDFProcessing(false);
          }}
          defaultTitle="PDF Export Demo"
          contentRef={contentRef}
        />
      )}

      {isPPTDownload && (
        <PPTDownloader
          onClose={() => {
            setIsPPTDownload(false);
            setIsPPTProcessing(false);
          }}
          defaultTitle="PPT Export Demo"
          contentRef={contentRef}
          scaleFactor={2}
          pptWidth={13.333}
          pptHeight={7.5}
          isStartEnd={true}
          groupGapY={0.05}
          imgSlideStart={imgStart}
          imgSlideMiddle={null}
          imgSlideEnd={imgEnd}
        />
      )}
    </div>
  );
}


export default memo(Demo);