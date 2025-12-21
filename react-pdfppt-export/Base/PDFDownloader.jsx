"use client"

import React, { useEffect, useState, useRef } from "react"
import { toPng } from "html-to-image"
import jsPDF from "jspdf"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"


const DEFAULT_LAYOUT = {
  marginX: 20,
  topContentMargin: 16,
  bottomMargin: 20,
  spacing: 16,
};

/**
 * Adds an image element to the PDF, inserting a page break when it would overflow.
 * Mutates layoutState.currentY so callers keep track of the running cursor.
 */
function addElementWithPageBreak(pdfInstance, imageData, elementWidth, elementHeight, layoutState) {
  if (!imageData || !pdfInstance) return;

  const {
    pageWidth,
    pageHeight,
    marginX,
    topContentMargin,
    bottomMargin,
    spacing,
  } = layoutState;

  if (!elementWidth || !elementHeight) {
    return;
  }

  const maxWidth = pageWidth - marginX * 2;

  const computeDisplaySize = () => {
    const headerOffset = layoutState.currentHeaderHeight || 0;
    const maxContentHeight = pageHeight - headerOffset - bottomMargin - topContentMargin;
    const widthScale = elementWidth > 0 ? Math.min(1, maxWidth / elementWidth) : 1;
    const heightScale = elementHeight > 0 && maxContentHeight > 0 ? Math.min(1, maxContentHeight / elementHeight) : 1;
    const scale = Math.min(widthScale, heightScale);
    return {
      displayWidth: Math.max(1, Math.round(elementWidth * scale)),
      displayHeight: Math.max(1, Math.round(elementHeight * scale)),
    };
  };

  let { displayWidth, displayHeight } = computeDisplaySize();

  if (layoutState.currentY + displayHeight > pageHeight - bottomMargin) {
    pdfInstance.addPage();
    const prepare = layoutState.preparePage || (() => 0);
    const headerUsed = prepare(pdfInstance, false) || 0;
    layoutState.currentHeaderHeight = headerUsed;
    layoutState.currentY = headerUsed + topContentMargin;
    ({ displayWidth, displayHeight } = computeDisplaySize());
  }

  const drawX = Math.max(marginX, Math.round((pageWidth - displayWidth) / 2));
  pdfInstance.addImage(imageData, "PNG", drawX, layoutState.currentY, displayWidth, displayHeight);
  layoutState.currentY += displayHeight + spacing;
}

/**
 * Produces a depth-first, DOM-order list of elements sized to fit on a PDF page.
 * Elements taller than the available content height are recursively broken down.
 */
function collectRenderableBlocks(rootNode, maxContentHeight, maxContentWidth) {
  if (!rootNode) return [];

  const blocks = [];
  const visited = new Set();

  const isRenderableElement = (node) =>
    node instanceof HTMLElement &&
    node.tagName !== "STYLE" &&
    node.tagName !== "SCRIPT" &&
    node.offsetHeight > 0 &&
    node.offsetWidth > 0;

  const shouldUseNodeDirectly = (node) => {
    if (!isRenderableElement(node)) return false;
    const rect = node.getBoundingClientRect();
    if (!rect || rect.height <= 0) return false;
    const widthScale = rect.width > 0 ? Math.min(1, maxContentWidth / rect.width) : 1;
    const projectedHeight = rect.height * widthScale;
    if (projectedHeight <= maxContentHeight) return true;
    const visibleChildren = Array.from(node.children).filter((child) => isRenderableElement(child));
    return visibleChildren.length === 0;
  };

  const visit = (node) => {
    if (!node || visited.has(node)) return;
    if (!isRenderableElement(node)) return;

    if (shouldUseNodeDirectly(node)) {
      blocks.push(node);
      visited.add(node);
      return;
    }

    const children = Array.from(node.children).filter((child) => isRenderableElement(child));
    if (!children.length) {
      blocks.push(node);
      visited.add(node);
      return;
    }

    children.forEach((child) => visit(child));
  };

  const initialChildren = Array.from(rootNode.children).filter((child) => isRenderableElement(child));
  if (!initialChildren.length) {
    visit(rootNode);
  } else {
    initialChildren.forEach((child) => visit(child));
  }

  return blocks;
}

