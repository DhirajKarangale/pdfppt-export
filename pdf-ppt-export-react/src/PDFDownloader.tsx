import jsPDF from "jspdf"
import { toPng } from "html-to-image"
import React, { useEffect, useState, useRef } from "react"

type PDFDownloaderProps = {
	onClose: () => void;
	contentRef: React.RefObject<HTMLElement | null>;
	defaultTitle?: string;
};

type LayoutState = {
	marginX: number;
	topContentMargin: number;
	bottomMargin: number;
	spacing: number;
	pageWidth: number;
	pageHeight: number;
	headerHeight: number;
	currentHeaderHeight: number;
	currentY: number;
	preparePage?: (pdf: jsPDF, includeHeader: boolean) => number;
};

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

	const blocks: HTMLElement[] = [];
	const visited = new Set<HTMLElement>();

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
 * 1. Preview phase: clone the dashboard root, rasterize chart nodes (".pdfppt-chart-snapshot") to PNG, store cloned HTML.
 * 2. Export phase: clone again, rasterize charts, then gather block-level DOM nodes sized to fit within a PDF page.
 * 3. Each block is rasterized (html-to-image), then piped through addElementWithPageBreak so items land on a page
 *    boundary before overflow, ensuring charts/cards/containers never split across pages.
 * 4. Only the first page receives the standard header (title + date + rule); subsequent pages start directly with content.

 * Charts are pre-rasterized to avoid font/SVG inconsistencies inside the PDF canvas.
 *
 * Props:
 * @param {() => void} onClose Invoked to close the dialog (also after successful download).
 * @param {React.RefObject<HTMLElement>} contentRef Ref pointing to the dashboard root being exported.
 */
// function PDFDownloader({ onClose, contentRef, defaultTitle = "PDF Title" }) {
function PDFDownloader({
	onClose,
	contentRef,
	defaultTitle = "PPT Title",
}: PDFDownloaderProps) {
	const [previewContent, setPreviewContent] = useState("")
	const [title, setTitle] = useState(defaultTitle)
	const [scale, setScale] = useState(1);
	const [msg, setMsg] = useState("Loading...");
	const previewRef = useRef<HTMLDivElement | null>(null);

	const bgColor = "#FFFFFF";

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
	* 3. Rasterize each ".pdfppt-chart-snapshot" to PNG and replace its DOM.
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
			const clone = originalNode.cloneNode(true) as HTMLElement;
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

			const originalCharts = originalNode.querySelectorAll(".pdfppt-chart-snapshot");
			const clonedCharts = clone.querySelectorAll(".pdfppt-chart-snapshot");

			await Promise.all(
				Array.from(originalCharts).map(async (chartEl, i) => {
					const cloneEl = clonedCharts[i];
					if (!(chartEl instanceof HTMLElement)) return;

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
			if (!source) return;
			
			const clonedNode = source.cloneNode(true) as HTMLElement;
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

			const originalCharts = source.querySelectorAll(".pdfppt-chart-snapshot");
			const clonedCharts = clonedNode.querySelectorAll(".pdfppt-chart-snapshot");

			await Promise.all(
				Array.from(originalCharts).map(async (chartEl, index) => {
					if (!(chartEl instanceof HTMLElement)) return;
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
		<div className="pdfppt-export-modal-overlay no-print">
			<div className="pdfppt-export-modal-container">
				<div className="pdfppt-export-modal-header">
					<h2 className="pdfppt-export-modal-title">Export PDF</h2>
				</div>

				<div className="pdfppt-export-modal-body">
					<input
						type="text"
						className="pdfppt-export-input"
						placeholder="Enter PDF title..."
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						aria-label="Presentation title"
					/>

					<div
						className="pdfppt-export-preview pdfppt-export-filter-scrollbar"
						ref={previewRef}
						role="region"
						aria-labelledby="pdf-preview-heading"
					>
						<p id="pdf-preview-heading" className="pdfppt-export-sr-only">
							PDF preview
						</p>

						{previewContent ? (
							<div className="pdfppt-export-preview-wrapper">
								<div
									className="pdfppt-export-preview-content"
									style={{
										transform: `scale(${scale * 0.8})`,
										transformOrigin: "top center",
									}}
									dangerouslySetInnerHTML={{ __html: previewContent }}
								/>
							</div>
						) : (
							<p className="pdfppt-export-preview-status" role="status">
								Generating preview...
							</p>
						)}
					</div>
				</div>

				<div className="pdfppt-export-modal-footer">
					<button onClick={onClose} className="pdfppt-export-btn pdfppt-export-btn-cancel">
						Cancel
					</button>

					<div className="pdfppt-export-footer-actions">
						<p className="pdfppt-export-footer-msg">{msg}</p>
						<button
							onClick={handleDownload}
							disabled={!!msg}
							className={`pdfppt-export-btn pdfppt-export-btn-download ${msg ? "disabled" : ""}`}
						>
							Download PDF
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}

export default PDFDownloader;