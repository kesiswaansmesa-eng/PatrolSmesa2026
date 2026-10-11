import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Downloads a DOM element directly as a high-resolution PDF file.
 * Compatible with modern browser download mechanisms and mobile web.
 */
export async function exportElementToPDF(
  element: HTMLElement,
  fileName: string,
  options?: {
    orientation?: 'p' | 'portrait' | 'l' | 'landscape';
    margin?: number;
    title?: string;
  }
): Promise<void> {
  const orientation = options?.orientation || 'p';
  const margin = options?.margin ?? 10; // 10mm margin

  // Clone or prepare element
  // Temporarily force light background on the element for crisp black-on-white PDF rendering
  const prevOverflow = element.style.overflow;
  const prevMaxHeight = element.style.maxHeight;
  element.style.overflow = 'visible';
  element.style.maxHeight = 'none';

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // High resolution (retina 2x)
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    
    // A4 dimensions in mm: 210 x 297 (portrait) or 297 x 210 (landscape)
    const isLandscape = orientation === 'l' || orientation === 'landscape';
    const pdf = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = isLandscape ? 297 : 210;
    const pageHeight = isLandscape ? 210 : 297;
    const contentWidth = pageWidth - margin * 2;
    
    // Calculate aspect ratio
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const contentHeight = (imgHeight * contentWidth) / imgWidth;

    if (contentHeight <= pageHeight - margin * 2) {
      // Fits in a single page
      pdf.addImage(imgData, 'JPEG', margin, margin, contentWidth, contentHeight);
    } else {
      // Multi-page slicing
      let heightLeft = contentHeight;
      let position = margin;
      let page = 1;

      while (heightLeft > 0) {
        if (page > 1) {
          pdf.addPage();
        }
        // Offset the image position
        pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentHeight);
        heightLeft -= (pageHeight - margin * 2);
        position -= (pageHeight - margin * 2);
        page++;
      }
    }

    if (options?.title) {
      pdf.setProperties({
        title: options.title,
        subject: 'Dokumen Resmi SMKN 1 Jember',
        author: 'SMKN 1 Jember',
        creator: 'Sistem Kesiswaan Patrol SMKN 1 Jember',
      });
    }

    // Trigger download on client local PC / Drive
    const cleanFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
    pdf.save(cleanFileName);
  } finally {
    element.style.overflow = prevOverflow;
    element.style.maxHeight = prevMaxHeight;
  }
}