/**
 * PDFDownloader (React Component)
 * Modal dialog that lets a user preview and export the referenced dashboard DOM as a PDF.
 *
 * High‑level flow:
 * 1. Preview phase: clone the dashboard root, rasterize chart nodes (".chart-snapshot") to PNG, store cloned HTML.
 * 2. Export phase: clone again, rasterize charts, then capture either a single large PNG or segmented slices
 *    (fallback when height > MAX_SINGLE_IMAGE_HEIGHT or single capture fails) and paginate into A4 pages.
 * 3. Each PDF page receives a header (title + date + horizontal rule) and centered content image slice.
 *
 * Segmented fallback rationale: browsers impose maximum canvas dimensions; very tall dashboards risk truncation.
 * Charts are pre-rasterized to avoid font/SVG inconsistencies inside the PDF canvas.
 *
 * Props:
 * @param {boolean} isOpen Controls dialog visibility.
 * @param {() => void} onClose Invoked to close the dialog (also after successful download).
 * @param {React.RefObject<HTMLElement>} contentRef Ref pointing to the dashboard root being exported.
 */
function PDFDownloader({ isOpen, onClose, contentRef }) {
  const [previewContent, setPreviewContent] = useState("")
  const [title, setTitle] = useState("CEX Dashboard Info")
  const [scale, setScale] = useState(1);
  const [msg, setMsg] = useState("Loading...");

  const previewRef = useRef(null)
  const bgColor = "#ffffff";

  const relaxOverflowingContainers = (root) => {
    if (!root || typeof root.querySelectorAll !== "function") return;
    const selectors = [
      '[data-slot="card-content"]',
      '[data-slot="scroll-area"]',
      '[data-slot="scroll-area-viewport"]',
      '[data-pdf-expand]'
    ].join(",");
    root.querySelectorAll(selectors).forEach((el) => {
      if (!(el instanceof HTMLElement)) return;
      el.style.setProperty("overflow", "visible", "important");
      el.style.setProperty("overflow-x", "visible", "important");
      el.style.setProperty("overflow-y", "visible", "important");
      el.style.setProperty("max-height", "none", "important");
      el.style.setProperty("flex", "initial", "important");
    });
  };

  /**
   * PREVIEW_IMAGE_OPTIONS
   * Configuration forwarded to html-to-image when rasterizing chart elements for preview.
   * - quality        (number) 1 = max PNG quality.
   * - pixelRatio     (number) used to increase effective DPI for sharper text.
   * - backgroundColor(string) solid backdrop to prevent transparency artifacts.
   * - skipFonts      (boolean) avoids font loading issues / CORS.
   * - skipAutoScale  (boolean) disable internal auto scaling.
   * - preferredFontFormat (string) hints font format selection.
   */
  const PREVIEW_IMAGE_OPTIONS = {
    quality: 1.0,
    pixelRatio: 2,
    backgroundColor: bgColor,
    skipFonts: true,
    skipAutoScale: true,
    preferredFontFormat: 'woff',
  }

  // If the total scroll height of the cloned node exceeds this value (in px),
  // we fall back to segmented capture instead of trying to rasterize one huge image.
  // Large single canvases can be truncated by browsers due to internal limits (~16k-32k px).
  const MAX_SINGLE_IMAGE_HEIGHT = 14000;

  useEffect(() => {
    if (!contentRef.current || !previewRef.current) return

    const originalWidth = contentRef.current.offsetWidth
    const previewWidth = previewRef.current.offsetWidth

    if (originalWidth > 0 && previewWidth > 0) {
      const computedScale = previewWidth / originalWidth
      setScale(Math.min(1, computedScale))
    }
  }, [previewContent]);


  /**
   * Returns today's date formatted as DD/MM/YYYY for use in PDF header.
   * @returns {string} e.g. "29/09/2025".
   */
  const getFormattedDate = () => {
    const now = new Date()
    const day = String(now.getDate()).padStart(2, "0")
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const year = now.getFullYear()
    return `${day}/${month}/${year}`
  }

    /**
     * Export handler: builds the PDF by rasterizing the cloned dashboard.
    * Workflow summary:
    * 1. Wait for fonts + double rAF for layout stability.
    * 2. Clone root, inline CSS variables, strip ".pdfppt-noprint" elements.
    * 3. Rasterize each ".chart-snapshot" to PNG and replace its DOM.
    * 4. Append clone off-screen, gather block-sized DOM nodes that fit within PDF bounds.
    * 5. Convert each block to PNG and call addElementWithPageBreak so the element lands wholly on the current page.
    * 6. Render standardized header (title, date, rule) on every page before placing content.
    * 7. Save PDF and invoke onClose.
     * Error handling: exceptions logged; UI state message cleared in finally.
     */
  async function handleDownload() {
    if (!contentRef.current) return

    try {
      setMsg("Generating PDF...");

      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

      const originalNode = contentRef.current;
      const clone = originalNode.cloneNode(true);
      const fullWidth = originalNode.scrollWidth;
      clone.style.width = fullWidth ? `${fullWidth}px` : `${originalNode.offsetWidth}px`;
      clone.style.maxWidth = clone.style.width;
      clone.style.overflow = 'visible';
      const styleTag = document.createElement('style');
      styleTag.textContent = `*{box-sizing:border-box !important;} body,html{margin:0;padding:0;}`;
      clone.prepend(styleTag);

      try {
        const rootStyle = getComputedStyle(document.documentElement);
        const cssVars = Array.from(rootStyle)
          .filter(k => k.startsWith('--'))
          .map(v => `${v}:${rootStyle.getPropertyValue(v)}`)
          .join(';');
        if (cssVars) {
          clone.style.cssText += ';' + cssVars;
        }
      } catch (_) { /* ignore */ }

      clone.querySelectorAll(".pdfppt-noprint").forEach((el) => el.remove());

      const originalCharts = originalNode.querySelectorAll(".chart-snapshot");
      const clonedCharts = clone.querySelectorAll(".chart-snapshot");

      await Promise.all(
        Array.from(originalCharts).map(async (chartEl, i) => {
          const cloneEl = clonedCharts[i];
          try {
            chartEl.querySelectorAll('text, tspan').forEach(t => {
              try {
                const cs = getComputedStyle(t);
                t.setAttribute('fill', cs.fill || '#000');
                t.setAttribute('font-weight', cs.fontWeight || '400');
                const fs = cs.fontSize || '12px';
                t.setAttribute('font-size', fs.replace('px', ''));
                const ff = cs.fontFamily || 'Helvetica, Arial, sans-serif';
                t.setAttribute('font-family', ff);
              } catch (_) { }
            });
            const dataUrl = await toPng(chartEl, {
              cacheBust: true,
              backgroundColor: bgColor,
              skipFonts: true,
              skipAutoScale: true,
              preferredFontFormat: 'woff',
            })

              const img = new Image()
              img.src = dataUrl
              img.style.width = "100%"
              img.style.borderRadius = "inherit"
              img.style.boxShadow = "inherit"

              await img.decode()
              cloneEl.innerHTML = ""
              cloneEl.appendChild(img)
            } catch (err) {
              console.log("Failed to render chart image", err)
            }
          })
        )

      const hiddenWrapper = document.createElement("div")
      hiddenWrapper.style.position = "fixed"
      hiddenWrapper.style.top = "-10000px"
      hiddenWrapper.style.left = "-10000px"
      hiddenWrapper.style.zIndex = "-999"
      hiddenWrapper.style.pointerEvents = "none"
      hiddenWrapper.style.background = bgColor
      hiddenWrapper.style.padding = '0'
      hiddenWrapper.appendChild(clone)
      document.body.appendChild(hiddenWrapper)

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const dateStr = getFormattedDate();
        const headerHeight = 40;

      const preparePage = (pdfInstance, includeHeader) => {
          pdfInstance.setFillColor(bgColor);
          pdfInstance.rect(0, 0, pageWidth, pageHeight, 'F');
          if (!includeHeader) {
            return 0;
          }
          const marginX = DEFAULT_LAYOUT.marginX;
          pdfInstance.setTextColor(0, 0, 0);
          pdfInstance.setFont('helvetica', 'bold');
          pdfInstance.setFontSize(20);
          pdfInstance.text(title.trim(), marginX, 30);
          pdfInstance.setTextColor(100, 100, 100);
          pdfInstance.setFont('helvetica', 'normal');
          pdfInstance.setFontSize(10);
          pdfInstance.text(dateStr, pageWidth - marginX, 30, { align: 'right' });
          pdfInstance.setDrawColor(180);
          pdfInstance.setLineWidth(0.5);
          pdfInstance.line(marginX, 36, pageWidth - marginX, 36);
          return headerHeight;
        };

      const initialHeaderHeight = preparePage(pdf, true);

      const layoutState = {
        ...DEFAULT_LAYOUT,
        pageWidth,
        pageHeight,
        headerHeight,
        currentHeaderHeight: initialHeaderHeight,
        currentY: initialHeaderHeight + DEFAULT_LAYOUT.topContentMargin,
        preparePage,
      };

      const maxContentHeight = pageHeight - headerHeight - DEFAULT_LAYOUT.bottomMargin - DEFAULT_LAYOUT.topContentMargin;
      const maxContentWidth = pageWidth - DEFAULT_LAYOUT.marginX * 2;

      const cleanup = () => {
        if (hiddenWrapper.parentNode) {
          hiddenWrapper.parentNode.removeChild(hiddenWrapper);
        }
      };

      try {
        const exportBlocks = collectRenderableBlocks(clone, maxContentHeight, maxContentWidth);
        const blocksToRender = exportBlocks.length ? exportBlocks : [clone];
        let renderedBlocks = 0;

          for (let index = 0; index < blocksToRender.length; index++) {
            const block = blocksToRender[index];
            const rect = block.getBoundingClientRect();
            if (!rect || rect.height <= 0 || rect.width <= 0) {
              continue;
            }

            setMsg(`Rendering ${index + 1} / ${blocksToRender.length}...`);
            let blockImage;
            try {
              blockImage = await toPng(block, {
                backgroundColor: bgColor,
                cacheBust: true,
                skipFonts: true,
                skipAutoScale: true,
                preferredFontFormat: 'woff',
                pixelRatio: 2,
              });
            } catch (captureErr) {
              console.log('Failed to rasterize block', captureErr);
              continue;
            }

            addElementWithPageBreak(pdf, blockImage, rect.width, rect.height, layoutState);
            renderedBlocks++;
          }

          if (renderedBlocks === 0) {
            setMsg("Rendering fallback snapshot...");
            try {
              const fallbackRect = clone.getBoundingClientRect();
              const fallbackImage = await toPng(clone, {
                backgroundColor: bgColor,
                cacheBust: true,
                skipFonts: true,
                skipAutoScale: true,
                preferredFontFormat: 'woff',
                pixelRatio: 2,
              });
              if (fallbackRect.width > 0 && fallbackRect.height > 0) {
                addElementWithPageBreak(pdf, fallbackImage, fallbackRect.width, fallbackRect.height, layoutState);
              }
            } catch (fallbackErr) {
              console.log('Fallback snapshot failed', fallbackErr);
            }
          }

          setMsg("Finalizing PDF...");
        } finally {
          cleanup();
        }

      pdf.save(`${title.trim()}.pdf`);
      onClose();
    } catch (err) {
      console.log("Error generating PDF", err)
    }
    finally {
      setMsg("");
    }
  }

  /**
   * Preview generation effect: on open (or ref change) clones dashboard, rasterizes charts, stores HTML for scaled preview.
   */
  useEffect(() => {
    if (!contentRef.current) return
    let isMounted = true

    /**
     * generatePreview: prepares a width-stabilized cloned HTML snapshot with charts replaced by PNGs for crisp preview.
     */
    const generatePreview = async () => {
      setMsg("Generating preview...");

      const source = contentRef.current;
      const clonedNode = source.cloneNode(true);
      const fullWidth = source.scrollWidth;
      clonedNode.style.width = fullWidth ? `${fullWidth}px` : `${source.offsetWidth}px`;
      clonedNode.style.maxWidth = clonedNode.style.width;
      clonedNode.style.overflow = 'visible';
      const styleTag = document.createElement('style');
      styleTag.textContent = `*{box-sizing:border-box !important;} body,html{margin:0;padding:0;}`;
      clonedNode.prepend(styleTag);

      try {
        if (document.fonts && document.fonts.ready) {
          await document.fonts.ready;
        }
      } catch (_) { }
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

      try {
        const rootStyle = getComputedStyle(document.documentElement);
        const cssVars = Array.from(rootStyle)
          .filter(k => k.startsWith('--'))
          .map(v => `${v}:${rootStyle.getPropertyValue(v)}`)
          .join(';');
        if (cssVars) clonedNode.style.cssText += ';' + cssVars;
      } catch (_) { }

      clonedNode.querySelectorAll(".pdfppt-noprint").forEach((el) => el.remove());

      const originalCharts = source.querySelectorAll(".chart-snapshot");
      const clonedCharts = clonedNode.querySelectorAll(".chart-snapshot");

      await Promise.all(
        Array.from(originalCharts).map(async (chartEl, index) => {
          try {
            chartEl.querySelectorAll('text, tspan').forEach(t => {
              try {
                const cs = getComputedStyle(t);
                t.setAttribute('fill', cs.fill || '#000');
                t.setAttribute('font-weight', cs.fontWeight || '400');
                const fs = cs.fontSize || '12px';
                t.setAttribute('font-size', fs.replace('px', ''));
                const ff = cs.fontFamily || 'Helvetica, Arial, sans-serif';
                t.setAttribute('font-family', ff);
              } catch (_) { }
            });
            const dataUrl = await toPng(chartEl, PREVIEW_IMAGE_OPTIONS)

              const img = new Image()
              img.src = dataUrl
              img.style.width = "100%"
              img.style.borderRadius = "inherit"
              img.style.boxShadow = "inherit"

              const target = clonedCharts[index]
              target.innerHTML = ""
              target.appendChild(img)
            } catch (err) {
              console.log("Chart conversion failed", err)
            }
          })
        );

      if (isMounted) {
        setPreviewContent(clonedNode.innerHTML)
      }

      setMsg("");
    }

    generatePreview();
    return () => { isMounted = false; }
  }, [contentRef]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="cex:!w-[1000px] cex:!max-w-[95vw] cex:max-h-[95vh] cex:overflow-hidden cex:border-0">
        <DialogHeader>
          <DialogTitle>Download Dashboard PDF</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <div className="cex:flex cex:flex-col cex:gap-4">
          <Input
            placeholder="Enter PDF title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="PDF title"
            aria-describedby="pdf-title-description"
          />
          <p id="pdf-title-description" className="cex:text-xs cex:text-muted-foreground cex:sr-only">
            Provide a descriptive name for the exported PDF file.
          </p>

          <ScrollArea
            className="cex:border cex:rounded-md cex:p-2 cex:max-h-[60vh] cex:overflow-auto"
            aria-labelledby="pdf-preview-heading"
            role="region"
          >
            <div className="cex:pt-2" ref={previewRef}>
              <p id="pdf-preview-heading" className="cex:text-sm cex:font-medium cex:sr-only">
                PDF preview
              </p>
              {previewContent ? (
                <div
                  style={{
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                    width: `${100 / scale}%`,
                  }}
                  dangerouslySetInnerHTML={{ __html: previewContent }}
                />
              ) : (
                <p
                  className="cex:text-muted-foreground cex:text-sm cex:text-center cex:py-4"
                  role="status"
                  aria-live="polite"
                >
                  Generating preview...
                </p>
              )}
            </div>
          </ScrollArea>

        </div>

        <DialogFooter className="cex:gap-2 cex:sm:justify-between cex:pt-2">
          <div className="cex:flex cex:items-end cex:justify-center cex:gap-[5px]">
            <Button variant="outline" className="cex:cursor-pointer" onClick={onClose}>
              Cancel
            </Button>
          </div>

          <div className="cex:flex cex:items-end cex:justify-center cex:gap-[5px]">
            <p className="cex:text-xs cex:italic cex:text-muted-foreground cex:mt-1 cex:self-center">
              {msg}
            </p>

            <Button
              className="cex:bg-sysco-primary-blue cex:hover:bg-sysco-primary-blue/80 cex:text-white cex:cursor-pointer"
              onClick={handleDownload}
              disabled={msg}
            >
              Download PDF
            </Button>
          </div>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  )
}

export default PDFDownloader;