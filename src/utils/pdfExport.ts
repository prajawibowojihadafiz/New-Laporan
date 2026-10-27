import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

export const PDF_PAGEBREAK_CONFIG = {
  mode: ['avoid-all', 'css', 'legacy'] as const,
  avoid: [
    'tr',
    '.no-break',
    '.page-break-inside-avoid',
    '.foto-kegiatan-card',
    '.tabel-foto-kegiatan',
    '.foto-kegiatan-container',
    '.card',
    '.card-block',
    '.signature-block',
  ],
};

/**
 * Configuration options matching the requested standard
 */
export const getHtml2PdfOptions = (filename: string = 'Laporan_Harian.pdf') => ({
  margin: 10,
  filename: filename,
  image: { type: 'jpeg' as const, quality: 0.98 },
  html2canvas: { scale: 2, useCORS: true, logging: false },
  jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
  pagebreak: { mode: ['avoid-all', 'css', 'legacy'] as ('avoid-all' | 'css' | 'legacy')[] },
});

/**
 * Check if the current browser/device supports native file sharing
 * (standard on modern mobile devices: Chrome Android, Safari iOS, etc.)
 */
export function isWebShareSupported(): boolean {
  if (typeof navigator === 'undefined' || !navigator.share) {
    return false;
  }
  return true;
}

/**
 * Helper to ensure all images in an element are completely loaded before rendering canvas
 * Using Promise.all and naturalHeight checks to ensure photos are ready.
 */
export async function waitForImagesToLoad(element: HTMLElement): Promise<void> {
  const images = Array.from(element.querySelectorAll<HTMLImageElement>('.foto-kegiatan-img, img'));
  await Promise.all(
    images.map((img) => {
      if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
        // Safety timeout so broken or slow images don't block indefinitely
        setTimeout(resolve, 3000);
      });
    })
  );
}

/**
 * Build a pristine multi-page jsPDF instance using html2canvas-pro.
 * Guaranteed to support modern Tailwind CSS v4 color formats (oklch, color-mix) without crashing,
 * while strictly adhering to pagebreak avoidance rules so tables, rows, cards, and photos
 * are never sliced in half horizontally across pages.
 */
