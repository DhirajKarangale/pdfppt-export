"use client"

import { useState, useRef } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"

import ChartPie from "./components/ChartPie"
import ChartLine from "./components/ChartLine"
import ChartBar from "./components/ChartBar"
import InfoBox from "./components/InfoBox"

import { PDFDownloader, PPTDownloader } from "pdf-ppt-export-react";

function App() {
  const printRef = useRef(null)
  const [showPdfModal, setShowPdfModal] = useState(false)
  const [showPptModal, setShowPptModal] = useState(false)

  return (
    <>
      <div className="w-full h-full bg-gray-50 flex flex-col gap-6" ref={printRef}>

        <Card className="pdfppt-noprint">
          <CardHeader className="flex flex-col sm:flex-row items-center justify-between">
            <CardTitle className="text-xl">Dashboard</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setShowPdfModal(true)}>Download PDF</Button>
              <Button onClick={() => setShowPptModal(true)} variant="outline">Download PPT</Button>
            </div>
          </CardHeader>
        </Card>

        <div className="bg-transparent grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
          <div className="chart-snapshot" data-id="chart-1">
            <ChartPie title="Chart Pie" />
          </div>

          <div className="chart-snapshot" data-id="chart-1">
            <ChartLine title="Line Chart" />
          </div>

          <div className="chart-snapshot" data-id="chart-1">
            <ChartBar title="Bar Chart" />
          </div>

          <InfoBox title="Information" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pdfppt-noprint">
          <ChartPie title="Chart 2" />
          <InfoBox title="Information 4" />
        </div>
      </div>

      {showPdfModal && <PDFDownloader
        onClose={() => setShowPdfModal(false)}
        contentRef={printRef}
        defaultTitle="AABBCC"
      />}

      {showPptModal && <PPTDownloader
        onClose={() => setShowPptModal(false)}
        contentRef={printRef}
        scaleFactor={2}
        pptWidth={13.333}
        pptHeight={7.5}
        isStartEnd={true}
        groupGapY={0.5}

        imgSlideStart={null}
        imgSlideMiddle={null}
        imgSlideEnd={null}
      />}
    </>
  )
}

export default App