import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

export async function exportReportToPdf(
  element: HTMLElement,
  filename: string = 'Laporan-Photobooth.pdf'
): Promise<boolean> {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 850,
      onclone: (_clonedDoc, clonedEl) => {
        // Ensure element is visible and in normal flow in the cloned DOM
        clonedEl.style.position = 'static';
        clonedEl.style.left = '0';
        clonedEl.style.top = '0';
        clonedEl.style.display = 'block';
        clonedEl.style.visibility = 'visible';
        clonedEl.style.opacity = '1';

        // Also ensure parent container in cloned document isn't hidden
        if (clonedEl.parentElement) {
          clonedEl.parentElement.style.position = 'static';
          clonedEl.parentElement.style.left = '0';
          clonedEl.parentElement.style.top = '0';
          clonedEl.parentElement.style.display = 'block';
          clonedEl.parentElement.style.visibility = 'visible';
        }
      },
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
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

    pdf.save(filename);
    return true;
  } catch (err) {
    console.error('Failed to generate PDF with html2canvas/jsPDF:', err);
    // Fallback: trigger native browser print
    window.print();
    return false;
  }
}