export async function buildPdfDocument(
  element: HTMLElement,
  targetWidth: number = 800
): Promise<{ pdf: jsPDF; canvas: HTMLCanvasElement; blob: Blob }> {
  // 1. Wait for all images to settle and decode in DOM 100%
  await waitForImagesToLoad(element);

  // 2. Safe delay (800ms) before rendering canvas
  await new Promise((resolve) => setTimeout(resolve, 800));

  // A4 portrait math with 10mm margins:
  // A4 dimensions: 210mm x 297mm.
  // Margins: 10mm top, bottom, left, right.
  // Printable area: 190mm width x 277mm height.
  // Aspect ratio: 277 / 190 ≈ 1.4578947.
  // At targetWidth = 800px, printable height per page = 800 * (277 / 190) ≈ 1166.3px.
  const pxPageHeight = Math.round(targetWidth * (277 / 190));

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: 1024,
    width: targetWidth,
    imageTimeout: 15000,
    onclone: (clonedDoc, clonedEl) => {
      // 1. Ensure all images inside cloned DOM are visible and clean
      const clonedImages = Array.from(clonedEl.querySelectorAll('img'));
      clonedImages.forEach((img) => {
        img.style.display = 'block';
        img.style.visibility = 'visible';
        img.style.opacity = '1';
        if (img.src && img.src.startsWith('data:')) {
          img.removeAttribute('crossorigin');
        }
      });

      // 2. Force document and viewport width
      clonedDoc.documentElement.style.width = `${targetWidth}px`;
      clonedDoc.documentElement.style.minWidth = `${targetWidth}px`;
      clonedDoc.documentElement.style.maxWidth = `${targetWidth}px`;
      clonedDoc.body.style.width = `${targetWidth}px`;
      clonedDoc.body.style.minWidth = `${targetWidth}px`;
      clonedDoc.body.style.maxWidth = `${targetWidth}px`;
      clonedDoc.body.style.margin = '0';
      clonedDoc.body.style.padding = '0';
      clonedDoc.body.style.overflow = 'visible';

      clonedEl.style.position = 'static';
      clonedEl.style.left = '0';
      clonedEl.style.top = '0';
      clonedEl.style.display = 'block';
      clonedEl.style.visibility = 'visible';
      clonedEl.style.opacity = '1';
      clonedEl.style.width = `${targetWidth}px`;
      clonedEl.style.minWidth = `${targetWidth}px`;
      clonedEl.style.maxWidth = `${targetWidth}px`;
      clonedEl.style.boxSizing = 'border-box';

      // 3. Dynamic Pagebreak Avoidance (Next Page bila tidak cukup):
      // Iterates through breakable elements. If an element crosses a page boundary,
      // pushes it cleanly to start at the top of the next page using spacer rows/divs.
      try {
        const avoidSelectors = [
          'tr.page-break-inside-avoid',
          'tr.no-break',
          'tbody tr',
          '.foto-kegiatan-card',
          '.tabel-foto-kegiatan',
          '.foto-kegiatan-container',
          '.card-block',
          '.signature-block',
        ];

        const elementsToAvoid = Array.from(
          clonedEl.querySelectorAll<HTMLElement>(avoidSelectors.join(', '))
        );

        elementsToAvoid.forEach((el) => {
          const rootRect = clonedEl.getBoundingClientRect();
          const elRect = el.getBoundingClientRect();
          const topRelativeToRoot = elRect.top - rootRect.top;
          const bottomRelativeToRoot = elRect.bottom - rootRect.top;
          const elHeight = bottomRelativeToRoot - topRelativeToRoot;

          if (elHeight <= 0 || elHeight >= pxPageHeight) return;

          const startPage = Math.floor(topRelativeToRoot / pxPageHeight);
          const endPage = Math.floor((bottomRelativeToRoot - 1) / pxPageHeight);

          // Check if element crosses the boundary between startPage and next page
          const pageBoundaryY = (startPage + 1) * pxPageHeight;
          const isPhotoTable =
            el.classList.contains('tabel-foto-kegiatan') ||
            el.classList.contains('foto-kegiatan-container');

          // For the photo table, if it starts with less than 320px remaining on page 1, push it whole
          const needsPush =
            startPage !== endPage ||
            (isPhotoTable && pageBoundaryY - topRelativeToRoot < 320 && topRelativeToRoot < pageBoundaryY);

          if (needsPush && topRelativeToRoot < pageBoundaryY) {
            const pushDown = pageBoundaryY - topRelativeToRoot;

            if (el.tagName.toLowerCase() === 'tr') {
              // For table rows, insert an invisible spacer tr with height to push row cleanly
              const spacerRow = clonedDoc.createElement('tr');
              spacerRow.className = 'pdf-pagebreak-spacer-row';
              const spacerCell = clonedDoc.createElement('td');
              const colSpan = (el as HTMLTableRowElement).cells?.length || 10;
              spacerCell.colSpan = Math.max(colSpan, 5);
              spacerCell.style.height = `${pushDown}px`;
              spacerCell.style.padding = '0';
              spacerCell.style.margin = '0';
              spacerCell.style.border = 'none';
              spacerCell.style.backgroundColor = 'transparent';
              spacerRow.appendChild(spacerCell);
              el.parentNode?.insertBefore(spacerRow, el);
            } else {
              // For block containers and cards, insert a spacer div
              const spacerDiv = clonedDoc.createElement('div');
              spacerDiv.className = 'pdf-pagebreak-spacer';
              spacerDiv.style.display = 'block';
              spacerDiv.style.height = `${pushDown}px`;
              spacerDiv.style.margin = '0';
              spacerDiv.style.padding = '0';
              spacerDiv.style.border = 'none';
              el.parentNode?.insertBefore(spacerDiv, el);
            }
          }
        });
      } catch (err) {
        console.warn('Page break calculation warning:', err);
      }
    },
  });

  // 4. Construct jsPDF instance with standard A4 margins (10mm)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Calculate pages and slice canvas
  const scale = 2;
  const pageCanvasHeight = Math.round(pxPageHeight * scale);
  const totalCanvasHeight = canvas.height;
  const totalPages = Math.ceil(totalCanvasHeight / pageCanvasHeight) || 1;

  for (let i = 0; i < totalPages; i++) {
    if (i > 0) {
      pdf.addPage();
    }

    const currentSliceHeight = Math.min(pageCanvasHeight, totalCanvasHeight - i * pageCanvasHeight);
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = canvas.width;
    pageCanvas.height = pageCanvasHeight;

    const pageCtx = pageCanvas.getContext('2d');
    if (pageCtx) {
      pageCtx.fillStyle = '#ffffff';
      pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvasHeight);
      pageCtx.drawImage(
        canvas,
        0,
        i * pageCanvasHeight,
        canvas.width,
        currentSliceHeight,
        0,
        0,
        canvas.width,
        currentSliceHeight
      );
    }

    const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.98);
    // Draw with 10mm margin on A4 (width 190mm, height 277mm)
    pdf.addImage(pageImgData, 'JPEG', 10, 10, 190, 277, undefined, 'FAST');
  }

  const blob = pdf.output('blob');
  return { pdf, canvas, blob };
}

