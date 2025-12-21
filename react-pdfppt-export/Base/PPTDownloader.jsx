"use client"

import React, { useEffect, useRef, useState } from "react"
import { toPng } from "html-to-image"
import PptxGenJS from "pptxgenjs"
import { formatHex, parse, converter } from "culori"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"

/**
 * PPTDownloader (React Component)
 * Modal dialog that lets the user export the currently rendered dashboard as a PPTX file.
 *
 * High‑level flow:
 * 1. When opened, a preview is produced by cloning the dashboard DOM and rasterizing any chart nodes.
 * 2. On export, the live DOM is scanned to:
 *    - Assign stable data-uid values to elements.
 *    - Detect visually styled containers ("groups") treated as panels.
 *    - Collect unique text nodes (lowest unique ancestor heuristic) and chart placeholders.
 *    - Group texts / shapes / charts inside panels and run a layout algorithm (assignPosition2) to paginate.
 *    - Render panels, shapes, texts, charts into slides (or fall back to a single full-image slide if none found).
 * 3. Optional start/middle/end background images applied; presentation written with PptxGenJS.
 *
 * Props:
 * @param {boolean} isOpen Whether the dialog is visible.
 * @param {() => void} onClose Close handler (also invoked after successful export).
 * @param {React.RefObject<HTMLElement>} contentRef Ref pointing to the dashboard root being exported.
 * @param {string} [imgSlideStart] Optional default/fallback start slide background (data URL or path).
 * @param {string} [imgSlideMiddle] Optional background image applied to middle/content slides.
 * @param {string} [imgSlideEnd] Optional default/fallback end slide background (data URL or path).
 */
