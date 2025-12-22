"use client"

import { Pie, PieChart, Label } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { useRef, useState, useLayoutEffect, useMemo } from "react";
import type { TooltipProps } from "recharts/types/component/Tooltip";

export type PieChartItem = {
  label: string;
  data: number;
  fill: string;
};

type ChartPieProps = {
  title: string;
  chartData:
  | PieChartItem[]
  | {
    data: PieChartItem[];
  };
};

function ChartPie({ title, chartData }: ChartPieProps) {
  const chartAreaRef = useRef<HTMLDivElement | null>(null);
  const [radii, setRadii] = useState<{ inner: number; outer: number }>({
    inner: 80,
    outer: 120,
  });

  useLayoutEffect(() => {
    const el = chartAreaRef.current
    if (!el) return

    const calc = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      if (!w || !h) return

      const screenWidth = window.innerWidth
      let horizontalPadding = 40;
      if (screenWidth >= 1024) horizontalPadding = 60;
      else if (screenWidth >= 735) horizontalPadding = 40;

      const effectiveWidth = w - horizontalPadding
      const size = Math.min(effectiveWidth, h)
      const outer = Math.max(50, size / 2 - 10)
      const thickness = Math.min(outer * 0.50, 70)
      const inner = Math.max(0, outer - thickness)
      setRadii(r => (r.outer !== outer || r.inner !== inner ? { inner, outer } : r))
    }
    calc()
    window.addEventListener("resize", calc)
    const id = setTimeout(calc, 50)
    return () => {
      window.removeEventListener("resize", calc)
      clearTimeout(id)
    }
  }, [])

  // Split chart data into pie slices and overall total value.
  // Prepare pie slices and compute aggregate value (sum of slices). If an overall row exists, prefer it; otherwise use computed sum.
  const { pieData, overallValue } = useMemo(() => {
    const dataArray = Array.isArray(chartData) ? chartData : (chartData && Array.isArray(chartData.data) ? chartData.data : []);
    const overallValue = dataArray.reduce((acc, cur) => acc + (Number(cur?.data) || 0), 0);
    return { pieData: dataArray, overallValue };
  }, [chartData]);

  // If all slices are zero Recharts draws nothing. We inject equal tiny placeholder values
  // purely for rendering while keeping displayed labels & totals at 0.
  const allZero = pieData.length > 0 && pieData.every(d => (Number(d.data) || 0) === 0);
  const pieRenderData = useMemo(() => {
    if (!pieData.length) return [];
    if (!allZero) return pieData.map(d => ({ ...d, _origData: d.data, renderValue: d.data }));
    const PLACEHOLDER = 1;
    return pieData.map(d => ({ ...d, _origData: d.data, renderValue: PLACEHOLDER }));
  }, [pieData, allZero]);

  // Metadata injected for snapshot/export (labels, values, colors).
  const chartMeta = useMemo(() => {
    if (!pieData.length) return null;
    return {
      chartType: "pie",
      labels: pieData.map(d => d.label),
      values: pieData.map(d => d.data),
      colors: pieData.map(d => d.fill),
      legendColor: "#05004E",
      lableColor: "#FFFFFF",
      showLegend: false,
      showValue: true,
    }
  }, [pieData])

  // Custom tooltip so that when all slices are zero we still show 0 (not placeholder 1)
  const PieSliceTooltip = ({
    active,
    payload,
  }: TooltipProps<number, string>) => {
    if (!active || !payload?.length) return null;
    const p = payload[0]?.payload || {};
    const value = p._origData ?? p.data ?? 0;
    return (
      <div style={{ border: '1px solid rgba(0,0,0,0.12)', background: '#F5F5F5', padding: '0.375rem 0.625rem', borderRadius: '0.375rem' }} className="text-xs shadow-xl grid gap-1">
        <div className="font-medium text-muted-foreground">{p.label}</div>
        <div className="font-mono font-semibold text-foreground tabular-nums">{value}</div>
      </div>
    );
  };

  return (
    <Card className="w-full h-full flex flex-col p-0 m-0 gap-0 rounded-[20px] shadow-[0px_4px_20px_0px_#EEEEEE80]" style={{ border: '1px solid #F8F9FA' }}>

      <CardHeader className="w-full h-[32px] mr-[19px] mt-[25px]">
        <div className="w-full text-h2 font-semibold" style={{ color: '#05004E' }}>
          {title}
        </div>
      </CardHeader>

      <CardContent
        className="w-full flex-1 mt-[10px] mb-[44px] p-0
        flex flex-col items-start justify-start gap-0 no-scrollbar">

        <div
          ref={chartAreaRef}
          className="w-full flex-1 min-h-[260px] pdfppt-chart-snapshot lg:px-[25px] md:px-[10px] sm:px-[5px]"
          {...(chartMeta ? { 'pdfppt-data-chart': JSON.stringify(chartMeta) } : {})}>

          <ChartContainer
            className="w-full h-full min-h-[240px] max-h-[640px]" config={{}}>
            <PieChart>
              <Pie
                data={pieRenderData}
                dataKey="renderValue"
                nameKey="label"
                innerRadius={radii.inner}
                outerRadius={radii.outer}
                stroke="none"
                strokeWidth={0}
                startAngle={360 + 90}
                endAngle={90}
                label={({ cx, cy, midAngle, innerRadius, outerRadius, index }) => {
                  const originalValue = Number(pieRenderData[index]?._origData ?? 0)
                  if (!allZero && originalValue <= 0) return null
                  const RADIAN = Math.PI / 180
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
                  const x = cx + radius * Math.cos(-midAngle * RADIAN)
                  const y = cy + radius * Math.sin(-midAngle * RADIAN)
                  return (
                    <text
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="text-filter-size font-bold fill-gray-200"
                    >
                      {originalValue}
                    </text>
                  )
                }}
              >
                <Label
                  position="center"
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-black text-medium font-semibold"
                          >
                            {overallValue}
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </Pie>
              <ChartTooltip cursor={false} content={<PieSliceTooltip />} />
            </PieChart>
          </ChartContainer>
        </div>

        {(() => {
          const half = Math.ceil(pieData.length / 2)
          const top = pieData.slice(0, half)
          const bottom = pieData.slice(half)
          return (
            <div className="w-full flex-shrink-0 mt-[10px] flex flex-col items-center justify-center gap-[14px]">

              <div className="flex justify-center gap-[9px]">
                {top.map(item => (
                  <div key={item.label} className="w-max flex items-center gap-1">
                    <span
                      className="lg:w-[10px] lg:h-[11px] w-[8px] h-[9px] whitespace-nowrap"
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="lg:text-small text-small font-normal text-black whitespace-nowrap">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              {bottom.length > 0 && (
                <div className="flex justify-center gap-[9px]">
                  {bottom.map(item => (
                    <div key={item.label} className="flex items-center gap-1">
                      <span
                        className="lg:w-[10px] lg:h-[11px] w-[8px] h-[9px] whitespace-nowrap"
                        style={{ backgroundColor: item.fill }}
                      />
                      <span className="lg:text-small text-small font-normal text-black whitespace-nowrap">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })()}
      </CardContent>

    </Card>
  )
}

export default ChartPie;