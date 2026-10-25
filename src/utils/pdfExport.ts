import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

/**
 * Check if the current browser/device supports native file sharing
 * (standard on modern mobile devices: Chrome Android, Safari iOS, etc.)
 */
export function isWebShareSupported(): boolean {
  if (typeof navigator === 'undefined' || !navigator.share || !navigator.canShare) {
    return false;
  }
  try {
    const testFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    return navigator.canShare({ files: [testFile] });
  } catch {
    return false;
  }
}

/**
 * Render an HTML element to a jsPDF instance with mobile-proof layout clamping.
 * Forces the cloned DOM to an exact 800px desktop canvas width so that
 * mobile viewports (e.g. 360px - 412px) never compress, warp, or wrap lines messily.
 */
async function buildPdfFromElement(
  element: HTMLElement,
  targetWidth: number = 800
): Promise<{ pdf: jsPDF; canvas: HTMLCanvasElement }> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: 1024,
    width: targetWidth,
    onclone: (clonedDoc, clonedEl) => {
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

      // Ensure target element is fixed to targetWidth and placed at (0,0) in normal flow
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
    },
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.98);
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
  shareTitle: string = 'Laporan Operasional Photobooth'
): Promise<SharePdfResult> {
  try {
    const { pdf } = await buildPdfFromElement(element);
    const pdfBlob = pdf.output('blob');
    const pdfFile = new File([pdfBlob], filename, { type: 'application/pdf' });

    // Check if navigator.share with files is supported
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
          text: `Berikut adalah berkas PDF ${shareTitle} (${filename}).`,
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
          message: 'Berbagi tidak berhasil, berkas PDF diunduh otomatis.',
        };
      }
    } else {
      // Device/browser does not support file sharing (e.g. desktop PC)
      pdf.save(filename);
      return {
        success: true,
        method: 'download',
        message: 'Peramban tidak mendukung berbagi langsung. Berkas PDF telah diunduh!',
      };
    }
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