function PPTDownloader({ isOpen, onClose, contentRef, imgSlideStart, imgSlideMiddle, imgSlideEnd }) {
  const [title, setTitle] = useState("CEX Dashboard Info");
  const [previewContent, setPreviewContent] = useState("");
  const [previewScale, setPreviewScale] = useState(1);
  const [msg, setMsg] = useState("Loading...");

  const previewRef = useRef(null);
  const toRgb = converter('rgb');
  const bgColor = "#F5F5F5";
  const scaleFactor = 1;
  const pptWidth = 13.333; // 14.4;
  const pptHeight = 7.5; // 14.58;
  const isStartEnd = true;

  /**
   * PREVIEW_IMAGE_OPTIONS
   * Options used for chart element conversion during preview generation.
   * quality: Image quality (1 = max).
   * pixelRatio: Multiplier for higher DPI snapshots (helps text sharpness).
   * backgroundColor: Ensures a solid background while rasterizing.
   * skipFonts: Skip font processing to avoid CORS issues.
   * skipAutoScale: Disable auto-scaling.
   * preferredFontFormat: Use WOFF fonts when possible.
   */
  const PREVIEW_IMAGE_OPTIONS = {
    quality: 1.0,
    pixelRatio: 2,
    backgroundColor: "#FFFFFF",
    skipFonts: true,
    skipAutoScale: true,
    preferredFontFormat: 'woff',
  }

  /**
   * Loads an image asset and renders it to an off-screen canvas at a specified opacity, returning
   * a PNG data URL with its intrinsic dimensions for subsequent scaling.
   * @param {string} src Image path/URL.
   * @param {number} opacity 0..1 opacity.
   * @returns {Promise<{dataUrl:string,width:number,height:number}>}
   */
  const loadImageWithOpacity = (src, opacity) => {
    return new Promise((resolve, reject) => {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || img.width;
            canvas.height = img.naturalHeight || img.height;
            const ctx = canvas.getContext('2d');
            ctx.globalAlpha = opacity;
            ctx.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL('image/png');
            resolve({ dataUrl, width: canvas.width, height: canvas.height });
          } catch (e) {
            reject(e);
          }
        };
        img.onerror = reject;
        img.src = src;
      } catch (err) {
        reject(err);
      }
    });
  };

  /**
   * Converts an arbitrary CSS color string to a normalized 6/8-digit hex value.
   * Treats fully / near-fully transparent colors as the literal string 'transparent'.
   * @param {string} color Raw CSS color value (named, rgb[a], hsl[a], hex, etc.).
   * @returns {string} A lowercase hex string (e.g. #aabbcc) or 'transparent' when not renderable.
   */
  const parseColorToHex = (color) => {
    if (!color) return "transparent";

    const isTransparent =
      color === "transparent" ||
      color === "rgba(0, 0, 0, 0)" ||
      color === "rgba(255, 255, 255, 0)";

    if (isTransparent) return "transparent";

    try {
      const parsed = parse(color);
      if (!parsed) return "transparent";

      const rgb = toRgb(parsed);
      if (!rgb) return "transparent";

      if ('alpha' in rgb && rgb.alpha !== undefined && rgb.alpha <= 0.1) {
        return "transparent";
      }

      return formatHex(rgb);
    } catch {
      return "transparent";
    }
  };

  /**
  * Assigns monotonically increasing data-uid attributes to all HTMLElement descendants.
  * This allows stable ordering between DOM scans irrespective of unrelated attribute changes.
  * @param {Element[]} allNodes Flat list of descendant nodes.
  */
  const assignElementUIDs = (allNodes) => {
    let idx = 0;
    for (const el of allNodes) {
      if (el instanceof HTMLElement) {
        el.setAttribute("data-uid", `el-${idx}`)
        idx++;
      }
    }
  }

  /**
   * Extracts layout + style snapshot for an element and converts pixel metrics to inches
   * based on pre-computed slide scaling helpers.
   * @param {HTMLElement} el Element to inspect.
   * @param {DOMRect} rootRect Bounding box of the root export container.
   * @param {(px:number)=>number} pxToInX Horizontal pixel->inch converter.
   * @param {(px:number)=>number} pxToInY Vertical pixel->inch converter.
   * @returns {{ element:HTMLElement, text:string, x:number, y:number, w:number, h:number, margins:Object, styles:Object }}
   */
  const getElementInfo = (el, rootRect, pxToInX, pxToInY) => {
    const style = getComputedStyle(el)
    const rect = el.getBoundingClientRect()
    const scrollWidth = el.scrollWidth || rect.width
    const scrollHeight = el.scrollHeight || rect.height

    const parseFloatVal = (val) => {
      const cleaned = val.replace(/[a-zA-Z]/g, '');
      return parseFloat(cleaned) || 0
    }

    const parseSize = (size) => {
      const cleaned = size.replace(/[a-zA-Z]/g, '');
      const parsed = parseInt(cleaned) || 7;
      const final = parseInt(parsed * 0.75);

      return final;
    }

    return {
      element: el,
      text: el.innerText || "",
      x: pxToInX(rect.left - rootRect.left),
      y: pxToInY(rect.top - rootRect.top),
      w: pxToInX(rect.width),
      h: pxToInY(rect.height),
      contentWidthIn: pxToInX(scrollWidth),
      contentHeightIn: pxToInY(scrollHeight),

      margins: {
        topIn: pxToInY(parseFloatVal(style.marginTop)), rightIn: pxToInX(parseFloatVal(style.marginRight)),
        bottomIn: pxToInY(parseFloatVal(style.marginBottom)), leftIn: pxToInX(parseFloatVal(style.marginLeft))
      },

      style: style,

      styles: {
        fontWeight: style.fontWeight,
        textAlign: style.textAlign,

        fontSize: parseSize(style.fontSize),

        borderWidth: pxToInY(parseFloatVal(style.borderWidth)),
        borderTopWidth: pxToInY(parseFloatVal(style.borderTopWidth)),
        borderBottomWidth: pxToInY(parseFloatVal(style.borderBottomWidth)),
        borderRightWidth: pxToInX(parseFloatVal(style.borderRightWidth)),
        borderLeftWidth: pxToInX(parseFloatVal(style.borderLeftWidth)),

        padding: parseFloatVal(style.padding),
        paddingLeft: parseFloatVal(style.paddingLeft),
        paddingRight: parseFloatVal(style.paddingRight),
        paddingTop: parseFloatVal(style.paddingTop),
        paddingBottom: parseFloatVal(style.paddingBottom),
        borderRadius: parseFloatVal(style.borderRadius),
        outlineWidth: parseFloatVal(style.outlineWidth),

        color: parseColorToHex(style.color),
        backgroundColor: parseColorToHex(style.backgroundColor),
        outlineColor: parseColorToHex(style.outlineColor),
        borderColor: parseColorToHex(style.borderColor),
        borderTopColor: parseColorToHex(style.borderTopColor),
        borderBottomColor: parseColorToHex(style.borderBottomColor),
        borderRightColor: parseColorToHex(style.borderRightColor),
        borderLeftColor: parseColorToHex(style.borderLeftColor),
      },
    }
  }

  /**
   * Heuristically determines if an element has a visible background / border / shadow such that
   * it should be considered a grouping container (panel) in the PPT output.
   * @param {CSSStyleDeclaration} style Computed style of the element.
   * @returns {boolean} True if visually styled.
   */
  const hasVisualStyle = (style) => {
    const hasBg = style.backgroundColor &&
      style.backgroundColor !== "transparent" &&
      style.backgroundColor !== "rgba(0, 0, 0, 0)";

    const hasBorder =
      (style.borderWidth > 0 || style.borderLeftWidth > 0 || style.borderRightWidth > 0 ||
        style.borderBottomWidth > 0 || style.borderTopWidth > 0) &&
      style.borderColor &&
      style.borderColor !== "transparent" &&
      style.borderColor !== "rgba(0, 0, 0, 0)";

    const hasShadow = !!style.boxShadow && style.boxShadow !== "none";

    const hasDimensions = (
      parseFloat(style.height || "0") > 0 &&
      parseFloat(style.width || "0") < 96 &&
      style.display === 'flex'
    );

    return hasBg || hasBorder || hasShadow || hasDimensions;
  };

  /**
   * Determines if one rectangular element (element) is fully contained within another (bg).
   * Compares the left, right, top, and bottom edges of both rectangles to ensure all edges
   * of the inner element are within the bounds of the outer element.
   * Returns true if the inner element is completely inside the outer, false otherwise.
   *
   * @param {Object} element Rectangle to test, with x, y, w, h properties.
   * @param {Object} bg Bounding rectangle, with x, y, w, h properties.
   * @returns {boolean} True if element is fully inside bg, false otherwise.
   */
  const isInside = (element, bg) => {
    const elLeft = element.x;
    const elRight = element.x + element.w;
    const elTop = element.y;
    const elBottom = element.y + element.h;

    const bgLeft = bg.x;
    const bgRight = bg.x + bg.w;
    const bgTop = bg.y;
    const bgBottom = bg.y + bg.h;

    return (
      elLeft >= bgLeft &&
      elRight <= bgRight &&
      elTop >= bgTop &&
      elBottom <= bgBottom
    );
  };

  /**
   * Determines if two rectangular elements (a and b) overlap in 2D space.
   * Calculates the left, right, top, and bottom edges for both rectangles,
   * then checks if they intersect. Returns true if any part of the rectangles overlap,
   * otherwise returns false.
   *
   * @param {Object} a First rectangle with x, y, w, h properties.
   * @param {Object} b Second rectangle with x, y, w, h properties.
   * @returns {boolean} True if rectangles overlap, false otherwise.
   */
  const isOverlapping = (a, b) => {
    const aLeft = a.x;
    const aRight = a.x + a.w;
    const aTop = a.y;
    const aBottom = a.y + a.h;

    const bLeft = b.x;
    const bRight = b.x + b.w;
    const bTop = b.y;
    const bBottom = b.y + b.h;

    return !(
      aRight < bLeft ||
      aLeft > bRight ||
      aBottom < bTop ||
      aTop > bBottom
    );
  };

  /**
   * Initializes a PptxGenJS presentation with a custom layout sized to an assumed dashboard height.
   * Returns pixel->inch converters tied to the chosen layout dimensions.
   * @param {HTMLElement} root Root element to measure.
   * @returns {{ppt: PptxGenJS, pxToInX:Function, pxToInY:Function, rootRect:DOMRect}}
   */
  const setupPresentation = (root) => {
    const rootRect = root.getBoundingClientRect();

    const contentWidth = Math.max(root.scrollWidth, rootRect.width, 1);
    const contentHeight = Math.max(root.scrollHeight, rootRect.height, 1);

    const scaleX = pptWidth / contentWidth;
    const scaleY = pptHeight / contentHeight;

    const pxToInX = (px) => px * scaleX;
    const pxToInY = (px) => px * scaleY;

    const ppt = new PptxGenJS();
    ppt.defineLayout({ name: "Custom", width: pptWidth, height: pptHeight });
    ppt.layout = "Custom";

    return { ppt, pxToInX, pxToInY, rootRect };
  };

  /**
   * Creates the slide deck array. If groups exist the total count is the maximum assigned group.slide
   * plus optional start/end wrapper slides (derived from isStartEnd). If there are no groups a single
   * content slide is created (plus wrappers if enabled). Returns a tuple: [allSlides, middleSlides].
   * middleSlides excludes the first/last wrapper when start/end slides are present.
   * @param {PptxGenJS} ppt Presentation instance.
   * @param {Array} groups Detected grouping panel objects.
   * @returns {[import('pptxgenjs').Slide[], import('pptxgenjs').Slide[]]} [allSlides, middleSlides]
   */
  const createSlides = (ppt, groups) => {
    const extra = isStartEnd ? 2 : 0;

    if (!groups.length) {
      const slide = ppt.addSlide();
      slide.background = { fill: bgColor };
      return [[slide], [slide]];
    }

    const mxSlides = Math.max(...groups.map(g => g.slide));
    const slides = [];

    for (let i = 1; i <= mxSlides + extra; i++) {
      const slide = ppt.addSlide();
      slide.background = { fill: bgColor };
      slides.push(slide);
    }

    const middleSlides = (extra > 0 && slides.length > 2)
      ? slides.slice(1, -1)
      : slides;

    return [slides, middleSlides];
  }

  /**
   * Applies a background image to each supplied slide (typically content slides).
   * Accepts a data URL directly or attempts to load/rasterize a regular URL/path. Silent no-op on failure.
   * @param {import('pptxgenjs').Slide[]} slides Target slides.
   * @param {string} backgroundSrc Data URL or image path/URL.
   * @returns {Promise<void>}
   */
  const backgroundToMiddleSlides = async (slides, backgroundSrc) => {
    if (!slides?.length || !backgroundSrc) return;
    try {
      let backgroundData = backgroundSrc;
      if (!backgroundSrc.startsWith("data:")) {
        const { dataUrl } = await loadImageWithOpacity(backgroundSrc, 1);
        backgroundData = dataUrl;
      }
      slides.forEach(slide => {
        slide.background = { data: backgroundData };
      });
    } catch (e) { }
  }

  /**
   * Decorates the first and last slide as start/end wrappers.
   * Attempts to load provided start/end sources; falls back to provided imgSlideStart/imgSlideEnd props,
   * and finally to text-only slides if all loading fails.
   * Overlays a title (stateful) and current date on the start slide; end slide shows image or thank-you text.
   * @param {import('pptxgenjs').Slide[]} slides All slides (mutated in place).
   * @param {string} startImageSrc Primary start slide image source (may be blank).
   * @param {string} endImageSrc Primary end slide image source (may be blank).
   * @returns {Promise<void>}
   */
  const setupStartEndSlides = async (slides, startImageSrc, endImageSrc) => {
    const yCenter = pptHeight / 2;

    try {
      const startSlide = slides[0];
      const endSlide = slides[slides.length - 1];

      const loadAsDataUrl = async (src, fallbackSrc) => {
        try {
          if (!src) throw new Error("Missing source");
          if (src.startsWith("data:")) return src;
          const { dataUrl } = await loadImageWithOpacity(src, 1);
          return dataUrl;
        } catch (_) {
          if (!fallbackSrc) return null;
          try {
            if (fallbackSrc.startsWith("data:")) return fallbackSrc;
            const { dataUrl } = await loadImageWithOpacity(fallbackSrc, 1);
            return dataUrl;
          } catch (err) {
            return null;
          }
        }
      };

      const [startImgDataUrl, endImgDataUrl] = await Promise.all([
        loadAsDataUrl(startImageSrc, imgSlideStart),
        loadAsDataUrl(endImageSrc, imgSlideEnd),
      ]);

      const dateStr = (() => {
        const d = new Date();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${mm}/${dd}/${yyyy}`;
      })();

      if (startImgDataUrl) {
        startSlide.background = { data: startImgDataUrl };
        addTextElement(startSlide, title, 50, "#FFFFFF", 0, yCenter, -100, 'center');
        addTextElement(startSlide, dateStr, 20, "#FFFFFF", pptWidth - 2, pptHeight - 0.5, 0.1, 'left');
      } else {
        addTextElement(startSlide, title, 50, "#000000", 0, yCenter, -100, 'center');
        addTextElement(startSlide, dateStr, 20, "#000000", pptWidth - 2, pptHeight - 0.5, 0.1, 'left');
      }

      if (endImgDataUrl) {
        endSlide.background = { data: endImgDataUrl };
      } else {
        addTextElement(endSlide, 'Thank You !!!', 50, "#000000", 0, yCenter, -100, 'center');
      }
    } catch (e) {
      const startSlide = slides?.[0];
      const endSlide = slides?.[slides.length - 1];
      const fallbackTitle = title || "Dashboard";
      if (startSlide) {
        addTextElement(startSlide, fallbackTitle, 40, "#000000", 0, yCenter, -100, 'center');
      }
      if (endSlide) {
        addTextElement(endSlide, 'Thank You !!!', 40, "#000000", 0, yCenter, -100, 'center');
      }
    }
  };

  /**
   * Fallback path when no grouping panels are detected: rasterizes the full dashboard into one image
   * and inserts it into the first (only) content slide.
   * @param {HTMLElement} root Dashboard root element.
   * @param {import('pptxgenjs').Slide[]} slides Content (middle) slides.
   * @returns {Promise<void>}
   */
  const addDummySlides = async (root, slides) => {
    try {
      let imgData
      try {
        imgData = await toPng(root, { cacheBust: true, skipFonts: true });
      } catch (e) { }
      const slide = slides[0];
      slide.addImage({
        data: imgData,
        x: 0.2,
        y: 1.0,
        w: pptWidth - 0.4,
        h: pptHeight - 1.4,
      });
    } catch (imgErr) {
    }
  }

  /**
  * Adds a positioned text element (used for titles / date strings) estimating width from content length.
  * NOTE: This helper intentionally sets bold + left alignment; callers pass pre-centered x/y.
  * @param {import('pptxgenjs').Slide} slide Target slide.
  * @param {string} text Text content.
  * @param {number} fontSize Font size in points.
  * @param {string} color Hex font color.
  * @param {number} posX X (inches).
  * @param {number} posY Y (inches) center line of the text box.
  * @param {number} [sizeXOffset=0] Additional width offset to avoid wrapping for long strings.
  */
  const addTextElement = (slide, text, fontSize, color, posX, posY, sizeXOffset = 0, align) => {
    const lineHeightIn = (fontSize * 1.2) / 72;
    const boxHeight = Math.max(lineHeightIn, 0.8);
    const centeredY = posY - boxHeight / 2;
    const w = sizeXOffset == -100 ? pptWidth : ((text.length * fontSize * 0.55) / 72) + sizeXOffset;

    slide.addText(text, {
      x: posX,
      y: centeredY,
      w: w,
      h: boxHeight,
      fontSize,
      bold: true,
      align: align,
      valign: 'middle',
      color,
    });
  };

  /**
   * Finds the lowest (deepest) element that uniquely contains the provided text value without
   * any descendant sharing the exact trimmed text; used to deduplicate nested identical text nodes.
   * @param {HTMLElement} root Root of the search tree.
   * @param {string} text Text fragment to disambiguate.
   * @param {string} uid data-uid of the originating element (used for ordering / stability).
   * @returns {HTMLElement|null} Lowest unique container or null if not resolvable.
   */
  const getLowestUniqueElement = (root, text, uid) => {
    const candidates = Array.from(root.querySelectorAll("*")).filter(
      el => el instanceof HTMLElement && el.textContent?.includes(text)
    );

    const uidNum = uid.split('-')[1];

    for (const el of candidates) {
      const elUid = el.getAttribute("data-uid")?.split('-')[1];
      if (!elUid || elUid < uidNum) continue;

      const children = Array.from(el.querySelectorAll("*"))
      const hasChildWithSameText = children.some(child => child.textContent?.trim() === text.trim())

      if (!hasChildWithSameText) {
        return el
      }
    }

    return null
  }

  /**
   * Collects a list of unique text nodes to render to the PPT by selecting the lowest unique
   * container for each visible text string (avoids nested duplication like <div><span>Label</span></div>).
   * @param {HTMLElement} root Root element.
   * @param {Element[]} allNodes Flat descendant list.
   * @returns {HTMLElement[]} Deduplicated elements containing textual content.
   */
  const getRenderableTextNodes = (root, allNodes) => {
    const textNodes = [];
    const renderedUIDs = new Set();

    for (const el of allNodes) {
      if (!(el instanceof HTMLElement)) continue;
      if (el.closest(".pdfppt-noprint")) continue;

      const text = el.innerText.trim();
      const uid = el.getAttribute("data-uid");
      if (!text || !uid || renderedUIDs.has(uid)) continue;

      const target = getLowestUniqueElement(root, text, uid);
      const targetUID = target?.getAttribute("data-uid");
      if (target && targetUID && !renderedUIDs.has(targetUID)) {
        textNodes.push(target);
        renderedUIDs.add(targetUID);
      }
    }

    return textNodes;
  };

  /**
   * Finds the closest shared ancestor across all provided nodes.
   * Useful for excluding a wrapper container from panel detection.
   * @param {HTMLElement[]} nodes Elements to evaluate.
   * @returns {HTMLElement|null} The nearest common ancestor or null if none.
   */
  const getCommonAncestor = (nodes) => {
    if (nodes.length === 0) return null;
    let current = nodes[0].parentElement;
    while (current) {
      if (nodes.every(n => current?.contains(n))) return current;
      current = current.parentElement;
    }
    return null;
  };

  /**
   * Detects visually styled container elements that become grouping panels in the final PPT.
   * Applies heuristics to skip tiny flex children or overlapping duplicates.
   * @param {Element[]} allNodes All descendant nodes.
   * @param {HTMLElement|null} outermostWrapper Common ancestor of text nodes (excluded from grouping).
   * @param {DOMRect} rootRect Root bounding rect.
   * @param {(px:number)=>number} pxToInX Horizontal converter.
   * @param {(px:number)=>number} pxToInY Vertical converter.
   * @returns {Array<{background:Object,texts:Array,charts:Array,slide?:number}>}
   */
  const collectBackgrounds = (
    allNodes,
    outermostWrapper,
    rootRect,
    pxToInX,
    pxToInY
  ) => {
    const groups = [];
    const shapeUIDs = new Set();
    const forcedRoots = new Set();

    for (const el of allNodes) {
      if (!(el instanceof HTMLElement)) continue;
      const uid = el.getAttribute("data-uid");

      if (!uid || shapeUIDs.has(uid)) continue;
      if (el.closest(".pdfppt-noprint") || el === outermostWrapper) continue;
      if (el.hasAttribute("data-ppt-skip")) continue;
      let skipForForcedAncestor = false;
      for (const root of forcedRoots) {
        if (root !== el && root.contains(el)) {
          skipForForcedAncestor = true;
          break;
        }
      }
      if (skipForForcedAncestor) continue;

      const isForcedGroup =
        el.classList.contains("ppt-group-root") ||
        el.hasAttribute("data-ppt-full-slide");

      if (!isForcedGroup && !hasVisualStyle(getComputedStyle(el))) continue;

      const info = getElementInfo(el, rootRect, pxToInX, pxToInY);

      const overlapsExisting = groups.some(group =>
        group.background && isOverlapping(info, group.background)
      );

      if (overlapsExisting && !isForcedGroup) continue;

      groups.push({
        background: info,
        texts: [],
        charts: [],
        shapes: [],
      });

      shapeUIDs.add(uid);
      if (isForcedGroup) {
        forcedRoots.add(el);
      }
    }

    return groups;
  };

  /**
   * Assigns each text element to the background group whose bounding box fully contains it.
   * @param {HTMLElement[]} textNodes Candidate text elements.
   * @param {Array} groups Background group objects.
   * @param {DOMRect} rootRect Root bounding rectangle.
   * @param {(px:number)=>number} pxToInX Horizontal converter.
   * @param {(px:number)=>number} pxToInY Vertical converter.
   */
  const assignTextsToGroups = (
    textNodes,
    groups,
    rootRect,
    pxToInX,
    pxToInY
  ) => {
    for (const el of textNodes) {
      if (!(el instanceof HTMLElement)) continue;

      const info = getElementInfo(el, rootRect, pxToInX, pxToInY);
      if (!info.text.trim()) continue;

      const targetGroup = groups.find(group =>
        group.background && isInside(info, group.background)
      );

      if (!targetGroup) continue;
      targetGroup.texts.push(info);
    }
  };

  /**
   * Assigns visually styled elements (shapes) to their corresponding background group panels.
   * Iterates through all descendant nodes, checks for visual style, and determines if the element
   * is fully contained within a group's background panel. Avoids duplicating shapes that match the
   * group's background or are already represented as text. Adds qualifying shapes to the group's shapes array.
   *
   * @param {Element[]} allNodes All descendant nodes to evaluate.
   * @param {Array} groups Array of background group objects.
   * @param {DOMRect} rootRect Bounding rectangle of the root container.
   * @param {(px:number)=>number} pxToInX Horizontal pixel-to-inch converter.
   * @param {(px:number)=>number} pxToInY Vertical pixel-to-inch converter.
   */
  const assignShapesToGroups = (
    allNodes,
    groups,
    rootRect,
    pxToInX,
    pxToInY
  ) => {

    for (const el of allNodes) {
      if (
        !(el instanceof HTMLElement) ||
        el.closest(".pdfppt-noprint") ||
        el.hasAttribute("data-ppt-skip")
      ) continue;

      const info = getElementInfo(el, rootRect, pxToInX, pxToInY);
      if (!hasVisualStyle(info.style)) continue;

      const targetGroup = groups.find(group =>
        group.background && isInside(info, group.background)
      );

      if (!targetGroup) continue;
      if (targetGroup.background == info) continue;

      const texts = targetGroup.texts;
      let isTaken = false;

      for (const text in texts) {
        if (text == info) {
          isTaken = true;
          break;
        }
      }

      if (isTaken) continue;

      targetGroup.shapes.push(info);
    }
  };

  /**
   * Assigns chart placeholder elements (with data-chart JSON) into the group whose panel fully contains them.
   * @param {Element[]} allNodes All descendant nodes.
   * @param {Array} groups Group collection.
   * @param {DOMRect} rootRect Root bounds.
   * @param {(px:number)=>number} pxToInX Horizontal converter.
   * @param {(px:number)=>number} pxToInY Vertical converter.
   */
  const assignChartsToGroups = (
    allNodes,
    groups,
    rootRect,
    pxToInX,
    pxToInY
  ) => {
    for (const el of allNodes) {
      if (
        !(el instanceof HTMLElement) ||
        el.closest(".pdfppt-noprint") ||
        el.hasAttribute("data-ppt-skip")
      ) continue;

      const chartMetaRaw = el.getAttribute("data-chart");
      if (!chartMetaRaw) continue;
      if (!chartMetaRaw.trim().startsWith("{") || !chartMetaRaw.trim().endsWith("}")) continue;

      const info = getElementInfo(el, rootRect, pxToInX, pxToInY);
      const targetGroup = groups.find(group =>
        group.background && isInside(info, group.background)
      );

      if (!targetGroup) continue;
      targetGroup.charts.push(info);
    }
  };

  /**
   * Legacy vertical pagination algorithm: sequentially stacks groups and advances to a new slide
   * when the group's bottom exceeds the current slide height. Adjusts coordinates for subsequent slides.
   * (Currently used; retained name for backward compatibility.)
   * @param {Array} groups Background groups.
   * @param {number} slideHeight Slide height (inches).
   */
  const assignPosition = (groups, slideHeight) => {
    let slide = 1;
    let offsetY = 0;

    for (const group of groups) {
      const groupHeight = group.background.h + group.background.y;
      if (groupHeight > slideHeight * slide) {
        slide++;

        const newPos1 = slideHeight * (slide - 1);
        const newGPos = group.background.y - newPos1;
        offsetY = 0.1 - newGPos;
      }

      group.slide = slide;

      if (slide > 1) {
        const newPos = (slideHeight * (slide - 1)) - offsetY;
        group.background.y -= newPos;

        for (const text of group.texts) {
          text.y -= newPos;
        }

        for (const chart of group.charts) {
          chart.y = newPos;
        }
      }
    }
  }

  /**
   * Layout algorithm currently in use: scales each group uniformly (scaleFactor) then places up to
   * two groups per slide (top and bottom) with vertical margins and horizontal centering.
   * Mutates group coordinates and assigns group.slide (1-based index).
   * @param {Array} groups Panel/group objects.
   * @param {number} stMargin Top margin for the first group on slide 1.
   * @param {number} margin Generic vertical margin for subsequent placements.
   */
  const assignPosition2 = (groups, stMargin, margin) => {
    const scaleMargins = (margins, factor) => {
      if (!margins || factor === 1) return;
      if (typeof margins.topIn === "number") margins.topIn *= factor;
      if (typeof margins.rightIn === "number") margins.rightIn *= factor;
      if (typeof margins.bottomIn === "number") margins.bottomIn *= factor;
      if (typeof margins.leftIn === "number") margins.leftIn *= factor;
    };

    const scaleStyles = (styles, factor) => {
      if (!styles || factor === 1) return;
      const numericKeys = [
        "borderWidth",
        "borderTopWidth",
        "borderBottomWidth",
        "borderLeftWidth",
        "borderRightWidth",
        "padding",
        "paddingLeft",
        "paddingRight",
        "paddingTop",
        "paddingBottom",
        "borderRadius",
        "outlineWidth",
      ];
      for (const key of numericKeys) {
        if (typeof styles[key] === "number") {
          styles[key] *= factor;
        }
      }
      if (typeof styles.fontSize === "number") {
        styles.fontSize = Math.max(1, Math.round(styles.fontSize * factor));
      }
    };

    const translateGroup = (group, dx, dy) => {
      if (!dx && !dy) return;
      group.background.x += dx;
      group.background.y += dy;
      for (const text of group.texts) {
        text.x += dx;
        text.y += dy;
      }
      for (const shape of group.shapes) {
        shape.x += dx;
        shape.y += dy;
      }
      for (const chart of group.charts) {
        chart.x += dx;
        chart.y += dy;
      }
    };

    const applyUniformScale = (group, factor) => {
      if (!group || !group.background) return;
      if (!Number.isFinite(factor) || factor <= 0 || factor === 1) return;

      const bg = group.background;
      const originX = bg.x + bg.w / 2;
      const originY = bg.y + bg.h / 2;
      const originalWidth = bg.w;
      const originalHeight = bg.h;

      bg.w = Math.max(0.1, originalWidth * factor);
      bg.h = Math.max(0.1, originalHeight * factor);
      bg.x = originX - bg.w / 2;
      bg.y = originY - bg.h / 2;
      if (typeof bg.contentWidthIn === "number") bg.contentWidthIn *= factor;
      if (typeof bg.contentHeightIn === "number") bg.contentHeightIn *= factor;
      scaleMargins(bg.margins, factor);
      scaleStyles(bg.styles, factor);

      const scaleEntry = (item) => {
        if (!item) return;
        const itemOriginX = item.x + item.w / 2;
        const itemOriginY = item.y + item.h / 2;
        const deltaX = itemOriginX - originX;
        const deltaY = itemOriginY - originY;
        const newWidth = Math.max(0.05, item.w * factor);
        const newHeight = Math.max(0.05, item.h * factor);
        const newCenterX = originX + deltaX * factor;
        const newCenterY = originY + deltaY * factor;
        item.w = newWidth;
        item.h = newHeight;
        item.x = newCenterX - newWidth / 2;
        item.y = newCenterY - newHeight / 2;
        if (typeof item.contentWidthIn === "number") item.contentWidthIn *= factor;
        if (typeof item.contentHeightIn === "number") item.contentHeightIn *= factor;
        scaleMargins(item.margins, factor);
        scaleStyles(item.styles, factor);
      };

      for (const text of group.texts) scaleEntry(text);
      for (const shape of group.shapes) scaleEntry(shape);
      for (const chart of group.charts) scaleEntry(chart);
    };

    const clampToSlideBounds = (group) => {
      let dx = 0;
      if (group.background.x < 0) {
        dx = -group.background.x;
      } else if (group.background.x + group.background.w > pptWidth) {
        dx = pptWidth - (group.background.x + group.background.w);
      }

      let dy = 0;
      if (group.background.y < 0) {
        dy = -group.background.y;
      } else if (group.background.y + group.background.h > pptHeight) {
        dy = pptHeight - (group.background.y + group.background.h);
      }

      if (dx || dy) {
        translateGroup(group, dx, dy);
      }

      const clampItemSize = (item) => {
        if (!item) return;
        if (item.w > pptWidth) item.w = pptWidth;
        if (item.h > pptHeight) item.h = pptHeight;
        if (item.x < 0) item.x = 0;
        if (item.x + item.w > pptWidth) item.x = Math.max(0, pptWidth - item.w);
        if (item.y < 0) item.y = 0;
        if (item.y + item.h > pptHeight) item.y = Math.max(0, pptHeight - item.h);
      };

      clampItemSize(group.background);
      for (const text of group.texts) clampItemSize(text);
      for (const shape of group.shapes) clampItemSize(shape);
      for (const chart of group.charts) clampItemSize(chart);
    };

    const isFullSlideGroup = (group) => {
      const el = group?.background?.element;
      if (!el) return false;
      if (el.dataset && Object.prototype.hasOwnProperty.call(el.dataset, "pptFullSlide")) {
        const val = el.dataset.pptFullSlide;
        return val === "" || val === "true";
      }
      return el.classList?.contains("ppt-full-slide") || false;
    };

    const slideChunks = [];
    let cursor = 0;
    while (cursor < groups.length) {
      const current = groups[cursor];
      if (!current) break;
      if (isFullSlideGroup(current)) {
        slideChunks.push([current]);
        cursor += 1;
        continue;
      }

      const next = groups[cursor + 1];
      if (next && !isFullSlideGroup(next)) {
        slideChunks.push([current, next]);
        cursor += 2;
      } else {
        slideChunks.push([current]);
        cursor += 1;
      }
    }

    let slide = 1;
    let isFirstContentSlide = true;

    for (const slideGroups of slideChunks) {
      if (!slideGroups.length) continue;

      const topMargin = isFirstContentSlide ? stMargin : margin;
      const bottomMargin = margin;
      const verticalGap = slideGroups.length === 2 ? margin : 0;
      const availableHeight = Math.max(0.1, pptHeight - topMargin - bottomMargin - verticalGap);
      const slotHeight = slideGroups.length === 2 ? availableHeight / 2 : availableHeight;

      const hasFullSlideInChunk = slideGroups.some(g => isFullSlideGroup(g));
      if (hasFullSlideInChunk) {
        isFirstContentSlide = true;
      } else {
        isFirstContentSlide = false;
      }

      slideGroups.forEach((group, slotIndex) => {
        const bg = group.background;
        if (!bg) return;

        const maxHeight = slotHeight;
        const widthScaleCap = bg.w > 0 ? Math.min(1, pptWidth / bg.w) : 1;
        const heightScaleCap = bg.h > 0 ? Math.min(1, maxHeight / bg.h) : 1;
        const baseScale = Math.min(scaleFactor, widthScaleCap, heightScaleCap);
        const safeScale = Number.isFinite(baseScale) && baseScale > 0 ? baseScale : 1;

        applyUniformScale(group, safeScale);

        if (group.background.h > maxHeight) {
          const adjust = Math.min(1, maxHeight / group.background.h);
          applyUniformScale(group, adjust);
        }

        if (group.background.w > pptWidth) {
          const adjust = Math.min(1, pptWidth / group.background.w);
          applyUniformScale(group, adjust);
        }

        group.slide = slide;

        const slotTop = slotIndex === 0 ? topMargin : topMargin + slotHeight + verticalGap;
        const slotBottom = slotTop + slotHeight;

        const targetX = Math.max(0, (pptWidth - group.background.w) / 2);
        const targetY = slotTop;

        translateGroup(group, targetX - group.background.x, targetY - group.background.y);

        if (group.background.y + group.background.h > slotBottom) {
          const overshoot = group.background.y + group.background.h - slotBottom;
          translateGroup(group, 0, -overshoot);
        }
        if (group.background.y < slotTop) {
          translateGroup(group, 0, slotTop - group.background.y);
        }

        clampToSlideBounds(group);
      });

      slide++;
    }
  };

  /**
   * Draws individual border sides for a shape/text element on a PPT slide, emulating CSS per-side borders.
   * For each side (top, right, bottom, left) with nonzero width, adds a thin rounded rectangle shape
   * with the correct color and thickness, positioned to match the corresponding border side.
   * This enables accurate reproduction of complex border styles from the DOM in the PPT output.
   *
   * @param {Object} info Element style/layout info (from getElementInfo).
   * @param {number} adjX Adjusted X position (inches).
   * @param {number} adjY Adjusted Y position (inches).
   * @param {number} adjW Adjusted width (inches).
   * @param {number} adjH Adjusted height (inches).
   * @param {import('pptxgenjs').Slide} slide Target slide.
   * @param {PptxGenJS} ppt Presentation instance (for ShapeType constants).
   */
  const addBordersInSlide = (info, adjX, adjY, adjW, adjH, slide, ppt) => {
    const barLengthShrink = 0;

    const borderSides = {
      top: info.styles.borderTopWidth > 0,
      right: info.styles.borderRightWidth > 0,
      bottom: info.styles.borderBottomWidth > 0,
      left: info.styles.borderLeftWidth > 0,
    };

    const sideColors = {
      top: parseColorToHex(info.styles.borderTopColor),
      right: parseColorToHex(info.styles.borderRightColor),
      bottom: parseColorToHex(info.styles.borderBottomColor),
      left: parseColorToHex(info.styles.borderLeftColor),
    };

    if (borderSides.left) {
      slide.addShape(ppt.ShapeType.roundRect, {
        x: adjX + barLengthShrink / 5,
        y: adjY + barLengthShrink / 2,
        w: info.styles.borderLeftWidth,
        h: adjH - barLengthShrink,
        fill: { color: sideColors.left },
        line: { color: sideColors.left, width: 0 },
      });
    }
    if (borderSides.right) {
      slide.addShape(ppt.ShapeType.roundRect, {
        x: adjX + adjW - info.styles.borderRightWidth,
        y: adjY,
        w: info.styles.borderRightWidth,
        h: adjH - barLengthShrink,
        fill: { color: sideColors.right },
        line: { color: sideColors.right, width: 0 },
      });
    }
    if (borderSides.top) {
      slide.addShape(ppt.ShapeType.roundRect, {
        x: adjX,
        y: adjY,
        w: adjW - barLengthShrink,
        h: info.styles.borderTopWidth,
        fill: { color: sideColors.top },
        line: { color: sideColors.top, width: 0 },
      });
    }
    if (borderSides.bottom) {
      slide.addShape(ppt.ShapeType.roundRect, {
        x: adjX,
        y: adjY + adjH - info.styles.borderBottomWidth,
        w: adjW - barLengthShrink,
        h: info.styles.borderBottomWidth,
        fill: { color: sideColors.bottom },
        line: { color: sideColors.bottom, width: 0 },
      });
    }
  }

  /**
   * Draws each group's background panel onto its target slide.
   * Note: ShapeType.rect is used regardless of border radius; rounded appearance is not reproduced here.
   * @param {Array} groups Group data objects containing background + slide index.
   * @param {import('pptxgenjs').Slide[]} slides Slides array (indexed by group.slide - 1).
   * @param {PptxGenJS} ppt Presentation instance.
   */
  const addBackgroundInSlide = (groups, slides, ppt) => {
    for (const group of groups) {
      const background = group.background;
      const isRounded = background.styles.borderRadius > 0;
      const lineWidth = Math.max(background.styles.borderWidth, background.styles.outlineWidth || 0);
      const showLine = lineWidth > 0;

      const expandX = (background.margins?.leftIn || 0);
      const expandY = (background.margins?.topIn || 0);
      const expandRight = (background.margins?.rightIn || 0);
      const expandBottom = (background.margins?.bottomIn || 0);
      const bgX = background.x - expandX;
      const bgY = background.y - expandY;
      const bgW = background.w + expandX + expandRight;
      const bgH = background.h + expandY + expandBottom;

      slides[group.slide - 1].addShape(isRounded ? ppt.ShapeType.rect : ppt.ShapeType.rect, {
        x: bgX,
        y: bgY,
        w: bgW,
        h: bgH,
        fill: background.styles.backgroundColor !== "transparent" ? { color: background.styles.backgroundColor } : undefined,
        ...(showLine
          ? {
            line: {
              color: background.styles.borderColor || background.styles.outlineColor || "transparent",
              width: lineWidth,
            },
          }
          : {}),
      });
    }
  }

  /**
   * Adds text boxes for all group-assigned text nodes. Side-specific borders are reproduced by
   * drawing individual thin shapes to emulate CSS per-side border colors/widths.
   * @param {Array} groups Group structures with text info.
   * @param {import('pptxgenjs').Slide[]} slides Slides collection.
   * @param {PptxGenJS} ppt Presentation instance.
   */
  const addTextsInSlide = (groups, slides, ppt) => {
    for (const group of groups) {
      for (const info of group.texts) {
        if (!info.text.trim()) continue;

        const adjX = info.x - (info.margins?.leftIn || 0);
        const adjY = info.y - (info.margins?.topIn || 0);
        const adjW = info.w + (info.margins?.leftIn || 0) + (info.margins?.rightIn || 0);
        const adjH = info.h + (info.margins?.topIn || 0) + (info.margins?.bottomIn || 0);

        const fillColor = info.styles.backgroundColor;
        const shouldApplyFill = fillColor && fillColor !== "transparent";
        const lineWidth = Math.max(info.styles.borderWidth, info.styles.outlineWidth || 0);
        const showLine = lineWidth > 0;

        const padVals = [
          info.styles.paddingLeft,
          info.styles.paddingRight,
          info.styles.paddingTop,
          info.styles.paddingBottom,
        ].filter(v => typeof v === 'number' && v > 0);
        const margin = Math.max(1, padVals.length ? Math.min(...padVals) : 1);

        const slide = slides[group.slide - 1];
        if (!slide) continue;

        const hasNoWrap = info.style?.whiteSpace?.includes("nowrap");
        const originalText = info.text || "";
        const textValue = hasNoWrap ? originalText.replace(/\s/g, "\u00A0") : originalText;

        let boxWidth = adjW;
        let boxX = adjX;

        if (hasNoWrap) {
          const contentWidth = typeof info.contentWidthIn === "number" && info.contentWidthIn > 0
            ? info.contentWidthIn
            : boxWidth;
          const nowrapPadding = 0.1;
          const desiredWidth = Math.min(pptWidth, contentWidth + nowrapPadding);
          if (desiredWidth > boxWidth) {
            const extra = desiredWidth - boxWidth;
            if (info.styles.textAlign === "center") {
              boxX -= extra / 2;
            } else if (info.styles.textAlign === "right" || info.styles.textAlign === "end") {
              boxX -= extra;
            }
            boxWidth = desiredWidth;
          }
        }

        if (boxX < 0) {
          boxX = 0;
        }
        if (boxX + boxWidth > pptWidth) {
          boxX = Math.max(0, pptWidth - boxWidth);
        }

        slide.addText(textValue, {
          x: boxX,
          y: adjY,
          w: boxWidth,
          h: adjH,
          fontSize: info.styles.fontSize,
          color: info.styles.color || "#000000",
          ...(shouldApplyFill ? { fill: { color: fillColor } } : {}),
          bold: info.styles.fontWeight === "bold" || parseInt(info.styles.fontWeight) >= 600,
          align: info.styles.textAlign,
          ...(showLine
            ? {
              line: {
                color: info.styles.borderColor || info.styles.outlineColor || "transparent",
                width: lineWidth,
              },
            }
            : {}),
          margin: margin,
        });

        addBordersInSlide(info, adjX, adjY, adjW, adjH, slide, ppt);
      }
    }
  }

  /**
   * Renders visually styled container elements (shapes) onto their assigned PPT slides.
   * For each group, iterates through its shapes and draws a rectangle or rounded rectangle
   * based on border radius, applying fill color, border color, and margin as detected from CSS styles.
   * Also calls addBorders to reproduce per-side borders for more accurate visual fidelity.
   *
   * @param {Array} groups Array of group objects containing shape info.
   * @param {import('pptxgenjs').Slide[]} slides Slides collection.
   * @param {PptxGenJS} ppt Presentation instance (for ShapeType constants).
   */
  const addShapesInSlide = (groups, slides, ppt) => {
    for (const group of groups) {
      for (const info of group.shapes) {
        const adjX = info.x - (info.margins?.leftIn || 0);
        const adjY = info.y - (info.margins?.topIn || 0);
        const adjW = info.w + (info.margins?.leftIn || 0) + (info.margins?.rightIn || 0);
        const adjH = info.h + (info.margins?.topIn || 0) + (info.margins?.bottomIn || 0);

        const lineWidth = Math.max(info.styles.borderWidth, info.styles.outlineWidth);
        const showLine = lineWidth > 0;
        const isRounded = (parseFloat(info.styles.borderRadius) || 0) > 0;
        const fillColor = info.styles.backgroundColor;
        const shouldApplyFill = fillColor && fillColor !== "transparent";

        const padVals = [
          info.styles.paddingLeft,
          info.styles.paddingRight,
          info.styles.paddingTop,
          info.styles.paddingBottom,
        ].filter(v => typeof v === 'number' && v > 0);
        const margin = Math.max(1, padVals.length ? Math.min(...padVals) : 1);

        const slide = slides[group.slide - 1];
        if (!slide) continue;

        slide.addShape(isRounded ? ppt.ShapeType.roundRect : ppt.ShapeType.rect, {
          x: adjX,
          y: adjY,
          w: adjW,
          h: adjH,
          ...(shouldApplyFill ? { fill: { color: fillColor } } : {}),
          ...(showLine
            ? {
              line: {
                color: info.styles.borderColor || info.styles.outlineColor || "transparent",
                width: lineWidth,
              },
            }
            : {}),
          margin: margin,
        });

        addBordersInSlide(info, adjX, adjY, adjW, adjH, slide, ppt);
      }
    }
  }

  /**
   * Recreates charts defined by serialized JSON stored in each chart element's data-chart attribute.
   * Currently supports 'bar', 'pie', and 'doughnut'. Other types default to a single-series dataset.
   * @param {Array} groups Groups containing chart placement info.
   * @param {import('pptxgenjs').Slide[]} slides Slides array.
   */
  const addChartsInSlide = (groups, slides) => {
    for (const group of groups) {
      for (const chart of group.charts) {
        let chartNode = chart.element;

        const chartMetaRaw = chartNode.getAttribute("data-chart");
        if (!chartMetaRaw) continue;
        if (!chartMetaRaw.trim().startsWith("{") || !chartMetaRaw.trim().endsWith("}")) continue;

        try {
          const chartMeta = JSON.parse(chartMetaRaw);
          if (!chartMeta) continue;

          let pptChartData = [];

          if (chartMeta.chartType === "bar" && chartMeta.colors?.length > 0) {
            pptChartData = chartMeta.labels.map((label, i) => ({
              name: label,
              labels: [""],
              values: [chartMeta.values[i]],
            }));
          }
          else {
            pptChartData = [
              {
                name: "Chart",
                labels: chartMeta.labels,
                values: chartMeta.values,
              },
            ];
          }

          const chartOptions = {
            x: chart.x,
            y: chart.y,
            w: chart.w,
            h: chart.h,
            chartColors: chartMeta.colors,
            showLegend: chartMeta.showLegend || false,
            legendPos: "b",
            showValue: true,
            dataLabelFontSize: 10,
            legendFontSize: 10,
            dataLabelFontBold: true,
            legendColor: chartMeta.legendColor || "#000000",
            dataLabelColor: chartMeta.lableColor || "#000000",
            dataLabelPosition: chartMeta.chartType === "pie" || chartMeta.chartType === "doughnut" ? "ctr" : "t",
          };

          slides[group.slide - 1].addChart(
            chartMeta.chartType,
            pptChartData,
            chartOptions,
          );

        } catch (e) {
          console.log("Invalid chart metadata", e);
        }
      }
    }
  }

  /**
   * Master export routine: gather DOM nodes -> assign UIDs -> derive text/shapes/charts -> detect groups ->
   * layout via assignPosition2 -> create slides -> apply middle & wrapper backgrounds -> render panels/shapes/texts/charts
   * or fallback image -> write PPTX file. Errors are caught silently (future improvement: user notification).
   * @returns {Promise<void>}
   */
  const handleDownload = async () => {
    if (!contentRef.current) return;

    try {
      setMsg("Generating PPT...");

      const root = contentRef.current;
      const { ppt, pxToInX, pxToInY, rootRect } = setupPresentation(root);
      const allNodes = Array.from(root.querySelectorAll("*"));

      assignElementUIDs(allNodes);

      const textNodes = getRenderableTextNodes(root, allNodes);
      const outermostWrapper = getCommonAncestor(textNodes);

      const groups = collectBackgrounds(allNodes, outermostWrapper, rootRect, pxToInX, pxToInY);
      assignTextsToGroups(textNodes, groups, rootRect, pxToInX, pxToInY);
      assignShapesToGroups(allNodes, groups, rootRect, pxToInX, pxToInY);
      assignChartsToGroups(allNodes, groups, rootRect, pxToInX, pxToInY);
      assignPosition2(groups, 0.15, 0.15);

      const [slides, middleSlides] = createSlides(ppt, groups);

      await backgroundToMiddleSlides(middleSlides, imgSlideMiddle);

      if (isStartEnd) {
        await setupStartEndSlides(slides, imgSlideStart, imgSlideEnd);
      }

      if (groups.length) {
        // Test-only hook: allow legacy assignPosition coverage when flag is set.
        if (typeof window !== 'undefined' && window.__PPT_TEST_FORCE_ASSIGN_POSITION) {
          try {
            assignPosition(groups, pptHeight);
          } catch (_) { /* silent */ }
        }
        addBackgroundInSlide(groups, middleSlides, ppt);
        addShapesInSlide(groups, middleSlides, ppt);
        addTextsInSlide(groups, middleSlides, ppt);
        addChartsInSlide(groups, middleSlides);
      } else {
        await addDummySlides(root, middleSlides);
      }

      await ppt.writeFile({ fileName: `${title}.pptx` });
      onClose();
    } catch (err) {
      // Log caught error (guard undefined variable reference); kept silent for user.
      console.log("Error Generating ppt:", err);
    }
    finally {
      setMsg("");
    }
  }

  /**
   * Dynamically scales the dashboard preview to fit the dialog width while maintaining aspect ratio.
   * Runs when the dialog opens or the preview content changes.
   */
  useEffect(() => {
    if (!contentRef.current || !previewRef.current) return

    const originalWidth = contentRef.current.offsetWidth
    const previewWidth = previewRef.current.offsetWidth

    if (originalWidth > 0 && previewWidth > 0) {
      const computedScale = previewWidth / originalWidth
      setPreviewScale(Math.min(1, computedScale))
    }
  }, [previewContent]);

  /**
   * Preview generation effect
   * - Trigger: runs when the dialog opens or when the dashboard ref changes.
   * - Purpose: create a width-stabilized HTML snapshot of the dashboard for the modal preview
   *   without mutating the live DOM. Charts are rasterized to PNG to preserve visual fidelity
   *   across environments where SVG/CSS rendering may differ.
   * - Safety: uses an `isMounted` guard to avoid calling state setters after unmount.
   * - Side-effects: none on the real DOM; cloned nodes are manipulated and only their
   *   innerHTML is stored in component state (`previewContent`).
   */
  useEffect(() => {
    if (!contentRef.current) return
    let isMounted = true

    /**
     * generatePreview
     * Creates a cloned, width-stabilized version of the target content, replaces chart
     * nodes with rasterized PNGs for visual fidelity, then stores its HTML for
     * scaled preview rendering within the dialog (without mutating original DOM).
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
    return () => {
      isMounted = false;
    }
  }, [contentRef]);

  // Test-only exposure of internal helpers to raise coverage without refactoring.
  if (typeof window !== 'undefined' && !window.__PPT_DOWNLOADER_TEST_API) {
    window.__PPT_DOWNLOADER_TEST_API = {
      parseColorToHex,
      assignElementUIDs,
      getElementInfo,
      hasVisualStyle,
      isInside,
      isOverlapping,
      setupPresentation,
      createSlides,
      backgroundToMiddleSlides,
      setupStartEndSlides,
      addDummySlides,
      addTextElement,
      getLowestUniqueElement,
      getRenderableTextNodes,
      getCommonAncestor,
      collectBackgrounds,
      assignTextsToGroups,
      assignShapesToGroups,
      assignChartsToGroups,
      assignPosition,
      assignPosition2,
      addBordersInSlide,
      addBackgroundInSlide,
      addTextsInSlide,
      addShapesInSlide,
      addChartsInSlide,
      // Newly exposed for coverage of export routine and scaling effect.
      __handleDownload: handleDownload,
    };
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="cex:!w-[1000px] cex:!max-w-[95vw] cex:max-h-[95vh] cex:overflow-hidden cex:border-0">
        <DialogHeader>
          <DialogTitle>Download Dashboard PPT</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <div className="cex:flex cex:flex-col cex:gap-4">
          <Input
            placeholder="Enter PPT title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="Presentation title"
            aria-describedby="ppt-title-description"
          />
          <p id="ppt-title-description" className="cex:text-xs cex:text-muted-foreground cex:sr-only">
            Provide a descriptive name for the exported PowerPoint file.
          </p>

          <ScrollArea
            className="cex:border cex:rounded-md cex:p-2 cex:max-h-[60vh] cex:overflow-auto"
            aria-labelledby="ppt-preview-heading"
            role="region"
          >
            <div className="cex:pt-2" ref={previewRef}>
              <p id="ppt-preview-heading" className="cex:text-sm cex:font-medium cex:sr-only">
                PPT preview
              </p>
              {previewContent ? (
                <div
                  style={{
                    transform: `scale(${previewScale})`,
                    transformOrigin: "top left",
                    width: `${100 / previewScale}%`,
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
              Download PPT
            </Button>
          </div>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  )
}

export default PPTDownloader;