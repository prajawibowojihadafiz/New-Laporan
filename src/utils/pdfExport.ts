import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

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
 * Using Promise.all and naturalHeight checks as requested for many photos stability.
 */
async function waitForImagesToLoad(element: HTMLElement): Promise<void> {
  const images = Array.from(element.querySelectorAll<HTMLImageElement>('.foto-kegiatan-img, img'));
  await Promise.all(
    images.map((img) => {
      if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
        // Safety timeout so slow or broken images don't block indefinitely
        setTimeout(resolve, 3000);
      });
    })
  );
}

/**
 * Render an HTML element to a jsPDF instance with mobile-proof layout clamping.
 * Forces the cloned DOM to an exact 800px desktop canvas width and windowWidth: 1024
 * so that mobile viewports (e.g. 360px - 412px) never compress, warp, or wrap lines messily.
 */
async function buildPdfFromElement(
  element: HTMLElement,
  targetWidth: number = 800
): Promise<{ pdf: jsPDF; canvas: HTMLCanvasElement }> {
  // 1. Wait for all images to settle and decode in DOM 100%
  await waitForImagesToLoad(element);

  // 2. Explicit safe delay (800ms) right before html2canvas is called to allow mobile browser GPU & DOM painting
  await new Promise((resolve) => setTimeout(resolve, 800));

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
      // Clean up any crossOrigin attributes on data URLs inside the cloned DOM
      const clonedImages = Array.from(clonedEl.querySelectorAll('img'));
      clonedImages.forEach((img) => {
        img.style.display = 'block';
        img.style.visibility = 'visible';
        img.style.opacity = '1';
        if (img.src && img.src.startsWith('data:')) {
          img.removeAttribute('crossorigin');
        }
      });

      // Force viewport and document width on the cloned document
      clonedDoc.documentElement.style.width = `${targetWidth}px`;
      clonedDoc.documentElement.style.minWidth = `${targetWidth}px`;
      clonedDoc.documentElement.style.maxWidth = `${targetWidth}px`;
      clonedDoc.body.style.width = `${targetWidth}px`;
      clonedDoc.body.style.minWidth = `${targetWidth}px`;
      clonedDoc.body.style.maxWidth = `${targetWidth}px`;
      clonedDoc.body.style.margin = '0';
      clonedDoc.body.style.padding = '0';
      clonedDoc.body.style.overflow = 'visible';

      // Ensure target element is fixed to targetWidth and placed in normal flow
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

      // Fix parent containers in cloned document
      let parent = clonedEl.parentElement;
      while (parent && parent !== clonedDoc.body) {
        parent.style.position = 'static';
        parent.style.left = '0';
        parent.style.top = '0';
        parent.style.display = 'block';
        parent.style.visibility = 'visible';
        parent.style.opacity = '1';
        parent.style.width = `${targetWidth}px`;
        parent = parent.parentElement;
      }

      // Pagebreak avoidance logic: prevents .tabel-foto-kegiatan, .foto-kegiatan-card, etc.
      // from being sliced across A4 page boundaries (at 800px width, 1 A4 page is ~1131px)
      try {
        const a4PageHeightPx = Math.round(targetWidth * (297 / 210));
        const rootRect = clonedEl.getBoundingClientRect();
        const avoidSelectors = [
          '.tabel-foto-kegiatan',
          '.foto-kegiatan-container',
          '.foto-kegiatan-card',
          'tr',
          '.card-block',
        ];

        const avoidElements = Array.from(clonedEl.querySelectorAll<HTMLElement>(avoidSelectors.join(', ')));

        avoidElements.forEach((el) => {
          const elRect = el.getBoundingClientRect();
          const topRelativeToRoot = elRect.top - rootRect.top;
          const bottomRelativeToRoot = elRect.bottom - rootRect.top;

          for (let page = 1; page <= 5; page++) {
            const pageBoundaryY = page * a4PageHeightPx;
            // If element starts before the page boundary but extends past it, push it to next page
            if (topRelativeToRoot < pageBoundaryY && bottomRelativeToRoot > pageBoundaryY) {
              const pushDown = pageBoundaryY - topRelativeToRoot + 20;
              const currentMarginTop = parseInt(el.style.marginTop || '0', 10) || 0;
              el.style.marginTop = `${currentMarginTop + pushDown}px`;
              break;
            }
          }
        });
      } catch (pageBreakErr) {
        console.warn('Page break calculation fallback:', pageBreakErr);
      }
    },
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
  const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm
  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  // First page
  pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
  heightLeft -= pdfHeight;

  // Subsequent pages if content overflows single A4 page
  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfHeight;
  }

  return { pdf, canvas };
}

/**
 * Download the PDF report directly to device storage
 */
export async function exportReportToPdf(
  element: HTMLElement,
  filename: string = 'Laporan-Photobooth.pdf'
): Promise<boolean> {
  try {
    const { pdf } = await buildPdfFromElement(element);
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
  filename: string = 'Laporan-Photobooth.pdf',
  shareTitle: string = 'Laporan Operasional Photobooth',
  summaryText?: string
): Promise<SharePdfResult> {
  try {
    const { pdf } = await buildPdfFromElement(element);
    const pdfBlob = pdf.output('blob');
    const pdfFile = new File([pdfBlob], filename, { type: 'application/pdf' });

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
          // User closed share dialog without picking an app
          return {
            success: true,
            method: 'cancelled',
            message: 'Berbagi PDF dibatalkan.',
          };
        }
        // Fallback to downloading file if share failed
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
        // Ignored, file already downloaded
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