/**
 * Download the PDF report directly to device storage
 */
export async function exportReportToPdf(
  element: HTMLElement,
  filename: string = 'Laporan_Harian.pdf'
): Promise<boolean> {
  try {
    const { pdf } = await buildPdfDocument(element);
    pdf.save(filename);
    return true;
  } catch (err) {
    console.error('Failed to generate PDF download:', err);
    window.print();
    return false;
  }
}

export interface SharePdfResult {
  success: boolean;
  method: 'share' | 'download' | 'cancelled';
  message?: string;
}

/**
 * Share the PDF report directly (e.g. to WhatsApp / Telegram) via Web Share API.
 * If file sharing is not supported on the current device, falls back to direct download.
 */
export async function shareReportPdf(
  element: HTMLElement,
  filename: string = 'Laporan_Harian.pdf',
  shareTitle: string = 'Laporan Operasional Photobooth',
  summaryText?: string
): Promise<SharePdfResult> {
  try {
    const { pdf, blob } = await buildPdfDocument(element);
    const pdfFile = new File([blob], filename, { type: 'application/pdf' });

    // 1. Try sharing file via navigator.share (Mobile Chrome, Safari, etc.)
    if (
      typeof navigator !== 'undefined' &&
      navigator.share &&
      navigator.canShare &&
      navigator.canShare({ files: [pdfFile] })
    ) {
      try {
        await navigator.share({
          files: [pdfFile],
          title: shareTitle,
          text: summaryText
            ? `${shareTitle}\n\n${summaryText}`
            : `Berikut adalah berkas PDF ${shareTitle} (${filename}).`,
        });
        return {
          success: true,
          method: 'share',
          message: 'Laporan PDF berhasil dibagikan!',
        };
      } catch (shareErr: unknown) {
        const error = shareErr as { name?: string };
        if (error?.name === 'AbortError') {
          return {
            success: true,
            method: 'cancelled',
            message: 'Berbagi PDF dibatalkan.',
          };
        }
        // Fallback to downloading file if share was aborted or rejected
        pdf.save(filename);
        return {
          success: true,
          method: 'download',
          message: 'Berbagi langsung tidak selesai, berkas PDF diunduh otomatis.',
        };
      }
    }

    // 2. If file sharing is not supported, download the PDF and optionally offer text sharing
    pdf.save(filename);

    if (typeof navigator !== 'undefined' && navigator.share && summaryText) {
      try {
        await navigator.share({
          title: shareTitle,
          text: `Berkas PDF telah diunduh (${filename}).\n\n${summaryText}`,
        });
        return {
          success: true,
          method: 'share',
          message: 'Berkas PDF diunduh & ringkasan teks dibagikan!',
        };
      } catch {
        // Ignored, file already saved
      }
    }

    return {
      success: true,
      method: 'download',
      message: 'Peramban tidak mendukung berbagi file langsung. Berkas PDF telah diunduh!',
    };
  } catch (err) {
    console.error('Failed to share PDF:', err);
    window.print();
    return {
      success: false,
      method: 'download',
      message: 'Gagal membuat PDF otomatis, dialihkan ke jendela cetak.',
    };
  }
}
